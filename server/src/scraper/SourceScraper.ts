import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  CacheSettings,
  ContentSource,
  getSourceType,
  randomizeList,
  SOF,
  ST,
  Scene,
  RemoteSettings,
  ScraperHelpers,
  PlayerCaptcha,
  WF
} from 'flipflip-common'
import {
  toCacheSettings,
  toRemoteSettings,
  toScene,
  toContentSource
} from '../db/mappers'
import { findSceneById } from '../db/SceneRepository'
import { Scene as SceneRow, User } from '../db/types/entities'
import {
  findContentSources,
  findContentSourceTagIds,
  updateContentSourceCount
} from '../db/ContentSourceRepository'
import { toBoolean } from '../db/utils'
import Logger from '../logging/Logger'
import { findCacheSettings } from '../db/CacheSettingsRepository'
import { findRemoteSettings } from '../db/RemoteSettingsRepository'
import { findContentSourceClipIds } from '../db/ClipRepository'
import { StaticPool } from 'node-worker-threads-pool'
import { ScrapeRequest } from './ScrapeRequest'
import { ScrapeResult } from './ScrapeResult'
import { pushInChunks } from '../utils'

const logger = Logger.create('SourceScraper')
async function getDirectories(path: string) {
  const dirs = await fs.promises.readdir(path, { withFileTypes: true })
  return dirs
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
}

export interface ScrapedSourcePromise {
  source: ContentSource
  helpers: ScraperHelpers
}

function toContentSourceUrl(url: string): ContentSource {
  return {
    id: 0,
    url,
    type: getSourceType(url),
    offline: false,
    marked: false,
    tags: [],
    clips: [],
    disabledClips: [],
    blacklist: [],
    count: 0,
    countComplete: false,
    weight: 0,
    fileUrl: '',
    dirOfSources: false,
    includeRetweets: false,
    includeReplies: false
  }
}

export default class SourceScraper {
  private static readonly pool = new StaticPool({
    size: Math.max(1, os.cpus().length - 2),
    task: path.join(__dirname, 'Scrapers.js')
  })

  private readonly scene: Scene
  private readonly caching: CacheSettings
  private readonly remoteSettings: RemoteSettings

  private allURLs: Map<string, string[]>
  private allPosts: Record<string, string>
  private scrapeQueue: Record<string, Array<ScrapedSourcePromise>>
  private availableToScrape: string[]
  private sourceIndex: number
  private queueEmpty: boolean
  private captcha?: PlayerCaptcha
  private systemMessage?: string

  public static async create(
    sceneId: number,
    user: User
  ): Promise<SourceScraper> {
    const scene = toScene((await findSceneById(sceneId)) as SceneRow)

    const sources: ContentSource[] = []
    const sourceRows = await findContentSources(sceneId)
    for (const row of sourceRows) {
      const clips: number[] = scene.playVideoClips
        ? await findContentSourceClipIds(user.id as number, row.id as number)
        : []
      const tags = await findContentSourceTagIds(
        user.id as number,
        row.id as number
      )
      if (
        toBoolean(row.localDirOfSources) &&
        getSourceType(row.url) === ST.local
      ) {
        try {
          const directories = await getDirectories(row.url)
          for (const directory of directories) {
            sources.push(toContentSourceUrl(path.join(row.url, directory)))
          }
        } catch (e) {
          sources.push(toContentSource(row, tags, clips))
          logger.error('Failed to read local directory', e as object)
        }
      } else {
        sources.push(toContentSource(row, tags, clips))
      }
    }

    if (scene.sourceOrderFunction === SOF.random) {
      randomizeList(sources)
    }

    const caching = toCacheSettings(await findCacheSettings(user))
    const remoteSettings = toRemoteSettings(await findRemoteSettings(user))
    return new SourceScraper(scene, caching, remoteSettings, sources)
  }

  private constructor(
    scene: Scene,
    caching: CacheSettings,
    remoteSettings: RemoteSettings,
    sceneSources: ContentSource[]
  ) {
    this.scene = scene
    this.caching = caching
    this.remoteSettings = remoteSettings
    this.scrapeQueue = {}
    this.allPosts = {}
    this.allURLs = new Map<string, string[]>()
    this.sourceIndex = 0
    this.queueEmpty = sceneSources.length === 0
    this.availableToScrape = []

    for (const source of sceneSources) {
      this.availableToScrape.push(source.url)
      this.scrapeQueue[source.url] = [
        { source, helpers: { next: -1, count: 0, retries: 0 } }
      ]
    }
  }

  public getSourceUrls(willScrape: boolean): string[] {
    const sourceUrls = Array.from(this.allURLs.keys())
    if (willScrape && this.availableToScrape.length > 0) {
      const scrapeUrl = this.availableToScrape.pop()
      sourceUrls.push(scrapeUrl as string)
    }
    return sourceUrls
  }

  public async getScrapedUrls(
    canScrape: boolean,
    sourceUrl?: string
  ): Promise<string[] | undefined> {
    if (canScrape) {
      let scrapeUrl = sourceUrl
      if (!this.queueEmpty && scrapeUrl == null) {
        const sourceUrls = Object.keys(this.scrapeQueue)
        const length = this.sourceIndex + sourceUrls.length
        for (let i = this.sourceIndex; i < length; i++) {
          const index = i % sourceUrls.length
          const url = sourceUrls[index]
          if (this.scrapeQueue[url].length > 0) {
            scrapeUrl = url
            this.sourceIndex = index
            break
          }
        }
      }

      if (scrapeUrl != null) {
        await this.scrapeSource(scrapeUrl)
      } else {
        this.queueEmpty = true
      }
    }

    const key = sourceUrl ?? WF.images
    return this.allURLs.get(key)
  }

  private async scrapeSource(sourceUrl: string) {
    if (this.captcha != null) {
      return // TODO handle captcha
    }

    const promiseData = this.scrapeQueue[sourceUrl].pop()
    if (promiseData == null) return

    const { imageTypeFilter, weightFunction } = this.scene
    const request: ScrapeRequest = {
      allPosts: this.allPosts,
      caching: this.caching,
      remoteSettings: this.remoteSettings,
      source: promiseData.source,
      filter: imageTypeFilter,
      weight: weightFunction,
      helpers: promiseData.helpers
    }

    const object = await SourceScraper.pool.exec(request)
    this.processResponse(object)
    if (object?.captcha != null) {
      this.captcha = {
        captcha: object.captcha,
        source: object?.source,
        helpers: object?.helpers
      }
    }

    if (object?.error != null) {
      const next = object?.helpers?.next
      logger.error(
        'Error retrieving ' +
          object?.source?.url +
          (typeof next === 'number' && next > 0 ? ' Page ' + next : '')
      )
      logger.error(object.error)
    }

    if (object?.warning != null) {
      logger.warn(object.warning)
    }

    if (object?.systemMessage != null) {
      this.systemMessage = object.systemMessage
    }

    // If we are not at the end of a source
    if (object?.source) {
      if (object?.data) {
        this.allPosts = object.allPosts ?? {}

        // Add the next promise to the queue
        const { source, helpers } = object
        if (helpers?.next != null) {
          this.scrapeQueue[source.url].push({ source, helpers })
          this.queueEmpty = false
        }

        await updateContentSourceCount(
          source.url,
          helpers?.count ?? 0,
          helpers?.next == null
        )
      }
    }
  }

  private processResponse(object: ScrapeResult) {
    if (object?.source && object?.data && object?.weight && object?.helpers) {
      const source = object.source
      if ((source.blacklist?.length ?? 0) > 0) {
        object.data = object.data.filter(
          (url: string) => !source.blacklist.includes(url)
        )
      }

      this.processAllURLs(object.data, object.source, object.weight)
    }
  }

  private processAllURLs(
    data: string[],
    source: ContentSource,
    weight: string
  ) {
    const key = weight === WF.images ? WF.images : source.url
    let urls = this.allURLs.get(key)
    if (urls == null) {
      urls = data
    } else {
      urls.push(...data)
    }

    this.allURLs.set(key, urls)
  }
}

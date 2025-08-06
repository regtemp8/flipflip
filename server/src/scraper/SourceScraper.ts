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
  WF,
  getFileName
} from 'flipflip-common'
import {
  toCacheSettings,
  toRemoteSettings,
  toScene,
  toContentSource
} from '../db/mappers'
import { findSceneById } from '../db/SceneRepository'
import { Scene as SceneRow, User } from '../db/types/generated'
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
import { getServerHost, getServerPort } from '../utils'
import { ScrapeResult } from './ScrapeResult'
import proxy, { ProxyRequest } from '../routes/ProxyService'
import fileRegistry from '../routes/FileRegistry'

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
    size: os.cpus().length * 2, // TODO make thread pool size configurable?
    task: path.join(__dirname, 'Scrapers.js')
  })

  private readonly scene: Scene
  private readonly caching: CacheSettings
  private readonly remoteSettings: RemoteSettings

  private allURLs: Record<string, string[]>
  private allPosts: Record<string, string>
  private scrapeQueue: Record<string, Array<ScrapedSourcePromise>>
  private sourceIndex: number
  private canScrape: boolean
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
            sources.push(toContentSourceUrl(row.url + path.sep + directory))
          }
        } catch (e) {
          sources.push(toContentSource(row, tags, clips))
          logger.error('Failed to read local directory', e)
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
    this.allURLs = {}
    this.sourceIndex = 0
    this.canScrape = true

    for (const source of sceneSources) {
      this.allURLs[source.url] = []
      this.scrapeQueue[source.url] = [
        { source, helpers: { next: -1, count: 0, retries: 0 } }
      ]
    }
  }

  public async getSourceUrls(sourceUrl?: string) {
    let scrapeUrl = sourceUrl
    if (this.canScrape && scrapeUrl == null) {
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
      this.canScrape = false
    }

    return sourceUrl != null
      ? this.allURLs[sourceUrl]
      : Object.keys(this.allURLs).filter((key) => this.allURLs[key].length > 0)
  }

  private async scrapeSource(sourceUrl: string) {
    if (this.captcha != null) {
      return // TODO handle captcha
    }

    const promiseData = this.scrapeQueue[sourceUrl].pop()
    if (promiseData == null) return

    const { imageTypeFilter, weightFunction } = this.scene
    const request: ScrapeRequest = {
      allURLs: this.allURLs,
      allPosts: this.allPosts,
      caching: this.caching,
      remoteSettings: this.remoteSettings,
      source: promiseData.source,
      filter: imageTypeFilter,
      weight: weightFunction,
      helpers: promiseData.helpers
    }

    const response = await SourceScraper.pool.exec(request)
    const object = this.processResponse(response)
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
        if (object.allURLs) {
          this.allURLs = object.allURLs
        }

        this.allPosts = object.allPosts ?? {}

        // Add the next promise to the queue
        const { source, helpers } = object
        if (helpers?.next != null) {
          this.scrapeQueue[source.url].push({ source, helpers })
          this.canScrape = true
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
    if (
      object?.source &&
      object?.data &&
      object?.allURLs &&
      object?.weight &&
      object?.helpers
    ) {
      const source = object.source
      if ((source.blacklist?.length ?? 0) > 0) {
        object.data = object.data.filter(
          (url: string) => !source.blacklist.includes(url)
        )
      }

      object.data = this.rewriteURLs(object.data)
      object.allURLs = this.processAllURLs(
        object.data,
        object.allURLs,
        object.source,
        object.weight,
        object.helpers
      )
    }

    return object
  }

  private rewriteURLs(data: string[]) {
    return data.map((url) => {
      const sourceType = getSourceType(url)
      if (sourceType === ST.local || sourceType === ST.video) {
        const uuid = fileRegistry().set(url)
        url = `http://${getServerHost()}:${getServerPort()}/fs/file/registry/${uuid}`
      } else if (
        sourceType === ST.imagefap ||
        sourceType === ST.deviantart ||
        sourceType === ST.luscious ||
        sourceType === ST.bdsmlr ||
        sourceType === ST.hydrus
      ) {
        let ext: string | undefined = undefined
        if (sourceType === ST.hydrus) {
          ext = new URL(url).searchParams.get('ext') ?? undefined
        }

        let proxyRequest: ProxyRequest
        if (sourceType === ST.bdsmlr) {
          const pieces = url.split(':::')
          proxyRequest = { url: pieces[0], headers: JSON.parse(pieces[1]) }
        } else {
          proxyRequest = { url }
        }

        const uuid = proxy().set(proxyRequest, ext)
        url = `http://${getServerHost()}:${getServerPort()}/proxy/${uuid}`
      }

      return url
    })
  }

  private processAllURLs(
    data: string[],
    allURLs: Record<string, string[]>,
    source: ContentSource,
    weight: string,
    helpers: ScraperHelpers
  ): Record<string, string[]> {
    const newAllURLs = { ...allURLs }
    if (helpers.next != null && (helpers.next as number) <= 0) {
      if (weight === WF.sources) {
        newAllURLs[source.url] = data
      } else {
        for (const d of data) {
          newAllURLs[d] = [source.url]
        }
      }
    } else {
      if (weight === WF.sources) {
        const sourceURLs = newAllURLs[source.url] ?? []
        newAllURLs[source.url] = sourceURLs.concat(
          data.filter((u: string) => {
            const fileName = getFileName(u, path.sep)
            const found = sourceURLs
              .map((u: string) => getFileName(u, path.sep))
              .includes(fileName)
            return !found
          })
        )
      } else {
        for (const d of data.filter((u: string) => {
          const fileName = getFileName(u, path.sep)
          const found = Object.keys(newAllURLs)
            .map((u: string) => getFileName(u, path.sep))
            .includes(fileName)
          return !found
        })) {
          newAllURLs[d] = [source.url]
        }
      }
    }

    return newAllURLs
  }
}

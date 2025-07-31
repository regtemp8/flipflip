import fs from 'fs'
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
  PlayerCaptcha
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
import { scrapeFiles } from './Scrapers'
import { findCacheSettings } from '../db/CacheSettingsRepository'
import { findRemoteSettings } from '../db/RemoteSettingsRepository'
import { findContentSourceClipIds } from '../db/ClipRepository'

const logger = Logger.create('SourceScraper')
async function getDirectories(path: string) {
  const dirs = await fs.promises.readdir(path, { withFileTypes: true })
  return dirs
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
}

interface ScraperProgress {
  total: number
  current: number
  message: string[]
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
  private readonly scene: Scene
  private readonly caching: CacheSettings
  private readonly remoteSettings: RemoteSettings

  private sceneSources: ContentSource[]
  private allURLs: Record<string, string[]>
  private allPosts: Record<string, string>
  private promiseQueue: Array<ScrapedSourcePromise>
  private completed: boolean
  private progress: ScraperProgress
  private running: boolean
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
    this.sceneSources = sceneSources
    this.promiseQueue = []
    this.allPosts = {}
    this.allURLs = {}
    this.progress = {
      total: sceneSources.length,
      current: 0,
      message: []
    }
    this.running = false
    this.completed = false

    for (const sceneSource of sceneSources) {
      this.allURLs[sceneSource.url] = []
    }
  }

  public getUrls() {
    return this.allURLs
  }

  public async start() {
    if (this.running || this.completed) {
      return
    }

    this.running = true
    const { total, current } = this.progress
    if (current === total) {
      setTimeout(() => {
        this.promiseLoop()
      }, 200)
    } else {
      setTimeout(() => {
        this.sourceLoop()
      }, 200)
    }
  }

  public stop() {
    this.running = false
  }

  private async sourceLoop() {
    if (!this.running) {
      return
    }

    const source = this.sceneSources[this.progress.current]
    this.progress.current++
    this.progress.message = [source.url]

    const { imageTypeFilter, weightFunction } = this.scene
    const object = await scrapeFiles(
      this.allURLs,
      this.allPosts,
      this.caching,
      this.remoteSettings,
      source,
      imageTypeFilter,
      weightFunction,
      { next: -1, count: 0, retries: 0 }
    )

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

    if (object?.source) {
      // Just add the new urls to the end of the list
      if (object?.data && object?.allURLs) {
        this.allURLs = object.allURLs
        this.allPosts = object.allPosts ?? {}

        // Add the next promise to the queue
        const { source, helpers } = object
        if (helpers?.next != null) {
          this.promiseQueue.push({ source, helpers })
        }

        await updateContentSourceCount(
          source.url,
          helpers?.count ?? 0,
          helpers?.next == null
        )
      }
    }

    const { total, current } = this.progress
    if (current < total) {
      const timeout = object?.timeout ?? 1000
      setTimeout(() => {
        this.sourceLoop()
      }, timeout)
    } else {
      setTimeout(() => {
        this.promiseLoop()
      }, 200)
    }
  }

  private async promiseLoop() {
    if (this.promiseQueue.length === 0) {
      this.running = false
      this.completed = true
    }
    if (!this.running) {
      return
    }

    if (this.captcha != null) {
      setTimeout(() => {
        this.promiseLoop()
      }, 2000)
    }

    const promiseData = this.promiseQueue.pop()
    if (promiseData == null) return

    const { imageTypeFilter, weightFunction } = this.scene
    const object = await scrapeFiles(
      this.allURLs,
      this.allPosts,
      this.caching,
      this.remoteSettings,
      promiseData.source,
      imageTypeFilter,
      weightFunction,
      promiseData.helpers
    )

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
          this.promiseQueue.push({ source, helpers })
        }

        await updateContentSourceCount(
          source.url,
          helpers?.count ?? 0,
          helpers?.next == null
        )
      }

      const timeout = object?.timeout ?? 1000
      setTimeout(() => {
        this.promiseLoop()
      }, timeout)
    }
  }
}

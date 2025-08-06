import { ValueResponse, ImageViewData, ViewerEvent } from 'flipflip-common'
import ScenePlaylistPlayer from './ScenePlaylistPlayer'
import ContentLoader from './ContentLoader'
import { User, Scene as SceneRow } from '../db/types/generated'
import Logger from '../logging/Logger'
import { findDisplaySettings } from '../db/DisplaySettingsRepository'
import UrlLoader from './UrlLoader'
import { findSceneById } from '../db/SceneRepository'
import { toScene } from '../db/mappers'

interface ViewPlayerItem {
  sceneId: number
  loaderTimeLeft: number
  viewerShownTimeLeft: number
  viewerLoadedTimeLeft: number
  queue: ImageViewData[]
  urlLoader: UrlLoader
  contentLoader: ContentLoader
  retries: number
}

async function getNextViewPlayerItem(
  playlistPlayer: ScenePlaylistPlayer,
  user: User
): Promise<ViewPlayerItem | undefined> {
  const nextPlaylistItem = playlistPlayer.next()
  if (nextPlaylistItem != null) {
    const { sceneId, duration } = nextPlaylistItem
    const scene = toScene((await findSceneById(sceneId)) as SceneRow)
    const urlLoader = await UrlLoader.create(scene, user)
    const contentLoader = await ContentLoader.create(scene, user)
    return {
      sceneId,
      loaderTimeLeft: duration,
      viewerLoadedTimeLeft: duration,
      viewerShownTimeLeft: duration,
      queue: [],
      urlLoader,
      contentLoader,
      retries: 0
    }
  } else {
    return undefined
  }
}

const logger = Logger.create('ViewPlayer')
export default class ViewPlayer {
  private readonly viewId: number
  private readonly user: User
  private readonly maxInMemory: number
  private playlistPlayer: ScenePlaylistPlayer
  private current: ViewPlayerItem
  private next?: ViewPlayerItem
  private loading: boolean
  private preloading: boolean
  private doneLoading: boolean

  private constructor(
    viewId: number,
    user: User,
    maxInMemory: number,
    playlistPlayer: ScenePlaylistPlayer,
    current: ViewPlayerItem,
    next?: ViewPlayerItem
  ) {
    this.viewId = viewId
    this.user = user
    this.maxInMemory = maxInMemory
    this.playlistPlayer = playlistPlayer
    this.current = current
    this.next = next
    this.loading = false
    this.preloading = false
    this.doneLoading = false
  }

  public getViewId() {
    return this.viewId
  }

  public getCurrentSceneId() {
    return this.current.sceneId
  }

  public start() {
    this.startLoading()
  }

  public stop() {
    this.loading = false
    this.preloading = false
  }

  public take(totalCount: number) {
    const currentCount = Math.min(totalCount, this.current.queue.length)
    let items: ImageViewData[] = []
    if (this.current.viewerLoadedTimeLeft > 0) {
      items = items.concat(this.current.queue.splice(0, currentCount))
    }
    if (
      this.current.viewerLoadedTimeLeft <= 0 &&
      totalCount > currentCount &&
      this.next != null &&
      this.next.queue.length > 0 &&
      this.next.viewerLoadedTimeLeft > 0
    ) {
      const nextCount = Math.min(
        totalCount - currentCount,
        this.next.queue.length
      )
      items = items.concat(this.next.queue.splice(0, nextCount))
    }

    this.startLoading()
    return items
  }

  public async onEvent({
    event,
    sceneId,
    duration
  }: ViewerEvent): Promise<ValueResponse | undefined> {
    logger.info(
      "Received event: '{event}' for scene: {sceneId}, duration: {duration}",
      { event, sceneId, duration }
    )

    let item: ViewPlayerItem
    if (this.current.sceneId === sceneId) {
      item = this.current
    } else if (this.next != null && this.next.sceneId === sceneId) {
      item = this.next
    } else {
      logger.info(
        'Event sceneId does not match current or next sceneId, ignoring event (event: {sceneId}, current: {current}, next: {next})',
        { current: this.current.sceneId, next: this.next?.sceneId, sceneId }
      )
      return
    }

    if (event === 'discarded') {
      item.loaderTimeLeft += duration
      this.startLoading()
    } else if (event === 'loaded') {
      item.viewerLoadedTimeLeft -= duration
      logger.info('Viewer loaded time left: {viewerLoadedTimeLeft}', {
        viewerLoadedTimeLeft: item.viewerLoadedTimeLeft
      })

      this.doneLoading =
        this.current.viewerLoadedTimeLeft <= 0 &&
        (this.next?.viewerLoadedTimeLeft ?? 0) <= 0
      return { value: this.doneLoading }
    } else if (event === 'shown') {
      item.viewerShownTimeLeft -= duration
      logger.info('Viewer shown time left: {viewerShownTimeLeft}', {
        viewerShownTimeLeft: item.viewerShownTimeLeft
      })
      if (item.viewerShownTimeLeft <= 0) {
        const newSceneId = await this.changeViewPlayerItem()
        if (newSceneId != null) {
          logger.info('Scene changed, new scene id: {sceneId}', {
            sceneId: newSceneId
          })
          return { value: newSceneId }
        }
      }
    }
  }

  private startLoading() {
    if (this.loading || this.doneLoading) {
      return
    }

    logger.info('Start loading')
    this.loading = true
    setTimeout(() => this.load(), 1000)
  }

  private async load() {
    if (!this.loading) {
      return
    }

    let timeout = 0
    if (
      (this.current.loaderTimeLeft > 0 &&
        this.current.queue.length < this.maxInMemory) ||
      (this.current.viewerLoadedTimeLeft > 0 && this.current.queue.length < 3)
    ) {
      logger.info(
        'Load current image view - loaderTimeLeft: {timeLeft}, queue.length: {queue}',
        {
          timeLeft: this.current.loaderTimeLeft,
          queue: this.current.queue.length
        }
      )
      await this.loadImageView(this.current)
      timeout = 2 ** this.current.retries * 100
    } else if (
      !this.preloading &&
      this.next != null &&
      this.next.loaderTimeLeft > 0 &&
      this.next.queue.length < this.maxInMemory
    ) {
      logger.info('Load next image view - loaderTimeLeft: {timeLeft}', {
        timeLeft: this.next.loaderTimeLeft
      })
      await this.loadImageView(this.next)
      timeout = 2 ** this.next.retries * 100
    } else {
      logger.info('Stop loading')
      this.loading = false
    }

    setTimeout(() => this.load(), timeout)
  }

  private startPreloading() {
    if (this.preloading || this.doneLoading) {
      return
    }

    logger.info('Start preloading')
    this.preloading = true
    setTimeout(() => this.preload(), 1000)
  }

  private async preload() {
    if (!this.preloading) {
      return
    }

    let timeout = 0
    if (
      this.next != null &&
      this.next.queue.length < 5 &&
      this.next.loaderTimeLeft > 0
    ) {
      logger.info('Preload')
      await this.loadImageView(this.next)
      timeout = 2 ** this.next.retries * 100
    } else {
      logger.info('Stop preloading')
      this.preloading = false
    }

    setTimeout(() => this.preload(), timeout)
  }

  private async loadImageView(item: ViewPlayerItem) {
    const url = await item.urlLoader.getUrl()
    if (url == null) {
      item.retries++
      logger.warn('Failed to get URL')
      return undefined
    }

    const data = await item.contentLoader.getData(url)
    if (data == null || data.error || !item.contentLoader.shouldLoad(data)) {
      return undefined
    }

    const view = item.contentLoader.getViewData(data) // TODO audio BPM
    const transform = item.contentLoader.getTransform(data)
    const effects = item.contentLoader.getEffects(data, view.timeToNextFrame) // TODO audio BPM
    const imageView = item.contentLoader.getImageView(
      data,
      effects,
      view,
      transform
    )
    if (imageView != null) {
      item.queue.push(imageView)
      item.loaderTimeLeft -= imageView.view.timeToNextFrame
      item.retries = 0
    } else {
      item.retries++
    }
  }

  private async changeViewPlayerItem() {
    logger.info('Change View Player Item')
    if (this.next == null) {
      logger.info('No next view player item, stopping view player')
      this.stop()
      return
    }

    this.doneLoading = false
    this.current = this.next
    this.next = await getNextViewPlayerItem(this.playlistPlayer, this.user)
    if (this.next != null) {
      this.startPreloading()
    }

    return this.current.sceneId
  }

  public static async create(viewId: number, user: User): Promise<ViewPlayer> {
    const playlistPlayer = await ScenePlaylistPlayer.create(viewId)
    // TODO must check beforehand that each scene playlist has at least 1 item
    const current = (await getNextViewPlayerItem(
      playlistPlayer,
      user
    )) as ViewPlayerItem
    const next = await getNextViewPlayerItem(playlistPlayer, user)
    const { maxInMemory } = await findDisplaySettings(user)
    return new ViewPlayer(
      viewId,
      user,
      maxInMemory,
      playlistPlayer,
      current,
      next
    )
  }
}

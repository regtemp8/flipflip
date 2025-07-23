import { ValueResponse, ImageViewData } from "flipflip-common"
import ScenePlaylistPlayer from "./ScenePlaylistPlayer"
import sourceScrapers from "../scraper/SourceScraperService"
import ContentLoader from "./ContentLoader"
import { User } from "../db/types/generated"
import Logger from "../logging/Logger"
import { findDisplaySettings } from "../db/DisplaySettingsRepository"

interface ViewerEvent {
  event: 'shown' | 'discarded'
  sceneId: number
  duration: number
}

interface ViewPlayerItem {
  sceneId: number
  loaderTimeLeft: number
  viewerTimeLeft: number
  queue: ImageViewData[]
  loader: ContentLoader
  retries: number
}

async function getNextViewPlayerItem(playlistPlayer: ScenePlaylistPlayer, user: User): Promise<ViewPlayerItem | undefined> {
  const nextPlaylistItem = playlistPlayer.next()
  if (nextPlaylistItem != null) {
    const { sceneId, duration } = nextPlaylistItem
    const loader = await ContentLoader.create(sceneId, user)
    return { sceneId, loaderTimeLeft: duration, viewerTimeLeft: duration, queue: [], loader, retries: 0 }
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
  }

  public getViewId() {
    return this.viewId
  }

  public getCurrentSceneId() {
    return this.current.sceneId
  }

  public start() {
    sourceScrapers().subscribe(this.current.sceneId, this.user)
    if (this.next != null) {
      sourceScrapers().subscribe(this.next.sceneId, this.user)
    }

    this.startLoading()
  }

  public stop() {
    this.loading = false
    this.preloading = false
  }

  public take(itemCount: number) {
    if(itemCount > this.current.queue.length) {
      itemCount = this.current.queue.length
    }

    const items = this.current.queue.splice(0, itemCount)
    this.startLoading()
    return items
  }

  public getProgress() {
    return sourceScrapers().getProgress(this.current.sceneId)
  }

  // TODO if ValueResponse return 200 else 204
  public async onEvent({ event, sceneId, duration }: ViewerEvent): Promise<ValueResponse | undefined> {
    if (this.current.sceneId !== sceneId) {
      return
    }
    if (event === 'discarded') {
      this.current.loaderTimeLeft += duration
      this.startLoading()
    } else if (event === 'shown') {
      this.current.viewerTimeLeft -= duration
      if (this.current.viewerTimeLeft <= 0) {
        const newSceneId = await this.changeViewPlayerItem()
        if (newSceneId != null) {
          return { value: newSceneId }
        }
      }
    }
  }

  private startLoading() {
    if (this.loading) {
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
    if ((this.current.loaderTimeLeft > 0 && this.current.queue.length < this.maxInMemory) || this.current.queue.length < 3) {
      logger.info('Load current image view - loaderTimeLeft: {timeLeft}, queue.length: {queue}', {timeLeft: this.current.loaderTimeLeft, queue: this.current.queue.length})
      await this.loadImageView(this.current)
      timeout = (2 ** this.current.retries) * 100
    } else if (!this.preloading && this.next != null && this.next.loaderTimeLeft > 0 && this.next.queue.length < this.maxInMemory) {
      logger.info('Load next image view - loaderTimeLeft: {timeLeft}', {timeLeft: this.next.loaderTimeLeft})
      await this.loadImageView(this.next)
      timeout = (2 ** this.next.retries) * 100
    } else {
      logger.info('Stop loading')
      this.loading = false
    }

    setTimeout(() => this.load(), timeout)
  }

  private startPreloading() {
    if (this.preloading) {
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
    if (this.next != null && this.next.queue.length < 5 && this.next.loaderTimeLeft > 0) {
      logger.info('Preload')
      await this.loadImageView(this.next)
      timeout = (2 ** this.next.retries) * 100
    } else {
      logger.info('Stop preloading')
      this.preloading = false
    }

    setTimeout(() => this.preload(), timeout)
  }

  private async loadImageView(item: ViewPlayerItem) {
    const data = await item.loader.getData()
    if (data == null || data.error || !item.loader.shouldLoad(data)) {
      return undefined
    }

    const view = item.loader.getViewData(data) // TODO audio BPM
    const transform = item.loader.getTransform(data)
    const effects = item.loader.getEffects(data, view.timeToNextFrame) // TODO audio BPM
    const imageView = item.loader.getImageView(data, effects, view, transform)
    if (imageView != null) {
      item.queue.push(imageView)
      item.loaderTimeLeft -= imageView.view.timeToNextFrame
      item.retries = 0
    } else {
      item.retries++
    }
  }

  private async changeViewPlayerItem() {
    sourceScrapers().unsubscribe(this.current.sceneId)
    if (this.next == null) {
      this.stop()
      return
    }

    this.current = this.next
    this.next = await getNextViewPlayerItem(this.playlistPlayer, this.user)
    if (this.next != null) {
      sourceScrapers().subscribe(this.next.sceneId, this.user)
      this.startPreloading()
      return this.next.sceneId
    }
  }

  public static async create(viewId: number, user: User): Promise<ViewPlayer> {
    const playlistPlayer = await ScenePlaylistPlayer.create(viewId)
    // TODO must check beforehand that each scene playlist has at least 1 item
    const current = await getNextViewPlayerItem(playlistPlayer, user) as ViewPlayerItem
    const next = await getNextViewPlayerItem(playlistPlayer, user)
    const {maxInMemory} = await findDisplaySettings(user)
    return new ViewPlayer(viewId, user, maxInMemory, playlistPlayer, current, next)
  }
}
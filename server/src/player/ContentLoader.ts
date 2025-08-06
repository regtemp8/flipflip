import fs from 'fs'
import {
  BT,
  getRandomColor,
  getSourceType,
  isImage,
  isVideo,
  OF,
  OT,
  SOF,
  ST,
  WF,
  ContentSource,
  Scene,
  HTF,
  VTF,
  STF,
  TF,
  IT,
  IF,
  SL,
  VO,
  GO,
  SC,
  ImageViewData,
  ContentData,
  TransformData,
  ViewData,
  EffectsData,
  ContentType,
  EasingParams,
  VideoClipData,
  BackgroundStyle,
  StrobeData,
  ZoomMoveData,
  SlideData,
  CrossFadeData,
  FadeInOutLoopData,
  PanningLoopData,
  PanningData,
  ViewVideoData
} from 'flipflip-common'
import DurationCalculator from './DurationCalculator'
import imageSize from 'image-size'
import sourceScrapers from '../scraper/SourceScraperService'
import {
  flatten,
  getFfprobePath,
  getRandomBoolean,
  getRandomFloat,
  getRandomInteger,
  getRandomListItem,
  getServerHost,
  getServerPort
} from '../utils'
import Logger from '../logging/Logger'
import gifInfo from 'gif-info'
import ffprobe from 'ffprobe'
import { toContentSource, toScene } from '../db/mappers'
import { findSceneById } from '../db/SceneRepository'
import { Scene as SceneRow, User } from '../db/types/generated'
import {
  findContentSources,
  findContentSourceTagIds
} from '../db/ContentSourceRepository'
import { findDisplaySettings } from '../db/DisplaySettingsRepository'
import { toBoolean } from '../db/utils'
import fileRegistry from '../routes/FileRegistry'
import proxy, { ProxyRequest } from '../routes/ProxyService'
import UrlLoader from './UrlLoader'

function newContentData(
  url: string,
  type?: ContentType,
  width?: number,
  height?: number
): ContentData {
  const error = type == null
  return { url, error, type, width, height }
}

interface LoadCriteria {
  minImageSize: number
  minVideoSize: number
  imageOrientation: string
  videoOrientation: string
  imageTypeFilter: string
}

interface TransformCriteria {
  imageOrientation: string
  videoOrientation: string
}

export interface SceneData {
  gifOption: string
  gifTimingConstant: number
  gifTimingMin: number
  gifTimingMax: number
  videoOption: string
  videoTimingConstant: number
  videoTimingMin: number
  videoTimingMax: number
  videoVolume: number
  videoRandomSpeed: boolean
  videoSpeed: number
  videoSpeedMin: number
  videoSpeedMax: number
  randomVideoStart: boolean
  skipVideoStart: number
  skipVideoEnd: number
  continueVideo: boolean
  timingTF: string
  timingDuration: number
  timingDurationMin: number
  timingDurationMax: number
  timingSinRate: number
  timingBPMMulti: number
  bpm?: number
  imageType: string
  backgroundType: string
  backgroundColor: string
  backgroundColorSet: string[]
  backgroundBlur: number
  slide: boolean
}

const logger = Logger.create('ContentLoader')
export default class ContentLoader {
  private readonly scene: Scene
  private readonly loadCriteria: LoadCriteria
  private readonly transformCriteria: TransformCriteria
  private urlLoader: UrlLoader
  private dataCache: Map<string, ContentData>
  private loadCache: Map<string, boolean>
  private transformCache: Map<string, TransformData>
  private videoPlaybackPositions: Map<string, number>

  private timeToNextFrameDuration: DurationCalculator
  private strobeDuration: DurationCalculator
  private strobeDelayDuration: DurationCalculator
  private zoomMoveDuration: DurationCalculator
  private slideDuration: DurationCalculator
  private crossFadeDuration: DurationCalculator
  private fadeInOutDuration: DurationCalculator
  private panningDuration: DurationCalculator
  private maxSlideDuration: DurationCalculator
  private maxCrossFadeDuration: DurationCalculator

  private strobeEasing?: EasingParams
  private zoomMoveEasing?: EasingParams
  private slideEasing?: EasingParams
  private crossFadeEasing?: EasingParams
  private fadeIOStartEasing?: EasingParams
  private fadeIOEndEasing?: EasingParams
  private panningStartEasing?: EasingParams
  private panningEndEasing?: EasingParams

  private displayIndex?: number

  public static async create(
    sceneId: number,
    user: User
  ): Promise<ContentLoader> {
    const scene = toScene((await findSceneById(sceneId)) as SceneRow)

    const sources: ContentSource[] = []
    const sourceRows = await findContentSources(sceneId)
    for (const row of sourceRows) {
      const tags = await findContentSourceTagIds(
        row.id as number,
        user.id as number
      )
      sources.push(toContentSource(row, tags))
    }

    const { easingControls, minImageSize, minVideoSize } =
      await findDisplaySettings(user)

    const loadCriteria = {
      minImageSize,
      minVideoSize,
      imageOrientation: scene.imageOrientation,
      videoOrientation: scene.videoOrientation,
      imageTypeFilter: scene.imageTypeFilter
    }
    const transformCriteria = {
      imageOrientation: scene.imageOrientation,
      videoOrientation: scene.videoOrientation
    }

    return new ContentLoader(
      scene,
      sources,
      toBoolean(easingControls),
      loadCriteria,
      transformCriteria
    )
  }

  private constructor(
    scene: Scene,
    sources: ContentSource[],
    easingControls: boolean,
    loadCriteria: LoadCriteria,
    transformCriteria: TransformCriteria
  ) {
    this.scene = scene
    this.loadCriteria = loadCriteria
    this.transformCriteria = transformCriteria
    this.urlLoader = UrlLoader.create(scene, sources)
    this.dataCache = new Map<string, ContentData>()
    this.loadCache = new Map<string, boolean>()
    this.transformCache = new Map<string, TransformData>()
    this.videoPlaybackPositions = new Map<string, number>()
    this.timeToNextFrameDuration = new DurationCalculator({
      timingFunction: this.scene.timingFunction,
      time: this.scene.timingConstant,
      timeMin: this.scene.timingMin,
      timeMax: this.scene.timingMax,
      sinRate: this.scene.timingSinRate,
      bpmMulti: this.scene.timingBPMMulti
    })
    this.strobeDuration = new DurationCalculator({
      timingFunction: scene.strobeTF,
      time: scene.strobeTime,
      timeMax: scene.strobeTimeMax,
      timeMin: scene.strobeTimeMin,
      sinRate: scene.strobeSinRate,
      bpmMulti: scene.strobeBPMMulti
    })
    this.strobeDelayDuration = new DurationCalculator({
      timingFunction: scene.strobeDelayTF,
      time: scene.strobeDelay,
      timeMax: scene.strobeDelayMax,
      timeMin: scene.strobeDelayMin,
      sinRate: scene.strobeDelaySinRate,
      bpmMulti: scene.strobeDelayBPMMulti
    })
    this.zoomMoveDuration = new DurationCalculator({
      timingFunction: this.scene.transTF,
      time: this.scene.transDuration,
      timeMax: this.scene.transDurationMax,
      timeMin: this.scene.transDurationMin,
      sinRate: this.scene.transSinRate,
      bpmMulti: this.scene.transBPMMulti
    })
    this.slideDuration = new DurationCalculator({
      timingFunction: this.scene.slideTF,
      time: this.scene.slideDuration,
      timeMin: this.scene.slideDurationMin,
      timeMax: this.scene.slideDurationMax,
      sinRate: this.scene.slideSinRate,
      bpmMulti: this.scene.slideBPMMulti
    })
    this.crossFadeDuration = new DurationCalculator({
      timingFunction: this.scene.fadeTF,
      time: this.scene.fadeDuration,
      timeMin: this.scene.fadeDurationMin,
      timeMax: this.scene.fadeDurationMax,
      sinRate: this.scene.fadeSinRate,
      bpmMulti: this.scene.fadeBPMMulti
    })
    this.fadeInOutDuration = new DurationCalculator({
      timingFunction: this.scene.fadeIOTF,
      time: this.scene.fadeIODuration,
      timeMin: this.scene.fadeIODurationMin,
      timeMax: this.scene.fadeIODurationMax,
      sinRate: this.scene.fadeIOSinRate,
      bpmMulti: this.scene.fadeIOBPMMulti
    })
    this.panningDuration = new DurationCalculator({
      timingFunction: this.scene.panTF,
      time: this.scene.panDuration,
      timeMin: this.scene.panDurationMin,
      timeMax: this.scene.panDurationMax,
      sinRate: this.scene.panSinRate,
      bpmMulti: this.scene.panBPMMulti
    })
    this.maxSlideDuration = new DurationCalculator({
      timingFunction: scene.slideTF,
      time: scene.slideDuration,
      timeMin: scene.slideDurationMin,
      timeMax: scene.slideDurationMax,
      sinRate: 1,
      bpmMulti: scene.slideBPMMulti
    })
    this.maxCrossFadeDuration = new DurationCalculator({
      timingFunction: scene.fadeTF,
      time: scene.fadeDuration,
      timeMin: scene.fadeDurationMin,
      timeMax: scene.fadeDurationMax,
      sinRate: 1,
      bpmMulti: scene.fadeBPMMulti
    })
    if (easingControls) {
      this.strobeEasing = {
        ea: this.scene.strobeEase,
        exp: this.scene.strobeExp,
        amp: this.scene.strobeAmp,
        per: this.scene.strobePer,
        ov: this.scene.strobeOv
      }
      this.zoomMoveEasing = {
        ea: this.scene.transEase,
        exp: this.scene.transExp,
        amp: this.scene.transAmp,
        per: this.scene.transPer,
        ov: this.scene.transOv
      }
      this.slideEasing = {
        ea: this.scene.slideEase,
        exp: this.scene.slideExp,
        amp: this.scene.slideAmp,
        per: this.scene.slidePer,
        ov: this.scene.slideOv
      }
      this.crossFadeEasing = {
        ea: this.scene.fadeEase,
        exp: this.scene.fadeExp,
        amp: this.scene.fadeAmp,
        per: this.scene.fadePer,
        ov: this.scene.fadeOv
      }
      this.fadeIOStartEasing = {
        ea: this.scene.fadeIOStartEase,
        exp: this.scene.fadeIOStartExp,
        amp: this.scene.fadeIOStartAmp,
        per: this.scene.fadeIOStartPer,
        ov: this.scene.fadeIOStartOv
      }
      this.fadeIOEndEasing = {
        ea: this.scene.fadeIOEndEase,
        exp: this.scene.fadeIOEndExp,
        amp: this.scene.fadeIOEndAmp,
        per: this.scene.fadeIOEndPer,
        ov: this.scene.fadeIOEndOv
      }
      this.panningStartEasing = {
        ea: this.scene.panStartEase,
        exp: this.scene.panStartExp,
        amp: this.scene.panStartAmp,
        per: this.scene.panStartPer,
        ov: this.scene.panStartOv
      }
      this.panningEndEasing = {
        ea: this.scene.panEndEase,
        exp: this.scene.panEndExp,
        amp: this.scene.panEndAmp,
        per: this.scene.panEndPer,
        ov: this.scene.panEndOv
      }
      if (this.scene.orderFunction === OF.strict) {
        this.displayIndex = 0
      }
    }
  }

  private isLocal(url: URL) {
    return (
      url.hostname === getServerHost() &&
      url.port === getServerPort().toString()
    )
  }

  private getLocalFilePath(url: URL) {
    const fileRegistryPath = '/fs/file/registry/'
    if (this.isLocal(url) && url.pathname.startsWith(fileRegistryPath)) {
      logger.info('Get local file: {url}', { url })
      return fileRegistry().get(url.pathname.substring(fileRegistryPath.length))
    }
  }

  private getProxyRequest(url: URL) {
    const proxyPath = '/proxy/'
    if (this.isLocal(url) && url.pathname.startsWith(proxyPath)) {
      logger.info('Get proxied file: {url}', { url })
      const request = proxy().getRequest(
        url.pathname.substring(proxyPath.length)
      )
      if (request == null) {
        throw new Error('Failed to get proxy request')
      }

      return request
    }
  }

  private async getImageBuffer(imageUrl: string) {
    const url = new URL(imageUrl)
    const localFilePath = this.getLocalFilePath(url)
    if (localFilePath != null) {
      return await fs.promises.readFile(localFilePath)
    }

    const request = this.getProxyRequest(url) ?? { url: imageUrl }
    logger.info('Fetch image: {url}', { url: request.url })
    const response = await fetch(request.url, { headers: request.headers })
    const buffer = await response.arrayBuffer()
    return Buffer.from(buffer)
  }

  public async getData(): Promise<ContentData | undefined> {
    const url = await this.urlLoader.getUrl()
    if (url == null) {
      logger.warn('Failed to get URL')
      return
    }

    const data = this.dataCache.get(url)
    if (data != null) {
      return data
    }

    const sourceType = getSourceType(url)
    if (sourceType === ST.nimja) {
      const proxyURL = this.proxyNimjaURL(url)
      const data = newContentData(proxyURL, 'iframe')
      this.dataCache.set(url, data)
      return data
    } else if (isImage(url, false)) {
      let buffer: Buffer
      try {
        buffer = await this.getImageBuffer(url)
      } catch {
        const errorData = newContentData(url)
        errorData.error = true
        this.dataCache.set(url, errorData)
        return errorData
      }

      const { width, height } = imageSize(buffer)
      const data = newContentData(url, 'image', width, height)

      // TODO parse URL and use path in case there are query params
      if (url.endsWith('.gif')) {
        try {
          const info = gifInfo(buffer)
          if (info != null) {
            data.animated = info.animated
            data.duration = info.duration // TODO browser specific duration, see beta4 GIFDataLoader
          }
        } catch {
          const errorData = newContentData(url)
          errorData.error = true
          this.dataCache.set(url, errorData)
          return errorData
        }
      }

      this.dataCache.set(url, data)
      return data
    } else if (isVideo(url, false)) {
      let clip: VideoClipData | undefined
      const clipRegex =
        /(.*):::(\d+):([\d-]+):::(\d+\.?\d*):(\d+\.?\d*)$/g.exec(url)
      if (clipRegex != null) {
        clip = {
          url: clipRegex[1],
          id: Number(clipRegex[2]),
          start: Number(clipRegex[4]),
          end: Number(clipRegex[5])
        }
        if (clipRegex[3] !== '-') {
          clip.volume = Number(clipRegex[3]) / 100
        }
      }

      let videoStream: ffprobe.FFProbeStream | undefined
      try {
        const videoUrl = clip?.url ?? url
        const probeUrl =
          this.getLocalFilePath(new URL(videoUrl)) ??
          this.getProxyRequest(new URL(videoUrl))?.url ??
          videoUrl
        const info = await ffprobe(probeUrl, {
          path: getFfprobePath()
        })
        videoStream = info.streams.find(
          (stream) => stream.codec_type == 'video'
        )
        if (videoStream == null) {
          throw new Error('Video stream not found')
        }
      } catch (error) {
        logger.error('Failed to read video stream', { error })
        const errorData = newContentData(url)
        errorData.error = true
        this.dataCache.set(url, errorData)
        return errorData
      }

      const { width, height, duration } = videoStream
      const data = newContentData(url, 'video', width, height)
      data.clip = clip
      if (duration != null) {
        data.duration = Number(duration) * 1000
      }

      this.dataCache.set(url, data)
      return data
    } else {
      this.dataCache.set(url, newContentData(url))
      logger.error(`Unsupported type: ${url}`)
    }
  }

  private proxyNimjaURL(url: string) {
    const host = getServerHost()
    const port = getServerPort()
    return url.replace(
      'https://hypno.nimja.com',
      `http://${host}:${port}/proxy/nimja`
    )
  }

  public getTransform(data: ContentData): TransformData {
    const criteria = this.transformCriteria
    const key = JSON.stringify({ url: data.url, criteria })
    let transform = this.transformCache.get(key)
    if (transform != null) {
      return transform
    }

    let rotate = false
    if (data.type === 'image') {
      rotate = this.shouldRotate(data, criteria.imageOrientation)
    } else if (data.type === 'video') {
      rotate = this.shouldRotate(data, criteria.videoOrientation)
    }

    transform = { rotate }
    this.transformCache.set(key, transform)
    return transform
  }

  private shouldRotate(data: ContentData, orientation: string) {
    const width = data.width as number
    const height = data.height as number
    switch (orientation) {
      case OT.forceLandscape:
        return width < height
      case OT.forcePortrait:
        return height < width
      default:
        return false
    }
  }

  public getViewData(data: ContentData, bpm?: number) {
    const timeToNextFrame = this.timeToNextFrameDuration.calc(0, bpm)
    const backgroundStyle = this.getBackgroundStyle()
    const view: ViewData = {
      timeToNextFrame,
      imageType: this.scene.imageType,
      backgroundType: this.scene.backgroundType,
      backgroundStyle
    }

    if (data.type === 'video') {
      let start: number
      let end: number
      const duration = (data.duration as number) / 1000
      if (this.scene.playVideoClips) {
        start = data.clip?.start ?? 0
        end = data.clip?.end ?? duration
      } else {
        start = this.scene.skipVideoStart / 1000
        end = duration - this.scene.skipVideoEnd / 1000
      }

      const speed = this.calcVideoSpeed()
      const timeToPlay = this.calcVideoTimeToPlay(start, end)
      if (timeToPlay > view.timeToNextFrame) {
        view.timeToNextFrame = timeToPlay
      }

      let playStart: number | undefined
      if (this.scene.continueVideo) {
        playStart = this.videoPlaybackPositions.get(data.url)
      }
      if (this.scene.randomVideoStart && playStart == null) {
        playStart = getRandomInteger(start, end)
      } else if (playStart == null) {
        playStart = start
      }

      const playEnd = playStart + (view.timeToNextFrame * speed) / 1000
      view.video = {
        url: data.clip?.url ?? data.url,
        volume: data.clip?.volume ?? this.scene.videoVolume / 100,
        speed,
        start,
        end,
        playStart,
        playEnd
      }
      if (this.scene.continueVideo) {
        const nextPosition = playEnd % end
        this.videoPlaybackPositions.set(data.url, nextPosition)
      }
    }
    if (data.animated === true) {
      const timeToPlay = this.calcGIFTimeToPlay(data.duration as number)
      if (timeToPlay > view.timeToNextFrame) {
        view.timeToNextFrame = timeToPlay
      }
    }

    return view
  }

  private getBackgroundStyle() {
    let style = this.getBackgroundColor()
    if (this.scene.slide) {
      if (style == null) {
        style = {}
      }

      style.overflow = 'hidden'
    }

    return style
  }

  private getBackgroundColor(): BackgroundStyle | undefined {
    const {
      backgroundType,
      backgroundColor,
      backgroundColorSet,
      backgroundBlur
    } = this.scene

    switch (backgroundType) {
      case BT.color:
        return { backgroundColor }
      case BT.colorSet:
        return { backgroundColor: getRandomListItem(backgroundColorSet) }
      case BT.colorRand:
        return { backgroundColor: getRandomColor() }
      case BT.blur:
        return { filter: `blur(${backgroundBlur}px)` }
      default:
        return undefined
    }
  }

  private calcVideoSpeed() {
    const { videoRandomSpeed, videoSpeed, videoSpeedMin, videoSpeedMax } =
      this.scene
    const speed = videoRandomSpeed
      ? getRandomFloat(videoSpeedMin, videoSpeedMax, 2)
      : videoSpeed

    return speed / 10
  }

  private calcVideoTimeToPlay(start: number, end: number) {
    switch (this.scene.videoOption) {
      case VO.full:
        return end - start
      case VO.part:
        return this.scene.videoTimingConstant
      case VO.partr:
        return getRandomInteger(
          this.scene.videoTimingMin,
          this.scene.videoTimingMax
        )
      case VO.atLeast:
        const partDuration = end - start
        const loops = Math.ceil(this.scene.videoTimingConstant / partDuration)
        return partDuration * loops
      default:
        return 0
    }
  }

  private calcGIFTimeToPlay(duration: number) {
    switch (this.scene.gifOption) {
      case GO.full:
        return duration
      case GO.part:
        return this.scene.gifTimingConstant
      case GO.partr:
        return getRandomInteger(
          this.scene.gifTimingMin,
          this.scene.gifTimingMax
        )
      case GO.atLeast:
        const loops = Math.ceil(this.scene.gifTimingConstant / duration)
        return duration * loops
      default:
        return 0
    }
  }

  public getEffects(data: ContentData, timeToNextFrame: number, bpm?: number) {
    const effects: EffectsData = {}
    effects.strobe = this.getStrobeEffect(timeToNextFrame, bpm)
    effects.zoomMove = this.getZoomMoveEffect(timeToNextFrame, bpm)
    effects.slide = this.getSlideEffect(timeToNextFrame, bpm)
    effects.crossFade = this.getCrossFadeEffect(timeToNextFrame, bpm)
    effects.fadeInOut = this.getFadeInOutEffect(timeToNextFrame, bpm)
    effects.panning = this.getPanningEffect(data, timeToNextFrame, bpm)

    return effects
  }

  private getStrobeEffect(timeToNextFrame: number, bpm?: number) {
    if (!this.scene.strobe) {
      return undefined
    }

    const strobe: StrobeData = {
      layer: this.scene.strobeLayer,
      loops: []
    }

    strobe.opacity = strobe.layer === SL.bottom ? this.scene.strobeOpacity : 1
    strobe.easing = this.strobeEasing

    let applyDelay = false
    let totalDuration = this.calcTotalDuration(timeToNextFrame, bpm)
    while (totalDuration > 0) {
      let duration = this.strobeDuration.calc(timeToNextFrame, bpm, 10)
      let opacity = 0
      let delay: number | undefined
      if (this.scene.strobePulse) {
        delay = this.strobeDelayDuration.calc(timeToNextFrame, bpm)
        if (delay < duration) {
          opacity = 1 - delay / duration
          duration = delay
          delay = undefined
        } else if (applyDelay) {
          delay -= duration
          totalDuration -= delay
        } else {
          delay = undefined
        }
      }

      applyDelay = true
      totalDuration -= duration
      const color = strobe.layer !== SL.image ? this.getStrobeColor() : ''
      strobe.loops.push({ duration, delay, color, opacity })
    }

    return strobe
  }

  private getStrobeColor() {
    switch (this.scene.strobeColorType) {
      case SC.color:
        return this.scene.strobeColor
      case SC.colorSet:
        return getRandomListItem(this.scene.strobeColorSet)
      case SC.colorRand:
        return getRandomColor()
      default:
        return undefined
    }
  }

  private getZoomMoveEffect(timeToNextFrame: number, bpm?: number) {
    if (
      this.scene.horizTransType === HTF.none &&
      this.scene.vertTransType === VTF.none &&
      !this.scene.zoom
    ) {
      return undefined
    }

    let horizTransType = this.scene.horizTransType
    if (horizTransType === HTF.random) {
      horizTransType = getRandomBoolean() ? HTF.left : HTF.right
    }

    let translateX: number
    if (horizTransType === HTF.none) {
      translateX = 0
    } else if (this.scene.horizTransRandom) {
      translateX = getRandomInteger(
        this.scene.horizTransLevelMin,
        this.scene.horizTransLevelMax
      )
    } else {
      translateX = this.scene.horizTransLevel
    }
    if (horizTransType === HTF.left) {
      translateX *= -1
    }

    let vertTransType = this.scene.vertTransType
    if (vertTransType === VTF.random) {
      vertTransType = getRandomBoolean() ? VTF.up : VTF.down
    }

    let translateY: number
    if (vertTransType === VTF.none) {
      translateY = 0
    } else if (this.scene.vertTransRandom) {
      translateY = getRandomInteger(
        this.scene.vertTransLevelMin,
        this.scene.vertTransLevelMax
      )
    } else {
      translateY = this.scene.vertTransLevel
    }
    if (vertTransType === VTF.up) {
      translateY *= -1
    }

    let scaleFrom = 1
    let scaleTo = 1
    if (this.scene.zoom) {
      if (this.scene.zoomRandom) {
        scaleFrom = getRandomFloat(
          this.scene.zoomStartMin,
          this.scene.zoomStartMax,
          2
        )
        scaleTo = getRandomFloat(
          this.scene.zoomEndMin,
          this.scene.zoomEndMax,
          2
        )
      } else {
        scaleFrom = this.scene.zoomStart
        scaleTo = this.scene.zoomEnd
      }
    }

    const duration = this.zoomMoveDuration.calc(timeToNextFrame, bpm)
    const zoomMove: ZoomMoveData = {
      translateX,
      translateY,
      scaleFrom,
      scaleTo,
      duration,
      easing: this.zoomMoveEasing
    }

    return zoomMove
  }

  private getSlideEffect(timeToNextFrame: number, bpm?: number) {
    if (!this.scene.slide) {
      return undefined
    }

    let slideType = this.scene.slideType
    if (slideType === STF.leftright) {
      slideType = getRandomBoolean() ? STF.left : STF.right
    } else if (slideType === STF.updown) {
      slideType = getRandomBoolean() ? STF.up : STF.down
    }
    if (slideType === STF.random) {
      const slideTypes = [STF.left, STF.right, STF.up, STF.down]
      slideType = getRandomListItem(slideTypes)
    }

    let [horizStart, horizEnd, vertStart, vertEnd] = [0, 0, 0, 0]
    switch (slideType) {
      case STF.left:
        horizStart = 100
        horizEnd = this.scene.slideDistance * -1
        break
      case STF.right:
        horizStart = -100
        horizEnd = this.scene.slideDistance
        break
      case STF.up:
        vertStart = 100
        vertEnd = this.scene.slideDistance * -1
        break
      case STF.down:
        vertStart = -100
        vertEnd = this.scene.slideDistance
        break
    }

    const duration = this.slideDuration.calc(timeToNextFrame, bpm)
    const slide: SlideData = {
      horizStart,
      horizEnd,
      vertStart,
      vertEnd,
      duration,
      easing: this.slideEasing
    }

    return slide
  }

  private getCrossFadeEffect(timeToNextFrame: number, bpm?: number) {
    if (!this.scene.crossFade) {
      return undefined
    }

    const duration = this.crossFadeDuration.calc(timeToNextFrame, bpm)
    const crossFade: CrossFadeData = { duration, easing: this.crossFadeEasing }
    return crossFade
  }

  private getFadeInOutEffect(timeToNextFrame: number, bpm?: number) {
    if (!this.scene.fadeInOut) {
      return undefined
    }

    let fadeIn = true
    let loops: FadeInOutLoopData[] = []
    let totalDuration = this.calcTotalDuration(timeToNextFrame, bpm)
    while (totalDuration > 0) {
      const duration = this.fadeInOutDuration.calc(timeToNextFrame, bpm, 10) / 2
      const opacity = fadeIn ? 1 : 0
      const easing = fadeIn ? this.fadeIOStartEasing : this.fadeIOEndEasing
      loops.push({ duration, opacity, easing })
      totalDuration -= duration
      fadeIn = !fadeIn
    }

    return { loops }
  }

  private getPanningEffect(
    data: ContentData,
    timeToNextFrame: number,
    bpm?: number
  ) {
    if (
      !this.scene.panning ||
      (this.scene.panHorizTransType === HTF.none &&
        this.scene.panVertTransType === VTF.none)
    ) {
      return undefined
    }

    let prevPanHorizTransType: string | undefined
    let prevPanVertTransType: string | undefined
    const start: PanningLoopData = { duration: 0 }
    start.translateX = this.getPanningTranslateX(data, prevPanHorizTransType)
    if (start.translateX != null) {
      prevPanHorizTransType = this.getHorizTransType(start.translateX.amount)
    }

    start.translateY = this.getPanningTranslateY(data, prevPanVertTransType)
    if (start.translateY != null) {
      prevPanVertTransType = this.getVertTransType(start.translateY.amount)
    }

    let loops: PanningLoopData[] = []
    let totalDuration = this.calcTotalDuration(timeToNextFrame, bpm)
    while (totalDuration > 0) {
      const translateX = this.getPanningTranslateX(data, prevPanHorizTransType)
      if (translateX != null) {
        prevPanHorizTransType = this.getHorizTransType(translateX.amount)
      }

      const translateY = this.getPanningTranslateY(data, prevPanVertTransType)
      if (translateY != null) {
        prevPanVertTransType = this.getVertTransType(translateY.amount)
      }

      const duration = this.panningDuration.calc(timeToNextFrame, bpm, 10) / 2
      loops.push({ translateX, translateY, duration })
      totalDuration -= duration
    }

    const panning: PanningData = {
      start,
      loops,
      startEasing: this.panningStartEasing,
      endEasing: this.panningEndEasing
    }
    return panning
  }

  private calcTotalDuration(timeToNextFrame: number, bpm?: number) {
    let maxSlideDuration = 0
    let maxCrossFadeDuration = 0
    if (this.scene.slide) {
      if (this.scene.slideTF === TF.random || this.scene.slideTF === TF.sin) {
        maxSlideDuration = this.scene.slideDurationMax
      } else {
        this.maxSlideDuration.reset()
        maxSlideDuration = this.maxSlideDuration.calc(timeToNextFrame, bpm)
      }
    }
    if (this.scene.crossFade) {
      if (this.scene.fadeTF === TF.random || this.scene.fadeTF === TF.sin) {
        maxCrossFadeDuration = this.scene.fadeDurationMax
      } else {
        this.maxCrossFadeDuration.reset()
        maxCrossFadeDuration = this.maxCrossFadeDuration.calc(
          timeToNextFrame,
          bpm
        )
      }
    }

    return timeToNextFrame + Math.max(maxSlideDuration, maxCrossFadeDuration)
  }

  private getHorizTransType(amount: number) {
    return amount < 0 ? HTF.right : HTF.left
  }

  private getVertTransType(amount: number) {
    return amount < 0 ? VTF.down : VTF.up
  }

  private getPanningTranslateX(data: ContentData, prevTransType?: string) {
    if (this.scene.panHorizTransType === HTF.none) {
      return undefined
    }

    const imageTypes = [
      IT.fitBestNoClip,
      IT.stretch,
      IT.centerNoClip,
      IT.fitWidth
    ]
    if (
      this.scene.panHorizTransImg &&
      (data.type === 'iframe' || imageTypes.includes(this.scene.imageType))
    ) {
      return undefined
    }

    let panHorizTransType: string
    if (prevTransType != null) {
      panHorizTransType = prevTransType === HTF.left ? HTF.right : HTF.left
    } else {
      panHorizTransType = this.scene.panHorizTransType
      if (panHorizTransType === HTF.random) {
        panHorizTransType = getRandomBoolean() ? HTF.right : HTF.left
      }
    }

    let horizPix = false
    let horizTransLevel = 0
    if (this.scene.panHorizTransImg) {
      // needs image size and parent container size
      // horizTransLevel is calculated in the Panning component
      horizPix = true
      horizTransLevel = 1
    } else {
      horizTransLevel = this.scene.panHorizTransRandom
        ? getRandomInteger(
            this.scene.panHorizTransLevelMin,
            this.scene.panHorizTransLevelMax
          )
        : this.scene.panHorizTransLevel
    }
    if (panHorizTransType === HTF.right) {
      horizTransLevel *= -1
    }

    const horizSuffix = horizPix ? 'px' : '%'
    return { amount: horizTransLevel, unit: horizSuffix }
  }

  private getPanningTranslateY(data: ContentData, prevTransType?: string) {
    if (this.scene.panVertTransType === VTF.none) {
      return undefined
    }

    const imageTypes = [
      IT.fitBestNoClip,
      IT.stretch,
      IT.centerNoClip,
      IT.fitHeight
    ]
    if (
      this.scene.panVertTransImg &&
      (data.type === 'iframe' || imageTypes.includes(this.scene.imageType))
    ) {
      return undefined
    }

    let panVertTransType: string
    if (prevTransType != null) {
      panVertTransType = prevTransType === VTF.up ? VTF.down : VTF.up
    } else {
      panVertTransType = this.scene.panVertTransType
      if (panVertTransType === VTF.random) {
        panVertTransType = getRandomBoolean() ? VTF.down : VTF.up
      }
    }

    let vertPix = false
    let vertTransLevel = 0
    if (this.scene.panVertTransImg) {
      // needs image size and parent container size
      // vertTransLevel is calculated in the Panning component
      vertTransLevel = 1
      vertPix = true
    } else {
      vertTransLevel = this.scene.panVertTransRandom
        ? getRandomInteger(
            this.scene.panVertTransLevelMin,
            this.scene.panVertTransLevelMax
          )
        : this.scene.panVertTransLevel
    }

    if (panVertTransType === VTF.down) {
      vertTransLevel = -vertTransLevel
    }

    const vertSuffix = vertPix ? 'px' : '%'
    return { amount: vertTransLevel, unit: vertSuffix }
  }

  public getImageView(
    data: ContentData,
    effects: EffectsData,
    view: ViewData,
    transform: TransformData
  ): ImageViewData {
    if (
      data.type === 'video' &&
      (effects.crossFade != null || effects.slide != null)
    ) {
      const crossFadeDuration = effects.crossFade?.duration ?? 0
      const slideDuration = effects.slide?.duration ?? 0
      const maxDuration = Math.max(crossFadeDuration, slideDuration) / 1000
      const video = view.video as ViewVideoData
      video.playEnd += maxDuration
    }
    if (
      data.type === 'iframe' &&
      view.backgroundType === BT.blur &&
      effects.zoomMove == null &&
      effects.fadeInOut == null &&
      effects.panning == null &&
      (effects.strobe == null || effects.strobe.layer !== SL.image)
    ) {
      // iframe blurred background is resource heavy
      // don't use it if it's not going to be visible
      view.backgroundType = BT.none
    }
    if (data.type === 'video') {
      const video = view.video as ViewVideoData
      const { playStart, playEnd } = video
      video.url = `${data.clip?.url ?? data.url}#t=${playStart},${playEnd}`
    }

    const displayIndex = this.displayIndex
    if (this.displayIndex != null) {
      this.displayIndex++
    }

    return {
      sceneId: this.scene.id,
      displayIndex,
      data,
      view,
      transform,
      effects
    }
  }

  public shouldLoad(data: ContentData): boolean {
    const criteria = this.loadCriteria
    const key = JSON.stringify({ url: data.url, criteria })
    const load = this.loadCache.get(key)
    if (load != null) {
      return load
    }

    const filter = criteria.imageTypeFilter
    switch (data.type) {
      case 'image': {
        const animated = data.animated
        const shouldLoad =
          filter === IF.any ||
          filter === IF.images ||
          (animated && filter === IF.animated) ||
          (animated !== true && filter === IF.stills)

        if (!shouldLoad) {
          this.loadCache.set(key, shouldLoad)
          return shouldLoad
        }

        const minSize = criteria.minImageSize
        const orientation = criteria.imageOrientation
        return this.shouldLoadContent(key, data, minSize, orientation)
      }
      case 'video': {
        const shouldLoad =
          filter === IF.any || filter === IF.videos || filter === IF.animated

        if (!shouldLoad) {
          this.loadCache.set(key, shouldLoad)
          return shouldLoad
        }

        const minSize = criteria.minVideoSize
        const orientation = criteria.videoOrientation
        return this.shouldLoadContent(key, data, minSize, orientation)
      }
      default: {
        this.loadCache.set(key, true)
        return true
      }
    }
  }

  private shouldLoadContent(
    key: string,
    data: ContentData,
    minSize: number,
    orientation: string
  ) {
    const width = data.width as number
    const height = data.height as number

    const shouldLoad =
      width >= minSize &&
      height >= minSize &&
      this.matchesOrientation(orientation, width, height)

    this.loadCache.set(key, shouldLoad)
    return shouldLoad
  }

  private matchesOrientation(
    orientation: string,
    width: number,
    height: number
  ) {
    switch (orientation) {
      case OT.onlyLandscape:
        return width >= height
      case OT.onlyPortrait:
        return height >= width
      default:
        return true
    }
  }
}

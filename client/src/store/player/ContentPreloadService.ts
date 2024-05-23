/// <reference path="../../gif-info.d.ts" />
import {
  getSourceType,
  isImage,
  isVideo,
  IF,
  IT,
  OF,
  OT,
  ST,
  VO,
  GO,
  BT,
  SL,
  SC,
  TF,
  HTF,
  VTF,
  STF,
  SOF,
  WF
} from 'flipflip-common'
import GIFDataLoader from './GIFDataLoader'
import {
  flatten,
  getRandomBoolean,
  getRandomColor,
  getRandomListItem,
  getRandomFloat,
  getRandomInteger
} from '../../data/utils'
import { CSSProperties } from 'react'
import { RootState } from '../../store/store'
import Scene from '../../store/scene/Scene'
import flipflip from '../../FlipFlipService'
import { ImageViewState } from './slice'
import DurationCalculator from '../../data/DurationCalculator'

interface Durations {
  timeToNextFrame: DurationCalculator
  strobeDuration: DurationCalculator
  strobeDelay: DurationCalculator
  zoomMove: DurationCalculator
  slide: DurationCalculator
  crossFade: DurationCalculator
  fadeInOut: DurationCalculator
  panning: DurationCalculator
}

function newDurations(): Durations {
  return {
    timeToNextFrame: new DurationCalculator(),
    strobeDuration: new DurationCalculator(),
    strobeDelay: new DurationCalculator(),
    zoomMove: new DurationCalculator(),
    slide: new DurationCalculator(),
    crossFade: new DurationCalculator(),
    fadeInOut: new DurationCalculator(),
    panning: new DurationCalculator()
  }
}

interface URLState {
  nextIndex: number
  nextSourceIndex: Record<string, number>
  sourceComplete: boolean
  loadedSources: string[]
  loadedURLs: string[]
}

function newURLState(): URLState {
  return {
    nextIndex: 0,
    nextSourceIndex: {},
    sourceComplete: false,
    loadedSources: [],
    loadedURLs: []
  }
}

export interface ContentData {
  url: string
  type?: 'image' | 'video' | 'iframe'
  error?: boolean
  width?: number
  height?: number
  duration?: number
  animated?: boolean
  clip?: VideoClipData
}

export interface VideoClipData {
  id: number
  url: string
  start: number
  end: number
  volume?: number
}

export type ContentType = ContentData['type']

function newContentData(
  url: string,
  type?: ContentType,
  width?: number,
  height?: number
): ContentData {
  const error = type == null
  return { url, error, type, width, height }
}

export interface LoadCriteria {
  minImageSize: number
  minVideoSize: number
  imageOrientation: string
  videoOrientation: string
  imageTypeFilter: string
}

export interface TransformCriteria {
  imageOrientation: string
  videoOrientation: string
}

export interface TransformData {
  rotate: boolean
}

export interface ViewVideoData {
  url: string
  volume: number
  speed: number
  start: number
  end: number
  playStart: number
  playEnd: number
}

export interface ViewData {
  timeToNextFrame: number
  video?: ViewVideoData
  imageType: string
  backgroundType: string
  backgroundStyle?: CSSProperties
}

export interface EasingParams {
  ea: string
  exp: number
  amp: number
  per: number
  ov: number
}

export interface EffectsData {
  strobe?: StrobeData
  zoomMove?: ZoomMoveData
  slide?: SlideData
  crossFade?: CrossFadeData
  fadeInOut?: FadeInOutData
  panning?: PanningData
}

export interface StrobeData {
  layer: string
  loops: StrobeLoopData[]
  opacity?: number
  easing?: EasingParams
}

export interface StrobeLoopData {
  color: string
  duration: number
  opacity: number
  delay?: number
}

export interface ZoomMoveData {
  scaleFrom: number
  scaleTo: number
  translateX: number
  translateY: number
  duration: number
  easing?: EasingParams
}

export interface SlideData {
  horizStart: number
  vertStart: number
  horizEnd: number
  vertEnd: number
  duration: number
  easing?: EasingParams
}

export interface CrossFadeData {
  duration: number
  easing?: EasingParams
}

export interface FadeInOutData {
  loops: FadeInOutLoopData[]
}

export interface FadeInOutLoopData {
  duration: number
  opacity: number
  easing?: EasingParams
}

export interface PanningData {
  start: PanningLoopData
  loops: PanningLoopData[]
  startEasing?: EasingParams
  endEasing?: EasingParams
}

export interface PanningLoopData {
  duration: number
  translateX?: PanningTranslateData
  translateY?: PanningTranslateData
}

export interface PanningTranslateData {
  amount: number
  unit: string
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

export class ContentPreloadService {
  private static instance: ContentPreloadService

  private dataCache: Map<string, ContentData>
  private loadCache: Map<string, boolean>
  private transformCache: Map<string, TransformData>
  private videoPlaybackPositions: Map<string, number>
  private sceneURLStates: Map<string, URLState>
  private durations: Map<string, Durations>
  private totalDuration: DurationCalculator

  private constructor() {
    this.dataCache = new Map<string, ContentData>()
    this.loadCache = new Map<string, boolean>()
    this.transformCache = new Map<string, TransformData>()
    this.videoPlaybackPositions = new Map<string, number>()
    this.sceneURLStates = new Map<string, URLState>()
    this.durations = new Map<string, Durations>()
    this.totalDuration = new DurationCalculator()
  }

  public static getInstance(): ContentPreloadService {
    if (!ContentPreloadService.instance) {
      ContentPreloadService.instance = new ContentPreloadService()
    }

    return ContentPreloadService.instance
  }

  public init() {
    this.dataCache.clear()
    this.loadCache.clear()
    this.transformCache.clear()
    this.videoPlaybackPositions.clear()
    this.sceneURLStates.clear()
    this.durations.clear()
  }

  public getData(uuid: string, state: RootState): Promise<ContentData> {
    return new Promise(async (resolve, reject) => {
      const url = this.getURL(uuid, state)
      if (url == null) {
        reject('failed to get URL')
        return
      }

      const data = this.dataCache.get(url)
      if (data != null) {
        resolve(data)
        return
      }

      const sourceType = getSourceType(url)
      if (sourceType === ST.nimja) {
        const proxyURL = await flipflip().api.proxyNimjaURL(url)
        const data = newContentData(proxyURL, 'iframe')
        this.dataCache.set(url, data)
        resolve(data)
      } else if (isImage(url, false)) {
        const image = new Image()
        const promise = new Promise((res, rej) => {
          image.onload = res
          image.onerror = () => rej(true)
          image.onabort = () => rej(false)
          image.src = url
        })

        try {
          await promise
        } catch (error) {
          if (error) {
            this.dataCache.set(url, newContentData(url))
          }

          resolve({ url, error: true })
          return
        }

        const { width, height } = image
        const data = newContentData(url, 'image', width, height)

        // TODO parse URL and use path in case there are query params
        if (url.endsWith('.gif')) {
          const loader = new GIFDataLoader()
          const { animated, duration } = await loader.getData(url)
          data.animated = animated
          data.duration = duration
        }

        this.dataCache.set(url, data)
        resolve(data)
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

        const video = document.createElement('video')
        const promise = new Promise((res, rej) => {
          video.onloadedmetadata = res
          video.onerror = () => rej(true)
          video.onabort = () => rej(false)
          video.src = clip?.url ?? url
        })

        try {
          await promise
        } catch (error) {
          if (error) {
            this.dataCache.set(url, newContentData(url))
          }

          resolve({ url, error: true })
          return
        }

        const { videoWidth, videoHeight, duration } = video
        const data = newContentData(url, 'video', videoWidth, videoHeight)
        data.duration = duration * 1000
        data.clip = clip
        this.dataCache.set(url, data)
        resolve(data)
      } else {
        this.dataCache.set(url, newContentData(url))
        reject('unsupported type: ' + url)
      }
    })
  }

  private getURL(uuid: string, state: RootState) {
    const sceneID = state.players[uuid].sceneID
    const allURLs = state.sourceScraper[sceneID].allURLs
    if (allURLs == null) {
      return undefined
    }

    let source: string
    let collection: string[]
    let url: string
    const {
      weightFunction,
      useWeights,
      orderFunction,
      sourceOrderFunction,
      fullSource,
      forceAll,
      forceAllSource
    } = state.scene.entries[sceneID]
    const sources = state.scene.entries[sceneID].sources.map(
      (id) => state.librarySource.entries[id]
    )
    const urlState = this.sceneURLStates.get(uuid) ?? newURLState()

    // For source weighted
    if (weightFunction === WF.sources) {
      let keys: string[]
      if (useWeights) {
        const validKeys = Object.keys(allURLs)
        keys = []
        for (const source of sources) {
          if (validKeys.includes(source.url as string)) {
            for (let w = source.weight; w > 0; w--) {
              keys.push(source.url as string)
            }
          }
        }
      } else {
        keys = Object.keys(allURLs)
      }

      // If sorting randomly, get a random source
      if (sourceOrderFunction === SOF.random) {
        // If we're playing full sources
        if (fullSource) {
          // If this is the first loop or source is done get next source
          if (urlState.nextIndex === -1 || urlState.sourceComplete) {
            if (forceAllSource) {
              // Filter the available urls to those not played yet
              keys = keys.filter((s) => !urlState.loadedSources.includes(s))
              // If there are no remaining urls for this source
              if (!(keys && keys.length > 0)) {
                urlState.loadedSources = []
                keys = Object.keys(allURLs)
              }
            }

            source = getRandomListItem(keys)
            urlState.nextIndex = keys.indexOf(source)
            urlState.sourceComplete = false
            urlState.loadedSources.push(source)
          } else {
            // Play same source
            source = keys[urlState.nextIndex]
          }
        } else {
          source = getRandomListItem(keys)
          urlState.loadedSources.push(source)
        }
      } else {
        // Else get the next source
        // If we're playing full sources
        if (fullSource) {
          // If this is the first loop or source is done get next source
          if (urlState.nextIndex === -1 || urlState.sourceComplete) {
            source = keys[++urlState.nextIndex % keys.length]
            urlState.sourceComplete = false
          } else {
            // Play same source
            source = keys[urlState.nextIndex % keys.length]
          }
        } else {
          source = keys[++urlState.nextIndex % keys.length]
        }
      }

      // Get the urls from the source
      collection = allURLs[source] ?? []
      if (collection.length === 0) {
        return undefined
      }

      // If sorting randomly and forcing all
      if (orderFunction === OF.random && (forceAll || fullSource)) {
        // Filter the available urls to those not played yet
        collection = collection.filter((u) => !urlState.loadedURLs.includes(u))
        // If there are no remaining urls for this source
        if (collection.length === 0) {
          if (fullSource) {
            urlState.loadedURLs = []
            urlState.sourceComplete = true
            return undefined
          } else {
            // Make sure all the other sources are also extinguished
            const remainingLibrary = flatten(Object.values(allURLs)).filter(
              (u: string) => !urlState.loadedURLs.includes(u)
            )
            // If they are, clear loadedURLs
            if (remainingLibrary.length === 0) {
              urlState.loadedURLs = []
              collection = allURLs[source] || []
            } else {
              return undefined
            }
          }
        }
      }

      // If sorting randomly, get a random URL
      if (orderFunction === OF.random) {
        url = getRandomListItem(collection)
      } else {
        // Else get the next index for this source
        const index = urlState.nextSourceIndex[source] ?? 0
        if (fullSource && index % collection.length === collection.length - 1) {
          urlState.sourceComplete = true
        }
        url = collection[index % collection.length]
        urlState.nextSourceIndex[source] = index + 1
      }
    } else {
      // For image weighted

      // Concat all images together
      const urlKeys = Object.keys(allURLs).filter(
        (key) => allURLs[key].length > 0
      )
      collection = urlKeys
      if (collection.length === 0) {
        return undefined
      }

      // If sorting randomly and forcing all
      if (orderFunction === OF.random && forceAll) {
        // Filter the available ulls to those not played yet
        collection = collection.filter(
          (u: string) => !urlState.loadedURLs.includes(u)
        )
        // If there are no remaining urls, clear loadedURLs
        if (collection.length === 0) {
          urlState.loadedURLs = []
          collection = urlKeys
        }
      }

      // If sorting randomly, get a random url
      if (orderFunction === OF.random) {
        url = getRandomListItem(collection)
      } else {
        // Else get the next index
        url = collection[++urlState.nextIndex % collection.length]
      }
    }

    if (
      orderFunction === OF.random &&
      (forceAll || (weightFunction === WF.sources && fullSource))
    ) {
      urlState.loadedURLs.push(url)
    }

    this.sceneURLStates.set(uuid, urlState)
    return url
  }

  public getTransform(
    data: ContentData,
    criteria: TransformCriteria
  ): TransformData {
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

  private getDurations(uuid: string) {
    let durations = this.durations.get(uuid)
    if (durations == null) {
      durations = newDurations()
      this.durations.set(uuid, durations)
    }

    return durations
  }

  public getViewData(
    data: ContentData,
    uuid: string,
    sceneID: number,
    state: RootState
  ) {
    const scene = state.scene.entries[sceneID]
    const currentAudio = state.players[uuid].currentAudio
    const bpm = currentAudio && state.audio.entries[currentAudio].bpm
    const durations = this.getDurations(uuid)
    const timeToNextFrame = durations.timeToNextFrame.calc(
      {
        timingFunction: scene.timingFunction,
        time: scene.timingConstant,
        timeMin: scene.timingMin,
        timeMax: scene.timingMax,
        sinRate: scene.timingSinRate,
        bpmMulti: scene.timingBPMMulti
      },
      0,
      bpm
    )

    const backgroundStyle = this.getBackgroundStyle(data, scene)
    const view: ViewData = {
      timeToNextFrame,
      imageType: scene.imageType,
      backgroundType: scene.backgroundType,
      backgroundStyle
    }

    if (data.type === 'video') {
      let start: number
      let end: number
      const duration = (data.duration as number) / 1000
      if (scene.playVideoClips) {
        start = data.clip?.start ?? 0
        end = data.clip?.end ?? duration
      } else {
        start = scene.skipVideoStart / 1000
        end = duration - scene.skipVideoEnd / 1000
      }

      const speed = this.calcVideoSpeed(scene)
      const timeToPlay = this.calcVideoTimeToPlay(scene, start, end)
      if (timeToPlay > timeToNextFrame) {
        view.timeToNextFrame = timeToPlay
      }

      let playStart: number | undefined
      if (scene.continueVideo) {
        playStart = this.videoPlaybackPositions.get(data.url)
      }
      if (scene.randomVideoStart && playStart == null) {
        playStart = getRandomInteger(start, end)
      } else if (playStart == null) {
        playStart = start
      }

      const playEnd = playStart + (view.timeToNextFrame * speed) / 1000
      view.video = {
        url: data.clip?.url ?? data.url,
        volume: data.clip?.volume ?? scene.videoVolume / 100,
        speed,
        start,
        end,
        playStart,
        playEnd
      }
      if (scene.continueVideo) {
        const nextPosition = playEnd % end
        this.videoPlaybackPositions.set(data.url, nextPosition)
      }
    }
    if (data.animated === true) {
      const timeToPlay = this.calcGIFTimeToPlay(scene, data.duration as number)
      if (timeToPlay > timeToNextFrame) {
        view.timeToNextFrame = timeToPlay
      }
    }

    return view
  }

  private getBackgroundStyle(data: ContentData, scene: Scene) {
    let style = this.getBackgroundColor(scene)
    if (scene.slide) {
      if (style == null) {
        style = {}
      }

      style.overflow = 'hidden'
    }

    return style
  }

  private getBackgroundColor(scene: Scene): CSSProperties | undefined {
    const {
      backgroundType,
      backgroundColor,
      backgroundColorSet,
      backgroundBlur
    } = scene

    switch (backgroundType) {
      case BT.color:
        return { backgroundColor }
      case BT.colorSet:
        return { backgroundColor: getRandomListItem(backgroundColorSet) }
      case BT.colorRand:
        return { backgroundColor: getRandomColor() }
      case BT.blur:
        return { filter: 'blur(' + backgroundBlur + 'px)' }
      default:
        return undefined
    }
  }

  private calcVideoSpeed(scene: Scene) {
    const { videoRandomSpeed, videoSpeed, videoSpeedMin, videoSpeedMax } = scene
    const speed = videoRandomSpeed
      ? getRandomFloat(videoSpeedMin, videoSpeedMax, 2)
      : videoSpeed

    return speed / 10
  }

  private calcVideoTimeToPlay(scene: Scene, start: number, end: number) {
    switch (scene.videoOption) {
      case VO.full:
        return end - start
      case VO.part:
        return scene.videoTimingConstant
      case VO.partr:
        return getRandomInteger(scene.videoTimingMin, scene.videoTimingMax)
      case VO.atLeast:
        const partDuration = end - start
        const loops = Math.ceil(scene.videoTimingConstant / partDuration)
        return partDuration * loops
      default:
        return 0
    }
  }

  private calcGIFTimeToPlay(scene: Scene, duration: number) {
    switch (scene.gifOption) {
      case GO.full:
        return duration
      case GO.part:
        return scene.gifTimingConstant
      case GO.partr:
        return getRandomInteger(scene.gifTimingMin, scene.gifTimingMax)
      case GO.atLeast:
        const loops = Math.ceil(scene.gifTimingConstant / duration)
        return duration * loops
      default:
        return 0
    }
  }

  public getEffects(
    data: ContentData,
    timeToNextFrame: number,
    uuid: string,
    sceneID: number,
    state: RootState
  ) {
    const currentAudio = state.players[uuid].currentAudio
    const bpm = currentAudio && state.audio.entries[currentAudio].bpm

    const effects: EffectsData = {}
    effects.strobe = this.getStrobeEffect(
      uuid,
      sceneID,
      state,
      timeToNextFrame,
      bpm
    )
    effects.zoomMove = this.getZoomMoveEffect(
      uuid,
      sceneID,
      state,
      timeToNextFrame,
      bpm
    )
    effects.slide = this.getSlideEffect(
      uuid,
      sceneID,
      state,
      timeToNextFrame,
      bpm
    )
    effects.crossFade = this.getCrossFadeEffect(
      uuid,
      sceneID,
      state,
      timeToNextFrame,
      bpm
    )
    effects.fadeInOut = this.getFadeInOutEffect(
      uuid,
      sceneID,
      state,
      timeToNextFrame,
      bpm
    )
    effects.panning = this.getPanningEffect(
      data,
      uuid,
      sceneID,
      state,
      timeToNextFrame,
      bpm
    )

    return effects
  }

  private getStrobeEffect(
    uuid: string,
    sceneID: number,
    state: RootState,
    timeToNextFrame: number,
    bpm?: number
  ) {
    const scene = state.scene.entries[sceneID]
    if (!scene.strobe) {
      return undefined
    }

    const strobe: StrobeData = {
      layer: scene.strobeLayer,
      loops: []
    }

    strobe.opacity = strobe.layer === SL.bottom ? scene.strobeOpacity : 1
    if (state.app.config.displaySettings.easingControls) {
      strobe.easing = {
        ea: scene.strobeEase,
        exp: scene.strobeExp,
        amp: scene.strobeAmp,
        per: scene.strobePer,
        ov: scene.strobeOv
      }
    }

    let applyDelay = false
    const durations = this.getDurations(uuid)
    const durationTiming = {
      timingFunction: scene.strobeTF,
      time: scene.strobeTime,
      timeMax: scene.strobeTimeMax,
      timeMin: scene.strobeTimeMin,
      sinRate: scene.strobeSinRate,
      bpmMulti: scene.strobeBPMMulti
    }
    const delayTiming = {
      timingFunction: scene.strobeDelayTF,
      time: scene.strobeDelay,
      timeMax: scene.strobeDelayMax,
      timeMin: scene.strobeDelayMin,
      sinRate: scene.strobeDelaySinRate,
      bpmMulti: scene.strobeDelayBPMMulti
    }
    let totalDuration = this.calcTotalDuration(scene, timeToNextFrame, bpm)
    while (totalDuration > 0) {
      let duration = durations.strobeDuration.calc(
        durationTiming,
        timeToNextFrame,
        bpm,
        10
      )

      let opacity = 0
      let delay: number | undefined
      if (scene.strobePulse) {
        delay = durations.strobeDelay.calc(delayTiming, timeToNextFrame, bpm)
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
      const color = strobe.layer !== SL.image ? this.getStrobeColor(scene) : ''
      strobe.loops.push({ duration, delay, color, opacity })
    }

    return strobe
  }

  private getStrobeColor(scene: Scene) {
    switch (scene.strobeColorType) {
      case SC.color:
        return scene.strobeColor
      case SC.colorSet:
        return getRandomListItem(scene.strobeColorSet)
      case SC.colorRand:
        return getRandomColor()
      default:
        return undefined
    }
  }

  private getZoomMoveEffect(
    uuid: string,
    sceneID: number,
    state: RootState,
    timeToNextFrame: number,
    bpm?: number
  ) {
    const scene = state.scene.entries[sceneID]
    if (
      scene.horizTransType === HTF.none &&
      scene.vertTransType === VTF.none &&
      !scene.zoom
    ) {
      return undefined
    }

    let horizTransType = scene.horizTransType
    if (horizTransType === HTF.random) {
      horizTransType = getRandomBoolean() ? HTF.left : HTF.right
    }

    let translateX: number
    if (horizTransType === HTF.none) {
      translateX = 0
    } else if (scene.horizTransRandom) {
      translateX = getRandomInteger(
        scene.horizTransLevelMin,
        scene.horizTransLevelMax
      )
    } else {
      translateX = scene.horizTransLevel
    }
    if (horizTransType === HTF.left) {
      translateX *= -1
    }

    let vertTransType = scene.vertTransType
    if (vertTransType === VTF.random) {
      vertTransType = getRandomBoolean() ? VTF.up : VTF.down
    }

    let translateY: number
    if (vertTransType === VTF.none) {
      translateY = 0
    } else if (scene.vertTransRandom) {
      translateY = getRandomInteger(
        scene.vertTransLevelMin,
        scene.vertTransLevelMax
      )
    } else {
      translateY = scene.vertTransLevel
    }
    if (vertTransType === VTF.up) {
      translateY *= -1
    }

    let scaleFrom = 1
    let scaleTo = 1
    if (scene.zoom) {
      if (scene.zoomRandom) {
        scaleFrom = getRandomFloat(scene.zoomStartMin, scene.zoomStartMax, 2)
        scaleTo = getRandomFloat(scene.zoomEndMin, scene.zoomEndMax, 2)
      } else {
        scaleFrom = scene.zoomStart
        scaleTo = scene.zoomEnd
      }
    }

    const durations = this.getDurations(uuid)
    const duration = durations.zoomMove.calc(
      {
        timingFunction: scene.transTF,
        time: scene.transDuration,
        timeMax: scene.transDurationMax,
        timeMin: scene.transDurationMin,
        sinRate: scene.transSinRate,
        bpmMulti: scene.transBPMMulti
      },
      timeToNextFrame,
      bpm
    )

    const zoomMove: ZoomMoveData = {
      translateX,
      translateY,
      scaleFrom,
      scaleTo,
      duration
    }
    if (state.app.config.displaySettings.easingControls) {
      zoomMove.easing = {
        ea: scene.transEase,
        exp: scene.transExp,
        amp: scene.transAmp,
        per: scene.transPer,
        ov: scene.transOv
      }
    }

    return zoomMove
  }

  private getSlideEffect(
    uuid: string,
    sceneID: number,
    state: RootState,
    timeToNextFrame: number,
    bpm?: number
  ) {
    const scene = state.scene.entries[sceneID]
    if (!scene.slide) {
      return undefined
    }

    let slideType = scene.slideType
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
        horizEnd = scene.slideDistance * -1
        break
      case STF.right:
        horizStart = -100
        horizEnd = scene.slideDistance
        break
      case STF.up:
        vertStart = 100
        vertEnd = scene.slideDistance * -1
        break
      case STF.down:
        vertStart = -100
        vertEnd = scene.slideDistance
        break
    }

    const durations = this.getDurations(uuid)
    const duration = durations.slide.calc(
      {
        timingFunction: scene.slideTF,
        time: scene.slideDuration,
        timeMin: scene.slideDurationMin,
        timeMax: scene.slideDurationMax,
        sinRate: scene.slideSinRate,
        bpmMulti: scene.slideBPMMulti
      },
      timeToNextFrame,
      bpm
    )

    const slide: SlideData = {
      horizStart,
      horizEnd,
      vertStart,
      vertEnd,
      duration
    }
    if (state.app.config.displaySettings.easingControls) {
      slide.easing = {
        ea: scene.slideEase,
        exp: scene.slideExp,
        amp: scene.slideAmp,
        per: scene.slidePer,
        ov: scene.slideOv
      }
    }

    return slide
  }

  private getCrossFadeEffect(
    uuid: string,
    sceneID: number,
    state: RootState,
    timeToNextFrame: number,
    bpm?: number
  ) {
    const scene = state.scene.entries[sceneID]
    if (!scene.crossFade) {
      return undefined
    }

    const durations = this.getDurations(uuid)
    const duration = durations.crossFade.calc(
      {
        timingFunction: scene.fadeTF,
        time: scene.fadeDuration,
        timeMin: scene.fadeDurationMin,
        timeMax: scene.fadeDurationMax,
        sinRate: scene.fadeSinRate,
        bpmMulti: scene.fadeBPMMulti
      },
      timeToNextFrame,
      bpm
    )

    const crossFade: CrossFadeData = { duration }
    if (state.app.config.displaySettings.easingControls) {
      crossFade.easing = {
        ea: scene.fadeEase,
        exp: scene.fadeExp,
        amp: scene.fadeAmp,
        per: scene.fadePer,
        ov: scene.fadeOv
      }
    }

    return crossFade
  }

  private getFadeInOutEffect(
    uuid: string,
    sceneID: number,
    state: RootState,
    timeToNextFrame: number,
    bpm?: number
  ) {
    const scene = state.scene.entries[sceneID]
    if (!scene.fadeInOut) {
      return undefined
    }

    let startEasing: EasingParams | undefined
    let endEasing: EasingParams | undefined
    if (state.app.config.displaySettings.easingControls) {
      startEasing = {
        ea: scene.fadeIOStartEase,
        exp: scene.fadeIOStartExp,
        amp: scene.fadeIOStartAmp,
        per: scene.fadeIOStartPer,
        ov: scene.fadeIOStartOv
      }
      endEasing = {
        ea: scene.fadeIOEndEase,
        exp: scene.fadeIOEndExp,
        amp: scene.fadeIOEndAmp,
        per: scene.fadeIOEndPer,
        ov: scene.fadeIOEndOv
      }
    }

    let fadeIn = true
    let loops: FadeInOutLoopData[] = []
    const durations = this.getDurations(uuid)
    const timingSettings = {
      timingFunction: scene.fadeIOTF,
      time: scene.fadeIODuration,
      timeMin: scene.fadeIODurationMin,
      timeMax: scene.fadeIODurationMax,
      sinRate: scene.fadeIOSinRate,
      bpmMulti: scene.fadeIOBPMMulti
    }
    let totalDuration = this.calcTotalDuration(scene, timeToNextFrame, bpm)
    while (totalDuration > 0) {
      const duration =
        durations.fadeInOut.calc(timingSettings, timeToNextFrame, bpm, 10) / 2

      const opacity = fadeIn ? 1 : 0
      const easing = fadeIn ? startEasing : endEasing
      loops.push({ duration, opacity, easing })
      totalDuration -= duration
      fadeIn = !fadeIn
    }

    return { loops }
  }

  private getPanningEffect(
    data: ContentData,
    uuid: string,
    sceneID: number,
    state: RootState,
    timeToNextFrame: number,
    bpm?: number
  ) {
    const scene = state.scene.entries[sceneID]
    if (
      !scene.panning ||
      (scene.panHorizTransType === HTF.none &&
        scene.panVertTransType === VTF.none)
    ) {
      return undefined
    }

    let prevPanHorizTransType: string | undefined
    let prevPanVertTransType: string | undefined
    const start: PanningLoopData = { duration: 0 }
    start.translateX = this.getPanningTranslateX(
      data,
      scene,
      prevPanHorizTransType
    )
    if (start.translateX != null) {
      prevPanHorizTransType = this.getHorizTransType(start.translateX.amount)
    }

    start.translateY = this.getPanningTranslateY(
      data,
      scene,
      prevPanVertTransType
    )
    if (start.translateY != null) {
      prevPanVertTransType = this.getVertTransType(start.translateY.amount)
    }

    let loops: PanningLoopData[] = []
    const durations = this.getDurations(uuid)
    const timingSettings = {
      timingFunction: scene.panTF,
      time: scene.panDuration,
      timeMin: scene.panDurationMin,
      timeMax: scene.panDurationMax,
      sinRate: scene.panSinRate,
      bpmMulti: scene.panBPMMulti
    }
    let totalDuration = this.calcTotalDuration(scene, timeToNextFrame, bpm)
    while (totalDuration > 0) {
      const translateX = this.getPanningTranslateX(
        data,
        scene,
        prevPanHorizTransType
      )
      if (translateX != null) {
        prevPanHorizTransType = this.getHorizTransType(translateX.amount)
      }

      const translateY = this.getPanningTranslateY(
        data,
        scene,
        prevPanVertTransType
      )
      if (translateY != null) {
        prevPanVertTransType = this.getVertTransType(translateY.amount)
      }

      const duration =
        durations.panning.calc(timingSettings, timeToNextFrame, bpm, 10) / 2

      loops.push({ translateX, translateY, duration })
      totalDuration -= duration
    }

    const panning: PanningData = { start, loops }
    if (state.app.config.displaySettings.easingControls) {
      panning.startEasing = {
        ea: scene.panStartEase,
        exp: scene.panStartExp,
        amp: scene.panStartAmp,
        per: scene.panStartPer,
        ov: scene.panStartOv
      }

      panning.endEasing = {
        ea: scene.panEndEase,
        exp: scene.panEndExp,
        amp: scene.panEndAmp,
        per: scene.panEndPer,
        ov: scene.panEndOv
      }
    }

    return panning
  }

  private calcTotalDuration(
    scene: Scene,
    timeToNextFrame: number,
    bpm?: number
  ) {
    let maxSlideDuration = 0
    let maxCrossFadeDuration = 0
    if (scene.slide) {
      if (scene.slideTF === TF.random || scene.slideTF === TF.sin) {
        maxSlideDuration = scene.slideDurationMax
      } else {
        this.totalDuration.reset()
        maxSlideDuration = this.totalDuration.calc(
          {
            timingFunction: scene.slideTF,
            time: scene.slideDuration,
            timeMin: scene.slideDurationMin,
            timeMax: scene.slideDurationMax,
            sinRate: 1,
            bpmMulti: scene.slideBPMMulti
          },
          timeToNextFrame,
          bpm
        )
      }
    }
    if (scene.crossFade) {
      if (scene.fadeTF === TF.random || scene.fadeTF === TF.sin) {
        maxCrossFadeDuration = scene.fadeDurationMax
      } else {
        this.totalDuration.reset()
        maxCrossFadeDuration = this.totalDuration.calc(
          {
            timingFunction: scene.fadeTF,
            time: scene.fadeDuration,
            timeMin: scene.fadeDurationMin,
            timeMax: scene.fadeDurationMax,
            sinRate: 1,
            bpmMulti: scene.fadeBPMMulti
          },
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

  private getPanningTranslateX(
    data: ContentData,
    scene: Scene,
    prevTransType?: string
  ) {
    if (scene.panHorizTransType === HTF.none) {
      return undefined
    }

    const imageTypes = [
      IT.fitBestNoClip,
      IT.stretch,
      IT.centerNoClip,
      IT.fitWidth
    ]
    if (
      scene.panHorizTransImg &&
      (data.type === 'iframe' || imageTypes.includes(scene.imageType))
    ) {
      return undefined
    }

    let panHorizTransType: string
    if (prevTransType != null) {
      panHorizTransType = prevTransType === HTF.left ? HTF.right : HTF.left
    } else {
      panHorizTransType = scene.panHorizTransType
      if (panHorizTransType === HTF.random) {
        panHorizTransType = getRandomBoolean() ? HTF.right : HTF.left
      }
    }

    let horizPix = false
    let horizTransLevel = 0
    if (scene.panHorizTransImg) {
      // needs image size and parent container size
      // horizTransLevel is calculated in the Panning component
      horizPix = true
      horizTransLevel = 1
    } else {
      horizTransLevel = scene.panHorizTransRandom
        ? getRandomInteger(
            scene.panHorizTransLevelMin,
            scene.panHorizTransLevelMax
          )
        : scene.panHorizTransLevel
    }
    if (panHorizTransType === HTF.right) {
      horizTransLevel *= -1
    }

    const horizSuffix = horizPix ? 'px' : '%'
    return { amount: horizTransLevel, unit: horizSuffix }
  }

  private getPanningTranslateY(
    data: ContentData,
    scene: Scene,
    prevTransType?: string
  ) {
    if (scene.panVertTransType === VTF.none) {
      return undefined
    }

    const imageTypes = [
      IT.fitBestNoClip,
      IT.stretch,
      IT.centerNoClip,
      IT.fitHeight
    ]
    if (
      scene.panVertTransImg &&
      (data.type === 'iframe' || imageTypes.includes(scene.imageType))
    ) {
      return undefined
    }

    let panVertTransType: string
    if (prevTransType != null) {
      panVertTransType = prevTransType === VTF.up ? VTF.down : VTF.up
    } else {
      panVertTransType = scene.panVertTransType
      if (panVertTransType === VTF.random) {
        panVertTransType = getRandomBoolean() ? VTF.down : VTF.up
      }
    }

    let vertPix = false
    let vertTransLevel = 0
    if (scene.panVertTransImg) {
      // needs image size and parent container size
      // vertTransLevel is calculated in the Panning component
      vertTransLevel = 1
      vertPix = true
    } else {
      vertTransLevel = scene.panVertTransRandom
        ? getRandomInteger(
            scene.panVertTransLevelMin,
            scene.panVertTransLevelMax
          )
        : scene.panVertTransLevel
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
  ): ImageViewState {
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
      video.url = `${data.clip?.url ?? data.url}#t=${video.playStart},${
        video.playEnd
      }`
    }
    return {
      data,
      view,
      transform,
      effects,
      show: false,
      zIndex: -1
    }
  }

  public shouldLoad(data: ContentData, criteria: LoadCriteria): boolean {
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

export default function preload() {
  return ContentPreloadService.getInstance()
}

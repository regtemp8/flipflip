import React, { useEffect, useState, useRef } from 'react'
import wretch from 'wretch'
import gifInfo from 'gif-info'

import { CircularProgress, Container, Typography } from '@mui/material'

import {
  getSourceType,
  isVideo,
  urlToPath,
  GO,
  IF,
  OF,
  OT,
  SL,
  SOF,
  ST,
  VO,
  WF
} from 'flipflip-common'
import {
  flatten,
  getCachePath,
  getDuration,
  getRandomListItem,
  getRandomNumber
} from '../../data/utils'
import { getFileName } from './Scrapers'
import type ChildCallbackHack from './ChildCallbackHack'
import ImageView from './ImageView'
import Strobe from './Strobe'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectAppConfigCachingDirectory,
  selectAppConfigCachingEnabled,
  selectAppConfigDisplaySettingsMaxInMemory,
  selectAppConfigDisplaySettingsMaxInHistory,
  selectAppConfigDisplaySettingsMaxLoadingAtOnce,
  selectAppConfigDisplaySettingsMinVideoSize,
  selectAppConfigDisplaySettingsMinImageSize,
  selectAppConfigDefaultSceneOrderFunction,
  selectUndefined
} from '../../store/app/selectors'
import { selectConstants } from '../../store/constants/selectors'
import {
  selectSceneBackForth,
  selectSceneBackForthTF,
  selectSceneBackForthDuration,
  selectSceneBackForthDurationMin,
  selectSceneBackForthDurationMax,
  selectSceneBackForthSinRate,
  selectSceneBackForthBPMMulti,
  selectSceneOrderFunction,
  selectSceneUseWeights,
  selectSceneFullSource,
  selectSceneForceAllSource,
  selectSceneForceAll,
  selectSceneSkipVideoStart,
  selectSceneSkipVideoEnd,
  selectSceneVideoSpeed,
  selectSceneVideoSpeedMin,
  selectSceneVideoSpeedMax,
  selectSceneVideoRandomSpeed,
  selectSceneRandomVideoStart,
  selectSceneContinueVideo,
  selectSceneVideoOption,
  selectSceneVideoTimingConstant,
  selectSceneVideoTimingMin,
  selectSceneVideoTimingMax,
  selectSceneGifOption,
  selectSceneGifTimingConstant,
  selectSceneGifTimingMin,
  selectSceneGifTimingMax,
  selectSceneTimingTF,
  selectSceneTimingDuration,
  selectSceneTimingDurationMin,
  selectSceneTimingDurationMax,
  selectSceneTimingSinRate,
  selectSceneTimingBPMMulti,
  selectSceneSourceOrderFunction,
  selectSceneWeightFunction,
  selectSceneVideoOrientation,
  selectSceneIsDownloadScene,
  selectSceneNextSceneAllImages,
  selectSceneNextSceneID,
  selectSceneImageOrientation,
  selectSceneImageTypeFilter,
  selectSceneStrobe
} from '../../store/scene/selectors'
import { selectSceneLibrarySources } from '../../store/librarySource/selectors'
import { setRouteGoBack, cacheImage } from '../../store/app/thunks'
import { nextScene } from '../../store/scene/thunks'
import { selectAudioBPM } from '../../store/audio/selectors'
import {
  selectPlayerSceneID,
  selectPlayerHasStarted
} from '../../store/player/selectors'
import {
  selectSourceScraperAllPosts,
  selectSourceScraperAllURLs,
  selectSourceScraperSingleImage
} from '../../store/sourceScraper/selectors'
import flipflip from '../../FlipFlipService'

interface GifInfo {
  animated: boolean
  duration: number
  durationChrome: number
}

export interface ImagePlayerProps {
  uuid: string
  currentAudio?: number
  gridView: boolean
  advanceHack: ChildCallbackHack
  isPlaying: boolean
  historyOffset: number
  deleteHack?: ChildCallbackHack
  gridCoordinates?: number[]
  isOverlay?: boolean
  strobeLayer?: string
  setHistoryPaths: (
    historyPaths: Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>
  ) => void
  setHistoryOffset: (historyOffset: number) => void
  setVideo: (video?: HTMLVideoElement) => void
  setSceneCopy?: (children: React.ReactNode) => void
  setTimeToNextFrame?: (timeToNextFrame: number) => void
}

interface ImagePlayerState {
  image?: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement
  timeToNextFrame: number
  toggleStrobe: boolean
}

export default function ImagePlayer(props: ImagePlayerProps) {
  const _hasStarted = useRef<boolean>(false)
  const _allURLs = useRef<Record<string, string[]>>()
  const _allPosts = useRef<Record<string, string>>()

  const dispatch = useAppDispatch()
  const { isWin32, pathSep } = useAppSelector(selectConstants())
  const sceneID = useAppSelector(selectPlayerSceneID(props.uuid))
  _hasStarted.current = useAppSelector(selectPlayerHasStarted(props.uuid))
  _allURLs.current = useAppSelector(selectSourceScraperAllURLs(sceneID))
  _allPosts.current = useAppSelector(selectSourceScraperAllPosts(sceneID))
  const maxLoadingAtOnce = useAppSelector(
    selectAppConfigDisplaySettingsMaxLoadingAtOnce()
  )
  const maxInMemory = useAppSelector(
    selectAppConfigDisplaySettingsMaxInMemory()
  )
  const maxInHistory = useAppSelector(
    selectAppConfigDisplaySettingsMaxInHistory()
  )
  const cachingEnabled = useAppSelector(selectAppConfigCachingEnabled())
  const cachingDirectory = useAppSelector(selectAppConfigCachingDirectory())
  const minVideoSize = useAppSelector(
    selectAppConfigDisplaySettingsMinVideoSize()
  )
  const minImageSize = useAppSelector(
    selectAppConfigDisplaySettingsMinImageSize()
  )
  const defaultSceneOrderFunction = useAppSelector(
    selectAppConfigDefaultSceneOrderFunction()
  )
  const backForth = useAppSelector(selectSceneBackForth(sceneID))
  const backForthTF = useAppSelector(selectSceneBackForthTF(sceneID))
  const backForthDuration = useAppSelector(
    selectSceneBackForthDuration(sceneID)
  )
  const backForthDurationMin = useAppSelector(
    selectSceneBackForthDurationMin(sceneID)
  )
  const backForthDurationMax = useAppSelector(
    selectSceneBackForthDurationMax(sceneID)
  )
  const backForthSinRate = useAppSelector(selectSceneBackForthSinRate(sceneID))
  const backForthBPMMulti = useAppSelector(
    selectSceneBackForthBPMMulti(sceneID)
  )
  const orderFunction = useAppSelector(selectSceneOrderFunction(sceneID))
  const sourceOrderFunction = useAppSelector(
    selectSceneSourceOrderFunction(sceneID)
  )
  const weightFunction = useAppSelector(selectSceneWeightFunction(sceneID))
  const useWeights = useAppSelector(selectSceneUseWeights(sceneID))
  const sources = useAppSelector(selectSceneLibrarySources(sceneID))
  const fullSource = useAppSelector(selectSceneFullSource(sceneID))
  const forceAllSource = useAppSelector(selectSceneForceAllSource(sceneID))
  const forceAll = useAppSelector(selectSceneForceAll(sceneID))
  const videoOrientation = useAppSelector(selectSceneVideoOrientation(sceneID))
  const skipVideoStart = useAppSelector(selectSceneSkipVideoStart(sceneID))
  const skipVideoEnd = useAppSelector(selectSceneSkipVideoEnd(sceneID))
  const videoSpeed = useAppSelector(selectSceneVideoSpeed(sceneID))
  const videoSpeedMin = useAppSelector(selectSceneVideoSpeedMin(sceneID))
  const videoSpeedMax = useAppSelector(selectSceneVideoSpeedMax(sceneID))
  const videoRandomSpeed = useAppSelector(selectSceneVideoRandomSpeed(sceneID))
  const randomVideoStart = useAppSelector(selectSceneRandomVideoStart(sceneID))
  const continueVideo = useAppSelector(selectSceneContinueVideo(sceneID))
  const videoOption = useAppSelector(selectSceneVideoOption(sceneID))
  const videoTimingConstant = useAppSelector(
    selectSceneVideoTimingConstant(sceneID)
  )
  const videoTimingMin = useAppSelector(selectSceneVideoTimingMin(sceneID))
  const videoTimingMax = useAppSelector(selectSceneVideoTimingMax(sceneID))
  const downloadScene = useAppSelector(selectSceneIsDownloadScene(sceneID))
  const nextSceneAllImages = useAppSelector(
    selectSceneNextSceneAllImages(sceneID)
  )
  const nextSceneID = useAppSelector(selectSceneNextSceneID(sceneID))
  const imageOrientation = useAppSelector(selectSceneImageOrientation(sceneID))
  const gifOption = useAppSelector(selectSceneGifOption(sceneID))
  const gifTimingConstant = useAppSelector(
    selectSceneGifTimingConstant(sceneID)
  )
  const gifTimingMin = useAppSelector(selectSceneGifTimingMin(sceneID))
  const gifTimingMax = useAppSelector(selectSceneGifTimingMax(sceneID))
  const imageTypeFilter = useAppSelector(selectSceneImageTypeFilter(sceneID))
  const timingTF = useAppSelector(selectSceneTimingTF(sceneID))
  const timingDuration = useAppSelector(selectSceneTimingDuration(sceneID))
  const timingDurationMin = useAppSelector(
    selectSceneTimingDurationMin(sceneID)
  )
  const timingDurationMax = useAppSelector(
    selectSceneTimingDurationMax(sceneID)
  )
  const timingSinRate = useAppSelector(selectSceneTimingSinRate(sceneID))
  const timingBPMMulti = useAppSelector(selectSceneTimingBPMMulti(sceneID))
  const strobe = useAppSelector(selectSceneStrobe(sceneID))
  const bpmSelector =
    props.currentAudio != null
      ? selectAudioBPM(props.currentAudio)
      : selectUndefined
  const bpm = useAppSelector(bpmSelector)
  const singleImage = useAppSelector(selectSourceScraperSingleImage(sceneID))

  const [state, setState] = useState<ImagePlayerState>({
    timeToNextFrame: 0,
    toggleStrobe: false
  })

  const _historyOffset = useRef<number>(0)
  const _historyPaths = useRef<
    Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>
  >([])
  const _readyToDisplay = useRef<
    Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement | undefined>
  >([])
  const _backForth = useRef<number>()
  const _isMounted = useRef<boolean>(false)
  const _isLooping = useRef<boolean>(false)
  const _loadedSources = useRef<string[]>([])
  const _loadedURLs = useRef<string[]>([])
  const _playedURLs = useRef<string[]>([])
  const _nextIndex = useRef<number>(-1)
  const _nextAdvIndex = useRef<number>(0)
  const _sourceComplete = useRef<boolean>(false)
  const _nextSourceIndex = useRef(new Map<string, number>())
  const _timeout = useRef<number>()
  const _waitTimeouts = useRef(
    new Array<number | undefined>(maxLoadingAtOnce).fill(undefined)
  )
  const _imgLoadTimeouts = useRef(
    new Array<number | undefined>(maxLoadingAtOnce).fill(undefined)
  )
  const _runFetchLoopCallRequests = useRef<number[]>([])
  const _animationFrameHandle = useRef<number>()
  const _lastAdvance = useRef<number>()
  const _strictCheckCount = useRef<number>(0)
  const _nextImageID = useRef(0)
  const _prevSceneID = useRef<number>()

  // START LOG COMPONENT CHANGES
  // const pr_uuid = useRef<string>()
  // const pr_currentAudio = useRef<number>()
  // const pr_gridView = useRef<boolean>()
  // const pr_advanceHack = useRef<ChildCallbackHack>()
  // const pr_isPlaying = useRef<boolean>()
  // const pr_historyOffset = useRef<number>()
  // const pr_deleteHack = useRef<ChildCallbackHack>()
  // const pr_gridCoordinates = useRef<number[]>()
  // const pr_isOverlay = useRef<boolean>()
  // const pr_strobeLayer = useRef<string>()
  // const pr_setHistoryPaths = useRef<(
  //   historyPaths: Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>
  // ) => void>()
  // const pr_setHistoryOffset = useRef<(historyOffset: number) => void>()
  // const pr_setVideo = useRef<(video: HTMLVideoElement) => void>()
  // const pr_setTimeToNextFrame = useRef<(timeToNextFrame: number) => void>()
  // const pr_setSceneCopy = useRef<(children: React.ReactNode) => void>()
  // const p_isWin32 = useRef<boolean>()
  // const p_pathSep = useRef<string>()
  // const p_sceneID = useRef<number>()
  // const p_maxLoadingAtOnce = useRef<number>()
  // const p_maxInMemory = useRef<number>()
  // const p_maxInHistory = useRef<number>()
  // const p_cachingEnabled = useRef<boolean>()
  // const p_cachingDirectory = useRef<string>()
  // const p_minVideoSize = useRef<number>()
  // const p_minImageSize = useRef<number>()
  // const p_defaultSceneOrderFunction = useRef<string>()
  // const p_backForth = useRef<boolean>()
  // const p_backForthTF = useRef<string>()
  // const p_backForthDuration = useRef<number>()
  // const p_backForthDurationMin = useRef<number>()
  // const p_backForthDurationMax = useRef<number>()
  // const p_backForthSinRate = useRef<number>()
  // const p_backForthBPMMulti = useRef<number>()
  // const p_orderFunction = useRef<string>()
  // const p_sourceOrderFunction = useRef<string>()
  // const p_weightFunction = useRef<string>()
  // const p_useWeights = useRef<boolean>()
  // const p_sources = useRef<LibrarySource[]>()
  // const p_fullSource = useRef<boolean>()
  // const p_forceAllSource = useRef<boolean>()
  // const p_forceAll = useRef<boolean>()
  // const p_videoOrientation = useRef<string>()
  // const p_skipVideoStart = useRef<number>()
  // const p_skipVideoEnd = useRef<number>()
  // const p_videoSpeed = useRef<number>()
  // const p_videoSpeedMin = useRef<number>()
  // const p_videoSpeedMax = useRef<number>()
  // const p_videoRandomSpeed = useRef<boolean>()
  // const p_randomVideoStart = useRef<boolean>()
  // const p_continueVideo = useRef<boolean>()
  // const p_videoOption = useRef<string>()
  // const p_videoTimingConstant = useRef<number>()
  // const p_videoTimingMin = useRef<number>()
  // const p_videoTimingMax = useRef<number>()
  // const p_downloadScene = useRef<boolean>()
  // const p_nextSceneAllImages = useRef<boolean>()
  // const p_nextSceneID = useRef<number>()
  // const p_imageOrientation = useRef<string>()
  // const p_gifOption = useRef<string>()
  // const p_gifTimingConstant = useRef<number>()
  // const p_gifTimingMin = useRef<number>()
  // const p_gifTimingMax = useRef<number>()
  // const p_imageTypeFilter = useRef<string>()
  // const p_timingTF = useRef<string>()
  // const p_timingDuration = useRef<number>()
  // const p_timingDurationMin = useRef<number>()
  // const p_timingDurationMax = useRef<number>()
  // const p_timingSinRate = useRef<number>()
  // const p_timingBPMMulti = useRef<number>()
  // const p_strobe = useRef<boolean>()
  // const p_bpm = useRef<number>()
  // const p_singleImage = useRef<boolean>()
  // const r_hasStarted = useRef<boolean>()
  // const r_allURLs = useRef<Record<string, string[]>>()
  // const r_allPosts = useRef<Record<string, string>>()
  // const r_state = useRef<ImagePlayerState>()
  // const r_historyOffset = useRef<number>()
  // const r_historyPaths = useRef<
  //   Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>
  // >()
  // const r_readyToDisplay = useRef<
  //   Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement | undefined>
  // >()
  // const r_backForth = useRef<number>()
  // const r_isMounted = useRef<boolean>()
  // const r_isLooping = useRef<boolean>()
  // const r_loadedSources = useRef<string[]>()
  // const r_loadedURLs = useRef<string[]>()
  // const r_playedURLs = useRef<string[]>()
  // const r_nextIndex = useRef<number>()
  // const r_nextAdvIndex = useRef<number>()
  // const r_sourceComplete = useRef<boolean>()
  // const r_nextSourceIndex = useRef<Map<string, number>>()
  // const r_timeout = useRef<number>()
  // const r_waitTimeouts = useRef<Array<number | undefined>>()
  // const r_imgLoadTimeouts = useRef<Array<number | undefined>>()
  // const r_runFetchLoopCallRequests = useRef<number[]>()
  // const r_animationFrameHandle = useRef<number>()
  // const r_lastAdvance = useRef<number>()
  // const r_strictCheckCount = useRef<number>()
  // const r_nextImageID = useRef<number>()
  // const r_prevSceneID = useRef<number>()

  // console.log('33------------------------33')
  // if(props.uuid !== pr_uuid.current){
  //   console.log('UUID PROP CHANGED')
  // }
  // if(props.currentAudio !== pr_currentAudio.current){
  //   console.log('CURRENT_AUDIO PROP CHANGED')
  // }
  // if(props.isPlaying !== pr_isPlaying.current){
  //   console.log('IS_PLAYING PROP CHANGED')
  // }
  // if(props.gridView !== pr_gridView.current){
  //   console.log('GRID_VIEW PROP CHANGED')
  // }
  // if(props.historyOffset !== pr_historyOffset.current){
  //   console.log('HISTORY_OFFSET PROP CHANGED')
  // }
  // if(props.advanceHack !== pr_advanceHack.current){
  //   console.log('ADVANCE_HACK PROP CHANGED')
  // }
  // if(props.deleteHack !== pr_deleteHack.current){
  //   console.log('DELETE_HACK PROP CHANGED')
  // }
  // if(props.gridCoordinates !== pr_gridCoordinates.current){
  //   console.log('GRID_COORDINATES PROP CHANGED')
  // }
  // if(props.isOverlay !== pr_isOverlay.current){
  //   console.log('IS_OVERLAY PROP CHANGED')
  // }
  // if(props.strobeLayer !== pr_strobeLayer.current){
  //   console.log('STROBE_LAYER PROP CHANGED')
  // }
  // if(props.setHistoryOffset !== pr_setHistoryOffset.current){
  //   console.log('SET_HISTORY_OFFSET PROP CHANGED')
  // }
  // if(props.setHistoryPaths !== pr_setHistoryPaths.current){
  //   console.log('SET_HISTORY_PATHS PROP CHANGED')
  // }
  // if(props.setVideo !== pr_setVideo.current){
  //   console.log('SET_VIDEO PROP CHANGED')
  // }
  // if(props.setTimeToNextFrame !== pr_setTimeToNextFrame.current){
  //   console.log('SET_TIME_TO_NEXT_FRAME PROP CHANGED')
  // }
  // if(props.setSceneCopy !== pr_setSceneCopy.current){
  //   console.log('SET_SCENE_COPY PROP CHANGED')
  // }
  // if(p_isWin32.current !== isWin32) {
  // 	console.log('IS_WIN32 CHANGED')
  // }
  // if(p_pathSep.current !== pathSep) {
  // 	console.log('PATH_SEP CHANGED')
  // }
  // if(p_sceneID.current !== sceneID) {
  // 	console.log('SCENE_ID CHANGED')
  // }
  // if(p_maxLoadingAtOnce.current !== maxLoadingAtOnce) {
  // 	console.log('MAX_LOADING_AT_ONCE CHANGED')
  // }
  // if(p_maxInMemory.current !== maxInMemory) {
  // 	console.log('MAX_IN_MEMORY CHANGED')
  // }
  // if(p_maxInHistory.current !== maxInHistory) {
  // 	console.log('MAX_IN_HISTORY CHANGED')
  // }
  // if(p_cachingEnabled.current !== cachingEnabled) {
  // 	console.log('CACHING_ENABLED CHANGED')
  // }
  // if(p_cachingDirectory.current !== cachingDirectory) {
  // 	console.log('CACHING_DIRECTORY CHANGED')
  // }
  // if(p_minVideoSize.current !== minVideoSize) {
  // 	console.log('MIN_VIDEO_SIZE CHANGED')
  // }
  // if(p_minImageSize.current !== minImageSize) {
  // 	console.log('MIN_IMAGE_SIZE CHANGED')
  // }
  // if(p_defaultSceneOrderFunction.current !== defaultSceneOrderFunction) {
  // 	console.log('DEFAULT_SCENE_ORDER_FUNCTION CHANGED')
  // }
  // if(p_backForth.current !== backForth) {
  // 	console.log('BACK_FORTH CHANGED')
  // }
  // if(p_backForthTF.current !== backForthTF) {
  // 	console.log('BACK_FORTH_TF CHANGED')
  // }
  // if(p_backForthDuration.current !== backForthDuration) {
  // 	console.log('BACK_FORTH_DURATION CHANGED')
  // }
  // if(p_backForthDurationMin.current !== backForthDurationMin) {
  // 	console.log('BACK_FORTH_DURATION_MIN CHANGED')
  // }
  // if(p_backForthDurationMax.current !== backForthDurationMax) {
  // 	console.log('BACK_FORTH_DURATION_MAX CHANGED')
  // }
  // if(p_backForthSinRate.current !== backForthSinRate) {
  // 	console.log('BACK_FORTH_SIN_RATE CHANGED')
  // }
  // if(p_backForthBPMMulti.current !== backForthBPMMulti) {
  // 	console.log('BACK_FORTH_BPM_MULTI CHANGED')
  // }
  // if(p_orderFunction.current !== orderFunction) {
  // 	console.log('ORDER_FUNCTION CHANGED')
  // }
  // if(p_sourceOrderFunction.current !== sourceOrderFunction) {
  // 	console.log('SOURCE_ORDER_FUNCTION CHANGED')
  // }
  // if(p_weightFunction.current !== weightFunction) {
  // 	console.log('WEIGHT_FUNCTION CHANGED')
  // }
  // if(p_useWeights.current !== useWeights) {
  // 	console.log('USE_WEIGHTS CHANGED')
  // }
  // if(p_sources.current !== sources) {
  // 	console.log('SOURCES CHANGED')
  // }
  // if(p_fullSource.current !== fullSource) {
  // 	console.log('FULL_SOURCE CHANGED')
  // }
  // if(p_forceAllSource.current !== forceAllSource) {
  // 	console.log('FORCE_ALL_SOURCE CHANGED')
  // }
  // if(p_forceAll.current !== forceAll) {
  // 	console.log('FORCE_ALL CHANGED')
  // }
  // if(p_videoOrientation.current !== videoOrientation) {
  // 	console.log('VIDEO_ORIENTATION CHANGED')
  // }
  // if(p_skipVideoStart.current !== skipVideoStart) {
  // 	console.log('SKIP_VIDEO_START CHANGED')
  // }
  // if(p_skipVideoEnd.current !== skipVideoEnd) {
  // 	console.log('SKIP_VIDEO_END CHANGED')
  // }
  // if(p_videoSpeed.current !== videoSpeed) {
  // 	console.log('VIDEO_SPEED CHANGED')
  // }
  // if(p_videoSpeedMin.current !== videoSpeedMin) {
  // 	console.log('VIDEO_SPEED_MIN CHANGED')
  // }
  // if(p_videoSpeedMax.current !== videoSpeedMax) {
  // 	console.log('VIDEO_SPEED_MAX CHANGED')
  // }
  // if(p_videoRandomSpeed.current !== videoRandomSpeed) {
  // 	console.log('VIDEO_RANDOM_SPEED CHANGED')
  // }
  // if(p_randomVideoStart.current !== randomVideoStart) {
  // 	console.log('RANDOM_VIDEO_START CHANGED')
  // }
  // if(p_continueVideo.current !== continueVideo) {
  // 	console.log('CONTINUE_VIDEO CHANGED')
  // }
  // if(p_videoOption.current !== videoOption) {
  // 	console.log('VIDEO_OPTION CHANGED')
  // }
  // if(p_videoTimingConstant.current !== videoTimingConstant) {
  // 	console.log('VIDEO_TIMING_CONSTANT CHANGED')
  // }
  // if(p_videoTimingMin.current !== videoTimingMin) {
  // 	console.log('VIDEO_TIMING_MIN CHANGED')
  // }
  // if(p_videoTimingMax.current !== videoTimingMax) {
  // 	console.log('VIDEO_TIMING_MAX CHANGED')
  // }
  // if(p_downloadScene.current !== downloadScene) {
  // 	console.log('DOWNLOAD_SCENE CHANGED')
  // }
  // if(p_nextSceneAllImages.current !== nextSceneAllImages) {
  // 	console.log('NEXT_SCENE_ALL_IMAGES CHANGED')
  // }
  // if(p_nextSceneID.current !== nextSceneID) {
  // 	console.log('NEXT_SCENE_ID CHANGED')
  // }
  // if(p_imageOrientation.current !== imageOrientation) {
  // 	console.log('IMAGE_ORIENTATION CHANGED')
  // }
  // if(p_gifOption.current !== gifOption) {
  // 	console.log('GIF_OPTION CHANGED')
  // }
  // if(p_gifTimingConstant.current !== gifTimingConstant) {
  // 	console.log('GIF_TIMING_CONSTANT CHANGED')
  // }
  // if(p_gifTimingMin.current !== gifTimingMin) {
  // 	console.log('GIF_TIMING_MIN CHANGED')
  // }
  // if(p_gifTimingMax.current !== gifTimingMax) {
  // 	console.log('GIF_TIMING_MAX CHANGED')
  // }
  // if(p_imageTypeFilter.current !== imageTypeFilter) {
  // 	console.log('IMAGE_TYPE_FILTER CHANGED')
  // }
  // if(p_timingTF.current !== timingTF) {
  // 	console.log('TIMING_TF CHANGED')
  // }
  // if(p_timingDuration.current !== timingDuration) {
  // 	console.log('TIMING_DURATION CHANGED')
  // }
  // if(p_timingDurationMin.current !== timingDurationMin) {
  // 	console.log('TIMING_DURATION_MIN CHANGED')
  // }
  // if(p_timingDurationMax.current !== timingDurationMax) {
  // 	console.log('TIMING_DURATION_MAX CHANGED')
  // }
  // if(p_timingSinRate.current !== timingSinRate) {
  // 	console.log('TIMING_SIN_RATE CHANGED')
  // }
  // if(p_timingBPMMulti.current !== timingBPMMulti) {
  // 	console.log('TIMING_BPM_MULTI CHANGED')
  // }
  // if(p_strobe.current !== strobe) {
  // 	console.log('STROBE CHANGED')
  // }
  // if(p_bpm.current !== bpm) {
  // 	console.log('BPM CHANGED')
  // }
  // if(p_singleImage.current !== singleImage) {
  // 	console.log('SINGLE_IMAGE CHANGED')
  // }
  // if(r_hasStarted.current !== _hasStarted.current) {
  // 	console.log('HAS_STARTED CHANGED')
  // }
  // if(r_allURLs.current !== _allURLs.current) {
  // 	console.log('ALL_URLS CHANGED')
  // }
  // if(r_allPosts.current !== _allPosts.current) {
  // 	console.log('ALL_POSTS CHANGED')
  // }
  // if(r_state.current !== state) {
  // 	console.log('PLAYER STATE CHANGED')
  // }
  // if(r_historyOffset.current !== _historyOffset.current) {
  // 	console.log('HISTORY_OFFSET CHANGED')
  // }
  // if(r_historyPaths.current !== _historyPaths.current) {
  // 	console.log('HISTORY_PATHS CHANGED')
  // }
  // if(r_readyToDisplay.current !== _readyToDisplay.current) {
  // 	console.log('READY_TO_DISPLAY CHANGED')
  // }
  // if(r_backForth.current !== _backForth.current) {
  // 	console.log('BACK_FORTH CHANGED')
  // }
  // if(r_isMounted.current !== _isMounted.current) {
  // 	console.log('IS_MOUNTED CHANGED')
  // }
  // if(r_isLooping.current !== _isLooping.current) {
  // 	console.log('IS_LOOPING CHANGED')
  // }
  // if(r_loadedSources.current !== _loadedSources.current) {
  // 	console.log('LOADED_SOURCES CHANGED')
  // }
  // if(r_loadedURLs.current !== _loadedURLs.current) {
  // 	console.log('LOADED_URLS CHANGED')
  // }
  // if(r_playedURLs.current !== _playedURLs.current) {
  // 	console.log('PLAYED_URLS CHANGED')
  // }
  // if(r_nextIndex.current !== _nextIndex.current) {
  // 	console.log('NEXT_INDEX CHANGED')
  // }
  // if(r_nextAdvIndex.current !== _nextAdvIndex.current) {
  // 	console.log('NEXT_ADV_INDEX CHANGED')
  // }
  // if(r_sourceComplete.current !== _sourceComplete.current) {
  // 	console.log('SOURCE_COMPLETE CHANGED')
  // }
  // if(r_nextSourceIndex.current !== _nextSourceIndex.current) {
  // 	console.log('NEXT_SOURCE_INDEX CHANGED')
  // }
  // if(r_timeout.current !== _timeout.current) {
  // 	console.log('TIMEOUT CHANGED')
  // }
  // if(r_waitTimeouts.current !== _waitTimeouts.current) {
  // 	console.log('WAIT_TIMEOUTS CHANGED')
  // }
  // if(r_imgLoadTimeouts.current !== _imgLoadTimeouts.current) {
  // 	console.log('IMG_LOAD_TIMEOUTS CHANGED')
  // }
  // if(r_runFetchLoopCallRequests.current !== _runFetchLoopCallRequests.current) {
  // 	console.log('RUN_FETCH_LOOP_CALL_REQUESTS CHANGED')
  // }
  // if(r_animationFrameHandle.current !== _animationFrameHandle.current) {
  // 	console.log('ANIMATION_FRAME_HANDLE CHANGED')
  // }
  // if(r_lastAdvance.current !== _lastAdvance.current) {
  // 	console.log('LAST_ADVANCE CHANGED')
  // }
  // if(r_strictCheckCount.current !== _strictCheckCount.current) {
  // 	console.log('STRICT_CHECK_COUNT CHANGED')
  // }
  // if(r_nextImageID.current !== _nextImageID.current) {
  // 	console.log('NEXT_IMAGE_ID CHANGED')
  // }
  // if(r_prevSceneID.current !== _prevSceneID.current) {
  // 	console.log('PREV_SCENE_ID CHANGED')
  // }
  // console.log('33------------------------33')

  // pr_uuid.current = props.uuid
  // pr_currentAudio.current = props.currentAudio
  // pr_isPlaying.current = props.isPlaying
  // pr_gridView.current = props.gridView
  // pr_historyOffset.current = props.historyOffset
  // pr_advanceHack.current = props.advanceHack
  // pr_deleteHack.current = props.deleteHack
  // pr_gridCoordinates.current = props.gridCoordinates
  // pr_isOverlay.current = props.isOverlay
  // pr_strobeLayer.current = props.strobeLayer
  // pr_setHistoryOffset.current = props.setHistoryOffset
  // pr_setHistoryPaths.current = props.setHistoryPaths
  // pr_setVideo.current = props.setVideo
  // pr_setTimeToNextFrame.current = props.setTimeToNextFrame
  // pr_setSceneCopy.current = props.setSceneCopy
  // p_isWin32.current = isWin32
  // p_pathSep.current = pathSep
  // p_sceneID.current = sceneID
  // p_maxLoadingAtOnce.current = maxLoadingAtOnce
  // p_maxInMemory.current = maxInMemory
  // p_maxInHistory.current = maxInHistory
  // p_cachingEnabled.current = cachingEnabled
  // p_cachingDirectory.current = cachingDirectory
  // p_minVideoSize.current = minVideoSize
  // p_minImageSize.current = minImageSize
  // p_defaultSceneOrderFunction.current = defaultSceneOrderFunction
  // p_backForth.current = backForth
  // p_backForthTF.current = backForthTF
  // p_backForthDuration.current = backForthDuration
  // p_backForthDurationMin.current = backForthDurationMin
  // p_backForthDurationMax.current = backForthDurationMax
  // p_backForthSinRate.current = backForthSinRate
  // p_backForthBPMMulti.current = backForthBPMMulti
  // p_orderFunction.current = orderFunction
  // p_sourceOrderFunction.current = sourceOrderFunction
  // p_weightFunction.current = weightFunction
  // p_useWeights.current = useWeights
  // p_sources.current = sources
  // p_fullSource.current = fullSource
  // p_forceAllSource.current = forceAllSource
  // p_forceAll.current = forceAll
  // p_videoOrientation.current = videoOrientation
  // p_skipVideoStart.current = skipVideoStart
  // p_skipVideoEnd.current = skipVideoEnd
  // p_videoSpeed.current = videoSpeed
  // p_videoSpeedMin.current = videoSpeedMin
  // p_videoSpeedMax.current = videoSpeedMax
  // p_videoRandomSpeed.current = videoRandomSpeed
  // p_randomVideoStart.current = randomVideoStart
  // p_continueVideo.current = continueVideo
  // p_videoOption.current = videoOption
  // p_videoTimingConstant.current = videoTimingConstant
  // p_videoTimingMin.current = videoTimingMin
  // p_videoTimingMax.current = videoTimingMax
  // p_downloadScene.current = downloadScene
  // p_nextSceneAllImages.current = nextSceneAllImages
  // p_nextSceneID.current = nextSceneID
  // p_imageOrientation.current = imageOrientation
  // p_gifOption.current = gifOption
  // p_gifTimingConstant.current = gifTimingConstant
  // p_gifTimingMin.current = gifTimingMin
  // p_gifTimingMax.current = gifTimingMax
  // p_imageTypeFilter.current = imageTypeFilter
  // p_timingTF.current = timingTF
  // p_timingDuration.current = timingDuration
  // p_timingDurationMin.current = timingDurationMin
  // p_timingDurationMax.current = timingDurationMax
  // p_timingSinRate.current = timingSinRate
  // p_timingBPMMulti.current = timingBPMMulti
  // p_strobe.current = strobe
  // p_bpm.current = bpm
  // p_singleImage.current = singleImage
  // r_hasStarted.current = _hasStarted.current
  // r_allURLs.current = _allURLs.current
  // r_allPosts.current = _allPosts.current
  // r_state.current = state
  // r_historyOffset.current = _historyOffset.current
  // r_historyPaths.current = _historyPaths.current
  // r_readyToDisplay.current = _readyToDisplay.current
  // r_backForth.current = _backForth.current
  // r_isMounted.current = _isMounted.current
  // r_isLooping.current = _isLooping.current
  // r_loadedSources.current = _loadedSources.current
  // r_loadedURLs.current = _loadedURLs.current
  // r_playedURLs.current = _playedURLs.current
  // r_nextIndex.current = _nextIndex.current
  // r_nextAdvIndex.current = _nextAdvIndex.current
  // r_sourceComplete.current = _sourceComplete.current
  // r_nextSourceIndex.current = _nextSourceIndex.current
  // r_timeout.current = _timeout.current
  // r_waitTimeouts.current = _waitTimeouts.current
  // r_imgLoadTimeouts.current = _imgLoadTimeouts.current
  // r_runFetchLoopCallRequests.current = _runFetchLoopCallRequests.current
  // r_animationFrameHandle.current = _animationFrameHandle.current
  // r_lastAdvance.current = _lastAdvance.current
  // r_strictCheckCount.current = _strictCheckCount.current
  // r_nextImageID.current = _nextImageID.current
  // r_prevSceneID.current = _prevSceneID.current
  // END LOG COMPONENT CHANGES

  useEffect(() => {
    _isMounted.current = true
    props.advanceHack.listener = () => {
      let delay = 100
      if (_historyPaths.current.length > 0) {
        const source =
          _historyPaths.current[_historyPaths.current.length - 1].getAttribute(
            'source'
          )
        if (source && getSourceType(source) === ST.video) {
          delay = 200
        }
      }
      if (
        _lastAdvance.current == null ||
        new Date().getTime() - _lastAdvance.current > delay
      ) {
        _lastAdvance.current = new Date().getTime()
        clearTimeout(_timeout.current)
        _timeout.current = undefined
        // console.log('ADVANCE 111')
        advance(true, true)
      }
    }
    if (props.deleteHack) {
      props.deleteHack.listener = () => {
        // delete current image from historyPaths and _readyToDisplay
        deleteImg()
      }
    }
    _animationFrameHandle.current = requestAnimationFrame(animationFrame)
    startFetchLoops(maxLoadingAtOnce)
    // console.log('START MOUNT')
    start()

    return () => {
      if (_animationFrameHandle.current) {
        cancelAnimationFrame(_animationFrameHandle.current)
      }

      clearTimeout(_backForth.current)
      clearTimeout(_timeout.current)
      for (const timeout of _waitTimeouts.current) {
        clearTimeout(timeout)
      }
      for (const timeout of _imgLoadTimeouts.current) {
        clearTimeout(timeout)
      }
      _backForth.current = undefined
      _timeout.current = undefined
      _waitTimeouts.current = _waitTimeouts.current.fill(undefined)
      _imgLoadTimeouts.current = _imgLoadTimeouts.current.fill(undefined)
      _isMounted.current = false
      _isLooping.current = false
      _loadedSources.current = []
      _loadedURLs.current = []
      _playedURLs.current = []
      _nextIndex.current = -1
      _nextAdvIndex.current = 0
      _sourceComplete.current = false
      _nextSourceIndex.current = new Map<string, number>()
      if (props.deleteHack) {
        props.deleteHack.listener = undefined
      }
    }
  }, [])

  useEffect(() => {
    if (
      (props.isPlaying || _allURLs.current || _hasStarted.current) &&
      !_isLooping.current
    ) {
      // console.log('START PLAYING')
      start()
    } else if (!props.isPlaying) {
      _isLooping.current = false
      clearTimeout(_timeout.current)
      _timeout.current = undefined
    }
  }, [props.isPlaying, _allURLs.current, _hasStarted.current])

  useEffect(() => {
    if (_prevSceneID.current !== undefined) {
      // console.log('SCENE CHANGE')
      // reset internal state to transition to next scene
      const wasLooping = _timeout.current !== undefined
      if (wasLooping) {
        _isLooping.current = false
        clearTimeout(_timeout.current)
        // _timeout.current = undefined
      }
      if (_animationFrameHandle.current) {
        cancelAnimationFrame(_animationFrameHandle.current)
      }

      _readyToDisplay.current = []
      _historyPaths.current = []
      _loadedSources.current = []
      _loadedURLs.current = []
      _playedURLs.current = []
      _nextIndex.current = -1
      _nextAdvIndex.current = 0
      _sourceComplete.current = false
      _nextSourceIndex.current = new Map<string, number>()
      _waitTimeouts.current.forEach((timeout) => clearTimeout(timeout))
      _waitTimeouts.current = _waitTimeouts.current.fill(undefined)
      _imgLoadTimeouts.current.forEach((timeout) => clearTimeout(timeout))
      _imgLoadTimeouts.current = _imgLoadTimeouts.current.fill(undefined)
      _runFetchLoopCallRequests.current = []
      _strictCheckCount.current = 0

      props.setHistoryPaths(_historyPaths.current)
      props.setHistoryOffset(0)
      _historyOffset.current = 0

      _animationFrameHandle.current = requestAnimationFrame(animationFrame)
      startFetchLoops(maxLoadingAtOnce)
      if (wasLooping) {
        _isLooping.current = true
        _timeout.current = window.setTimeout(() => {
          // console.log('222 ADVANCE')
          advance(false, true)
        }, state.timeToNextFrame)
      }
    }

    _prevSceneID.current = sceneID
  }, [sceneID])

  useEffect(() => {
    _readyToDisplay.current = []
  }, [orderFunction, sourceOrderFunction])

  useEffect(() => {
    // console.log('backForth: ' + backForth)
    // console.log('props.isPlaying: ' + props.isPlaying)
    // console.log('hasStarted: ' + _hasStarted.current)
    if (
      backForth &&
      _backForth.current == null &&
      props.isPlaying &&
      _hasStarted.current
    ) {
      // console.log('SCHEDULE BACKFORTH')
      _backForth.current = window.setTimeout(
        () => doBackForth(-1),
        getBackForthTiming()
      )
    }
  }, [backForth, props.isPlaying, _hasStarted.current])

  useEffect(() => {
    if (!backForth) {
      clearTimeout(_backForth.current)
      _backForth.current = undefined
    }
  }, [backForth])

  const getHistoryOffset = () => {
    return props.historyOffset + _historyOffset.current
  }

  const getBackForthTiming = (): number =>
    getDuration(
      {
        timingFunction: backForthTF,
        time: backForthDuration,
        timeMin: backForthDurationMin,
        timeMax: backForthDurationMax,
        sinRate: backForthSinRate,
        bpmMulti: backForthBPMMulti
      },
      state.timeToNextFrame,
      bpm
    )

  const doBackForth = (newOffset: number) => {
    if (props.isPlaying && _isMounted.current) {
      _historyOffset.current = newOffset

      let newImage = undefined
      if (_historyPaths.current.length > 0) {
        let offset = props.historyOffset + newOffset
        if (offset <= -_historyPaths.current.length) {
          offset = -_historyPaths.current.length + 1
        }

        newImage =
          _historyPaths.current[_historyPaths.current.length - 1 + offset]
      }
      // console.log('doBackForth: SET IMG')
      setState({
        ...state,
        image: newImage
      })

      // console.log('RESCHEDULE BACKFORTH | ' + new Date().getTime())
      const nextOffset = newOffset === 0 ? -1 : 0
      _backForth.current = window.setTimeout(
        () => doBackForth(nextOffset),
        getBackForthTiming()
      )
    } else {
      if (_isMounted.current && _historyOffset.current !== 0) {
        _historyOffset.current = 0
      }
      clearTimeout(_backForth.current)
      _backForth.current = undefined
    }
  }

  const deleteImg = () => {
    const img =
      _historyPaths.current[
        _historyPaths.current.length - 1 + getHistoryOffset()
      ]
    const url = img.src
    const newHistoryPaths = []
    let newHistoryOffset = props.historyOffset
    for (const image of _historyPaths.current) {
      if (image.src !== url) {
        newHistoryPaths.push(image)
      } else {
        newHistoryOffset += 1
      }
    }
    if (newHistoryOffset > 0) {
      newHistoryOffset = 0
    }

    props.setHistoryPaths(newHistoryPaths)
    props.setHistoryOffset(newHistoryOffset)
    _historyPaths.current = newHistoryPaths
    _historyOffset.current = newHistoryOffset

    _readyToDisplay.current = _readyToDisplay.current.filter(
      (i) => i !== undefined && i.src !== url
    )
  }

  const start = () => {
    if (_allURLs.current == null) {
      // console.log('_allURLs.current == null')
      return
    }

    // console.log('ADVANCE 444')
    advance(true, true)
  }

  const startFetchLoops = (max: number, loop = 0) => {
    if (loop < max) {
      runFetchLoop(loop)
      // Put a small delay between our loops
      _waitTimeouts.current[loop] = window.setTimeout(
        () => startFetchLoops(max, loop + 1),
        10
      )
    }
  }

  const animationFrame = () => {
    if (!_isMounted.current || singleImage) {
      cancelAnimationFrame(_animationFrameHandle.current as number)
      return
    }
    let requestAnimation = false
    if (_readyToDisplay.current.length < maxLoadingAtOnce && _allURLs.current) {
      const requests = _runFetchLoopCallRequests.current || []
      while (requests.length > 0) {
        requestAnimation = true
        runFetchLoop(requests.shift() as number)
      }
    }
    if (requestAnimation) {
      _animationFrameHandle.current = requestAnimationFrame(animationFrame)
    } else {
      setTimeout(animationFrame, 100)
    }
  }

  const queueRunFetchLoop = (i: number) => {
    if (_runFetchLoopCallRequests.current) {
      _runFetchLoopCallRequests.current.push(i)
    } else {
      _runFetchLoopCallRequests.current = [i]
    }
  }

  const runFetchLoop = async (i: number) => {
    if (!_isMounted.current) return

    if (_readyToDisplay.current.length >= maxInMemory || !_allURLs.current) {
      // Wait for the display loop to use an image
      _waitTimeouts.current[i] = window.setTimeout(() => {
        queueRunFetchLoop(i)
      }, 100)
      return
    }

    let source: string
    let collection: string[]
    let url: string
    let urlIndex = 0
    let sourceIndex = 0
    let sourceLength = 0
    // For source weighted
    if (weightFunction === WF.sources) {
      let keys: string[]
      if (useWeights) {
        const validKeys = Object.keys(_allURLs.current)
        keys = []
        for (const source of sources) {
          if (validKeys.includes(source.url as string)) {
            for (let w = source.weight; w > 0; w--) {
              keys.push(source.url as string)
            }
          }
        }
      } else {
        keys = Object.keys(_allURLs.current)
      }

      // If sorting randomly, get a random source
      if (sourceOrderFunction === SOF.random) {
        // If we're playing full sources
        if (fullSource) {
          // If this is the first loop or source is done get next source
          if (_nextIndex.current === -1 || _sourceComplete.current) {
            if (forceAllSource) {
              // Filter the available urls to those not played yet
              keys = keys.filter((s) => !_loadedSources.current.includes(s))
              // If there are no remaining urls for this source
              if (!(keys && keys.length > 0)) {
                _loadedSources.current = []
                keys = Object.keys(_allURLs.current)
              }
            }

            source = getRandomListItem(keys)
            _nextIndex.current = keys.indexOf(source)
            _sourceComplete.current = false
            _loadedSources.current.push(source)
          } else {
            // Play same source
            source = keys[_nextIndex.current]
          }
        } else {
          source = getRandomListItem(keys)
          _loadedSources.current.push(source)
        }
      } else {
        // Else get the next source
        // If we're playing full sources
        if (fullSource) {
          // If this is the first loop or source is done get next source
          if (_nextIndex.current === -1 || _sourceComplete.current) {
            source = keys[++_nextIndex.current % keys.length]
            _sourceComplete.current = false
          } else {
            // Play same source
            source = keys[_nextIndex.current % keys.length]
          }
        } else {
          source = keys[++_nextIndex.current % keys.length]
        }
        sourceIndex = _nextIndex.current % keys.length
      }
      // Get the urls from the source
      collection = _allURLs.current[source] || []

      // If we have no urls, loop again
      if (!(collection && collection.length > 0)) {
        queueRunFetchLoop(i)
        return
      }

      // If sorting randomly and forcing all
      if (orderFunction === OF.random && (forceAll || fullSource)) {
        // Filter the available urls to those not played yet
        collection = collection.filter((u) => !_loadedURLs.current.includes(u))
        // If there are no remaining urls for this source
        if (!(collection && collection.length > 0)) {
          if (fullSource) {
            _loadedURLs.current = []
            _sourceComplete.current = true
            queueRunFetchLoop(i)
            return
          } else {
            // Make sure all the other sources are also extinguished
            const remainingLibrary = flatten(
              Object.values(_allURLs.current)
            ).filter((u: string) => !_loadedURLs.current.includes(u))
            // If they are, clear loadedURLs
            if (remainingLibrary.length === 0) {
              _loadedURLs.current = []
              collection = _allURLs.current[source] || []
            } else {
              // Else loop again
              queueRunFetchLoop(i)
              return
            }
          }
        }
      }

      // If sorting randomly, get a random URL
      if (orderFunction === OF.random) {
        url = getRandomListItem(collection)
      } else {
        // Else get the next index for this source
        let index = _nextSourceIndex.current.get(source)
        if (!index) {
          if (_nextSourceIndex.current.size > 0) {
            index = Math.min(..._nextSourceIndex.current.values())
          } else {
            index = 0
          }
        }
        if (orderFunction === OF.strict) {
          urlIndex = index
          sourceLength = collection.length
        }
        if (fullSource && index % collection.length === collection.length - 1) {
          _sourceComplete.current = true
        }
        url = collection[index % collection.length]
        _nextSourceIndex.current.set(source, index + 1)
      }
    } else {
      // For image weighted

      // Concat all images together
      const urlKeys = flatten(Object.keys(_allURLs.current))
      collection = urlKeys
      // If there are none, loop again
      if (!(collection && collection.length > 0)) {
        queueRunFetchLoop(i)
        return
      }

      // If sorting randomly and forcing all
      if (orderFunction === OF.random && forceAll) {
        // Filter the available ulls to those not played yet
        collection = collection.filter(
          (u: string) => !_loadedURLs.current.includes(u)
        )
        // If there are no remaining urls, clear loadedURLs
        if (!(collection && collection.length > 0)) {
          _loadedURLs.current = []
          collection = urlKeys
        }
      }

      // If sorting randomly, get a random url
      if (orderFunction === OF.random) {
        url = getRandomListItem(collection)
      } else {
        // Else get the next index
        url = collection[++_nextIndex.current % collection.length]
        if (orderFunction === OF.strict) {
          urlIndex = _nextIndex.current
          sourceLength = collection.length
        }
      }

      // Get the source of this image from the map
      source = _allURLs.current[url][0]
    }

    const allPosts = _allPosts.current as Record<string, string>
    const post = allPosts[url]

    if (
      orderFunction === OF.random &&
      (forceAll || (weightFunction === WF.sources && fullSource))
    ) {
      _loadedURLs.current.push(url)
    }

    // Don't bother loading files we've already cached locally
    const fileType = getSourceType(url)
    if (cachingEnabled && url.startsWith('http')) {
      if (
        fileType !== ST.nimja &&
        fileType !== ST.hydrus &&
        fileType !== ST.piwigo &&
        fileType !== ST.video &&
        fileType !== ST.local &&
        fileType !== ST.playlist
      ) {
        const sourceCachePath = await getCachePath(cachingDirectory, source)
        const filePath = sourceCachePath + getFileName(url, pathSep)
        const cachedAlready = await flipflip().api.pathExists(filePath)
        if (cachedAlready) {
          url = filePath
        }
      }
    }

    if (fileType === ST.nimja) {
      const iframe = document.createElement('iframe')
      iframe.setAttribute('source', source)
      if (post) {
        iframe.setAttribute('post', post)
      }
      if (orderFunction === OF.strict) {
        iframe.setAttribute('index', urlIndex.toString())
        iframe.setAttribute('length', sourceLength.toString())
        if (sourceIndex != null) {
          iframe.setAttribute('sindex', sourceIndex.toString())
        }
      }

      const successCallback = () => {
        if (_imgLoadTimeouts.current) {
          clearTimeout(_imgLoadTimeouts.current[i])
        }
        if (!_isMounted.current) return
        ;(iframe as any).key = _nextImageID.current++
        _readyToDisplay.current.push(iframe)
        if (_historyPaths.current.length === 0) {
          // console.log('ADVANCE 555')
          advance(false, false)
        }
        queueRunFetchLoop(i)
      }

      iframe.oncontextmenu = () => {
        return false
      }

      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin')
      iframe.src = url

      clearTimeout(_imgLoadTimeouts.current[i])
      successCallback()
    } else if (isVideo(url, false)) {
      const video = document.createElement('video')
      video.setAttribute('source', source)
      if (post) {
        video.setAttribute('post', post)
      }
      if (orderFunction === OF.strict) {
        video.setAttribute('index', urlIndex.toString())
        video.setAttribute('length', sourceLength.toString())
        if (sourceIndex != null) {
          video.setAttribute('sindex', sourceIndex.toString())
        }
      }
      const subtitleSplit = url.split('|||')
      if (subtitleSplit.length > 1) {
        url = subtitleSplit[0]
        video.setAttribute('subtitles', subtitleSplit[1])
      }
      const clipRegex =
        /(.*):::(\d+):([\d-]+):::(\d+\.?\d*):(\d+\.?\d*)$/g.exec(url)
      if (clipRegex != null) {
        url = clipRegex[1]
        video.setAttribute('clip', clipRegex[2])
        if (clipRegex[3] !== '-') {
          video.setAttribute('volume', clipRegex[3])
        }
        video.setAttribute('start', clipRegex[4])
        video.setAttribute('end', clipRegex[5])
      }

      const successCallback = () => {
        if (_imgLoadTimeouts.current) {
          clearTimeout(_imgLoadTimeouts.current[i])
        }
        if (!_isMounted.current) return
        dispatch(cacheImage(video))

        const width = video.videoWidth
        const height = video.videoHeight
        if (
          (videoOrientation === OT.onlyLandscape && height > width) ||
          (videoOrientation === OT.onlyPortrait && height < width)
        ) {
          errorCallback()
          return
        }

        if (
          !video.hasAttribute('start') &&
          !video.hasAttribute('end') &&
          (skipVideoStart > 0 || skipVideoEnd > 0) &&
          video.duration - skipVideoStart / 1000 - skipVideoEnd / 1000 > 0
        ) {
          video.setAttribute('start', (skipVideoStart / 1000).toString())
          video.setAttribute(
            'end',
            (video.duration - skipVideoEnd / 1000).toString()
          )
        }

        let speed = videoSpeed
        if (videoRandomSpeed) {
          speed =
            Math.floor(Math.random() * (videoSpeedMax - videoSpeedMin + 1)) +
            videoSpeedMin
        }
        video.setAttribute('speed', speed.toString())

        if (video.hasAttribute('start') && video.hasAttribute('end')) {
          const start = parseFloat(video.getAttribute('start') as string)
          const end = parseFloat(video.getAttribute('end') as string)
          if (randomVideoStart && (!continueVideo || !video.currentTime)) {
            video.currentTime = start + Math.random() * (end - start)
          } else if (video.currentTime < start || video.currentTime > end) {
            video.currentTime = start
          }
        } else if (randomVideoStart && (!continueVideo || !video.currentTime)) {
          video.currentTime = Math.random() * video.duration
        }

        switch (videoOption) {
          case VO.full:
            let duration
            if (video.hasAttribute('start') && video.hasAttribute('end')) {
              const start = video.currentTime
                ? video.currentTime
                : parseFloat(video.getAttribute('start') as string)
              const end = parseFloat(video.getAttribute('end') as string)
              duration = end - start
            } else {
              duration = video.duration - video.currentTime
            }
            duration = (duration * 1000) / (speed / 10)
            video.setAttribute('duration', duration.toString())
            break
          case VO.part:
            video.setAttribute('duration', videoTimingConstant.toString())
            break
          case VO.partr:
            video.setAttribute(
              'duration',
              getRandomNumber(videoTimingMin, videoTimingMax).toString()
            )
            break
          case VO.atLeast:
            let partDuration
            if (video.hasAttribute('start') && video.hasAttribute('end')) {
              const start = parseFloat(video.getAttribute('start') as string)
              const end = parseFloat(video.getAttribute('end') as string)
              partDuration = end - start
            } else {
              partDuration = video.duration
            }
            partDuration = (partDuration * 1000) / (speed / 10)
            let atLeastDuration = 0
            do {
              atLeastDuration += partDuration
            } while (atLeastDuration < videoTimingConstant)
            video.setAttribute('duration', atLeastDuration.toString())
            break
        }

        ;(video as any).key = _nextImageID.current
        if (orderFunction === OF.strict) {
          const lastIndex =
            _historyPaths.current.length > 0
              ? parseInt(
                  _historyPaths.current[
                    _historyPaths.current.length - 1
                  ].getAttribute('index') as string
                )
              : -1
          let count = 0
          while (_readyToDisplay.current.length < urlIndex - lastIndex) {
            count++
            _readyToDisplay.current.push(undefined)
          }
          _readyToDisplay.current[urlIndex - lastIndex - 1] = video
          _nextImageID.current++
        } else {
          _readyToDisplay.current.push(video)
          _nextImageID.current++
        }
        if (_historyPaths.current.length === 0) {
          // console.log('ADVANCE 666')
          advance(false, false)
        }
        queueRunFetchLoop(i)
      }

      const errorCallback = () => {
        if (_imgLoadTimeouts.current) {
          clearTimeout(_imgLoadTimeouts.current[i])
        }
        if (!_isMounted.current) return
        if (
          downloadScene ||
          (nextSceneAllImages && nextSceneID !== 0 && video && video.src)
        ) {
          if (!_playedURLs.current.includes(video.src)) {
            _playedURLs.current.push(video.src)
          }
        }
        if (orderFunction === OF.strict) {
          const lastIndex =
            _historyPaths.current.length > 0
              ? parseInt(
                  _historyPaths.current[
                    _historyPaths.current.length - 1
                  ].getAttribute('index') as string
                )
              : -1

          let count = 0
          while (_readyToDisplay.current.length < urlIndex - lastIndex) {
            count++
            _readyToDisplay.current.push(undefined)
          }
          const errImage = new Image()
          errImage.setAttribute('index', urlIndex.toString())
          errImage.setAttribute('length', sourceLength.toString())
          if (sourceIndex != null) {
            errImage.setAttribute('sindex', sourceIndex.toString())
          }
          errImage.src = 'img/flipflip_logo.png'
          _readyToDisplay.current[urlIndex - lastIndex - 1] = errImage
          _nextImageID.current++
        }
        queueRunFetchLoop(i)
      }

      video.onloadeddata = () => {
        // images may load immediately, but that messes up the setState()
        // lifecycle, so always load on the next event loop iteration.
        // Also, now  we know the image size, so we can finally filter it.
        if (
          video.videoWidth < minVideoSize ||
          video.videoHeight < minVideoSize
        ) {
          console.warn(
            'Video skipped due to minimum width/height: ' + video.src
          )
          errorCallback()
        } else {
          successCallback()
        }
      }

      video.onerror = video.onabort = () => {
        errorCallback()
      }

      video.onended = () => {
        if (videoOption === VO.full) {
          clearTimeout(_timeout.current)
          _timeout.current = undefined
          // console.log('ADVANCE 777')
          advance(true, true)
        } else {
          video.play().catch((err) => console.warn(err))
        }
      }

      video.src = url
      video.volume = 0
      video.preload = 'auto'

      clearTimeout(_imgLoadTimeouts.current[i])
      _imgLoadTimeouts.current[i] = window.setTimeout(errorCallback, 15000)

      video.load()
    } else {
      const img = new Image()
      img.setAttribute('source', source)
      if (post) {
        img.setAttribute('post', post)
      }
      if (orderFunction === OF.strict) {
        img.setAttribute('index', urlIndex.toString())
        img.setAttribute('length', sourceLength.toString())
        if (sourceIndex != null) {
          img.setAttribute('sindex', sourceIndex.toString())
        }
      }

      const successCallback = () => {
        if (_imgLoadTimeouts.current) {
          clearTimeout(_imgLoadTimeouts.current[i])
        }
        if (!_isMounted.current) return
        dispatch(cacheImage(img))

        const width = img.width
        const height = img.height
        if (
          (imageOrientation === OT.onlyLandscape && height > width) ||
          (imageOrientation === OT.onlyPortrait && height < width)
        ) {
          errorCallback()
          return
        }

        ;(img as any).key = _nextImageID.current
        if (orderFunction === OF.strict) {
          const lastIndex =
            _historyPaths.current.length > 0
              ? parseInt(
                  _historyPaths.current[
                    _historyPaths.current.length - 1
                  ].getAttribute('index') as string
                )
              : -1

          let count = 0
          while (_readyToDisplay.current.length < urlIndex - lastIndex) {
            count++
            _readyToDisplay.current.push(undefined)
          }
          _readyToDisplay.current[urlIndex - lastIndex - 1] = img
          _nextImageID.current++
        } else {
          _readyToDisplay.current.push(img)
          _nextImageID.current++
        }
        if (_historyPaths.current.length === 0 && _timeout.current == null) {
          // console.log('ADVANCE 888')
          advance(false, false)
        }
        queueRunFetchLoop(i)
      }

      const errorCallback = () => {
        if (_imgLoadTimeouts.current) {
          clearTimeout(_imgLoadTimeouts.current[i])
        }
        if (!_isMounted.current) return
        if (
          downloadScene ||
          (nextSceneAllImages && nextSceneID !== 0 && img && img.src)
        ) {
          if (!_playedURLs.current.includes(img.src)) {
            _playedURLs.current.push(img.src)
          }
        }
        if (orderFunction === OF.strict) {
          const lastIndex =
            _historyPaths.current.length > 0
              ? parseInt(
                  _historyPaths.current[
                    _historyPaths.current.length - 1
                  ].getAttribute('index') as string
                )
              : -1

          let count = 0
          while (_readyToDisplay.current.length < urlIndex - lastIndex) {
            count++
            _readyToDisplay.current.push(undefined)
          }
          const errImage = new Image()
          errImage.setAttribute('index', urlIndex.toString())
          errImage.setAttribute('length', sourceLength.toString())
          if (sourceIndex != null) {
            errImage.setAttribute('sindex', sourceIndex.toString())
          }
          errImage.src = 'img/flipflip_logo.png'
          _readyToDisplay.current[urlIndex - lastIndex - 1] = errImage
          _nextImageID.current++
        }
        queueRunFetchLoop(i)
      }

      img.onload = () => {
        // images may load immediately, but that messes up the setState()
        // lifecycle, so always load on the next event loop iteration.
        // Also, now  we know the image size, so we can finally filter it.
        if (img.width < minImageSize || img.height < minImageSize) {
          console.warn('Image skipped due to minimum width/height: ' + img.src)
          errorCallback()
        } else {
          successCallback()
        }
      }

      img.onerror = img.onabort = () => {
        errorCallback()
      }

      const processInfo = (info?: GifInfo) => {
        if (info == null) {
          queueRunFetchLoop(i)
          return
        }

        // If gif is animated and we want to play entire length, store its duration
        if (info && info.animated) {
          switch (gifOption) {
            case GO.full:
              img.setAttribute(
                'duration',
                (info.durationChrome
                  ? info.durationChrome
                  : info.duration
                ).toString()
              )
              break
            case GO.part:
              img.setAttribute('duration', gifTimingConstant.toString())
              break
            case GO.partr:
              img.setAttribute(
                'duration',
                getRandomNumber(gifTimingMin, gifTimingMax).toString()
              )
              break
            case GO.atLeast:
              let duration = 0
              do {
                duration += info.durationChrome
                  ? info.durationChrome
                  : info.duration
                if (duration === 0) {
                  break
                }
              } while (duration < gifTimingConstant)
              img.setAttribute('duration', duration.toString())
              break
          }
        }

        // Exclude non-animated gifs from gifs
        if (imageTypeFilter === IF.animated && info && !info.animated) {
          queueRunFetchLoop(i)
          return
          // Exclude animated gifs from stills
        } else if (imageTypeFilter === IF.stills && info && info.animated) {
          queueRunFetchLoop(i)
          return
        }

        img.src = url
        clearTimeout(_imgLoadTimeouts.current[i])
        _imgLoadTimeouts.current[i] = window.setTimeout(errorCallback, 5000)
      }

      // Get gifinfo if we need for imageFilter or playing full gif
      if (
        (imageTypeFilter === IF.animated ||
          imageTypeFilter === IF.stills ||
          gifOption !== GO.none) &&
        url.includes('.gif')
      ) {
        // Get gif info. See https://github.com/Prinzhorn/gif-info
        try {
          if (url.includes('file://')) {
            const arrayBuffer = await flipflip().api.readBinaryFile(
              urlToPath(url, isWin32)
            )
            processInfo(gifInfo(arrayBuffer))
          } else {
            wretch(url)
              .get()
              .arrayBuffer((arrayBuffer) => {
                processInfo(gifInfo(arrayBuffer))
              })
              .catch((err) => {
                console.error(err)
                processInfo()
              })
          }
        } catch (e) {
          console.error(e)
        }
      } else {
        img.src = url
        clearTimeout(_imgLoadTimeouts.current[i])
        _imgLoadTimeouts.current[i] = window.setTimeout(errorCallback, 5000)
      }
    }
  }

  const advance = (force = false, schedule = true) => {
    // console.log('=== ADVANCE === ' + props.uuid)
    // console.log('force: ' + force)
    // console.log('props.isPlaying: ' + props.isPlaying)
    // console.log('_isMounted.current: ' + _isMounted.current)
    // console.log('hasStarted: ' + _hasStarted.current)
    // console.log('_historyPaths.current.length === 0: ' + (_historyPaths.current.length === 0))
    // console.log('===============')
    // bail if dead
    if (
      !(
        force ||
        (props.isPlaying &&
          _isMounted.current &&
          (_hasStarted.current || _historyPaths.current.length === 0))
      )
    ) {
      // console.log('$$$ DEAD $$$')
      _isLooping.current = false
      return
    }
    _isLooping.current = true

    let nextHistoryPaths = _historyPaths.current
    let nextImg:
      | HTMLImageElement
      | HTMLVideoElement
      | HTMLIFrameElement
      | undefined
    if (props.historyOffset === 0) {
      if (
        downloadScene &&
        _playedURLs.current.length === sources[0].count &&
        _hasStarted.current
      ) {
        dispatch(setRouteGoBack())
      }
      if (nextSceneAllImages && nextSceneID !== 0) {
        let remainingLibrary
        const allURLs = _allURLs.current as Record<string, string[]>
        if (weightFunction === WF.sources) {
          remainingLibrary = flatten(Object.values(allURLs)).filter(
            (u: string) => !_playedURLs.current.includes(u)
          )
        } else {
          remainingLibrary = flatten(Object.keys(allURLs)).filter(
            (u: string) => !_playedURLs.current.includes(u)
          )
        }
        if (remainingLibrary.length === 0) {
          _playedURLs.current = new Array<string>()
          dispatch(nextScene(sceneID as number))
          return
        }
      }

      // Prevent playing same image again, if possible
      do {
        if (
          _readyToDisplay.current.length > 0 &&
          _readyToDisplay.current[0] != null
        ) {
          // If there is an image ready, display the next image
          nextImg = _readyToDisplay.current.shift()
          // console.log(`[${sceneID}] readyToDisplay: ${nextImg.src}`)
          _strictCheckCount.current = 0
        } else if (
          _historyPaths.current.length > 0 &&
          defaultSceneOrderFunction === OF.random &&
          !forceAll
        ) {
          // If no image is ready, we have a history to choose from, ordering is random, and NOT forcing all
          // Choose a random image from history to display
          nextImg = getRandomListItem(_historyPaths.current)
          // console.log('random historyPaths: ' + nextImg.src)
        } else if (_historyPaths.current.length > 0) {
          // If no image is ready, we have a history to choose from, and ordering is not random
          // Show the next image from history
          if (orderFunction === OF.strict) {
            // If ordering strictly and next isn't ready yet, don't load any image
            _strictCheckCount.current++
            if (_strictCheckCount.current >= 50) {
              _readyToDisplay.current.shift()
              _strictCheckCount.current = 0
            }
            nextImg = undefined
            // console.log('nextImg = undefined')
          } else {
            nextImg =
              _historyPaths.current[
                _nextAdvIndex.current++ % _historyPaths.current.length
              ]

            // console.log('adv historyPaths: ' + nextImg.src)
          }
        }
      } while (
        _historyPaths.current.length > 0 &&
        nextImg?.src ==
          _historyPaths.current[_historyPaths.current.length - 1].src &&
        (_readyToDisplay.current.length > 0 ||
          _historyPaths.current.filter(
            (s) =>
              s.src !=
              _historyPaths.current[_historyPaths.current.length - 1]?.src
          ).length > 0)
      )

      if (nextImg) {
        if (continueVideo && nextImg instanceof HTMLVideoElement) {
          const videoFind = Array.from(_historyPaths.current)
            .reverse()
            .find(
              (i) =>
                i.src === nextImg!.src &&
                i.getAttribute('start') === nextImg!.getAttribute('start') &&
                i.getAttribute('end') === nextImg!.getAttribute('end')
            )
          if (videoFind) {
            nextImg = videoFind
            // console.log('videoFind: ' + nextImg.src)
          }
        }

        nextHistoryPaths = nextHistoryPaths.concat([nextImg])
      }

      while (nextHistoryPaths.length > maxInHistory) {
        nextHistoryPaths.shift()!.remove()
      }

      if (
        nextImg != null &&
        (downloadScene ||
          (nextSceneAllImages && nextSceneID !== 0 && nextImg && nextImg.src))
      ) {
        if (!_playedURLs.current.includes(nextImg.src)) {
          _playedURLs.current.push(nextImg.src)
        }
      }
    } else {
      const newOffset = props.historyOffset + 1
      nextImg =
        _historyPaths.current[_historyPaths.current.length - 1 + newOffset]

      // console.log('newOffset: ' + nextImg.src)
      props.setHistoryOffset(newOffset)
    }

    if (!schedule) {
      _historyPaths.current = nextHistoryPaths
      props.setHistoryPaths(nextHistoryPaths)
      setState({
        ...state,
        image: nextImg
      })
    } else {
      let timeToNextFrame = getDuration(
        {
          timingFunction: timingTF,
          time: timingDuration,
          timeMin: timingDurationMin,
          timeMax: timingDurationMax,
          sinRate: timingSinRate,
          bpmMulti: timingBPMMulti
        },
        0,
        bpm
      )

      const durationAttr = nextImg?.getAttribute('duration')
      if (durationAttr) {
        timeToNextFrame = Math.max(timeToNextFrame, parseFloat(durationAttr))
      }
      if (props.setTimeToNextFrame) {
        props.setTimeToNextFrame(timeToNextFrame)
      }

      // props.setHistoryPaths(nextHistoryPaths)
      _historyPaths.current = nextHistoryPaths
      // console.log('IMAGE CHANGE')
      // console.log(`timeToNextFrame: ${timeToNextFrame}`)
      setState({
        image: nextImg,
        timeToNextFrame,
        toggleStrobe: strobe ? !state.toggleStrobe : state.toggleStrobe
      })

      if (
        !(nextImg instanceof HTMLVideoElement && videoOption === VO.full) &&
        !(
          singleImage &&
          _historyPaths.current.length > 0 &&
          getSourceType(
            _historyPaths.current[
              _historyPaths.current.length - 1
            ]!.getAttribute('source') as string
          ) === ST.nimja
        )
      ) {
        _timeout.current = window.setTimeout(() => {
          // console.log('ADVANCE TIMEOUT ' + new Date().getTime())
          advance(false, true)
        }, timeToNextFrame)

        // _timeout.current = window.setTimeout(
        //   () => advance(false, true),
        //   timeToNextFrame
        // )
      }
    }
  }

  const style: any = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    position: props.gridView ? 'static' : 'fixed',
    zIndex: props.isOverlay ? 4 : 'auto'
  }

  return (
    <div style={style}>
      {strobe && props.strobeLayer === SL.middle && (
        <Strobe
          sceneID={sceneID as number}
          currentAudio={props.currentAudio}
          zIndex={3}
          toggleStrobe={state.toggleStrobe}
          timeToNextFrame={state.timeToNextFrame}
        />
      )}
      {downloadScene && (
        <Container
          maxWidth={false}
          style={{
            height: '100%',
            zIndex: 3,
            flexGrow: 1,
            padding: 0,
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex'
          }}
        >
          {sources[0].countComplete && (
            <CircularProgress
              size={300}
              variant="determinate"
              value={Math.round(
                (_playedURLs.current.length / sources[0].count) * 100
              )}
            />
          )}
          {!sources[0].countComplete && <CircularProgress size={300} />}
          <div
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
              position: 'absolute',
              flexDirection: 'column'
            }}
          >
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              style={{
                paddingLeft: 8,
                paddingRight: 8,
                backgroundColor: '#2C2C2C'
              }}
            >
              {_playedURLs.current.length} / {sources[0].count}
              {sources[0].countComplete ? '' : '+'}
            </Typography>
          </div>
        </Container>
      )}
      <ImageView
        removeChild
        gridCoordinates={props.gridCoordinates}
        uuid={props.uuid}
        isOverlay={props.isOverlay}
        image={state.image}
        currentAudio={props.currentAudio}
        timeToNextFrame={state.timeToNextFrame}
        toggleStrobe={state.toggleStrobe}
        fitParent={props.gridView}
        setSceneCopy={props.setSceneCopy}
        setVideo={props.setVideo}
      />
    </div>
  )
}

;(ImagePlayer as any).displayName = 'ImagePlayer'

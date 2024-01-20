import React, { useEffect, useRef, useState } from 'react'
import { IdleTimer } from './IdleTimer'

import {
  Button,
  CircularProgress,
  Container,
  type Theme,
  Typography
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import { getFileGroup, urlToPath, SL, WC } from 'flipflip-common'
import { getFileName } from './Scrapers'
import AudioAlert from './AudioAlert'
import CaptionProgramPlaylist from './CaptionProgramPlaylist'
import ChildCallbackHack from './ChildCallbackHack'
import GridPlayer from './GridPlayer'
import ImageView from './ImageView'
import PictureGrid from './PictureGrid'
import PlayerBars from './PlayerBars'
import SourceScraper from './SourceScraper'
import Strobe from './Strobe'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectConstants } from '../../store/constants/selectors'
import {
  selectAppTutorial,
  selectAppConfigGeneralSettingsWatermarkSettings,
  selectAppConfigDisplaySettingsAudioAlert,
  selectAppConfigDisplaySettingsStartImmediately,
  selectPlayerAllTags,
  WatermarkSettings,
  selectUndefined
} from '../../store/app/selectors'
import {
  selectSceneIsGridScene,
  selectSceneIsAudioScene,
  selectSceneIsScriptScene,
  selectSceneIsDownloadScene,
  selectSceneNextSceneAllImages,
  selectSceneNextSceneTime,
  selectScenePersistAudio,
  selectSceneAudioEnabled,
  selectScenePersistText,
  selectSceneTextEnabled,
  selectSceneStrobe,
  selectSceneStrobeLayer,
  selectSceneScriptPlaylists,
  selectSceneName,
  selectSceneFirstSourceUrl
} from '../../store/scene/selectors'
import { changeAudioRoute } from '../../store/scene/slice'
import {
  navigateDisplayedLibrary,
  setRouteGoBack
} from '../../store/app/thunks'
import {
  selectPlayerOverlaysLoaded,
  selectPlayerState,
  selectPlayerCanStart,
  selectPlayerSceneID,
  selectPlayerFirstImageLoaded
} from '../../store/player/selectors'
import {
  nextScene,
  setPlayerHasStartedRecursive
} from '../../store/player/thunks'
import {
  selectAudioName,
  selectAudioThumb,
  selectAudioUrl,
  selectAudioArtist,
  selectAudioAlbum
} from '../../store/audio/selectors'
import { orderScriptTags } from '../../store/tag/thunks'
import {
  setPlayerFirstImageLoaded,
  setPlayerIsEmpty,
  setPlayerMainLoaded
} from '../../store/player/slice'
import { selectSourceScraperProgress } from '../../store/sourceScraper/selectors'
import { setFullScreen } from '../../data/actions'

const useStyles = makeStyles()((theme: Theme) => ({
    progressMain: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default,
      zIndex: 10
    },
    progressContainer: {
      flexGrow: 1,
      padding: theme.spacing(0),
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex'
    },
    emptyMain: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default,
      zIndex: 10
    },
    emptyContainer: {
      flexGrow: 1,
      padding: theme.spacing(0),
      position: 'relative'
    },
    startNowBtn: {
      marginTop: theme.spacing(1)
    }
  }))

interface ProgressCardProps {
  sceneID: number
  start?: () => void
}

function ProgressCard(props: ProgressCardProps) {
  const progress = useAppSelector(selectSourceScraperProgress(props.sceneID))
  if (!progress) return null

  const { total, current, message } = progress
  return (
    <main className={props.classes.progressMain}>
      <Container maxWidth={false} className={props.classes.progressContainer}>
        <CircularProgress
          size={300}
          value={Math.round((current / total) * 100)}
          variant="determinate"
        />
        <div
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            position: 'absolute',
            flexDirection: 'column'
          }}
        >
          <Typography component="h1" variant="h6" color="inherit" noWrap>
            {current} / {total}
          </Typography>
          {message.map((line, index) => (
            <Typography
              key={'msg-' + index}
              component="h1"
              variant="h5"
              color="inherit"
              noWrap
            >
              {line}
            </Typography>
          ))}
          {props.start && (
            <Button
              className={props.classes.startNowBtn}
              variant="contained"
              color="secondary"
              onClick={() => {
                if (props.start != null) {
                  props.start()
                }
              }}
            >
              Start Now
            </Button>
          )}
        </div>
      </Container>
    </main>
  )
}

export interface PlayerProps {
  uuid: string
  advanceHack?: ChildCallbackHack
  allLoaded?: boolean
  captionProgramJumpToHack?: ChildCallbackHack
  captionScale?: number
  gridCoordinates?: number[]
  gridView?: boolean
  preventSleep?: boolean
  getCurrentTimestamp?: () => number
  onCaptionError?: (e: string) => void
  onLoaded?: () => void
  setProgress?: (total: number, current: number, message: string[]) => void
  setSceneCopy?: (children: React.ReactNode) => void
  setVideo?: (video?: HTMLVideoElement) => void
}

function Player(props: PlayerProps) {
  const [currentAudio, setCurrentAudio] = useState<number>()

  const dispatch = useAppDispatch()
  const { isWin32, pathSep } = useAppSelector(selectConstants())
  const state = useAppSelector(selectPlayerState(props.uuid))
  const areOverlaysLoaded = useAppSelector(
    selectPlayerOverlaysLoaded(props.uuid)
  )
  const canStart = useAppSelector(selectPlayerCanStart(props.uuid))

  const watermark = useAppSelector(
    selectAppConfigGeneralSettingsWatermarkSettings(props.gridView ?? false)
  )
  const audioAlert = useAppSelector(selectAppConfigDisplaySettingsAudioAlert())
  const startImmediately = useAppSelector(
    selectAppConfigDisplaySettingsStartImmediately()
  )
  const tutorial = useAppSelector(selectAppTutorial())
  const allTags = useAppSelector(selectPlayerAllTags())
  const isGridScene = useAppSelector(selectSceneIsGridScene(state.sceneID))
  const isAudioScene = useAppSelector(selectSceneIsAudioScene(state.sceneID))
  const isScriptScene = useAppSelector(selectSceneIsScriptScene(state.sceneID))
  const isDownloadScene = useAppSelector(
    selectSceneIsDownloadScene(state.sceneID)
  )
  const nextSceneAllImages = useAppSelector(
    selectSceneNextSceneAllImages(state.sceneID)
  )
  const nextSceneTime = useAppSelector(selectSceneNextSceneTime(state.sceneID))
  const persistAudio = useAppSelector(selectScenePersistAudio(state.sceneID))
  const audioEnabled = useAppSelector(selectSceneAudioEnabled(state.sceneID))
  const persistText = useAppSelector(selectScenePersistText(state.sceneID))
  const textEnabled = useAppSelector(selectSceneTextEnabled(state.sceneID))
  const strobe = useAppSelector(selectSceneStrobe(state.sceneID))
  const strobeLayer = useAppSelector(selectSceneStrobeLayer(state.sceneID))
  const scriptPlaylists = useAppSelector(
    selectSceneScriptPlaylists(state.sceneID)
  )
  const name = useAppSelector(selectSceneName(state.sceneID))
  const firstSourceUrl = useAppSelector(
    selectSceneFirstSourceUrl(state.sceneID)
  )

  const audioThumbSelector =
    currentAudio != null ? selectAudioThumb(currentAudio) : selectUndefined
  const audioThumb = useAppSelector(audioThumbSelector)
  const audioUrlSelector =
    currentAudio != null ? selectAudioUrl(currentAudio) : selectUndefined
  const audioUrl = useAppSelector(audioUrlSelector)
  const audioNameSelector =
    currentAudio != null ? selectAudioName(currentAudio) : selectUndefined
  const audioName = useAppSelector(audioNameSelector)
  const audioArtistSelector =
    currentAudio != null ? selectAudioArtist(currentAudio) : selectUndefined
  const audioArtist = useAppSelector(audioArtistSelector)
  const audioAlbumSelector =
    currentAudio != null ? selectAudioAlbum(currentAudio) : selectUndefined
  const audioAlbum = useAppSelector(audioAlbumSelector)

  const [isPlaying, setIsPlaying] = useState(true)
  const [historyOffset, setHistoryOffset] = useState(0)
  const [historyPaths, setHistoryPaths] = useState(
    new Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>()
  )
  const [imagePlayerDeleteHack, setImagePlayerDeleteHack] = useState(
    new ChildCallbackHack()
  )
  const [mainVideo, setMainVideo] = useState<HTMLVideoElement>()
  const [overlayVideos, setOverlayVideos] = useState<
    Array<Array<HTMLVideoElement | undefined>>
  >([])
  const [timeToNextFrame, setTimeToNextFrame] = useState<number>()
  const [recentPictureGrid, setRecentPictureGrid] = useState(false)
  const [thumbImage, setThumbImage] = useState<HTMLImageElement>()
  const [hideCursor, setHideCursor] = useState(false)

  const _startTime = useRef<number>()
  const _idleTimerRef = useRef<HTMLDivElement>(null)
  const _interval = useRef<number>()
  const _toggleStrobe = useRef(false)
  const _wakeLock = useRef<WakeLockSentinel>()
  const _currentTimestamp = useRef<number>()
  const _imagePlayerAdvanceHacks = useRef(
    new Array<ChildCallbackHack[]>(state.overlays.length + 1).fill([
      new ChildCallbackHack()
    ])
  )

  const _setHistoryOffset = useRef<(offset: number) => void>(setHistoryOffset)
  const _setHistoryPaths =
    useRef<
      (
        paths: Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>
      ) => void
    >(setHistoryPaths)
  const _setVideo = useRef<(video?: HTMLVideoElement) => void>(
    (video?: HTMLVideoElement) => {
      if (props.setVideo) {
        props.setVideo(video)
      } else {
        setMainVideo(video)
      }
    }
  )
  const _changeTimeToNextFrame = useRef<(ttnf: number) => void>(
    (ttnf: number) => {
      _toggleStrobe.current = !_toggleStrobe.current
      setTimeToNextFrame(ttnf)
    }
  )

  // START LOG COMPONENT CHANGES
  // const pr_uuid = useRef<string>()
  // const pr_advanceHack = useRef<ChildCallbackHack>()
  // const pr_allLoaded = useRef<boolean>()
  // const pr_captionProgramJumpToHack = useRef<ChildCallbackHack>()
  // const pr_captionScale = useRef<number>()
  // const pr_gridCoordinates = useRef<number[]>()
  // const pr_gridView = useRef<boolean>()
  // const pr_preventSleep = useRef<boolean>()
  // const pr_getCurrentTimestamp = useRef<() => number>()
  // const pr_onCaptionError = useRef<(e: string) => void>()
  // const pr_onLoaded = useRef<() => void>()
  // const pr_setProgress = useRef<(total: number, current: number, message: string[]) => void>()
  // const pr_setSceneCopy = useRef<(children: React.ReactNode) => void>()
  // const pr_setVideo = useRef<(video: HTMLVideoElement) => void>()
  // const p_currentAudio = useRef<number>()
  // const p_isWin32 = useRef<boolean>()
  // const p_pathSep = useRef<string>()
  // const p_state = useRef<PlayerState>()
  // const p_areOverlaysLoaded = useRef<boolean[]>()
  // const p_canStart = useRef<boolean>()
  // const p_watermark = useRef<WatermarkSettings>()
  // const p_audioAlert = useRef<boolean>()
  // const p_startImmediately = useRef<boolean>()
  // const p_tutorial = useRef<string>()
  // const p_allTags = useRef<number[]>()
  // const p_isGridScene = useRef<boolean>()
  // const p_isAudioScene = useRef<boolean>()
  // const p_isScriptScene = useRef<boolean>()
  // const p_isDownloadScene = useRef<boolean>()
  // const p_nextSceneAllImages = useRef<boolean>()
  // const p_nextSceneTime = useRef<number>()
  // const p_persistAudio = useRef<boolean>()
  // const p_audioEnabled = useRef<boolean>()
  // const p_persistText = useRef<boolean>()
  // const p_textEnabled = useRef<boolean>()
  // const p_strobe = useRef<boolean>()
  // const p_strobeLayer = useRef<string>()
  // const p_scriptPlaylists = useRef<ScriptPlaylist[]>()
  // const p_name = useRef<string>()
  // const p_firstSourceUrl = useRef<string>()
  // const p_audioThumb = useRef<string>()
  // const p_audioUrl = useRef<string>()
  // const p_audioName = useRef<string>()
  // const p_audioArtist = useRef<string>()
  // const p_audioAlbum = useRef<string>()
  // const p_isPlaying = useRef<boolean>()
  // const p_historyOffset = useRef<number>()
  // const p_historyPaths = useRef<Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>>()
  // const p_imagePlayerDeleteHack = useRef<ChildCallbackHack>()
  // const p_mainVideo = useRef<HTMLVideoElement>()
  // const p_overlayVideos = useRef<HTMLVideoElement[][]>()
  // const p_timeToNextFrame = useRef<number>()
  // const p_recentPictureGrid = useRef<boolean>()
  // const p_thumbImage = useRef<HTMLImageElement>()
  // const p_hideCursor = useRef<boolean>()
  // const p_startTime = useRef<number>()
  // const p_idleTimerRef = useRef<HTMLDivElement>()
  // const p_interval = useRef<number>()
  // const p_toggleStrobe = useRef(false)
  // const p_powerSaveID = useRef<number>()
  // const p_currentTimestamp = useRef<number>()
  // const p_imagePlayerAdvanceHacks = useRef<ChildCallbackHack[][]>()
  // const p_setHistoryOffset = useRef<(offset: number) => void>()
  // const p_setHistoryPaths = useRef<(paths: Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>) => void>()
  // const p_setVideo = useRef<(video: HTMLVideoElement) => void>()
  // const p_changeTimeToNextFrame = useRef<(ttnf: number) => void>()

  // console.log('11------------------------11')
  // if(pr_uuid.current !== props.uuid){
  //   console.log('UUID PROP CHANGED')
  // }
  // if(pr_advanceHack.current !== props.advanceHack){
  //   console.log('ADVANCE_HACK PROP CHANGED')
  // }
  // if(pr_allLoaded.current !== props.allLoaded){
  //   console.log('ALL_LOADED PROP CHANGED')
  // }
  // if(pr_captionProgramJumpToHack.current !== props.captionProgramJumpToHack){
  //   console.log('CAPTION_PROGRAM_JUMP_TO_HACK PROP CHANGED')
  // }
  // if(pr_captionScale.current !== props.captionScale){
  //   console.log('CAPTION_SCALE PROP CHANGED')
  // }
  // if(pr_gridCoordinates.current !== props.gridCoordinates){
  //   console.log('GRID_COORDINATES PROP CHANGED')
  // }
  // if(pr_gridView.current !== props.gridView){
  //   console.log('GRID_VIEW PROP CHANGED')
  // }
  // if(pr_preventSleep.current !== props.preventSleep){
  //   console.log('PREVENT_SLEEP PROP CHANGED')
  // }
  // if(pr_getCurrentTimestamp.current !== props.getCurrentTimestamp){
  //   console.log('GET_CURRENT_TIMESTAMP PROP CHANGED')
  // }
  // if(pr_onCaptionError.current !== props.onCaptionError){
  //   console.log('ON_CAPTION_ERROR PROP CHANGED')
  // }
  // if(pr_onLoaded.current !== props.onLoaded){
  //   console.log('ON_LOADED PROP CHANGED')
  // }
  // if(pr_setProgress.current !== props.setProgress){
  //   console.log('SET_PROGRESS PROP CHANGED')
  // }
  // if(pr_setSceneCopy.current !== props.setSceneCopy){
  //   console.log('SET_SCENE_COPY PROP CHANGED')
  // }
  // if(pr_setVideo.current !== props.setVideo){
  //   console.log('SET_VIDEO PROP CHANGED')
  // }
  // if(p_currentAudio.current !== currentAudio){
  //   console.log('CURRENT_AUDIO CHANGED')
  // }
  // if(p_isWin32.current !== isWin32){
  //   console.log('IS_WIN32 CHANGED')
  // }
  // if(p_pathSep.current !== pathSep){
  //   console.log('PATH_SEP CHANGED')
  // }
  // if(p_state.current !== state){
  //   console.log('PLAYER_STATE CHANGED')
  //   console.log('-- PREV --')
  //   console.log(p_state.current)
  //   console.log('-- NEXT --')
  //   console.log(state)
  // }
  // if(p_areOverlaysLoaded.current !== areOverlaysLoaded){
  //   console.log('ARE_OVERLAYS_LOADED CHANGED')
  // }
  // if(p_canStart.current !== canStart){
  //   console.log('CAN_START CHANGED')
  // }
  // if(p_watermark.current !== watermark){
  //   console.log('WATERMARK CHANGED')
  // }
  // if(p_audioAlert.current !== audioAlert){
  //   console.log('AUDIO_ALERT CHANGED')
  // }
  // if(p_startImmediately.current !== startImmediately){
  //   console.log('START_IMMEDIATELY CHANGED')
  // }
  // if(p_tutorial.current !== tutorial){
  //   console.log('TUTORIAL CHANGED')
  // }
  // if(p_allTags.current !== allTags){
  //   console.log('ALL_TAGS CHANGED')
  // }
  // if(p_isGridScene.current !== isGridScene){
  //   console.log('IS_GRID_SCENE CHANGED')
  // }
  // if(p_isAudioScene.current !== isAudioScene){
  //   console.log('IS_AUDIO_SCENE CHANGED')
  // }
  // if(p_isScriptScene.current !== isScriptScene){
  //   console.log('IS_SCRIPT_SCENE CHANGED')
  // }
  // if(p_isDownloadScene.current !== isDownloadScene){
  //   console.log('IS_DOWNLOAD_SCENE CHANGED')
  // }
  // if(p_nextSceneAllImages.current !== nextSceneAllImages){
  //   console.log('NEXT_SCENE_ALL_IMAGES CHANGED')
  // }
  // if(p_nextSceneTime.current !== nextSceneTime){
  //   console.log('UUID CHANGED')
  // }
  // if(p_persistAudio.current !== persistAudio){
  //   console.log('PERSIST_AUDIO CHANGED')
  // }
  // if(p_audioEnabled.current !== audioEnabled){
  //   console.log('AUDIO_ENABLED CHANGED')
  // }
  // if(p_persistText.current !== persistText){
  //   console.log('PERSIST_TEXT CHANGED')
  // }
  // if(p_textEnabled.current !== textEnabled){
  // 	console.log('TEXT_ENABLED CHANGED')
  // }
  // if(p_strobe.current !== strobe){
  // 	console.log('STROBE CHANGED')
  // }
  // if(p_strobeLayer.current !== strobeLayer){
  // 	console.log('STROBE_LAYER CHANGED')
  // }
  // if(p_scriptPlaylists.current !== scriptPlaylists){
  // 	console.log('SCRIPT_PLAYLISTS CHANGED')
  // }
  // if(p_name.current !== name){
  // 	console.log('NAME CHANGED')
  // }
  // if(p_firstSourceUrl.current !== firstSourceUrl){
  // 	console.log('FIRST_SOURCE_URL CHANGED')
  // }
  // if(p_audioThumb.current !== audioThumb){
  // 	console.log('AUDIO_THUMB CHANGED')
  // }
  // if(p_audioUrl.current !== audioUrl){
  // 	console.log('AUDIO_URL CHANGED')
  // }
  // if(p_audioName.current !== audioName){
  // 	console.log('AUDIO_NAME CHANGED')
  // }
  // if(p_audioArtist.current !== audioArtist){
  // 	console.log('AUDIO_ARTIST CHANGED')
  // }
  // if(p_audioAlbum.current !== audioAlbum){
  // 	console.log('AUDIO_ALBUM CHANGED')
  // }
  // if(p_isPlaying.current !== isPlaying){
  // 	console.log('IS_PLAYING CHANGED')
  // }
  // if(p_historyOffset.current !== historyOffset){
  // 	console.log('HISTORY_OFFSET CHANGED')
  // }
  // if(p_historyPaths.current !== historyPaths){
  // 	console.log('HISTORY_PATHS CHANGED')
  // }
  // if(p_imagePlayerDeleteHack.current !== imagePlayerDeleteHack){
  // 	console.log('IMAGE_PLAYER_DELETE_HACK CHANGED')
  // }
  // if(p_mainVideo.current !== mainVideo){
  // 	console.log('MAIN_VIDEO CHANGED')
  // }
  // if(p_overlayVideos.current !== overlayVideos){
  // 	console.log('OVERLAY_VIDEOS CHANGED')
  // }
  // if(p_timeToNextFrame.current !== timeToNextFrame){
  // 	console.log('TIME_TO_NEXT_FRAME CHANGED')
  // }
  // if(p_recentPictureGrid.current !== recentPictureGrid){
  // 	console.log('RECENT_PICTURE_GRID CHANGED')
  // }
  // if(p_thumbImage.current !== thumbImage){
  // 	console.log('THUMB_IMAGE CHANGED')
  // }
  // if(p_hideCursor.current !== hideCursor){
  // 	console.log('HIDE_CURSOR CHANGED')
  // }
  // if(p_startTime.current !== _startTime.current){
  // 	console.log('START_TIME CHANGED')
  // }
  // if(p_idleTimerRef.current !== _idleTimerRef.current){
  // 	console.log('IDLE_TIMER_REF CHANGED')
  // }
  // if(p_interval.current !== _interval.current){
  // 	console.log('INTERVAL CHANGED')
  // }
  // if(p_toggleStrobe.current !== _toggleStrobe.current){
  // 	console.log('TOGGLE_STROBE CHANGED')
  // }
  // if(p_powerSaveID.current !== _powerSaveID.current){
  // 	console.log('POWER_SAVE_ID CHANGED')
  // }
  // if(p_currentTimestamp.current !== _currentTimestamp.current){
  // 	console.log('CURRENT_TIMESTAMP CHANGED')
  // }
  // if(p_imagePlayerAdvanceHacks.current !== _imagePlayerAdvanceHacks.current){
  // 	console.log('IMAGE_PLAYER_ADVANCE_HACKS CHANGED')
  // }
  // if(p_setHistoryOffset.current !== _setHistoryOffset.current){
  // 	console.log('SET_HISTORY_OFFSET CHANGED')
  // }
  // if(p_setHistoryPaths.current !== _setHistoryPaths.current){
  // 	console.log('SET_HISTORY_PATHS CHANGED')
  // }
  // if(p_setVideo.current !== _setVideo.current){
  // 	console.log('SET_VIDEO CHANGED')
  // }
  // if(p_changeTimeToNextFrame.current !== _changeTimeToNextFrame.current){
  // 	console.log('CHANGE_TIME_TO_NEXT_FRAME CHANGED')
  // }
  // console.log('11------------------------11')

  // pr_uuid.current = props.uuid
  // pr_advanceHack.current = props.advanceHack
  // pr_allLoaded.current = props.allLoaded
  // pr_captionProgramJumpToHack.current = props.captionProgramJumpToHack
  // pr_captionScale.current = props.captionScale
  // pr_gridCoordinates.current = props.gridCoordinates
  // pr_gridView.current = props.gridView
  // pr_preventSleep.current = props.preventSleep
  // pr_getCurrentTimestamp.current = props.getCurrentTimestamp
  // pr_onCaptionError.current = props.onCaptionError
  // pr_onLoaded.current = props.onLoaded
  // pr_setProgress.current = props.setProgress
  // pr_setSceneCopy.current = props.setSceneCopy
  // pr_setVideo.current = props.setVideo
  // p_currentAudio.current = currentAudio
  // p_isWin32.current = isWin32
  // p_pathSep.current = pathSep
  // p_state.current = state
  // p_areOverlaysLoaded.current = areOverlaysLoaded
  // p_canStart.current = canStart
  // p_watermark.current = watermark
  // p_audioAlert.current = audioAlert
  // p_startImmediately.current = startImmediately
  // p_tutorial.current = tutorial
  // p_allTags.current = allTags
  // p_isGridScene.current = isGridScene
  // p_isAudioScene.current = isAudioScene
  // p_isScriptScene.current = isScriptScene
  // p_isDownloadScene.current = isDownloadScene
  // p_nextSceneAllImages.current = nextSceneAllImages
  // p_nextSceneTime.current = nextSceneTime
  // p_persistAudio.current = persistAudio
  // p_audioEnabled.current = audioEnabled
  // p_persistText.current = persistText
  // p_textEnabled.current = textEnabled
  // p_strobe.current = strobe
  // p_strobeLayer.current = strobeLayer
  // p_scriptPlaylists.current = scriptPlaylists
  // p_name.current = name
  // p_firstSourceUrl.current = firstSourceUrl
  // p_audioThumb.current = audioThumb
  // p_audioUrl.current = audioUrl
  // p_audioName.current = audioName
  // p_audioArtist.current = audioArtist
  // p_audioAlbum.current = audioAlbum
  // p_isPlaying.current = isPlaying
  // p_historyOffset.current = historyOffset
  // p_historyPaths.current = historyPaths
  // p_imagePlayerDeleteHack.current = imagePlayerDeleteHack
  // p_mainVideo.current = mainVideo
  // p_overlayVideos.current = overlayVideos
  // p_timeToNextFrame.current = timeToNextFrame
  // p_recentPictureGrid.current = recentPictureGrid
  // p_thumbImage.current = thumbImage
  // p_hideCursor.current = hideCursor
  // p_startTime.current = _startTime.current
  // p_idleTimerRef.current = _idleTimerRef.current
  // p_interval.current = _interval.current
  // p_toggleStrobe.current = _toggleStrobe.current
  // p_powerSaveID.current = _powerSaveID.current
  // p_currentTimestamp.current = _currentTimestamp.current
  // p_imagePlayerAdvanceHacks.current = _imagePlayerAdvanceHacks.current
  // p_setHistoryOffset.current = _setHistoryOffset.current
  // p_setHistoryPaths.current = _setHistoryPaths.current
  // p_setVideo.current = _setVideo.current
  // p_changeTimeToNextFrame.current = _changeTimeToNextFrame.current
  // END LOG COMPONENT CHANGES

  useEffect(() => {
    if (props.preventSleep && window.navigator.wakeLock != null) {
      window.navigator.wakeLock
        .request('screen')
        .then((wakeLock) => (_wakeLock.current = wakeLock))
    }
    if (currentAudio) {
      const thumbImage = new Image()
      if (audioThumb) {
        thumbImage.src = audioThumb
      } else {
        thumbImage.src = 'img/flipflip_logo.png'
      }
      thumbImage.onload = () => {
        setThumbImage(thumbImage)
      }
    }

    return () => {
      clearInterval(_interval.current)
      _interval.current = undefined
      setFullScreen(false)
      if (props.preventSleep && _wakeLock.current != null) {
        _wakeLock.current.release().then(() => {
          _wakeLock.current = undefined
        })
      }
    }
  }, [])

  useEffect(() => {
    const thumbImage = new Image()
    thumbImage.src =
      currentAudio && audioThumb ? audioThumb : 'img/flipflip_logo.png'
    thumbImage.onload = () => {
      setThumbImage(thumbImage)
    }
  }, [currentAudio])

  useEffect(() => {
    if (_interval.current != null) {
      window.clearInterval(_interval.current)
    }
    if (state.nextSceneID !== 0) {
      _interval.current = window.setInterval(nextSceneLoop, 1000)
    }

    if (allTags) {
      _startTime.current = new Date().getTime()
    } else {
      // setHasStarted(true);
      _startTime.current = new Date().getTime()
    }
  }, [state.sceneID])

  useEffect(() => {
    console.log('11-- STATE.OVERLAYS.LENGTH CHANGED --11')
    setOverlayVideos(
      new Array<Array<HTMLVideoElement | undefined>>(
        state.overlays.length
      ).fill([undefined])
    )
  }, [state.overlays.length])

  useEffect(() => {
    if (props.allLoaded === false || state.hasStarted === false) {
      // console.log('## START props.allLoaded === false || state.hasStarted === false')
      start(state.mainLoaded, areOverlaysLoaded, canStart)
    }
  }, [props.allLoaded, state.hasStarted])

  useEffect(() => {
    if (canStart) {
      // console.log('## START canStart')
      start(state.mainLoaded, areOverlaysLoaded, canStart)
    }
  }, [canStart])

  useEffect(() => {
    if (!state.isEmpty && state.mainLoaded) {
      // console.log('START mainLoaded')
      play(state.mainLoaded, areOverlaysLoaded)
    }
  }, [state.mainLoaded])

  useEffect(() => {
    if (areOverlaysLoaded) {
      play(state.mainLoaded, areOverlaysLoaded)
    }
  }, [areOverlaysLoaded])

  const nextSceneLoop = () => {
    if (
      !isScriptScene &&
      isPlaying &&
      _startTime.current != null &&
      !nextSceneAllImages &&
      Math.abs(new Date().getTime() - _startTime.current) >= nextSceneTime
    ) {
      dispatch(nextScene(props.uuid))
    } else if (!isPlaying && _startTime.current) {
      _startTime.current += 1000
    }
  }

  const setOverlayVideo = (index: number, video?: HTMLVideoElement) => {
    const newOV = Array.from(overlayVideos)
    while (newOV.length <= index) {
      newOV.push([undefined])
    }
    if (newOV[index][0] !== video) {
      newOV[index][0] = video
      setOverlayVideos(newOV)
    }
  }

  const nop = () => {}

  const onPlaying = (position: number, duration: number) => {
    _currentTimestamp.current = position
  }

  const getTimestamp = () => {
    return _currentTimestamp.current
  }

  const changeCurrentAudio = (audioID: number) => {
    setCurrentAudio(audioID)
    if (isAudioScene) {
      dispatch(
        changeAudioRoute({ id: state.sceneID as number, value: audioID })
      )
    }
  }

  const setGridOverlayVideo = (
    oIndex: number,
    gIndex: number,
    video: HTMLVideoElement
  ) => {
    const newOV = Array.from(overlayVideos)
    while (newOV.length <= oIndex) {
      newOV.push([undefined])
    }
    while (newOV[oIndex].length <= gIndex) {
      newOV[oIndex].push(undefined)
    }
    if (newOV[oIndex][gIndex] !== video) {
      newOV[oIndex][gIndex] = video
      setOverlayVideos(newOV)
    }
  }

  const play = (isMainLoaded: boolean, areOverlaysLoaded: boolean[]) => {
    setIsPlaying(true)
    start(isMainLoaded, areOverlaysLoaded, canStart)
  }

  const pause = () => {
    setIsPlaying(false)
  }

  const start = (
    isMainLoaded: boolean,
    areOverlaysLoaded: boolean[],
    canStart: boolean,
    force = false
  ) => {
    // if(props.uuid === 'root') {
    //   console.log('== START ==')
    //   console.log('isMainLoaded: ' + isMainLoaded)
    //   console.log('force: ' + force)
    //   console.log('canStart: ' + canStart)
    //   console.log('props.allLoaded: ' + props.allLoaded)
    //   console.log('state.overlays.length: ' + state.overlays.length)
    //   console.log(state)
    //   console.log(areOverlaysLoaded)
    //   console.log('===========')
    // }

    const isLoaded =
      !force &&
      isMainLoaded &&
      (state.overlays.length === 0 || areOverlaysLoaded.every((b) => b))
    if (props.onLoaded && isLoaded) {
      props.onLoaded()
    }

    // console.log('isLoaded: ' + isLoaded)

    if (
      force ||
      (canStart &&
        ((isLoaded && props.allLoaded !== false) || startImmediately))
    ) {
      // console.log('START state.hasStarted: ' + state.hasStarted)
      dispatch(setPlayerHasStartedRecursive(props.uuid, true))
      dispatch(setPlayerMainLoaded({ uuid: props.uuid, value: true }))
      if (!_startTime.current) {
        _startTime.current = new Date().getTime()
      }
      setTimeout(() => {
        if (isGridScene) {
          for (const r of _imagePlayerAdvanceHacks.current) {
            for (const hack of r) {
              hack.fire()
            }
          }
        }
      }, 200)
    } else if (!isGridScene && !isAudioScene && state.overlays.length === 0) {
      dispatch(setPlayerMainLoaded({ uuid: props.uuid, value: isLoaded }))
    }
  }

  const goBack = () => {
    if (recentPictureGrid) {
      setRecentPictureGrid(false)
    } else {
      dispatch(setRouteGoBack())
    }
  }

  const historyBack = () => {
    setIsPlaying(false)
    setHistoryOffset(historyOffset - 1)
  }

  const historyForward = () => {
    setIsPlaying(false)
    setHistoryOffset(historyOffset + 1)
  }

  const onActive = () => {
    setHideCursor(false)
  }

  const onIdle = () => {
    setHideCursor(true)
  }

  const navigateTagging = (offset: number) => {
    // console.log('navigateTagging: false')
    dispatch(setPlayerFirstImageLoaded({ uuid: props.uuid, value: false }))
    dispatch(setPlayerHasStartedRecursive(props.uuid, false))
    dispatch(setPlayerMainLoaded({ uuid: props.uuid, value: false }))
    dispatch(setPlayerIsEmpty({ uuid: props.uuid, value: false }))
    setHistoryOffset(0)
    setHistoryPaths(new Array<any>())
    dispatch(navigateDisplayedLibrary(offset))
  }

  const onRecentPictureGrid = () => {
    setRecentPictureGrid(true)
  }

  const showCaptionProgram =
    !recentPictureGrid &&
    state.hasStarted &&
    textEnabled &&
    (scriptPlaylists.length > 0 || persistText)
  const showStrobe =
    !recentPictureGrid &&
    strobe &&
    state.hasStarted &&
    isPlaying &&
    (strobeLayer === SL.top || strobeLayer === SL.bottom)

  let rootStyle: any
  if (props.gridView) {
    rootStyle = {
      display: 'flex',
      position: 'relative',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: 'hidden'
    }
  } else {
    rootStyle = {
      display: 'flex',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  }
  if (tutorial != null) {
    rootStyle = {
      ...rootStyle,
      pointerEvents: 'none'
    }
  }

  let playerStyle: any = {}
  if (!props.gridView) {
    playerStyle = {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  } else if (state.hasStarted) {
    playerStyle = {
      position: 'relative',
      width: '100%',
      height: '100%'
    }
  }
  if (!state.hasStarted && !isDownloadScene) {
    playerStyle = {
      ...playerStyle,
      opacity: 0
    }
  }

  let watermarkStyle: any = {}
  let watermarkText = ''
  if (watermark) {
    watermarkStyle = {
      position: 'absolute',
      zIndex: 11,
      whiteSpace: 'pre',
      fontFamily: watermark.fontFamily,
      fontSize: watermark.fontSize,
      color: watermark.color
    }
    switch (watermark.corner) {
      case WC.bottomRight:
        watermarkStyle.bottom = 5
        watermarkStyle.right = 5
        watermarkStyle.textAlign = 'right'
        break
      case WC.bottomLeft:
        watermarkStyle.bottom = 5
        watermarkStyle.left = 5
        watermarkStyle.textAlign = 'left'
        break
      case WC.topRight:
        watermarkStyle.top = 5
        watermarkStyle.right = 5
        watermarkStyle.textAlign = 'right'
        break
      case WC.topLeft:
        watermarkStyle.top = 5
        watermarkStyle.left = 5
        watermarkStyle.textAlign = 'left'
        break
    }

    watermarkText = watermark.text.replace('{scene_name}', name)
    const img = historyPaths[historyPaths.length - 1 + historyOffset]
    if (img) {
      const source = img.getAttribute('source') as string
      watermarkText = watermarkText.replace('{source_url}', source)

      const fileGroup = getFileGroup(source, pathSep) ?? ''
      watermarkText = watermarkText.replace('{source_name}', fileGroup)
      if (img.hasAttribute('post')) {
        const post = img.getAttribute('post') as string
        watermarkText = watermarkText.replace('{post_url}', post)
      } else {
        watermarkText = watermarkText.replace(/\{post_url\}\s*/g, '')
      }
      watermarkText = watermarkText.replace(
        '{file_url}',
        img.src.startsWith('file') ? urlToPath(img.src, isWin32) : img.src
      )
      watermarkText = watermarkText.replace(
        '{file_name}',
        decodeURIComponent(getFileName(img.src, pathSep))
      )
    } else {
      watermarkText = watermarkText.replace(/\s*\{source_url\}\s*/g, '')
      watermarkText = watermarkText.replace(/\s*\{source_name\}\s*/g, '')
      watermarkText = watermarkText.replace(/\s*\{post_url\}\s*/g, '')
      watermarkText = watermarkText.replace(/\s*\{file_url\}\s*/g, '')
      watermarkText = watermarkText.replace(/\s*\{file_name\}\s*/g, '')
    }
    if (currentAudio) {
      watermarkText = watermarkText.replace('{audio_url}', audioUrl as string)
      watermarkText = watermarkText.replace(
        '{audio_name}',
        getFileName(audioUrl as string, pathSep)
      )
      if (audioName) {
        watermarkText = watermarkText.replace('{audio_title}', audioName)
      } else {
        watermarkText = watermarkText.replace(/\{audio_title\}\s*/g, '')
      }
      if (audioArtist) {
        watermarkText = watermarkText.replace('{audio_artist}', audioArtist)
      } else {
        watermarkText = watermarkText.replace(/\{audio_artist\}\s*/g, '')
      }
      if (audioAlbum) {
        watermarkText = watermarkText.replace('{audio_album}', audioAlbum)
      } else {
        watermarkText = watermarkText.replace(/\{audio_album\}\s*/g, '')
      }
    } else {
      watermarkText = watermarkText.replace(/\s*\{audio_url\}\s*/g, '')
      watermarkText = watermarkText.replace(/\s*\{audio_name\}\s*/g, '')
      watermarkText = watermarkText.replace(/\s*\{audio_title\}\s*/g, '')
      watermarkText = watermarkText.replace(/\s*\{audio_artist\}\s*/g, '')
      watermarkText = watermarkText.replace(/\s*\{audio_album\}\s*/g, '')
    }
  }

  const captionScale = props.captionScale ? props.captionScale : 1

  let getCurrentTimestamp: any
  if (props.getCurrentTimestamp) {
    getCurrentTimestamp = props.getCurrentTimestamp
  } else if (audioEnabled) {
    getCurrentTimestamp = getTimestamp
  }

  return (
    <div style={rootStyle}>
      {!recentPictureGrid && !props.gridView && state.hasStarted && (
        <div
          style={{
            zIndex: 999,
            position: 'absolute',
            width: '100%',
            height: '100%',
            cursor: hideCursor ? 'none' : 'unset'
          }}
          ref={_idleTimerRef}
        >
          <IdleTimer
            ref={(ref) => {
              return _idleTimerRef.current
            }}
            onActive={onActive}
            onIdle={onIdle}
            timeout={2000}
          />
        </div>
      )}
      {showStrobe && (
        <Strobe
          sceneID={state.sceneID as number}
          currentAudio={currentAudio as number}
          zIndex={5}
          toggleStrobe={_toggleStrobe.current}
          timeToNextFrame={timeToNextFrame as number}
        />
      )}
      {!state.hasStarted && !state.isEmpty && !isDownloadScene && (
        <ProgressCard
          sceneID={state.sceneID as number}
          start={
            canStart
              ? () => start(state.mainLoaded, areOverlaysLoaded, canStart, true)
              : undefined
          }
          classes={props.classes}
        />
      )}
      {state.isEmpty && (
        <main className={props.classes.emptyMain}>
          <div style={{ height: 64 }} />
          <Container maxWidth={false} className={props.classes.emptyContainer}>
            <Typography
              component="h1"
              variant="h3"
              color="inherit"
              noWrap
              style={{
                textAlign: 'center',
                marginTop: '25%'
              }}
            >
              (ಥ﹏ಥ)
            </Typography>
            <Typography
              component="h1"
              variant="h4"
              color="inherit"
              noWrap
              style={{ textAlign: 'center' }}
            >
              I couldn't find anything
            </Typography>
          </Container>
        </main>
      )}

      {!props.gridView && (
        <PlayerBars
          hasStarted={state.hasStarted}
          historyPaths={historyPaths}
          historyOffset={historyOffset}
          imagePlayerAdvanceHacks={_imagePlayerAdvanceHacks.current}
          imagePlayerDeleteHack={imagePlayerDeleteHack}
          isEmpty={state.isEmpty}
          isPlaying={isPlaying}
          mainVideo={mainVideo}
          overlayVideos={overlayVideos}
          sceneID={state.sceneID}
          title={
            allTags
              ? isAudioScene
                ? currentAudio
                  ? audioName
                  : 'Loading...'
                : firstSourceUrl
              : name
          }
          recentPictureGrid={recentPictureGrid}
          persistAudio={audioEnabled && persistAudio}
          persistText={textEnabled && persistText}
          goBack={goBack}
          historyBack={historyBack}
          historyForward={historyForward}
          navigateTagging={navigateTagging}
          onRecentPictureGrid={onRecentPictureGrid}
          play={() => play(state.mainLoaded, areOverlaysLoaded)}
          pause={pause}
          onPlaying={
            !textEnabled || !currentAudio || props.getCurrentTimestamp
              ? undefined
              : onPlaying
          }
          setCurrentAudio={changeCurrentAudio}
        />
      )}

      <div style={playerStyle}>
        {recentPictureGrid && <PictureGrid pictures={historyPaths} />}
        {!recentPictureGrid && watermark && (
          <div style={watermarkStyle}>{watermarkText}</div>
        )}
        {isAudioScene && (
          <ImageView
            uuid={props.uuid}
            image={thumbImage}
            currentAudio={currentAudio}
            fitParent
            removeChild
          />
        )}
        {!recentPictureGrid &&
          (audioAlert || allTags) &&
          (audioEnabled || persistAudio) && <AudioAlert audio={currentAudio} />}
        {!isGridScene && !isAudioScene && (
          <SourceScraper
            uuid={props.uuid}
            currentAudio={currentAudio}
            opacity={recentPictureGrid ? 0 : 1}
            gridCoordinates={props.gridCoordinates}
            gridView={props.gridView ?? false}
            isPlaying={isPlaying}
            strobeLayer={strobe ? strobeLayer : undefined}
            historyOffset={historyOffset}
            advanceHack={
              props.advanceHack
                ? props.advanceHack
                : _imagePlayerAdvanceHacks.current[0][0]
            }
            deleteHack={imagePlayerDeleteHack}
            setHistoryOffset={_setHistoryOffset.current}
            setHistoryPaths={_setHistoryPaths.current}
            setSceneCopy={props.setSceneCopy}
            setVideo={_setVideo.current}
            setTimeToNextFrame={_changeTimeToNextFrame.current}
          />
        )}

        {!recentPictureGrid &&
          !isAudioScene &&
          state.overlays.length > 0 &&
          !state.isEmpty &&
          state.overlays.map((overlay, index) => {
            let showProgress = state.mainLoaded && !state.hasStarted
            if (showProgress) {
              for (let x = 0; x < index; x++) {
                if (!areOverlaysLoaded[x]) {
                  showProgress = false
                  break
                }
              }
            }
            if (!overlay.isGrid) {
              while (_imagePlayerAdvanceHacks.current.length <= index + 1) {
                _imagePlayerAdvanceHacks.current.push([new ChildCallbackHack()])
              }
              return (
                <SourceScraper
                  key={index}
                  uuid={props.uuid}
                  overlayIndex={index}
                  currentAudio={currentAudio}
                  gridView={props.gridView ?? false}
                  isPlaying={isPlaying && !state.isEmpty}
                  historyOffset={0}
                  advanceHack={_imagePlayerAdvanceHacks.current[index + 1][0]}
                  setHistoryOffset={nop}
                  setHistoryPaths={nop}
                  setVideo={
                    props.setVideo && !props.gridView
                      ? props.setVideo
                      : (video?: HTMLVideoElement) =>
                          setOverlayVideo(index, video)
                  }
                />
              )
            } else if (overlay.isGrid && !props.gridView) {
              const gridSize = overlay.grid[0].length * overlay.grid.length
              while (_imagePlayerAdvanceHacks.current.length <= index + 1) {
                _imagePlayerAdvanceHacks.current.push([new ChildCallbackHack()])
              }
              if (
                _imagePlayerAdvanceHacks.current[index + 1].length !== gridSize
              ) {
                _imagePlayerAdvanceHacks.current[index + 1] =
                  new Array<ChildCallbackHack>(gridSize).fill(
                    new ChildCallbackHack()
                  )
              }

              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    opacity: overlay.opacity / 100
                  }}
                >
                  <GridPlayer
                    hideBars
                    parentUUID={props.uuid}
                    overlayIndex={index}
                    gridConfig={overlay}
                    advanceHacks={_imagePlayerAdvanceHacks.current[index + 1]}
                    setVideo={(gIndex: number, video: HTMLVideoElement) =>
                      setGridOverlayVideo(index, gIndex, video)
                    }
                  />
                </div>
              )
            } else {
              return <div key={index} />
            }
          })}
      </div>

      {showCaptionProgram &&
        (textEnabled && persistText ? scriptPlaylists : []).map(
          (playlist, i) => (
            <CaptionProgramPlaylist
              key={i}
              playlistIndex={i}
              playlist={playlist}
              currentAudio={currentAudio as number}
              currentImage={
                historyPaths.length > 0
                  ? historyPaths[historyPaths.length - 1]
                  : undefined
              }
              scale={captionScale}
              sceneID={state.sceneID as number}
              timeToNextFrame={timeToNextFrame as number}
              persist={textEnabled && persistText}
              orderScriptTags={(scriptID: number) => {
                dispatch(orderScriptTags(scriptID))
              }}
              jumpToHack={props.captionProgramJumpToHack}
              getCurrentTimestamp={getCurrentTimestamp}
              advance={() => {
                const advance = props.advanceHack
                  ? props.advanceHack
                  : _imagePlayerAdvanceHacks.current[0][0]
                advance.fire()
              }}
              onError={props.onCaptionError}
            />
          )
        )}
    </div>
  )
}

;(Player as any).displayName = 'Player'
export default Player

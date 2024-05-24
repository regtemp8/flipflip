import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { IdleTimer } from './IdleTimer'

import {
  Button,
  CircularProgress,
  Container,
  type Theme,
  Typography
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import { getFileName, getFileGroup, urlToPath, WC } from 'flipflip-common'
import AudioAlert from './AudioAlert'
import CaptionProgramPlaylist from './CaptionProgramPlaylist'
import ChildCallbackHack from './ChildCallbackHack'
import PictureGrid from './PictureGrid'
import PlayerBars from './PlayerBars'
import SourceScraper from './SourceScraper'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectConstants } from '../../store/constants/selectors'
import {
  selectAppTutorial,
  selectAppConfigGeneralSettingsWatermarkSettings,
  selectAppConfigDisplaySettingsAudioAlert,
  selectAppConfigDisplaySettingsStartImmediately,
  selectPlayerAllTags,
  selectUndefined
} from '../../store/app/selectors'
import {
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
  selectPlayerSceneID,
  selectPlayerMainLoaded,
  selectPlayerHasStarted,
  selectPlayerIsEmpty
} from '../../store/player/selectors'
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
import { HTMLContentElement } from './HTMLContentElement'
import useStayAwake from 'use-stay-awake'
import { usePageVisibility } from 'react-page-visibility'
import { useWakeLock } from 'react-screen-wake-lock'

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
  const { classes } = useStyles()
  const progress = useAppSelector(selectSourceScraperProgress(props.sceneID))
  if (!progress) return null

  const { total, current, message } = progress
  return (
    <main className={classes.progressMain}>
      <Container maxWidth={false} className={classes.progressContainer}>
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
              className={classes.startNowBtn}
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
  const sceneID = useAppSelector(selectPlayerSceneID(props.uuid))
  const nextSceneID = 0
  const mainLoaded = useAppSelector(selectPlayerMainLoaded(props.uuid))
  const hasStarted = useAppSelector(selectPlayerHasStarted(props.uuid))
  const isEmpty = useAppSelector(selectPlayerIsEmpty(props.uuid))

  const watermark = useAppSelector(
    selectAppConfigGeneralSettingsWatermarkSettings(false)
  )
  const audioAlert = useAppSelector(selectAppConfigDisplaySettingsAudioAlert())
  const startImmediately = useAppSelector(
    selectAppConfigDisplaySettingsStartImmediately()
  )
  const tutorial = useAppSelector(selectAppTutorial())
  const allTags = useAppSelector(selectPlayerAllTags())
  const isAudioScene = useAppSelector(selectSceneIsAudioScene(sceneID))
  const isScriptScene = useAppSelector(selectSceneIsScriptScene(sceneID))
  const isDownloadScene = useAppSelector(selectSceneIsDownloadScene(sceneID))
  const nextSceneAllImages = useAppSelector(
    selectSceneNextSceneAllImages(sceneID)
  )
  const nextSceneTime = useAppSelector(selectSceneNextSceneTime(sceneID))
  const persistAudio = useAppSelector(selectScenePersistAudio(sceneID))
  const audioEnabled = useAppSelector(selectSceneAudioEnabled(sceneID))
  const persistText = useAppSelector(selectScenePersistText(sceneID))
  const textEnabled = useAppSelector(selectSceneTextEnabled(sceneID))
  const strobe = useAppSelector(selectSceneStrobe(sceneID))
  const strobeLayer = useAppSelector(selectSceneStrobeLayer(sceneID))
  const scriptPlaylists = useAppSelector(selectSceneScriptPlaylists(sceneID))
  const name = useAppSelector(selectSceneName(sceneID))
  const firstSourceUrl = useAppSelector(selectSceneFirstSourceUrl(sceneID))

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
  const canStart = false
  const isDisplayWithOneView = false

  const [isPlaying, setIsPlaying] = useState(true)
  const [historyOffset, setHistoryOffset] = useState(0)
  const [historyPaths, setHistoryPaths] = useState<HTMLContentElement[]>([])
  const [mainVideo, setMainVideo] = useState<HTMLVideoElement>()
  const [timeToNextFrame, setTimeToNextFrame] = useState<number>()
  const [recentPictureGrid, setRecentPictureGrid] = useState(false)
  const [thumbImage, setThumbImage] = useState<HTMLImageElement>()
  const [hideCursor, setHideCursor] = useState(false)

  const wakeLock = useWakeLock()
  const stayAwake = useStayAwake()
  const isPageVisible = usePageVisibility()

  const _imagePlayerDeleteHack = useRef(new ChildCallbackHack())
  const _startTime = useRef<number>()
  const _idleTimerRef = useRef<HTMLDivElement>(null)
  const _interval = useRef<number>()
  const _toggleStrobe = useRef(false)
  const _currentTimestamp = useRef<number>()
  const _imagePlayerAdvanceHacks = useRef(
    new Array<ChildCallbackHack[]>(1).fill([new ChildCallbackHack()])
  )

  const _setHistoryOffset = useRef<(offset: number) => void>(setHistoryOffset)
  const _setHistoryPaths =
    useRef<(paths: HTMLContentElement[]) => void>(setHistoryPaths)
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

  const { uuid, allLoaded, captionScale, getCurrentTimestamp, onLoaded } = props

  const start = useCallback(
    (isMainLoaded: boolean, canStart: boolean, force = false) => {
      const isLoaded = !force && isMainLoaded
      if (onLoaded && isLoaded) {
        onLoaded()
      }

      if (
        force ||
        (canStart && ((isLoaded && allLoaded !== false) || startImmediately))
      ) {
        dispatch(setPlayerMainLoaded({ uuid, value: true }))
        if (!_startTime.current) {
          _startTime.current = new Date().getTime()
        }
      } else if (!isAudioScene && mainLoaded !== isLoaded) {
        dispatch(setPlayerMainLoaded({ uuid, value: isLoaded }))
      }
    },
    [
      dispatch,
      isAudioScene,
      allLoaded,
      onLoaded,
      uuid,
      startImmediately,
      mainLoaded
    ]
  )

  const play = useCallback(() => {
    setIsPlaying(true)
    start(mainLoaded, canStart)
  }, [mainLoaded, canStart, start])

  const nextSceneLoop = useCallback(() => {
    if (
      !isScriptScene &&
      isPlaying &&
      _startTime.current != null &&
      !nextSceneAllImages &&
      Math.abs(new Date().getTime() - _startTime.current) >= nextSceneTime
    ) {
      // dispatch(nextScene(props.uuid))
    } else if (!isPlaying && _startTime.current) {
      _startTime.current += 1000
    }
  }, [isPlaying, isScriptScene, nextSceneAllImages, nextSceneTime])

  useEffect(() => {
    if (!props.preventSleep) {
      return
    }
    if (isPageVisible) {
      if (wakeLock.isSupported && wakeLock.released !== false) {
        wakeLock.request().catch(() => {})
      } else if (!wakeLock.isSupported && stayAwake.canSleep) {
        stayAwake.preventSleeping()
      }
    } else if (!wakeLock.isSupported && !stayAwake.canSleep) {
      stayAwake.allowSleeping()
    }
  }, [isPageVisible, props.preventSleep, stayAwake, wakeLock])

  useEffect(() => {
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
    }
  }, [audioThumb, currentAudio, props.preventSleep])

  useEffect(() => {
    const thumbImage = new Image()
    thumbImage.src =
      currentAudio && audioThumb ? audioThumb : 'img/flipflip_logo.png'
    thumbImage.onload = () => {
      setThumbImage(thumbImage)
    }
  }, [currentAudio, audioThumb])

  useEffect(() => {
    if (_interval.current != null) {
      window.clearInterval(_interval.current)
    }
    if (nextSceneID !== 0) {
      _interval.current = window.setInterval(nextSceneLoop, 1000)
    }

    if (allTags) {
      _startTime.current = new Date().getTime()
    } else {
      _startTime.current = new Date().getTime()
    }
  }, [sceneID, allTags, nextSceneLoop, nextSceneID])

  useEffect(() => {
    if (!isEmpty && mainLoaded) {
      play()
    }
  }, [play, isEmpty, mainLoaded])

  const onPlaying = (position: number, duration: number) => {
    _currentTimestamp.current = position
  }

  const getTimestamp = () => {
    return _currentTimestamp.current
  }

  const changeCurrentAudio = (audioID: number) => {
    setCurrentAudio(audioID)
    if (isAudioScene) {
      dispatch(changeAudioRoute({ id: sceneID as number, value: audioID }))
    }
  }

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const goBack = useCallback(() => {
    if (recentPictureGrid) {
      setRecentPictureGrid(false)
    } else {
      if (wakeLock.isSupported && wakeLock.released === false) {
        wakeLock.release().catch(() => {})
      } else if (!wakeLock.isSupported && !stayAwake.canSleep) {
        stayAwake.allowSleeping()
      }

      dispatch(setRouteGoBack())
    }
  }, [dispatch, recentPictureGrid, stayAwake, wakeLock])

  const historyBack = useCallback(() => {
    setIsPlaying(false)
    setHistoryOffset(historyOffset - 1)
  }, [historyOffset])

  const historyForward = useCallback(() => {
    setIsPlaying(false)
    setHistoryOffset(historyOffset + 1)
  }, [historyOffset])

  const onActive = () => {
    setHideCursor(false)
  }

  const onIdle = () => {
    setHideCursor(true)
  }

  const navigateTagging = useCallback(
    (offset: number) => {
      dispatch(setPlayerFirstImageLoaded({ uuid: props.uuid, value: false }))
      dispatch(setPlayerMainLoaded({ uuid: props.uuid, value: false }))
      dispatch(setPlayerIsEmpty({ uuid: props.uuid, value: false }))
      setHistoryOffset(0)
      setHistoryPaths([])
      dispatch(navigateDisplayedLibrary(offset))
    },
    [dispatch, props.uuid]
  )

  const onRecentPictureGrid = useCallback(() => {
    setRecentPictureGrid(true)
  }, [])

  const showCaptionProgram =
    !recentPictureGrid &&
    hasStarted &&
    textEnabled &&
    (scriptPlaylists.length > 0 || persistText)

  let rootStyle: CSSProperties = {
    display: 'flex',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
  if (tutorial != null) {
    rootStyle = {
      ...rootStyle,
      pointerEvents: 'none'
    }
  }

  let playerStyle: CSSProperties = {}
  if (hasStarted) {
    playerStyle = {
      position: 'relative',
      width: '100%',
      height: '100%'
    }
  }
  if (!hasStarted && !isDownloadScene) {
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

  const { classes } = useStyles()
  return (
    <div style={rootStyle}>
      {!recentPictureGrid && hasStarted && (
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
      {!hasStarted && !isEmpty && !isDownloadScene && (
        <ProgressCard
          sceneID={sceneID as number}
          start={canStart ? () => start(mainLoaded, canStart, true) : undefined}
        />
      )}
      {isEmpty && (
        <main className={classes.emptyMain}>
          <div style={{ height: 64 }} />
          <Container maxWidth={false} className={classes.emptyContainer}>
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

      {isDisplayWithOneView && (
        <PlayerBars
          hasStarted={hasStarted}
          historyPaths={historyPaths}
          historyOffset={historyOffset}
          imagePlayerAdvanceHacks={_imagePlayerAdvanceHacks.current}
          imagePlayerDeleteHack={_imagePlayerDeleteHack.current}
          isEmpty={isEmpty}
          isPlaying={isPlaying}
          mainVideo={mainVideo}
          sceneID={sceneID}
          title={
            allTags
              ? isAudioScene
                ? currentAudio
                  ? (audioName as string)
                  : 'Loading...'
                : (firstSourceUrl as string)
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
          play={play}
          pause={pause}
          onPlaying={
            !textEnabled || !currentAudio || getCurrentTimestamp
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
        {isAudioScene && thumbImage != null && (
          <img src={thumbImage.src} alt="" />
        )}
        {!recentPictureGrid &&
          (audioAlert || allTags) &&
          (audioEnabled || persistAudio) && (
            <AudioAlert audioID={currentAudio} />
          )}
        {!isAudioScene && (
          <SourceScraper
            uuid={props.uuid}
            currentAudio={currentAudio}
            opacity={recentPictureGrid ? 0 : 1}
            isPlaying={isPlaying}
            strobeLayer={strobe ? strobeLayer : undefined}
            historyOffset={historyOffset}
            advanceHack={
              props.advanceHack
                ? props.advanceHack
                : _imagePlayerAdvanceHacks.current[0][0]
            }
            deleteHack={_imagePlayerDeleteHack.current}
            setHistoryOffset={_setHistoryOffset.current}
            setHistoryPaths={_setHistoryPaths.current}
            setSceneCopy={props.setSceneCopy}
            setVideo={_setVideo.current}
            setTimeToNextFrame={_changeTimeToNextFrame.current}
          />
        )}
      </div>

      {showCaptionProgram &&
        (textEnabled && persistText ? scriptPlaylists : []).map(
          (playlistID, i) => (
            <CaptionProgramPlaylist
              key={i}
              playlistIndex={i}
              playlistID={playlistID}
              currentAudio={currentAudio as number}
              currentImage={
                historyPaths.length > 0
                  ? historyPaths[historyPaths.length - 1]
                  : undefined
              }
              scale={captionScale ?? 1}
              sceneID={sceneID as number}
              timeToNextFrame={timeToNextFrame as number}
              persist={textEnabled && persistText}
              orderScriptTags={(scriptID: number) => {
                dispatch(orderScriptTags(scriptID))
              }}
              jumpToHack={props.captionProgramJumpToHack}
              getCurrentTimestamp={
                (audioEnabled
                  ? getTimestamp
                  : getCurrentTimestamp) as () => number
              }
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

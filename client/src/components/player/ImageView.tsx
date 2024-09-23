import React, {
  CSSProperties,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  SyntheticEvent
} from 'react'
import { type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { BT, IT, SL } from 'flipflip-common'
import {
  ContentData,
  EffectsData,
  StrobeData,
  TransformData,
  ViewData
} from '../../store/player/ContentPreloadService'
import { cx } from '@emotion/css'
import Strobe from './Strobe'
import ZoomMove from './ZoomMove'
import FadeInOut from './FadeInOut'
import Panning, { ImageMeasurements } from './Panning'
import ImageTransition from './ImageTransition'
import { RectReadOnly } from 'react-use-measure'

const playVideo = (video: HTMLVideoElement): void => {
  video.play().catch((err) => console.warn(err))
}

const pauseVideo = (video: HTMLVideoElement): void => {
  video.pause()
}

const center = (
  width: number,
  height: number,
  parentWidth: number,
  parentHeight: number
): CSSProperties => {
  const left = (parentWidth - height) / 2 - width
  const top = (parentHeight - width) / 2
  return { width, height, left, top }
}

const fitWidth = (
  imgWidth: number,
  imgHeight: number,
  parentWidth: number,
  parentHeight: number
): CSSProperties => {
  const height = parentWidth
  const width = (height / imgHeight) * imgWidth
  return center(width, height, parentWidth, parentHeight)
}

const fitHeight = (
  imgWidth: number,
  imgHeight: number,
  parentWidth: number,
  parentHeight: number
): CSSProperties => {
  const width = parentHeight
  const height = (width / imgWidth) * imgHeight
  return center(width, height, parentWidth, parentHeight)
}

const fitBestNoClip = (
  imgWidth: number,
  imgHeight: number,
  parentWidth: number,
  parentHeight: number
): CSSProperties => {
  const heightRatio = parentHeight / imgWidth
  const widthRatio = parentWidth / imgHeight
  return heightRatio < widthRatio
    ? fitHeight(imgWidth, imgHeight, parentWidth, parentHeight)
    : fitWidth(imgWidth, imgHeight, parentWidth, parentHeight)
}

const enableStrobeImage = (strobe: StrobeData) => strobe.layer === SL.image
const enableStrobeBackground = (strobe: StrobeData) =>
  strobe.layer === SL.background
const enableStobeTopOrBottom = (strobe: StrobeData) => {
  return strobe.layer === SL.top || strobe.layer === SL.bottom
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
    rotate: {
      position: 'absolute',
      transform: 'rotate(270deg)',
      transformOrigin: 'top right'
    },
    fitContain: {
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    },
    fitCover: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    fitFill: {
      width: '100%',
      height: '100%',
      objectFit: 'fill'
    },
    fitCenter: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    fitScaleDown: {
      width: '100%',
      height: '100%',
      objectFit: 'scale-down'
    },
    fitParentWidth: {
      position: 'relative',
      width: '100%',
      height: 'auto',
      display: 'block',
      margin: '0 auto',
      top: '50%',
      transform: 'translateY(-50%)'
    },
    fitParentHeight: {
      position: 'relative',
      height: '100%',
      width: 'auto',
      display: 'block',
      margin: '0 auto'
    },
    imageContainer: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 2,
      position: 'absolute'
    },
    backgroundContainer: {
      height: '100%',
      width: '100%',
      zIndex: -1,
      position: 'absolute',
      overflow: 'hidden',
      backgroundSize: 'cover'
    }
  }
})

interface ImageStyling {
  style?: CSSProperties
  className?: string
  containerClassName?: string
}

export interface ImageViewProps {
  index: number
  sceneID: number
  show: boolean
  isPlaying: boolean
  zIndex: number
  data: ContentData
  transform: TransformData
  view: ViewData
  effects: EffectsData
  bounds: RectReadOnly
  displayIndex?: number
  pictureGrid?: boolean
  onLoad: (
    index: number,
    duration: number,
    sceneID: number,
    displayIndex?: number
  ) => void
  onError: (
    index: number,
    duration: number,
    sceneID: number,
    displayIndex?: number
  ) => void
  onHide: (index: number) => void
}

function ImageView(props: ImageViewProps) {
  const {
    index,
    sceneID,
    show,
    isPlaying,
    zIndex,
    data,
    transform,
    view,
    effects,
    displayIndex,
    bounds,
    onLoad,
    onError,
    onHide
  } = props
  const { classes } = useStyles()

  const _prevURL = useRef<string>()
  const _prevShow = useRef<boolean>(false)
  const _prevIsPlaying = useRef<boolean>(true)
  const _foregroundImage = useRef<HTMLImageElement | null>(null)
  const _backgroundImage = useRef<HTMLImageElement | null>(null)
  const _foregroundVideo = useRef<HTMLVideoElement | null>(null)
  const _backgroundVideo = useRef<HTMLVideoElement | null>(null)
  const _foregroundIFrame = useRef<HTMLIFrameElement | null>(null)
  const _backgroundIFrame = useRef<HTMLIFrameElement | null>(null)
  const _iframeLoadCount = useRef<number>(10)
  const _loading = useRef<boolean>(true)
  const _hidden = useRef<boolean>(true)

  const imageStyling = useMemo((): ImageStyling => {
    if (transform.rotate) {
      const className = classes.rotate
      const imgWidth = data.width as number
      const imgHeight = data.height as number
      const parentWidth = bounds.width
      const parentHeight = bounds.height
      switch (view.imageType) {
        case IT.fitBestNoClip: {
          return {
            className,
            style: fitBestNoClip(imgWidth, imgHeight, parentWidth, parentHeight)
          }
        }
        case IT.fitBestClip: {
          const heightRatio = parentHeight / imgWidth
          const widthRatio = parentWidth / imgHeight
          const style =
            heightRatio > widthRatio
              ? fitHeight(imgWidth, imgHeight, parentWidth, parentHeight)
              : fitWidth(imgWidth, imgHeight, parentWidth, parentHeight)
          return { className, style }
        }
        case IT.stretch: {
          return {
            className,
            style: center(parentHeight, parentWidth, parentWidth, parentHeight)
          }
        }
        case IT.center: {
          return {
            className,
            style: center(imgWidth, imgHeight, parentWidth, parentHeight)
          }
        }
        case IT.centerNoClip: {
          const style =
            imgWidth > parentHeight || imgHeight > parentWidth
              ? fitBestNoClip(imgWidth, imgHeight, parentWidth, parentHeight)
              : center(imgWidth, imgHeight, parentWidth, parentHeight)

          return { className, style }
        }
        case IT.fitWidth: {
          return {
            className,
            style: fitWidth(imgWidth, imgHeight, parentWidth, parentHeight)
          }
        }
        case IT.fitHeight: {
          return {
            className,
            style: fitHeight(imgWidth, imgHeight, parentWidth, parentHeight)
          }
        }
        default:
          return {}
      }
    } else {
      switch (view.imageType) {
        case IT.fitBestNoClip:
          return { className: classes.fitContain }
        case IT.fitBestClip:
          const imgWidth = data.width as number
          const imgHeight = data.height as number
          const parentWidth = bounds.width
          const parentHeight = bounds.height
          const heightRatio = parentHeight / imgWidth
          const widthRatio = parentWidth / imgHeight
          const className =
            heightRatio > widthRatio
              ? classes.fitParentHeight
              : classes.fitParentWidth
          return { className }
        case IT.stretch:
          return { className: classes.fitFill }
        case IT.center:
          return { containerClassName: classes.fitCenter }
        case IT.centerNoClip:
          return { className: classes.fitScaleDown }
        case IT.fitWidth:
          return { className: classes.fitParentWidth }
        case IT.fitHeight:
          return { className: classes.fitParentHeight }
        default:
          return {}
      }
    }
  }, [
    view.imageType,
    transform.rotate,
    data.height,
    data.width,
    bounds.height,
    bounds.width,
    classes.fitCenter,
    classes.fitContain,
    classes.fitFill,
    classes.fitParentHeight,
    classes.fitParentWidth,
    classes.fitScaleDown,
    classes.rotate
  ])

  const blurredBackgroundStyling = useMemo((): ImageStyling => {
    if (view.backgroundType !== BT.blur) {
      return {}
    }
    if (transform.rotate) {
      const imgWidth = data.width as number
      const imgHeight = data.height as number
      const parentWidth = bounds.width
      const parentHeight = bounds.height
      const heightRatio = parentHeight / imgWidth
      const widthRatio = parentWidth / imgHeight
      const style =
        heightRatio > widthRatio
          ? fitHeight(imgWidth, imgHeight, parentWidth, parentHeight)
          : fitWidth(imgWidth, imgHeight, parentWidth, parentHeight)

      const className = classes.rotate
      return { className, style }
    } else {
      return { className: classes.fitCover }
    }
  }, [
    view.backgroundType,
    classes.fitCover,
    classes.rotate,
    transform.rotate,
    bounds.height,
    bounds.width,
    data.height,
    data.width
  ])

  const onHideEvent = useCallback(() => {
    _hidden.current = true
    if (_foregroundVideo.current != null) {
      _foregroundVideo.current.volume = 0
      pauseVideo(_foregroundVideo.current)
    }
    if (_backgroundVideo.current != null) {
      pauseVideo(_backgroundVideo.current)
    }
    if (_foregroundIFrame.current != null) {
      _foregroundIFrame.current.src = 'about:blank'
    }
    if (_backgroundIFrame.current != null) {
      _backgroundIFrame.current.src = 'about:blank'
    }
    onHide(index)
  }, [onHide, index])

  const onLoadEvent = useCallback(() => {
    if (_loading.current) {
      _loading.current = false
      onLoad(index, view.timeToNextFrame, sceneID, displayIndex)
    }
  }, [onLoad, index, view.timeToNextFrame, sceneID, displayIndex])

  const onErrorEvent = useCallback(() => {
    if (_loading.current) {
      _loading.current = false
      onError(index, view.timeToNextFrame, sceneID, displayIndex)
    }
  }, [onError, index, view.timeToNextFrame, sceneID, displayIndex])

  const onLoadIFrame = useCallback(
    (event: SyntheticEvent<HTMLIFrameElement>) => {
      const iframe = event.currentTarget
      let loaded =
        iframe.contentWindow != null &&
        iframe.contentWindow.location.href === data.url
      const document = loaded
        ? iframe.contentDocument ?? iframe.contentWindow?.document
        : undefined
      if (document != null && document.readyState === 'complete') {
        const copyright = document.getElementsByClassName('copyright')
        if (copyright.length > 0) {
          copyright[0].remove()
        }
        const startButton = document.getElementById('intro-start')
        loaded = startButton != null
      }

      if (loaded) {
        _iframeLoadCount.current--
        if (_iframeLoadCount.current === 0) {
          onLoadEvent()
        }
      } else {
        _iframeLoadCount.current = 10
        onErrorEvent()
      }
    },
    [data.url, onLoadEvent, onErrorEvent]
  )

  const onVideoRepeat = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget
      pauseVideo(video)
      if (_hidden.current) {
        return
      }

      video.currentTime = view.video?.start as number
      if (isPlaying) {
        playVideo(video)
      }
    },
    [view.video?.start, isPlaying]
  )

  const onVideoTimeUpdate = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const { currentTime } = event.currentTarget
      const start = view.video?.start as number
      const end = view.video?.end as number
      if (currentTime < start || currentTime >= end) {
        onVideoRepeat(event)
      }
    },
    [onVideoRepeat, view.video?.end, view.video?.start]
  )

  const foregroundComponent = useMemo(() => {
    const { className, style } = imageStyling
    switch (data.type) {
      case 'image':
        return (
          <img
            ref={_foregroundImage}
            onLoad={onLoadEvent}
            onError={onErrorEvent}
            onAbort={onErrorEvent}
            src={data.url}
            className={className}
            style={style}
            alt=""
          />
        )
      case 'video':
        return (
          <video
            ref={_foregroundVideo}
            onLoadedData={onLoadEvent}
            onError={onErrorEvent}
            onAbort={onErrorEvent}
            src={view.video?.url}
            onTimeUpdate={onVideoTimeUpdate}
            onEnded={onVideoRepeat}
            className={className}
            style={style}
          />
        )
      case 'iframe':
        return (
          <iframe
            ref={_foregroundIFrame}
            className={classes.fitContain}
            style={{ border: 0 }}
            onLoad={onLoadIFrame}
            onError={onErrorEvent}
            onAbort={onErrorEvent}
            src={data.url}
            title={`nimja-${index}`}
            sandbox="allow-scripts allow-same-origin"
          />
        )
      default:
        return null
    }
  }, [
    index,
    data.type,
    data.url,
    view.video?.url,
    imageStyling,
    classes.fitContain,
    onErrorEvent,
    onLoadEvent,
    onLoadIFrame,
    onVideoRepeat,
    onVideoTimeUpdate
  ])

  const backgroundComponent = useMemo(() => {
    if (view.backgroundType !== BT.blur) {
      return null
    }

    const { className, style } = blurredBackgroundStyling
    switch (data.type) {
      case 'image':
        return (
          <img
            ref={_backgroundImage}
            src={data.url}
            className={className}
            style={style}
            alt=""
          />
        )
      case 'video':
        return (
          <video
            ref={_backgroundVideo}
            src={view.video?.url}
            onTimeUpdate={onVideoTimeUpdate}
            onEnded={onVideoRepeat}
            className={className}
            style={style}
            muted
          />
        )
      case 'iframe':
        return (
          <iframe
            ref={_backgroundIFrame}
            title={`nimja-bg-${index}`}
            className={className}
            style={{ ...style, border: 0 }}
            onLoad={onLoadIFrame}
            src={data.url}
            sandbox="allow-scripts allow-same-origin"
          />
        )
      default:
        return null
    }
  }, [
    view.backgroundType,
    view.video?.url,
    data.type,
    data.url,
    blurredBackgroundStyling,
    index,
    onLoadIFrame,
    onVideoRepeat,
    onVideoTimeUpdate
  ])

  if (_prevURL.current !== data.url) {
    _prevURL.current = data.url
    _loading.current = true
    switch (data.type) {
      case 'image':
        _foregroundImage.current?.removeAttribute('src')
        _backgroundImage.current?.removeAttribute('src')
        break
      case 'video':
        _foregroundVideo.current?.removeAttribute('src')
        _backgroundVideo.current?.removeAttribute('src')
        _foregroundVideo.current?.load()
        _backgroundVideo.current?.load()
        break
      case 'iframe':
        _iframeLoadCount.current = view.backgroundType === BT.blur ? 2 : 1
        break
    }
  }

  useEffect(() => {
    if (
      _hidden.current ||
      data.type !== 'video' ||
      _prevIsPlaying.current === isPlaying
    ) {
      return
    }

    _prevIsPlaying.current = isPlaying
    const fn = isPlaying ? playVideo : pauseVideo
    const foregroundVideo = _foregroundVideo.current as HTMLVideoElement
    if (view.backgroundType === BT.blur) {
      const backgroundVideo = _backgroundVideo.current as HTMLVideoElement
      fn(backgroundVideo)
    }
    fn(foregroundVideo)
  }, [isPlaying, data.type, view.backgroundType, index])

  useEffect(() => {
    if (_prevShow.current !== show) {
      if (show) {
        _hidden.current = false
        if (data.type === 'video') {
          const playbackRate = view.video?.speed ?? 1
          const foregroundVideo = _foregroundVideo.current as HTMLVideoElement
          foregroundVideo.volume = view.video?.volume ?? 0
          foregroundVideo.playbackRate = playbackRate
          if (view.backgroundType === BT.blur) {
            const backgroundVideo = _backgroundVideo.current as HTMLVideoElement
            backgroundVideo.playbackRate = playbackRate
            playVideo(backgroundVideo)
          }
          playVideo(foregroundVideo)
        }
        if (data.type === 'iframe') {
          const foregroundIFrame =
            _foregroundIFrame.current as HTMLIFrameElement
          const foregroundWindow = foregroundIFrame.contentWindow as Window
          const foregroundStart = foregroundWindow.document.getElementById(
            'intro-start'
          ) as HTMLElement
          if (view.backgroundType === BT.blur) {
            const backgroundIFrame =
              _backgroundIFrame.current as HTMLIFrameElement
            const backgroundWindow = backgroundIFrame.contentWindow as Window
            const backgroundStart = backgroundWindow.document.getElementById(
              'intro-start'
            ) as HTMLElement
            backgroundStart.click()
          }
          foregroundStart.click()
        }
      } else {
        if (data.type === 'video') {
          const foregroundVideo = _foregroundVideo.current as HTMLVideoElement
          foregroundVideo.volume = 0
        }
      }
    }

    _prevShow.current = show
  }, [show, data.type, view, index])

  const imageMeasurements: ImageMeasurements = useMemo(() => {
    const imageWidth = data.width as number
    const imageHeight = data.height as number
    return {
      imageType: view.imageType,
      imageWidth: transform.rotate ? imageHeight : imageWidth,
      imageHeight: transform.rotate ? imageWidth : imageHeight,
      parentWidth: bounds.width,
      parentHeight: bounds.height
    }
  }, [
    data.height,
    data.width,
    transform.rotate,
    view.imageType,
    bounds.width,
    bounds.height
  ])

  const effectClassName =
    imageStyling.containerClassName == null ? classes.imageContainer : undefined
  return (
    <ImageTransition
      show={show}
      isPlaying={isPlaying}
      zIndex={zIndex}
      slide={effects.slide}
      crossFade={effects.crossFade}
      onHide={onHideEvent}
    >
      <Strobe
        show={show}
        isPlaying={isPlaying}
        data={effects.strobe}
        enable={enableStobeTopOrBottom}
        zIndex={5}
      />
      <FadeInOut show={show} isPlaying={isPlaying} data={effects.fadeInOut}>
        <Strobe
          show={show}
          isPlaying={isPlaying}
          data={effects.strobe}
          enable={enableStrobeImage}
          zIndex={2}
        >
          <div
            className={cx(
              classes.imageContainer,
              imageStyling.containerClassName
            )}
            style={{
              overflow: 'hidden'
            }}
          >
            <ZoomMove
              show={show}
              isPlaying={isPlaying}
              data={effects.zoomMove}
              className={effectClassName}
            >
              <Panning
                show={show}
                isPlaying={isPlaying}
                data={effects.panning}
                measurements={imageMeasurements}
                className={effectClassName}
              >
                {foregroundComponent}
              </Panning>
            </ZoomMove>
          </div>
        </Strobe>
      </FadeInOut>
      <Strobe
        show={show}
        isPlaying={isPlaying}
        data={effects.strobe}
        enable={enableStrobeBackground}
        zIndex={1}
      />
      {view.backgroundStyle != null && (
        <div
          className={classes.backgroundContainer}
          style={view.backgroundStyle}
        >
          {backgroundComponent}
        </div>
      )}
    </ImageTransition>
  )
}

;(ImageView as any).displayName = 'ImageView'

export default React.memo(ImageView)

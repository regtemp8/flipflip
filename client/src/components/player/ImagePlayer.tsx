import React, { useEffect, useRef, useCallback, CSSProperties } from 'react'

import type ChildCallbackHack from './ChildCallbackHack'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectPlayerHasStarted,
  selectPlayerImageViews
} from '../../store/player/selectors'
import { HTMLContentElement } from './HTMLContentElement'
import ImageView from './ImageView'
import {
  setPlayerLoadingComplete,
  setPlayerPushReadyToLoad,
  setPlayerReadyToDisplay,
  setPlayerShownImageView
} from '../../store/player/slice'
import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material'
import { loadImageViews } from '../../store/player/thunks'

class ImageTimer {
  lastTick: DOMHighResTimeStamp
  timeToNextFrame: DOMHighResTimeStamp
  displayDuration: number
  paused: boolean
  retries: number

  constructor() {
    this.lastTick = 0
    this.timeToNextFrame = 0
    this.displayDuration = 0
    this.paused = false
    this.retries = 0
  }

  public tick(timestamp: DOMHighResTimeStamp) {
    this.lastTick = timestamp
    if (this.paused) {
      this.paused = false
      this.timeToNextFrame = this.lastTick + this.displayDuration
    }
  }

  public pause() {
    this.paused = true
    this.displayDuration = this.timeToNextFrame - this.lastTick
  }

  public next(timeToDisplay: number) {
    this.displayDuration = timeToDisplay
    this.timeToNextFrame = this.lastTick + this.displayDuration
    this.retries = 0
  }

  public retry() {
    this.retries++
    this.timeToNextFrame = this.lastTick + this.retries * 16
  }
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
    container: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      position: 'fixed',
      zIndex: 'auto'
    }
  }
})

interface DisplayItem {
  index: number
  duration: number
}

export interface ImagePlayerProps {
  uuid: string
  overlayIndex?: number
  currentAudio?: number
  gridView: boolean
  advanceHack: ChildCallbackHack
  isPlaying: boolean
  historyOffset: number
  deleteHack?: ChildCallbackHack
  gridCoordinates?: number[]
  strobeLayer?: string
  setHistoryPaths: (historyPaths: HTMLContentElement[]) => void
  setHistoryOffset: (historyOffset: number) => void
  setVideo: (video?: HTMLVideoElement) => void
  setSceneCopy?: (children: React.ReactNode) => void
  setTimeToNextFrame?: (timeToNextFrame: number) => void
}

export default function ImagePlayer(props: ImagePlayerProps) {
  const { classes } = useStyles()

  const _readyToDisplay = useRef<DisplayItem[]>([])
  const _displayOffset = useRef<number>(0)
  const _advanceTimeout = useRef<number>()
  const _timer = useRef<ImageTimer>(new ImageTimer())
  const _wasPlaying = useRef<boolean>(false)

  const dispatch = useAppDispatch()
  const hasStarted = useAppSelector(selectPlayerHasStarted(props.uuid))
  const imageViews = useAppSelector(
    selectPlayerImageViews(props.uuid, props.overlayIndex)
  )

  const advance = useCallback(
    (timestamp: DOMHighResTimeStamp) => {
      _timer.current.tick(timestamp)
      if (timestamp < _timer.current.timeToNextFrame) {
        _advanceTimeout.current = window.requestAnimationFrame(advance)
        return
      }

      if (_readyToDisplay.current[0] == null) {
        console.log('RETRY')
        _timer.current.retry()
        _advanceTimeout.current = window.requestAnimationFrame(advance)
        if (
          _timer.current.retries === 6 &&
          _readyToDisplay.current.length > 0
        ) {
          // waited long enough, try next
          _readyToDisplay.current.shift()
          _displayOffset.current++
        } else {
          return
        }
      }

      const item = _readyToDisplay.current.shift() as DisplayItem
      _displayOffset.current++
      _timer.current.next(item.duration)
      dispatch(
        setPlayerShownImageView({
          uuid: props.uuid,
          overlayIndex: props.overlayIndex,
          value: item.index
        })
      )

      _advanceTimeout.current = window.requestAnimationFrame(advance)
    },
    [dispatch, props.uuid, props.overlayIndex]
  )

  useEffect(() => {
    if (props.isPlaying && _wasPlaying.current) {
      _wasPlaying.current = false
      _advanceTimeout.current = window.requestAnimationFrame(advance)
    } else if (!props.isPlaying && _advanceTimeout.current != null) {
      _wasPlaying.current = true
      window.cancelAnimationFrame(_advanceTimeout.current)
      _advanceTimeout.current = undefined
      _timer.current.pause()
    }
  }, [props.isPlaying, advance])

  useEffect(() => {
    const onResize = () => {
      const { toKeep, toReturn } = _readyToDisplay.current.reduce<{
        toKeep: DisplayItem[]
        toReturn: DisplayItem[]
      }>(
        (collector, item) => {
          const prop =
            imageViews[item.index]?.transform?.rotate === true
              ? 'toReturn'
              : 'toKeep'
          collector[prop].push(item)
          return collector
        },
        { toKeep: [], toReturn: [] }
      )

      _readyToDisplay.current = toKeep
      dispatch(
        setPlayerPushReadyToLoad({
          uuid: props.uuid,
          overlayIndex: props.overlayIndex,
          value: toReturn.map((item) => item.index)
        })
      )
    }

    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [dispatch, props.uuid, props.overlayIndex, imageViews])

  useEffect(() => {
    return () => {
      if (_advanceTimeout.current != null) {
        window.cancelAnimationFrame(_advanceTimeout.current)
        _advanceTimeout.current = undefined
      }
    }
  }, [])

  useEffect(() => {
    if (hasStarted === true && _advanceTimeout.current == null) {
      _advanceTimeout.current = window.requestAnimationFrame(advance)
    }
  }, [hasStarted, advance])

  const failedToDisplay = useCallback(
    (index: number) => {
      dispatch(
        setPlayerLoadingComplete({
          uuid: props.uuid,
          overlayIndex: props.overlayIndex,
          value: index
        })
      )
      dispatch(loadImageViews(props.uuid, props.overlayIndex))
    },
    [dispatch, props.uuid, props.overlayIndex]
  )

  const readyToDisplay = useCallback(
    (index: number, duration: number, displayIndex?: number) => {
      if (displayIndex != null) {
        if (displayIndex >= _displayOffset.current) {
          displayIndex -= _displayOffset.current
          _readyToDisplay.current[displayIndex] = { index, duration }
        }
      } else {
        _readyToDisplay.current.push({ index, duration })
      }

      dispatch(
        setPlayerReadyToDisplay({
          uuid: props.uuid,
          overlayIndex: props.overlayIndex,
          value: undefined
        })
      )
      dispatch(loadImageViews(props.uuid, props.overlayIndex))
    },
    [dispatch, props.uuid, props.overlayIndex]
  )

  const readyToLoad = useCallback(
    (index: number) => {
      dispatch(
        setPlayerPushReadyToLoad({
          uuid: props.uuid,
          overlayIndex: props.overlayIndex,
          value: [index]
        })
      )
      dispatch(loadImageViews(props.uuid, props.overlayIndex))
    },
    [dispatch, props.uuid, props.overlayIndex]
  )

  const style: CSSProperties = {}
  if (props.gridView) {
    style.position = 'static'
  }
  if (props.overlayIndex != null) {
    style.zIndex = 4
  }

  return (
    <div className={classes.container} style={style}>
      {imageViews.map((state, index) => {
        return state != null ? (
          <ImageView
            key={index}
            index={index}
            show={state.show}
            isPlaying={props.isPlaying}
            zIndex={state.zIndex}
            onLoad={readyToDisplay}
            onError={failedToDisplay}
            onHide={readyToLoad}
            data={state.data}
            transform={state.transform}
            view={state.view}
            effects={state.effects}
            displayIndex={state.displayIndex}
            fitParent={props.gridView}
          />
        ) : null
      })}
    </div>
  )
}

;(ImagePlayer as any).displayName = 'ImagePlayer'

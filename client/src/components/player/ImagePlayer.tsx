import React, { useEffect, useRef, useCallback } from 'react'

import type ChildCallbackHack from './ChildCallbackHack'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectPlayerHasStarted,
  selectPlayerImageViews,
  selectPlayerPlaylistPlayerSceneID
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
import { Box, Theme } from '@mui/material'
import {
  decreasePlayerLoaderPlaylistTimeLeft,
  loadImageViews,
  playerShouldDisplay,
  updatePlayerPlaylist
} from '../../store/player/thunks'
import useMeasure from 'react-use-measure'
import { ResizeObserver } from '@juggle/resize-observer'

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
      position: 'absolute',
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
  currentAudio?: number
  advanceHack: ChildCallbackHack
  isPlaying: boolean
  historyOffset: number
  deleteHack?: ChildCallbackHack
  strobeLayer?: string
  synced?: boolean
  setHistoryPaths: (historyPaths: HTMLContentElement[]) => void
  setHistoryOffset: (historyOffset: number) => void
  setVideo: (video?: HTMLVideoElement) => void
  setSceneCopy?: (children: React.ReactNode) => void
  setTimeToNextFrame?: (timeToNextFrame: number) => void
}

const noop = () => {}
export default function ImagePlayer(props: ImagePlayerProps) {
  const { classes } = useStyles()
  const applyAdvance = props.synced !== true

  const _sceneID = useRef<number>()
  const _readyToDisplay = useRef<Record<number, DisplayItem[]>>({})
  const _displayOffset = useRef<number>(0)
  const _advanceTimeout = useRef<number>()
  const _prevTimestamp = useRef<DOMHighResTimeStamp>()
  const _timer = useRef<ImageTimer>(new ImageTimer())
  const _wasPlaying = useRef<boolean>(false)

  const [containerRef, containerBounds] = useMeasure({
    polyfill: ResizeObserver,
    offsetSize: true
  })

  const dispatch = useAppDispatch()
  const hasStarted = useAppSelector(selectPlayerHasStarted(props.uuid))
  const sceneID = useAppSelector(selectPlayerPlaylistPlayerSceneID(props.uuid))
  const imageViews = useAppSelector(selectPlayerImageViews(props.uuid))

  useEffect(() => {
    if (
      _sceneID.current != null &&
      _readyToDisplay.current[_sceneID.current] != null
    ) {
      const indexes = _readyToDisplay.current[_sceneID.current].map(
        (item) => item.index
      )
      dispatch(
        setPlayerLoadingComplete({
          uuid: props.uuid,
          value: indexes
        })
      )
      dispatch(loadImageViews(props.uuid))
      _readyToDisplay.current[_sceneID.current] = []
    }
    if (_prevTimestamp.current != null) {
      _timer.current.timeToNextFrame = _prevTimestamp.current
    }

    _sceneID.current = sceneID
  }, [sceneID, dispatch, props.uuid])

  const doAdvance = useCallback(
    (timestamp: DOMHighResTimeStamp) => {
      if (_prevTimestamp.current != null) {
        dispatch(
          updatePlayerPlaylist(props.uuid, timestamp - _prevTimestamp.current)
        )
      }

      _prevTimestamp.current = timestamp
      _timer.current.tick(timestamp)
      if (
        timestamp < _timer.current.timeToNextFrame ||
        _sceneID.current == null
      ) {
        _advanceTimeout.current = window.requestAnimationFrame(doAdvance)
        return
      }

      const sceneReadyToDisplay = _readyToDisplay.current[_sceneID.current]
      if (sceneReadyToDisplay[0] == null) {
        _timer.current.retry()
        _advanceTimeout.current = window.requestAnimationFrame(doAdvance)
        if (_timer.current.retries === 6 && sceneReadyToDisplay.length > 0) {
          // waited long enough, try next
          sceneReadyToDisplay.shift()
          _displayOffset.current++
        } else {
          return
        }
      }

      const item = sceneReadyToDisplay.shift() as DisplayItem
      _displayOffset.current++
      _timer.current.next(item.duration)
      dispatch(
        setPlayerShownImageView({
          uuid: props.uuid,
          value: item.index
        })
      )
      _advanceTimeout.current = window.requestAnimationFrame(doAdvance)
    },
    [dispatch, props.uuid]
  )

  const advance: (timestamp: DOMHighResTimeStamp) => void = applyAdvance
    ? doAdvance
    : noop

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
          value: [index]
        })
      )
      dispatch(loadImageViews(props.uuid))
    },
    [dispatch, props.uuid]
  )

  const readyToDisplay = useCallback(
    (
      index: number,
      duration: number,
      sceneID: number,
      displayIndex?: number
    ) => {
      if (dispatch(playerShouldDisplay(props.uuid, sceneID, duration))) {
        if (_readyToDisplay.current[sceneID] == null) {
          _readyToDisplay.current[sceneID] = []
        }
        if (displayIndex == null) {
          _readyToDisplay.current[sceneID].push({ index, duration })
        } else if (displayIndex >= _displayOffset.current) {
          displayIndex -= _displayOffset.current
          _readyToDisplay.current[sceneID][displayIndex] = { index, duration }
        }

        dispatch(
          decreasePlayerLoaderPlaylistTimeLeft(props.uuid, sceneID, duration)
        )
        dispatch(setPlayerReadyToDisplay(props.uuid))
        dispatch(loadImageViews(props.uuid))
      } else {
        failedToDisplay(index)
      }
    },
    [dispatch, props.uuid, failedToDisplay]
  )

  const readyToLoad = useCallback(
    (index: number) => {
      dispatch(
        setPlayerPushReadyToLoad({
          uuid: props.uuid,
          value: index
        })
      )
      dispatch(loadImageViews(props.uuid))
    },
    [dispatch, props.uuid]
  )

  let onLoad: (
    index: number,
    duration: number,
    sceneID: number,
    displayIndex?: number
  ) => void = noop
  let onError: (
    index: number,
    duration: number,
    sceneID: number,
    displayIndex?: number
  ) => void = noop
  let onHide: (index: number) => void = noop
  if (applyAdvance) {
    onLoad = readyToDisplay
    onError = failedToDisplay
    onHide = readyToLoad
  }

  return (
    <Box className={classes.container} ref={containerRef}>
      {imageViews.map((state, index) => {
        return state != null ? (
          <ImageView
            key={index}
            index={index}
            sceneID={state.sceneID}
            show={state.show}
            isPlaying={props.isPlaying}
            zIndex={state.zIndex}
            onLoad={onLoad}
            onError={onError}
            onHide={onHide}
            data={state.data}
            transform={state.transform}
            view={state.view}
            effects={state.effects}
            displayIndex={state.displayIndex}
            bounds={containerBounds}
          />
        ) : null
      })}
    </Box>
  )
}

;(ImagePlayer as any).displayName = 'ImagePlayer'

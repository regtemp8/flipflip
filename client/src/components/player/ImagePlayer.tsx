import React, { useCallback } from 'react'

import type ChildCallbackHack from './ChildCallbackHack'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectImagePlayerImageViews,
  selectPlayerIsPlaying
} from '../../store/imagePlayer/selectors'
import { HTMLContentElement } from './HTMLContentElement'
import ImageView from './ImageView'
import { setImagePlayerPushReadyToLoad } from '../../store/imagePlayer/slice'
import { makeStyles } from 'tss-react/mui'
import { Box } from '@mui/material'
import {
  discardedImageView,
  loadImageViews,
  readyToDisplayImageView
} from '../../store/imagePlayer/thunks'
import useMeasure from 'react-use-measure'
import { ResizeObserver } from '@juggle/resize-observer'

const useStyles = makeStyles()(() => {
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

export interface DisplayItem {
  index: number
  sceneID: number
  duration: number
}

export interface ImagePlayerProps {
  uuid: string
  currentAudio?: number
  advanceHack: ChildCallbackHack
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
  const isPlaying = useAppSelector(selectPlayerIsPlaying())

  const [containerRef, containerBounds] = useMeasure({
    polyfill: ResizeObserver,
    offsetSize: true
  })

  const dispatch = useAppDispatch()
  const imageViews = useAppSelector(selectImagePlayerImageViews(props.uuid))

  const failedToDisplay = useCallback(
    (index: number, duration: number, sceneID: number) => {
      const item: DisplayItem = { index, duration, sceneID }
      dispatch(discardedImageView(props.uuid, item))
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
      const item: DisplayItem = { index, duration, sceneID }
      dispatch(readyToDisplayImageView(props.uuid, item, displayIndex))
    },
    [dispatch, props.uuid]
  )

  const readyToLoad = useCallback(
    (index: number) => {
      dispatch(
        setImagePlayerPushReadyToLoad({
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
  if (props.synced !== true) {
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
            sceneID={state.sceneId}
            show={state.show}
            isPlaying={isPlaying}
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

import * as React from 'react'

import { Grid, Typography } from '@mui/material'

import { getSourceType, ST } from 'flipflip-common'
import VideoControl from '../player/VideoControl'
import type ChildCallbackHack from '../player/ChildCallbackHack'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  setSceneVideoSpeed,
  setSceneVideoVolume
} from '../../store/scene/slice'
import {
  selectSceneVideoVolume,
  selectSceneVideoSkip
} from '../../store/scene/selectors'

export interface VideoCardProps {
  sceneID: number
  isPlaying: boolean
  mainVideo?: HTMLVideoElement
  mainClipID?: number
  mainClipValue?: number[]
  imagePlayerAdvanceHacks: ChildCallbackHack[][]
}

export default function VideoCard(props: VideoCardProps) {
  const dispatch = useAppDispatch()
  const videoVolume = useAppSelector(selectSceneVideoVolume(props.sceneID))
  const videoSkip = useAppSelector(selectSceneVideoSkip(props.sceneID))

  let mainVideoTitle = ''
  if (props.mainVideo) {
    const source = props.mainVideo.getAttribute('source') as string
    const sourceType = getSourceType(source)
    if (sourceType === ST.video) {
      if (source.startsWith('http')) {
        mainVideoTitle = source.substring(source.lastIndexOf('/') + 1)
      } else {
        mainVideoTitle = source.substring(source.lastIndexOf('\\') + 1)
      }
    } else {
      mainVideoTitle = props.mainVideo.src
      mainVideoTitle = mainVideoTitle.substring(
        mainVideoTitle.lastIndexOf('/') + 1
      )
    }
  }
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12}>
        {props.mainVideo && (
          <React.Fragment>
            <Typography>Scene Video:</Typography>
            <Typography variant="body2" style={{ whiteSpace: 'normal' }}>
              {mainVideoTitle}
            </Typography>
            <VideoControl
              player
              useHotkeys
              video={props.mainVideo}
              volume={videoVolume}
              clipID={props.mainClipID}
              clipValue={props.mainClipValue}
              nextTrack={() => {
                props.imagePlayerAdvanceHacks[0][0].fire()
              }}
              onChangeSpeed={(speed: number) =>
                dispatch(
                  setSceneVideoSpeed({ id: props.sceneID, value: speed })
                )
              }
              onChangeVolume={(volume: number) =>
                dispatch(
                  setSceneVideoVolume({ id: props.sceneID, value: volume })
                )
              }
              skip={videoSkip}
            />
          </React.Fragment>
        )}
      </Grid>
    </Grid>
  )
}

;(VideoCard as any).displayName = 'VideoCard'

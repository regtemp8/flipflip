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
  selectSceneVideoSkip,
  selectSceneOtherSceneNames
} from '../../store/scene/selectors'

export interface VideoCardProps {
  sceneID: number
  isPlaying: boolean
  mainVideo: HTMLVideoElement
  mainClipID?: number
  mainClipValue?: number[]
  otherVideos: HTMLVideoElement[][]
  imagePlayerAdvanceHacks: ChildCallbackHack[][]
}

export default function VideoCard(props: VideoCardProps) {
  const dispatch = useAppDispatch()
  const videoVolume = useAppSelector(selectSceneVideoVolume(props.sceneID))
  const videoSkip = useAppSelector(selectSceneVideoSkip(props.sceneID))
  const otherSceneNames = useAppSelector(
    selectSceneOtherSceneNames(props.sceneID)
  )

  const nop = () => {}

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
      {props.otherVideos &&
        props.otherVideos.map((otherVideoList, listIndex) => (
          <React.Fragment key={listIndex}>
            {otherVideoList.map((otherVideo, index) => {
              if (otherVideo == null) return <React.Fragment key={index} />
              if (otherSceneNames[listIndex] == null) {
                return <React.Fragment key={index} />
              }
              const sourceURL = otherVideo.getAttribute('source') as string
              let otherVideoTitle
              const sourceType = getSourceType(sourceURL)
              if (sourceType === ST.video) {
                if (sourceURL.startsWith('http')) {
                  otherVideoTitle = sourceURL.substring(
                    sourceURL.lastIndexOf('/') + 1
                  )
                } else {
                  otherVideoTitle = sourceURL.substring(
                    sourceURL.lastIndexOf('\\') + 1
                  )
                }
              } else {
                otherVideoTitle = otherVideo.src
                otherVideoTitle = otherVideoTitle.substring(
                  otherVideoTitle.lastIndexOf('/') + 1
                )
              }
              let clipValue: number[] | undefined
              let clipID: number | undefined
              if (
                otherVideo.hasAttribute('start') &&
                otherVideo.hasAttribute('end')
              ) {
                const start = otherVideo.getAttribute('start') as string
                const end = otherVideo.getAttribute('end') as string
                const clip = otherVideo.getAttribute('clip') as string
                clipValue = [parseFloat(start), parseFloat(end)]
                clipID = parseInt(clip)
              }
              return (
                <Grid item xs={12} key={index}>
                  <Typography>{otherSceneNames[listIndex]} Video:</Typography>
                  <Typography variant="body2" style={{ whiteSpace: 'normal' }}>
                    {otherVideoTitle}
                  </Typography>
                  <VideoControl
                    video={otherVideo}
                    clipID={clipID}
                    clipValue={clipValue}
                    player
                    nextTrack={() => {
                      props.imagePlayerAdvanceHacks[listIndex + 1][index].fire()
                    }}
                    onChangeSpeed={nop}
                    onChangeVolume={nop}
                    skip={videoSkip}
                  />
                </Grid>
              )
            })}
          </React.Fragment>
        ))}
    </Grid>
  )
}

;(VideoCard as any).displayName = 'VideoCard'

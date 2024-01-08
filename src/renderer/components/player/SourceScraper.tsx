import React, { useState, useRef, useEffect } from 'react'

import { Dialog, DialogContent } from '@mui/material'

import type ChildCallbackHack from './ChildCallbackHack'
import ImagePlayer from './ImagePlayer'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { selectPlayerOverlayOpacity, selectPlayerCaptcha } from '../../../store/player/selectors'
import { PlayerCaptcha, setPlayerCaptcha } from '../../../store/player/slice'

export interface SourceScraperProps {
  uuid?: string
  overlayIndex?: number
  opacity?: number
  currentAudio: number
  isPlaying: boolean
  gridView: boolean
  historyOffset: number
  advanceHack: ChildCallbackHack
  deleteHack?: ChildCallbackHack
  gridCoordinates?: number[]
  strobeLayer?: string
  setHistoryOffset: (historyOffset: number) => void
  setHistoryPaths: (
    historyPaths: Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>
  ) => void
  setVideo: (video: HTMLVideoElement) => void
  setTimeToNextFrame?: (timeToNextFrame: number) => void
  setSceneCopy?: (children: React.ReactNode) => void
}

export default function SourceScraper(props: SourceScraperProps) {
  const dispatch = useAppDispatch()
  const isOverlay = props.overlayIndex != null
  const opacity = isOverlay ? useAppSelector(selectPlayerOverlayOpacity(props.overlayIndex, props.uuid)) / 100 : props.opacity

  const captcha = useAppSelector(selectPlayerCaptcha(props.uuid))
  const [load, setLoad] = useState(false)

  // START LOG COMPONENT CHANGES
  // const pr_uuid = useRef<string>()
  // const pr_overlayIndex = useRef<number>()
  // const pr_opacity = useRef<number>()
  // const pr_currentAudio = useRef<number>()
  // const pr_isPlaying = useRef<boolean>()
  // const pr_gridView = useRef<boolean>()
  // const pr_historyOffset = useRef<number>()
  // const pr_advanceHack = useRef<ChildCallbackHack>()
  // const pr_deleteHack = useRef<ChildCallbackHack>()
  // const pr_gridCoordinates = useRef<number[]>()
  // const pr_strobeLayer = useRef<string>()
  // const pr_setHistoryOffset = useRef<(historyOffset: number) => void>()
  // const pr_setHistoryPaths = useRef<(
  //   historyPaths: Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>
  // ) => void>()
  // const pr_setVideo = useRef<(video: HTMLVideoElement) => void>()
  // const pr_setTimeToNextFrame = useRef<(timeToNextFrame: number) => void>()
  // const pr_setSceneCopy = useRef<(children: React.ReactNode) => void>()
  // const p_isOverlay = useRef<boolean>()
  // const p_opacity = useRef<number>()
  // const p_captcha = useRef<PlayerCaptcha>()
  // const p_load = useRef<boolean>()

  // console.log('22------------------------22')
  // if(props.uuid !== pr_uuid.current){
  //   console.log('UUID PROP CHANGED')
  // }
  // if(props.overlayIndex !== pr_overlayIndex.current){
  //   console.log('OVERLAY_INDEX PROP CHANGED')
  // }
  // if(props.opacity !== pr_opacity.current){
  //   console.log('OPACITY PROP CHANGED')
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
  // if(p_isOverlay.current = isOverlay){
  //   console.log('IS_OVERLAY CHANGED')
  // }
  // if(p_opacity.current = opacity){
  //   console.log('OPACITY CHANGED')
  // }
  // if(p_captcha.current = captcha){
  //   console.log('CAPTCHA CHANGED')
  // }
  // if(p_load.current = load){
  //   console.log('LOAD CHANGED')
  // }
  // console.log('22------------------------22')

  // pr_uuid.current = props.uuid
  // pr_overlayIndex.current = props.overlayIndex
  // pr_opacity.current = props.opacity
  // pr_currentAudio.current = props.currentAudio
  // pr_isPlaying.current = props.isPlaying
  // pr_gridView.current = props.gridView
  // pr_historyOffset.current = props.historyOffset
  // pr_advanceHack.current = props.advanceHack
  // pr_deleteHack.current = props.deleteHack
  // pr_gridCoordinates.current = props.gridCoordinates
  // pr_strobeLayer.current = props.strobeLayer
  // pr_setHistoryOffset.current = props.setHistoryOffset
  // pr_setHistoryPaths.current = props.setHistoryPaths
  // pr_setVideo.current = props.setVideo
  // pr_setTimeToNextFrame.current = props.setTimeToNextFrame
  // pr_setSceneCopy.current = props.setSceneCopy
  // p_isOverlay.current = isOverlay
  // p_opacity.current = opacity
  // p_captcha.current = captcha
  // p_load.current = load
  // END LOG COMPONENT CHANGES

  const onIFrameLoad = () => {
    if (!load) {
      setLoad(true)
    } else {
      onCloseDialog()
    }
  }

  const onCloseDialog = () => {
    dispatch(setPlayerCaptcha({uuid: props.uuid, value: undefined}))
    setLoad(false)
  }

  let style: any = { opacity }
  if (props.gridView) {
    style = {
      ...style,
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: isOverlay ? 4 : 'auto'
    }
  }

  return (
    <div style={style}>
      <ImagePlayer
        uuid={props.uuid}
        currentAudio={props.currentAudio}
        isOverlay={isOverlay}
        isPlaying={props.isPlaying}
        gridView={props.gridView}
        historyOffset={props.historyOffset}
        setHistoryOffset={props.setHistoryOffset}
        setHistoryPaths={props.setHistoryPaths}
        advanceHack={props.advanceHack}
        deleteHack={props.deleteHack}
        strobeLayer={props.strobeLayer}
        setVideo={props.setVideo}
        gridCoordinates={props.gridCoordinates}
        setSceneCopy={props.setSceneCopy}
        setTimeToNextFrame={props.setTimeToNextFrame}
      />
      {captcha != null && (
        <Dialog open={true} onClose={onCloseDialog.bind(this)}>
          <DialogContent style={{ height: 600 }}>
            <iframe
              sandbox="allow-forms"
              src={captcha.captcha}
              height={'100%'}
              onLoad={onIFrameLoad.bind(this)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

;(SourceScraper as any).displayName = 'SourceScraper'

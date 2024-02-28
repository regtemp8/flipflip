import React, { CSSProperties, useState } from 'react'

import { Dialog, DialogContent } from '@mui/material'

import type ChildCallbackHack from './ChildCallbackHack'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectPlayerCaptcha } from '../../store/player/selectors'
import { setPlayerCaptcha } from '../../store/player/slice'
import { HTMLContentElement } from './HTMLContentElement'
import ImagePlayer from './ImagePlayer'

export interface SourceScraperProps {
  uuid: string
  overlayIndex?: number
  opacity?: number
  currentAudio?: number
  isPlaying: boolean
  gridView: boolean
  historyOffset: number
  advanceHack: ChildCallbackHack
  deleteHack?: ChildCallbackHack
  gridCoordinates?: number[]
  strobeLayer?: string
  setHistoryOffset: (historyOffset: number) => void
  setHistoryPaths: (historyPaths: HTMLContentElement[]) => void
  setVideo: (video?: HTMLVideoElement) => void
  setTimeToNextFrame?: (timeToNextFrame: number) => void
  setSceneCopy?: (children: React.ReactNode) => void
}

export default function SourceScraper(props: SourceScraperProps) {
  const dispatch = useAppDispatch()
  const isOverlay = props.overlayIndex != null

  const captcha = useAppSelector(selectPlayerCaptcha(props.uuid))
  const [load, setLoad] = useState(false)

  const onIFrameLoad = () => {
    if (!load) {
      setLoad(true)
    } else {
      onCloseDialog()
    }
  }

  const onCloseDialog = () => {
    dispatch(
      setPlayerCaptcha({
        uuid: props.uuid,
        overlayIndex: props.overlayIndex,
        value: undefined
      })
    )
    setLoad(false)
  }

  let style: CSSProperties = { opacity: props.opacity }
  if (props.gridView) {
    style.position = 'absolute'
    style.top = 0
    style.bottom = 0
    style.left = 0
    style.right = 0
    style.zIndex = isOverlay ? 4 : 'auto'
  }

  return (
    <div style={style}>
      <ImagePlayer
        uuid={props.uuid}
        overlayIndex={props.overlayIndex}
        currentAudio={props.currentAudio}
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
        <Dialog open={true} onClose={onCloseDialog}>
          <DialogContent style={{ height: 600 }}>
            <iframe
              title="Captcha Form"
              sandbox="allow-forms"
              src={captcha.captcha}
              height={'100%'}
              onLoad={onIFrameLoad}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

;(SourceScraper as any).displayName = 'SourceScraper'

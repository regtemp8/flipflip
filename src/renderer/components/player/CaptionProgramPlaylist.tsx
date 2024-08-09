import React, { useEffect, useState } from 'react'

import { randomizeList } from '../../data/utils'
import CaptionProgram from './CaptionProgram'
import type ChildCallbackHack from './ChildCallbackHack'
import { RP } from '../../data/const'
import { useAppSelector } from '../../../store/hooks'
import {
  selectSceneIsScriptScene,
  selectSceneScriptStartIndex
} from '../../../store/scene/selectors'
import type ScriptPlaylist from '../../../store/scene/ScriptPlaylist'

export interface CaptionProgramPlaylistProps {
  playlistIndex: number
  playlist: ScriptPlaylist
  currentAudio: number
  currentImage: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement
  scale: number
  sceneID: number
  timeToNextFrame: number
  orderScriptTags: (scriptID: number) => void
  jumpToHack?: ChildCallbackHack
  persist: boolean
  advance?: () => void
  getCurrentTimestamp?: () => number
  onError?: (e: string) => void
}

export default function CaptionProgramPlaylist (
  props: CaptionProgramPlaylistProps
) {
  const isScriptScene = useAppSelector(selectSceneIsScriptScene(props.sceneID))
  const scriptStartIndex = useAppSelector(
    selectSceneScriptStartIndex(props.sceneID)
  )

  const [currentIndex, setCurrentIndex] = useState(
    props.playlistIndex === 0 ? scriptStartIndex : 0
  )
  const [playingScripts, setPlayingScripts] = useState<number[]>([])

  useEffect(() => {
    if (props.playlistIndex === 0 && isScriptScene) {
      window.addEventListener('keydown', onKeyDown, false)
    }
    restart()

    return () => {
      if (props.playlistIndex === 0 && isScriptScene) {
        window.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [])

  useEffect(() => {
    if (!props.persist) {
      restart()
    }
  }, [props.playlist])

  const restart = () => {
    let scripts = props.playlist.scripts
    if (props.playlist.shuffle) {
      scripts = randomizeList(Array.from(scripts))
    }
    setPlayingScripts(scripts)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case '[':
        e.preventDefault()
        props.orderScriptTags(props.playlist.scripts[currentIndex])
        prevTrack()
        break
      case ']':
        e.preventDefault()
        props.orderScriptTags(props.playlist.scripts[currentIndex])
        nextTrack()
        break
    }
  }

  const prevTrack = () => {
    let prevTrack = currentIndex - 1
    if (prevTrack < 0) {
      prevTrack = props.playlist.scripts.length - 1
    }
    setCurrentIndex(prevTrack)
  }

  const nextTrack = () => {
    let nextTrack = currentIndex + 1
    if (nextTrack >= props.playlist.scripts.length) {
      if (props.playlist.repeat === RP.none) {
        nextTrack = props.playlist.scripts.length
      } else {
        nextTrack = 0
      }
    }
    setCurrentIndex(nextTrack)
  }

  let script = playingScripts[currentIndex]
  if (!script) script = props.playlist.scripts[currentIndex]
  if (!script) return <div />
  return (
    <CaptionProgram
      sceneID={props.sceneID}
      captionScriptID={script}
      persist={props.persist}
      repeat={props.playlist.repeat}
      scale={props.scale}
      singleTrack={playingScripts.length === 1}
      nextTrack={nextTrack.bind(this)}
      currentAudio={props.currentAudio}
      getCurrentTimestamp={props.getCurrentTimestamp}
      timeToNextFrame={props.timeToNextFrame}
      currentImage={props.currentImage}
      jumpToHack={props.jumpToHack}
      advance={props.advance}
      onError={props.onError}
    />
  )
}

;(CaptionProgramPlaylist as any).displayName = 'CaptionProgramPlaylist'

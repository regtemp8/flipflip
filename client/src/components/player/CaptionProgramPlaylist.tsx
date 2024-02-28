import React, { useCallback, useEffect, useState } from 'react'

import { randomizeList } from '../../data/utils'
import CaptionProgram from './CaptionProgram'
import type ChildCallbackHack from './ChildCallbackHack'
import { RP } from 'flipflip-common'
import { useAppSelector } from '../../store/hooks'
import {
  selectSceneIsScriptScene,
  selectSceneScriptStartIndex
} from '../../store/scene/selectors'
import type ScriptPlaylist from '../../store/scene/ScriptPlaylist'
import { HTMLContentElement } from './HTMLContentElement'

export interface CaptionProgramPlaylistProps {
  playlistIndex: number
  playlist: ScriptPlaylist
  currentAudio: number
  currentImage?: HTMLContentElement
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

export default function CaptionProgramPlaylist(
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

  const restart = useCallback(() => {
    let scripts = props.playlist.scripts
    if (props.playlist.shuffle) {
      scripts = randomizeList(Array.from(scripts))
    }
    setPlayingScripts(scripts)
  }, [props.playlist.scripts, props.playlist.shuffle])

  const prevTrack = useCallback(() => {
    let prevTrack = currentIndex - 1
    if (prevTrack < 0) {
      prevTrack = props.playlist.scripts.length - 1
    }
    setCurrentIndex(prevTrack)
  }, [currentIndex, props.playlist.scripts.length])

  const nextTrack = useCallback(() => {
    let nextTrack = currentIndex + 1
    if (nextTrack >= props.playlist.scripts.length) {
      if (props.playlist.repeat === RP.none) {
        nextTrack = props.playlist.scripts.length
      } else {
        nextTrack = 0
      }
    }
    setCurrentIndex(nextTrack)
  }, [currentIndex, props.playlist.repeat, props.playlist.scripts.length])

  useEffect(() => {
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

    if (props.playlistIndex === 0 && isScriptScene) {
      window.addEventListener('keydown', onKeyDown, false)
    }
    restart()

    return () => {
      if (props.playlistIndex === 0 && isScriptScene) {
        window.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [currentIndex, isScriptScene, nextTrack, prevTrack, props, restart])

  useEffect(() => {
    if (!props.persist) {
      restart()
    }
  }, [props.playlist, props.persist, restart])

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
      nextTrack={nextTrack}
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

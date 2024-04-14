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
import { HTMLContentElement } from './HTMLContentElement'
import { selectPlaylist } from '../../store/playlist/selectors'

export interface CaptionProgramPlaylistProps {
  playlistIndex: number
  playlistID: number
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
  const playlist = useAppSelector(selectPlaylist(props.playlistID))
  const isScriptScene = useAppSelector(selectSceneIsScriptScene(props.sceneID))
  const scriptStartIndex = useAppSelector(
    selectSceneScriptStartIndex(props.sceneID)
  )

  const [currentIndex, setCurrentIndex] = useState(
    props.playlistIndex === 0 ? scriptStartIndex : 0
  )
  const [playingScripts, setPlayingScripts] = useState<number[]>([])

  const restart = useCallback(() => {
    let scripts = playlist.items
    if (playlist.shuffle) {
      scripts = randomizeList(Array.from(scripts))
    }
    setPlayingScripts(scripts)
  }, [playlist.items, playlist.shuffle])

  const prevTrack = useCallback(() => {
    let prevTrack = currentIndex - 1
    if (prevTrack < 0) {
      prevTrack = playlist.items.length - 1
    }
    setCurrentIndex(prevTrack)
  }, [currentIndex, playlist.items.length])

  const nextTrack = useCallback(() => {
    let nextTrack = currentIndex + 1
    if (nextTrack >= playlist.items.length) {
      if (playlist.repeat === RP.none) {
        nextTrack = playlist.items.length
      } else {
        nextTrack = 0
      }
    }
    setCurrentIndex(nextTrack)
  }, [currentIndex, playlist.repeat, playlist.items.length])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case '[':
          e.preventDefault()
          props.orderScriptTags(playlist.items[currentIndex])
          prevTrack()
          break
        case ']':
          e.preventDefault()
          props.orderScriptTags(playlist.items[currentIndex])
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
  }, [
    currentIndex,
    isScriptScene,
    nextTrack,
    prevTrack,
    props,
    restart,
    playlist.items
  ])

  useEffect(() => {
    if (!props.persist) {
      restart()
    }
  }, [playlist, props.persist, restart])

  let script = playingScripts[currentIndex]
  if (!script) script = playlist.items[currentIndex]
  if (!script) return <div />
  return (
    <CaptionProgram
      sceneID={props.sceneID}
      captionScriptID={script}
      persist={props.persist}
      repeat={playlist.repeat}
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

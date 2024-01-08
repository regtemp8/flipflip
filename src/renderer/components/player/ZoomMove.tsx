import React, { type PropsWithChildren } from 'react'
import { animated, useSpring } from 'react-spring'

import { HTF, TF, VTF } from '../../data/const'
import { getDuration, getEaseFunction } from '../../data/utils'
import { useAppSelector } from '../../../store/hooks'
import {
  selectSceneHorizTransType,
  selectSceneHorizTransLevel,
  selectSceneHorizTransLevelMin,
  selectSceneHorizTransLevelMax,
  selectSceneHorizTransRandom,
  selectSceneVertTransType,
  selectSceneVertTransLevel,
  selectSceneVertTransLevelMin,
  selectSceneVertTransLevelMax,
  selectSceneVertTransRandom,
  selectSceneZoom,
  selectSceneZoomRandom,
  selectSceneZoomStart,
  selectSceneZoomStartMin,
  selectSceneZoomStartMax,
  selectSceneZoomEnd,
  selectSceneZoomEndMin,
  selectSceneZoomEndMax,
  selectSceneZoomTF,
  selectSceneZoomDuration,
  selectSceneZoomDurationMin,
  selectSceneZoomDurationMax,
  selectSceneZoomSinRate,
  selectSceneZoomBPMMulti,
  selectSceneTransEase,
  selectSceneTransExp,
  selectSceneTransAmp,
  selectSceneTransPer,
  selectSceneTransOv
} from '../../../store/scene/selectors'
import { selectAudioBPM } from '../../../store/audio/selectors'

export interface ZoomMoveProps {
  sceneID: number
  reset: boolean
  timeToNextFrame: number
  currentAudio: number
}

export default function ZoomMove (props: PropsWithChildren<ZoomMoveProps>) {
  const horizTransType = useAppSelector(
    selectSceneHorizTransType(props.sceneID)
  )
  const horizTransLevel = useAppSelector(
    selectSceneHorizTransLevel(props.sceneID)
  )
  const horizTransLevelMin = useAppSelector(
    selectSceneHorizTransLevelMin(props.sceneID)
  )
  const horizTransLevelMax = useAppSelector(
    selectSceneHorizTransLevelMax(props.sceneID)
  )
  const horizTransRandom = useAppSelector(
    selectSceneHorizTransRandom(props.sceneID)
  )
  const vertTransType = useAppSelector(selectSceneVertTransType(props.sceneID))
  const vertTransLevel = useAppSelector(
    selectSceneVertTransLevel(props.sceneID)
  )
  const vertTransLevelMin = useAppSelector(
    selectSceneVertTransLevelMin(props.sceneID)
  )
  const vertTransLevelMax = useAppSelector(
    selectSceneVertTransLevelMax(props.sceneID)
  )
  const vertTransRandom = useAppSelector(
    selectSceneVertTransRandom(props.sceneID)
  )
  const zoom = useAppSelector(selectSceneZoom(props.sceneID))
  const zoomRandom = useAppSelector(selectSceneZoomRandom(props.sceneID))
  const zoomStart = useAppSelector(selectSceneZoomStart(props.sceneID))
  const zoomStartMin = useAppSelector(selectSceneZoomStartMin(props.sceneID))
  const zoomStartMax = useAppSelector(selectSceneZoomStartMax(props.sceneID))
  const zoomEnd = useAppSelector(selectSceneZoomEnd(props.sceneID))
  const zoomEndMin = useAppSelector(selectSceneZoomEndMin(props.sceneID))
  const zoomEndMax = useAppSelector(selectSceneZoomEndMax(props.sceneID))
  const transTF = useAppSelector(selectSceneZoomTF(props.sceneID))
  const transDuration = useAppSelector(selectSceneZoomDuration(props.sceneID))
  const transDurationMin = useAppSelector(
    selectSceneZoomDurationMin(props.sceneID)
  )
  const transDurationMax = useAppSelector(
    selectSceneZoomDurationMax(props.sceneID)
  )
  const transSinRate = useAppSelector(selectSceneZoomSinRate(props.sceneID))
  const transBPMMulti = useAppSelector(selectSceneZoomBPMMulti(props.sceneID))
  const transEase = useAppSelector(selectSceneTransEase(props.sceneID))
  const transExp = useAppSelector(selectSceneTransExp(props.sceneID))
  const transAmp = useAppSelector(selectSceneTransAmp(props.sceneID))
  const transPer = useAppSelector(selectSceneTransPer(props.sceneID))
  const transOv = useAppSelector(selectSceneTransOv(props.sceneID))
  const bpm = useAppSelector(selectAudioBPM(props.currentAudio))

  let translateX = 0
  if (horizTransType !== HTF.none) {
    translateX = horizTransLevel
    if (horizTransRandom) {
      translateX =
        Math.floor(
          Math.random() * (horizTransLevelMax - horizTransLevelMin + 1)
        ) + horizTransLevelMin
    }
    if (horizTransType === HTF.left) {
      translateX = -translateX
    } else if (horizTransType === HTF.right) {
      // Already set
    } else if (horizTransType === HTF.random) {
      const type = Math.floor(Math.random() * 2)
      if (type) {
        translateX = -translateX
      } else {
        // Already set
      }
    }
  }

  let translateY = 0
  if (vertTransType !== VTF.none) {
    translateY = vertTransLevel
    if (vertTransRandom) {
      translateY =
        Math.floor(
          Math.random() * (vertTransLevelMax - vertTransLevelMin + 1)
        ) + vertTransLevelMin
    }
    if (vertTransType === VTF.up) {
      translateY = -translateY
    } else if (vertTransType === VTF.down) {
      // Already set
    } else if (vertTransType === VTF.random) {
      const type = Math.floor(Math.random() * 2)
      if (type) {
        translateY = -translateY
      } else {
        // Already set
      }
    }
  }

  let scaleFrom = 1
  let scaleTo = 1
  if (zoom) {
    if (zoomRandom) {
      scaleFrom =
        (Math.floor(
          Math.random() * (zoomStartMax * 10 - zoomStartMin * 10 + 1)
        ) +
          zoomStartMin * 10) /
        10
      scaleTo =
        (Math.floor(Math.random() * (zoomEndMax * 10 - zoomEndMin * 10 + 1)) +
          zoomEndMin * 10) /
        10
    } else {
      scaleFrom = zoomStart
      scaleTo = zoomEnd
    }
  }

  const duration = getDuration(
    {
      timingFunction: transTF,
      time: transDuration,
      timeMax: transDurationMax,
      timeMin: transDurationMin,
      sinRate: transSinRate,
      bpmMulti: transBPMMulti
    },
    props.timeToNextFrame,
    bpm
  )

  const imageProps = useSpring({
    reset: props.reset,
    from: {
      transform: 'translate(0%, 0%) scale(' + scaleFrom + ')'
    },
    to: {
      transform:
        'translate(' +
        translateX +
        '%, ' +
        translateY +
        '%) scale(' +
        scaleTo +
        ')'
    },
    config: {
      duration,
      easing: getEaseFunction(transEase, transExp, transAmp, transPer, transOv)
    }
  })

  return (
    <animated.div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 2,
        ...imageProps
      }}
    >
      {props.children}
    </animated.div>
  )
}

;(ZoomMove as any).displayName = 'ZoomMove'

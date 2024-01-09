import React, { type PropsWithChildren } from 'react'
import { animated, useSpring } from 'react-spring'

import { getDuration, getEaseFunction } from '../../data/utils'
import { useAppSelector } from '../../store/hooks'
import {
  selectSceneStrobeTF,
  selectSceneStrobeDuration,
  selectSceneStrobeDurationMin,
  selectSceneStrobeDurationMax,
  selectSceneStrobeSinRate,
  selectSceneStrobeBPMMulti,
  selectSceneTransEase,
  selectSceneTransExp,
  selectSceneTransAmp,
  selectSceneTransPer,
  selectSceneTransOv
} from '../../store/scene/selectors'
import { selectAudioBPM } from '../../store/audio/selectors'
import { selectUndefined } from '../../store/app/selectors'

export interface StrobeImageProps {
  sceneID: number
  timeToNextFrame: number
  currentAudio?: number
}

export default function StrobeImage(
  props: PropsWithChildren<StrobeImageProps>
) {
  const strobeTF = useAppSelector(selectSceneStrobeTF(props.sceneID))
  const strobeTime = useAppSelector(selectSceneStrobeDuration(props.sceneID))
  const strobeTimeMin = useAppSelector(
    selectSceneStrobeDurationMin(props.sceneID)
  )
  const strobeTimeMax = useAppSelector(
    selectSceneStrobeDurationMax(props.sceneID)
  )
  const strobeSinRate = useAppSelector(selectSceneStrobeSinRate(props.sceneID))
  const strobeBPMMulti = useAppSelector(
    selectSceneStrobeBPMMulti(props.sceneID)
  )
  const transEase = useAppSelector(selectSceneTransEase(props.sceneID))
  const transExp = useAppSelector(selectSceneTransExp(props.sceneID))
  const transAmp = useAppSelector(selectSceneTransAmp(props.sceneID))
  const transPer = useAppSelector(selectSceneTransPer(props.sceneID))
  const transOv = useAppSelector(selectSceneTransOv(props.sceneID))
  const bpmSelector =
    props.currentAudio != null
      ? selectAudioBPM(props.currentAudio)
      : selectUndefined
  const bpm = useAppSelector(bpmSelector)

  const duration = getDuration(
    {
      timingFunction: strobeTF,
      time: strobeTime,
      timeMax: strobeTimeMax,
      timeMin: strobeTimeMin,
      sinRate: strobeSinRate,
      bpmMulti: strobeBPMMulti
    },
    props.timeToNextFrame,
    bpm
  )

  const imageProps = useSpring({
    reset: true,
    from: {
      opacity: 1
    },
    to: {
      opacity: 0
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
        overflow: 'hidden',
        zIndex: 2,
        ...imageProps
      }}
    >
      {props.children}
    </animated.div>
  )
}

;(StrobeImage as any).displayName = 'StrobeImage'

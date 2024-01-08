import React, { type PropsWithChildren } from 'react'
import { animated, useTransition } from 'react-spring'

import { getDuration, getEaseFunction } from '../../data/utils'
import { useAppSelector } from '../../../store/hooks'
import {
  selectSceneFadeTF,
  selectSceneFadeDuration,
  selectSceneFadeDurationMin,
  selectSceneFadeDurationMax,
  selectSceneFadeSinRate,
  selectSceneFadeBPMMulti,
  selectSceneFadeEase,
  selectSceneFadeExp,
  selectSceneFadeAmp,
  selectSceneFadePer,
  selectSceneFadeOv
} from '../../../store/scene/selectors'
import { selectAudioBPM } from '../../../store/audio/selectors'

export interface CrossFadeProps {
  image: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement
  sceneID: number
  timeToNextFrame: number
  currentAudio: number
}

export default function CrossFade (props: PropsWithChildren<CrossFadeProps>) {
  const fadeTF = useAppSelector(selectSceneFadeTF(props.sceneID))
  const fadeDuration = useAppSelector(selectSceneFadeDuration(props.sceneID))
  const fadeDurationMin = useAppSelector(
    selectSceneFadeDurationMin(props.sceneID)
  )
  const fadeDurationMax = useAppSelector(
    selectSceneFadeDurationMax(props.sceneID)
  )
  const fadeSinRate = useAppSelector(selectSceneFadeSinRate(props.sceneID))
  const fadeBPMMulti = useAppSelector(selectSceneFadeBPMMulti(props.sceneID))
  const fadeEase = useAppSelector(selectSceneFadeEase(props.sceneID))
  const fadeExp = useAppSelector(selectSceneFadeExp(props.sceneID))
  const fadeAmp = useAppSelector(selectSceneFadeAmp(props.sceneID))
  const fadePer = useAppSelector(selectSceneFadePer(props.sceneID))
  const fadeOv = useAppSelector(selectSceneFadeOv(props.sceneID))
  const bpm = useAppSelector(selectAudioBPM(props.currentAudio))

  const duration = getDuration(
    {
      timingFunction: fadeTF,
      time: fadeDuration,
      timeMin: fadeDurationMin,
      timeMax: fadeDurationMax,
      sinRate: fadeSinRate,
      bpmMulti: fadeBPMMulti
    },
    props.timeToNextFrame,
    bpm
  )

  const fadeTransitions: [{ item: any, props: any, key: any }] = useTransition(
    props.image,
    (image: any) => {
      return image.key
    },
    {
      initial: {
        // Initial (first time) base values, optional (can be null)
        opacity: 1,
        volume: 1
      },
      from: {
        // Base values, optional
        opacity: 0,
        volume: 0
      },
      enter: {
        // Styles apply for entering elements
        opacity: 1,
        volume: 1
      },
      leave: {
        // Styles apply for leaving elements
        opacity: 0,
        volume: 0
      },
      unique: true, // If this is true, items going in and out with the same key will be re-used
      config: {
        duration,
        easing: getEaseFunction(fadeEase, fadeExp, fadeAmp, fadePer, fadeOv)
      }
    }
  )

  return (
    <React.Fragment>
      {fadeTransitions.map((transition) => {
        return (
          <animated.div
            key={transition.key}
            volume={transition.props.volume}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              ...transition.props
            }}
          >
            {props.children}
          </animated.div>
        )
      })}
    </React.Fragment>
  )
}

;(CrossFade as any).displayName = 'CrossFade'

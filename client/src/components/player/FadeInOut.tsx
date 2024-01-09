import React, {
  type PropsWithChildren,
  CSSProperties,
  useEffect,
  useState,
  useRef
} from 'react'
import {
  UseTransitionResult,
  ForwardedProps,
  animated,
  useTransition
} from 'react-spring'

import { TF } from 'flipflip-common'
import { getDuration, getEaseFunction } from '../../data/utils'
import Audio from '../../store/audio/Audio'
import { useAppSelector } from '../../store/hooks'
import {
  selectSceneFadeInOut,
  selectSceneFadeIOPulse,
  selectSceneFadeIOTF,
  selectSceneFadeIODuration,
  selectSceneFadeIODurationMin,
  selectSceneFadeIODurationMax,
  selectSceneFadeIOSinRate,
  selectSceneFadeIOBPMMulti,
  selectSceneFadeIODelayTF,
  selectSceneFadeIODelay,
  selectSceneFadeIODelayMin,
  selectSceneFadeIODelayMax,
  selectSceneFadeIODelaySinRate,
  selectSceneFadeIODelayBPMMulti,
  selectSceneFadeIOEndEase,
  selectSceneFadeIOEndExp,
  selectSceneFadeIOEndAmp,
  selectSceneFadeIOEndPer,
  selectSceneFadeIOEndOv,
  selectSceneFadeIOStartEase,
  selectSceneFadeIOStartExp,
  selectSceneFadeIOStartAmp,
  selectSceneFadeIOStartPer,
  selectSceneFadeIOStartOv
} from '../../store/scene/selectors'
import { selectAudioBPM } from '../../store/audio/selectors'
import { selectUndefined } from '../../store/app/selectors'

export interface FadeInOutProps {
  toggleFade: boolean
  currentAudio?: number
  timeToNextFrame: number
  sceneID: number
  fadeFunction: Function
}

export default function FadeInOut(props: PropsWithChildren<FadeInOutProps>) {
  const fadeInOut = useAppSelector(selectSceneFadeInOut(props.sceneID))
  const fadeIOPulse = useAppSelector(selectSceneFadeIOPulse(props.sceneID))
  const fadeIOTF = useAppSelector(selectSceneFadeIOTF(props.sceneID))
  const fadeIODuration = useAppSelector(
    selectSceneFadeIODuration(props.sceneID)
  )
  const fadeIODurationMin = useAppSelector(
    selectSceneFadeIODurationMin(props.sceneID)
  )
  const fadeIODurationMax = useAppSelector(
    selectSceneFadeIODurationMax(props.sceneID)
  )
  const fadeIOSinRate = useAppSelector(selectSceneFadeIOSinRate(props.sceneID))
  const fadeIOBPMMulti = useAppSelector(
    selectSceneFadeIOBPMMulti(props.sceneID)
  )
  const fadeIODelayTF = useAppSelector(selectSceneFadeIODelayTF(props.sceneID))
  const fadeIODelay = useAppSelector(selectSceneFadeIODelay(props.sceneID))
  const fadeIODelayMin = useAppSelector(
    selectSceneFadeIODelayMin(props.sceneID)
  )
  const fadeIODelayMax = useAppSelector(
    selectSceneFadeIODelayMax(props.sceneID)
  )
  const fadeIODelaySinRate = useAppSelector(
    selectSceneFadeIODelaySinRate(props.sceneID)
  )
  const fadeIODelayBPMMulti = useAppSelector(
    selectSceneFadeIODelayBPMMulti(props.sceneID)
  )
  const fadeIOEndEase = useAppSelector(selectSceneFadeIOEndEase(props.sceneID))
  const fadeIOEndExp = useAppSelector(selectSceneFadeIOEndExp(props.sceneID))
  const fadeIOEndAmp = useAppSelector(selectSceneFadeIOEndAmp(props.sceneID))
  const fadeIOEndPer = useAppSelector(selectSceneFadeIOEndPer(props.sceneID))
  const fadeIOEndOv = useAppSelector(selectSceneFadeIOEndOv(props.sceneID))
  const fadeIOStartEase = useAppSelector(
    selectSceneFadeIOStartEase(props.sceneID)
  )
  const fadeIOStartExp = useAppSelector(
    selectSceneFadeIOStartExp(props.sceneID)
  )
  const fadeIOStartAmp = useAppSelector(
    selectSceneFadeIOStartAmp(props.sceneID)
  )
  const fadeIOStartPer = useAppSelector(
    selectSceneFadeIOStartPer(props.sceneID)
  )
  const fadeIOStartOv = useAppSelector(selectSceneFadeIOStartOv(props.sceneID))
  const bpmSelector =
    props.currentAudio != null
      ? selectAudioBPM(props.currentAudio)
      : selectUndefined
  const bpm = useAppSelector(bpmSelector)

  const [toggleFade, setToggleFade] = useState(false)
  const [duration, setDuration] = useState(0)

  const _fadeTimeout = useRef<number>()
  const _fadeOut = useRef(false)
  const _lastToggle = useRef<any>()

  useEffect(() => {
    _fadeOut.current = false
    if (
      fadeInOut &&
      (fadeIOPulse ? fadeIODelayTF !== TF.scene : fadeIOTF !== TF.scene)
    ) {
      fadeLoop()
    }

    return () => {
      clearTimeout(_fadeTimeout.current)
      _fadeTimeout.current = undefined
      _fadeOut.current = false
    }
  }, [])

  useEffect(() => {
    if (fadeInOut) {
      clearTimeout(_fadeTimeout.current)
      if (fadeIOPulse ? fadeIODelayTF !== TF.scene : fadeIOTF !== TF.scene) {
        fadeLoop()
      }
    }
  }, [fadeIOTF, fadeIODelayTF, fadeIOPulse])

  const calcDuration = () => {
    return (
      getDuration(
        {
          timingFunction: fadeIOTF,
          time: fadeIODuration,
          timeMax: fadeIODurationMax,
          timeMin: fadeIODurationMin,
          sinRate: fadeIOSinRate,
          bpmMulti: fadeIOBPMMulti
        },
        props.timeToNextFrame,
        bpm,
        10
      ) / 2
    )
  }

  const fade = () => {
    const duration = calcDuration()
    const delay = fadeIOPulse ? getDelay() : duration
    setToggleFade(!toggleFade)
    setDuration(duration)
    props.fadeFunction()
    return delay
  }

  const fadeLoop = () => {
    const delay = fade()
    _fadeTimeout.current = window.setTimeout(fadeLoop, delay)
  }

  const getDelay = () => {
    return getDuration(
      {
        timingFunction: fadeIODelayTF,
        time: fadeIODelay,
        timeMax: fadeIODelayMax,
        timeMin: fadeIODelayMin,
        sinRate: fadeIODelaySinRate,
        bpmMulti: fadeIODelayBPMMulti
      },
      props.timeToNextFrame,
      bpm
    )
  }

  const sceneTiming = fadeIOTF === TF.scene
  if (props.toggleFade !== _lastToggle.current) {
    _fadeOut.current = false
    _lastToggle.current = props.toggleFade
  }

  const transitionParams: { items: boolean | null; values: object } = {
    items: false,
    values: {}
  }
  if (sceneTiming) {
    transitionParams.items = _fadeOut.current ? null : props.toggleFade
    transitionParams.values = {
      from: {
        opacity: _fadeOut.current ? 1 : 0
      },
      enter: {
        opacity: _fadeOut.current ? 0 : 1
      },
      leave: {
        opacity: _fadeOut.current ? 1 : 0
      },
      unique: true,
      config: {
        duration: calcDuration(),
        easing: _fadeOut.current
          ? getEaseFunction(
              fadeIOEndEase,
              fadeIOEndExp,
              fadeIOEndAmp,
              fadeIOEndPer,
              fadeIOEndOv
            )
          : getEaseFunction(
              fadeIOStartEase,
              fadeIOStartExp,
              fadeIOStartAmp,
              fadeIOStartPer,
              fadeIOStartOv
            )
      }
    }
  } else {
    transitionParams.items = toggleFade
    transitionParams.values = {
      from: {
        opacity: toggleFade ? 0 : 1
      },
      enter: {
        opacity: toggleFade ? 1 : 0
      },
      leave: {
        opacity: toggleFade ? 0 : 1
      },
      unique: true,
      config: {
        duration,
        easing: toggleFade
          ? getEaseFunction(
              fadeIOEndEase,
              fadeIOEndExp,
              fadeIOEndAmp,
              fadeIOEndPer,
              fadeIOEndOv
            )
          : getEaseFunction(
              fadeIOStartEase,
              fadeIOStartExp,
              fadeIOStartAmp,
              fadeIOStartPer,
              fadeIOStartOv
            )
      }
    }
  }

  const fadeTransitions: UseTransitionResult<
    boolean,
    ForwardedProps<CSSProperties>
  >[] = useTransition(
    transitionParams.items,
    (toggle: any) => toggle,
    transitionParams.values
  )
  if (sceneTiming) {
    clearTimeout(_fadeTimeout.current)
    if (_fadeOut.current) {
      props.fadeFunction()
      _fadeTimeout.current = window.setTimeout(() => {
        _fadeOut.current = false
      }, calcDuration())
    } else {
      _fadeTimeout.current = window.setTimeout(() => {
        _fadeOut.current = true
        setToggleFade(!toggleFade)
      }, calcDuration())
    }
  }

  return (
    <React.Fragment>
      {fadeTransitions.map((transition) => {
        return (
          <animated.div
            key={transition.key}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 2,
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

;(FadeInOut as any).displayName = 'FadeInOut'

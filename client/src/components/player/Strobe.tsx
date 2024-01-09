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

import { SC, SL, TF } from 'flipflip-common'
import * as utils from '../../data/utils'
import { useAppSelector } from '../../store/hooks'
import { selectSceneStrobeOptions } from '../../store/scene/selectors'
import { selectAudioBPM } from '../../store/audio/selectors'
import { selectUndefined } from '../../store/app/selectors'

export interface StrobeProps {
  sceneID: number
  toggleStrobe: boolean
  timeToNextFrame: number
  currentAudio?: number
  zIndex: number
  strobeFunction?: Function
}

export default function Strobe(props: PropsWithChildren<StrobeProps>) {
  const strobe = useAppSelector(selectSceneStrobeOptions(props.sceneID))
  const bpmSelector =
    props.currentAudio != null
      ? selectAudioBPM(props.currentAudio)
      : selectUndefined
  const bpm = useAppSelector(bpmSelector)

  const [toggleStrobe, setToggleStrobe] = useState(false)
  const [duration, setDuration] = useState(0)
  const _strobeTimeout = useRef<number>()

  const getStrobeColor = () => {
    let color = null
    if (strobe.colorType === SC.color) {
      color = strobe.color
    } else if (strobe.colorType === SC.colorSet) {
      if (strobe.colorSet.length > 0) {
        color = utils.getRandomListItem(strobe.colorSet)
      }
    } else {
      color = utils.getRandomColor()
    }
    const validColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g.exec(color)
    return validColor ? color : ''
  }

  const strobeOnce = () => {
    const duration = getDuration()
    setDuration(duration)
    const delay = strobe.strobePulse ? getDelay() : duration
    setToggleStrobe(!toggleStrobe)
    if (props.strobeFunction) {
      props.strobeFunction()
    }
    return delay
  }

  const strobeLoop = () => {
    const delay = strobeOnce()
    _strobeTimeout.current = window.setTimeout(strobeLoop, delay)
  }

  useEffect(() => {
    if (
      strobe.strobePulse
        ? strobe.delay.timingFunction !== TF.scene
        : strobe.timing.timingFunction !== TF.scene
    ) {
      strobeLoop()
    }

    return () => {
      clearTimeout(_strobeTimeout.current)
      _strobeTimeout.current = undefined
    }
  }, [])

  useEffect(() => {
    clearTimeout(_strobeTimeout.current)
    if (
      strobe.strobePulse
        ? strobe.delay.timingFunction !== TF.scene
        : strobe.timing.timingFunction !== TF.scene
    ) {
      strobeLoop()
    }
  }, [
    strobe.timing.timingFunction,
    strobe.delay.timingFunction,
    strobe.strobePulse
  ])

  useEffect(() => {
    if (
      strobe.strobePulse
        ? strobe.delay.timingFunction === TF.scene
        : strobe.timing.timingFunction === TF.scene
    ) {
      strobeOnce()
    }
  }, [props.toggleStrobe])

  const getDuration = () => {
    return utils.getDuration(strobe.timing, props.timeToNextFrame, bpm, 10)
  }

  const getDelay = () => {
    return utils.getDuration(strobe.delay, props.timeToNextFrame, bpm)
  }

  const strobeTransitions: UseTransitionResult<
    boolean,
    ForwardedProps<CSSProperties>
  >[] = useTransition(
    toggleStrobe,
    (toggle: any) => {
      return toggle
    },
    {
      from: {
        backgroundColor:
          strobe.strobeLayer === SL.image ? '' : getStrobeColor(),
        opacity: strobe.strobeLayer === SL.bottom ? strobe.strobeOpacity : 1
      },
      enter: {
        opacity: 0
      },
      leave: {
        opacity: 0
      },
      reset: true,
      unique: true,
      config: {
        duration,
        easing: utils.getEaseFunction(
          strobe.easing.ease,
          strobe.easing.exp,
          strobe.easing.amp,
          strobe.easing.per,
          strobe.easing.ov
        )
      }
    }
  )

  return (
    <React.Fragment>
      {strobeTransitions.map((transition) => {
        return (
          <animated.div
            key={transition.key}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: props.zIndex,
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

;(Strobe as any).displayName = 'Strobe'

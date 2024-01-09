import React, { type PropsWithChildren, CSSProperties } from 'react'
import {
  UseTransitionResult,
  ForwardedProps,
  animated,
  useTransition
} from 'react-spring'

import { STF } from 'flipflip-common'
import { getDuration, getEaseFunction, getRandomNumber } from '../../data/utils'
import { useAppSelector } from '../../store/hooks'
import {
  selectSceneSlideTF,
  selectSceneSlideDuration,
  selectSceneSlideDurationMin,
  selectSceneSlideDurationMax,
  selectSceneSlideSinRate,
  selectSceneSlideBPMMulti,
  selectSceneSlideType,
  selectSceneSlideDistance,
  selectSceneSlideEase,
  selectSceneSlideExp,
  selectSceneSlideAmp,
  selectSceneSlidePer,
  selectSceneSlideOv
} from '../../store/scene/selectors'
import { selectAudioBPM } from '../../store/audio/selectors'
import { selectUndefined } from '../../store/app/selectors'

export interface SlideProps {
  image: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement
  sceneID: number
  timeToNextFrame: number
  currentAudio?: number
}

export default function Slide(props: PropsWithChildren<SlideProps>) {
  const slideTF = useAppSelector(selectSceneSlideTF(props.sceneID))
  const slideDuration = useAppSelector(selectSceneSlideDuration(props.sceneID))
  const slideDurationMin = useAppSelector(
    selectSceneSlideDurationMin(props.sceneID)
  )
  const slideDurationMax = useAppSelector(
    selectSceneSlideDurationMax(props.sceneID)
  )
  const slideSinRate = useAppSelector(selectSceneSlideSinRate(props.sceneID))
  const slideBPMMulti = useAppSelector(selectSceneSlideBPMMulti(props.sceneID))
  const slideType = useAppSelector(selectSceneSlideType(props.sceneID))
  const slideDistance = useAppSelector(selectSceneSlideDistance(props.sceneID))
  const slideEase = useAppSelector(selectSceneSlideEase(props.sceneID))
  const slideExp = useAppSelector(selectSceneSlideExp(props.sceneID))
  const slideAmp = useAppSelector(selectSceneSlideAmp(props.sceneID))
  const slidePer = useAppSelector(selectSceneSlidePer(props.sceneID))
  const slideOv = useAppSelector(selectSceneSlideOv(props.sceneID))
  const bpmSelector =
    props.currentAudio != null
      ? selectAudioBPM(props.currentAudio)
      : selectUndefined
  const bpm = useAppSelector(bpmSelector)

  const duration = getDuration(
    {
      timingFunction: slideTF,
      time: slideDuration,
      timeMin: slideDurationMin,
      timeMax: slideDurationMax,
      sinRate: slideSinRate,
      bpmMulti: slideBPMMulti
    },
    props.timeToNextFrame,
    bpm
  )

  let slideHStart, slideHEnd, slideVStart, slideVEnd
  let type = slideType
  if (type === STF.leftright) {
    type = getRandomNumber(0, 1) === 0 ? STF.left : STF.right
  } else if (type === STF.updown) {
    type = getRandomNumber(0, 1) === 0 ? STF.up : STF.down
  } else if (slideType === STF.random) {
    const rand = getRandomNumber(0, 3)
    switch (rand) {
      case 0:
        type = STF.left
        break
      case 1:
        type = STF.right
        break
      case 2:
        type = STF.up
        break
      case 3:
        type = STF.down
        break
    }
  }

  switch (type) {
    case STF.left:
      slideHStart = 100
      slideHEnd = slideDistance * -1
      slideVStart = 0
      slideVEnd = 0
      break
    case STF.right:
      slideHStart = -100
      slideHEnd = slideDistance
      slideVStart = 0
      slideVEnd = 0
      break
    case STF.up:
      slideVStart = 100
      slideVEnd = slideDistance * -1
      slideHStart = 0
      slideHEnd = 0
      break
    case STF.down:
      slideVStart = -100
      slideVEnd = slideDistance
      slideHStart = 0
      slideHEnd = 0
      break
  }

  const slideTransitions: UseTransitionResult<
    HTMLIFrameElement | HTMLImageElement | HTMLVideoElement,
    ForwardedProps<CSSProperties>
  >[] = useTransition(
    props.image,
    (image: any) => {
      return image.key
    },
    {
      from: {
        // Base values, optional
        transform: `translate3d(${slideHStart}%,${slideVStart}%,0)`
      },
      enter: {
        // Styles apply for entering elements
        transform: 'translate3d(0%,0%,0)'
      },
      leave: {
        // Styles apply for leaving elements
        transform: `translate3d(${slideHEnd}%,${slideVEnd}%,0)`
      },
      unique: true, // If this is true, items going in and out with the same key will be re-used
      config: {
        duration,
        easing: getEaseFunction(
          slideEase,
          slideExp,
          slideAmp,
          slidePer,
          slideOv
        )
      }
    }
  )

  return (
    <React.Fragment>
      {slideTransitions.map((transition) => {
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

;(Slide as any).displayName = 'Slide'

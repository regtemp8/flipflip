import React, {
  type PropsWithChildren,
  useEffect,
  useState,
  useRef
} from 'react'
import { animated, useTransition } from 'react-spring'

import { HTF, TF, VTF } from '../../data/const'
import { getDuration, getEaseFunction } from '../../data/utils'
import { useAppSelector } from '../../../store/hooks'
import {
  selectScenePanning,
  selectScenePanTF,
  selectScenePanDuration,
  selectScenePanDurationMin,
  selectScenePanDurationMax,
  selectScenePanSinRate,
  selectScenePanBPMMulti,
  selectScenePanHorizTransType,
  selectScenePanHorizTransImg,
  selectScenePanHorizTransLevel,
  selectScenePanHorizTransLevelMin,
  selectScenePanHorizTransLevelMax,
  selectScenePanHorizTransRandom,
  selectScenePanVertTransType,
  selectScenePanVertTransImg,
  selectScenePanVertTransLevel,
  selectScenePanVertTransLevelMin,
  selectScenePanVertTransLevelMax,
  selectScenePanVertTransRandom,
  selectScenePanEndEase,
  selectScenePanEndExp,
  selectScenePanEndAmp,
  selectScenePanEndPer,
  selectScenePanEndOv,
  selectScenePanStartEase,
  selectScenePanStartExp,
  selectScenePanStartAmp,
  selectScenePanStartPer,
  selectScenePanStartOv
} from '../../../store/scene/selectors'
import { selectAudioBPM } from '../../../store/audio/selectors'

export interface PanningProps {
  togglePan: boolean
  currentAudio: number
  timeToNextFrame: number
  sceneID: number
  panFunction: Function
  image?: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement
  parentHeight?: number
  parentWidth?: number
}

export default function Panning (props: PropsWithChildren<PanningProps>) {
  const panning = useAppSelector(selectScenePanning(props.sceneID))
  const panTF = useAppSelector(selectScenePanTF(props.sceneID))
  const panDuration = useAppSelector(selectScenePanDuration(props.sceneID))
  const panDurationMin = useAppSelector(
    selectScenePanDurationMin(props.sceneID)
  )
  const panDurationMax = useAppSelector(
    selectScenePanDurationMax(props.sceneID)
  )
  const panSinRate = useAppSelector(selectScenePanSinRate(props.sceneID))
  const panBPMMulti = useAppSelector(selectScenePanBPMMulti(props.sceneID))
  const panHorizTransType = useAppSelector(
    selectScenePanHorizTransType(props.sceneID)
  )
  const panHorizTransImg = useAppSelector(
    selectScenePanHorizTransImg(props.sceneID)
  )
  const panHorizTransLevel = useAppSelector(
    selectScenePanHorizTransLevel(props.sceneID)
  )
  const panHorizTransLevelMin = useAppSelector(
    selectScenePanHorizTransLevelMin(props.sceneID)
  )
  const panHorizTransLevelMax = useAppSelector(
    selectScenePanHorizTransLevelMax(props.sceneID)
  )
  const panHorizTransRandom = useAppSelector(
    selectScenePanHorizTransRandom(props.sceneID)
  )
  const panVertTransType = useAppSelector(
    selectScenePanVertTransType(props.sceneID)
  )
  const panVertTransImg = useAppSelector(
    selectScenePanVertTransImg(props.sceneID)
  )
  const panVertTransLevel = useAppSelector(
    selectScenePanVertTransLevel(props.sceneID)
  )
  const panVertTransLevelMin = useAppSelector(
    selectScenePanVertTransLevelMin(props.sceneID)
  )
  const panVertTransLevelMax = useAppSelector(
    selectScenePanVertTransLevelMax(props.sceneID)
  )
  const panVertTransRandom = useAppSelector(
    selectScenePanVertTransRandom(props.sceneID)
  )
  const panEndEase = useAppSelector(selectScenePanEndEase(props.sceneID))
  const panEndExp = useAppSelector(selectScenePanEndExp(props.sceneID))
  const panEndAmp = useAppSelector(selectScenePanEndAmp(props.sceneID))
  const panEndPer = useAppSelector(selectScenePanEndPer(props.sceneID))
  const panEndOv = useAppSelector(selectScenePanEndOv(props.sceneID))
  const panStartEase = useAppSelector(selectScenePanStartEase(props.sceneID))
  const panStartExp = useAppSelector(selectScenePanStartExp(props.sceneID))
  const panStartAmp = useAppSelector(selectScenePanStartAmp(props.sceneID))
  const panStartPer = useAppSelector(selectScenePanStartPer(props.sceneID))
  const panStartOv = useAppSelector(selectScenePanStartOv(props.sceneID))
  const bpm = useAppSelector(selectAudioBPM(props.currentAudio))

  const [togglePan, setTogglePan] = useState(false)
  const [duration, setDuration] = useState(0)

  const _panTimeout = useRef<number>()
  const _panOut = useRef(false)
  const _lastToggle = useRef<any>()
  const _lastHorizRandom = useRef(0)
  const _lastVertRandom = useRef(0)

  useEffect(() => {
    _panOut.current = false
    _lastHorizRandom.current = 0
    _lastVertRandom.current = 0
    if (panning && panTF !== TF.scene) {
      panLoop(true)
    }

    return () => {
      clearTimeout(_panTimeout.current)
      _panTimeout.current = undefined
      _panOut.current = false
      _lastToggle.current = undefined
      _lastHorizRandom.current = 0
      _lastVertRandom.current = 0
    }
  }, [])

  useEffect(() => {
    if (panning) {
      clearTimeout(_panTimeout.current)
      if (panTF !== TF.scene) {
        panLoop(true)
      }
    }
  }, [panTF])

  const panIn = () => {
    const duration = calcDuration()
    setTogglePan(true)
    setDuration(duration)
    props.panFunction()
    return duration
  }

  const panOut = () => {
    const duration = calcDuration()
    setTogglePan(false)
    setDuration(duration)
    props.panFunction()
    return duration
  }

  const panLoop = (doPanIn: boolean) => {
    const delay = doPanIn ? panIn() : panOut()
    _panTimeout.current = window.setTimeout(panLoop.bind(this, !doPanIn), delay)
  }

  const calcDuration = () => {
    return (
      getDuration(
        {
          timingFunction: panTF,
          time: panDuration,
          timeMin: panDurationMin,
          timeMax: panDurationMax,
          sinRate: panSinRate,
          bpmMulti: panBPMMulti
        },
        props.timeToNextFrame,
        bpm,
        10
      ) / 2
    )
  }

  const sceneTiming = panTF === TF.scene
  if (props.togglePan !== _lastToggle.current) {
    _panOut.current = false
    _lastToggle.current = props.togglePan
  }
  let panTransitions: [{ item: any, props: any, key: any }]
  const image = props.image

  let horizTransLevel = 0
  let horizPix = false
  if (panHorizTransType !== HTF.none) {
    if (image && panHorizTransImg) {
      const height = image.offsetHeight
      const width = image.offsetWidth
      const parentHeight = props.parentHeight
        ? props.parentHeight
        : window.innerHeight
      const parentWidth = props.parentWidth
        ? props.parentWidth
        : window.innerWidth
      const heightDiff = Math.max(height - parentHeight, 0)
      const widthDiff = Math.max(width - parentWidth - heightDiff, 0)
      horizTransLevel = widthDiff / 2
      horizPix = true
    } else {
      horizTransLevel = panHorizTransLevel
      if (panHorizTransRandom) {
        horizTransLevel =
          Math.floor(
            Math.random() * (panHorizTransLevelMax - panHorizTransLevelMin + 1)
          ) + panHorizTransLevelMin
      }
    }
    if (panHorizTransType === HTF.left) {
      horizTransLevel = -horizTransLevel
    } else if (panHorizTransType === HTF.right) {
      // Already set
    } else if (panHorizTransType === HTF.random) {
      if ((sceneTiming && _panOut.current) || (!sceneTiming && togglePan)) {
        const type = Math.floor(Math.random() * 2)
        if (type) {
          horizTransLevel = -horizTransLevel
        } else {
          // Already set
        }
        _lastHorizRandom.current = type
      } else {
        if (_lastHorizRandom.current === 0) {
          // Already set
        } else {
          horizTransLevel = -horizTransLevel
        }
      }
    }
  }
  const horizSuffix = horizPix ? 'px' : '%'

  let vertTransLevel = 0
  let vertPix = false
  if (panVertTransType !== VTF.none) {
    if (image && panVertTransImg) {
      const height = image.offsetHeight
      const width = image.offsetWidth
      const parentHeight = props.parentHeight
        ? props.parentHeight
        : window.innerHeight
      const parentWidth = props.parentWidth
        ? props.parentWidth
        : window.innerWidth
      const widthDiff = Math.max(width - parentWidth, 0)
      const heightDiff = Math.max(height - parentHeight - widthDiff, 0)
      vertTransLevel = heightDiff / 2
      vertPix = true
    } else {
      vertTransLevel = panVertTransLevel
      if (panVertTransRandom) {
        vertTransLevel =
          Math.floor(
            Math.random() * (panVertTransLevelMax - panVertTransLevelMin + 1)
          ) + panVertTransLevelMin
      }
    }
    if (panVertTransType === VTF.up) {
      vertTransLevel = -vertTransLevel
    } else if (panVertTransType === VTF.down) {
      // Already set
    } else if (panVertTransType === VTF.random) {
      if ((sceneTiming && _panOut.current) || (!sceneTiming && togglePan)) {
        const type = Math.floor(Math.random() * 2)
        if (type) {
          vertTransLevel = -vertTransLevel
        } else {
          // Already set
        }
        _lastVertRandom.current = type
      } else {
        if (_lastVertRandom.current === 0) {
          // Already set
        } else {
          vertTransLevel = -vertTransLevel
        }
      }
    }
  }
  const vertSuffix = vertPix ? 'px' : '%'

  const horizTransLevelNeg = -horizTransLevel
  const vertTransLevelNeg = -vertTransLevel

  if (sceneTiming) {
    panTransitions = useTransition(
      _panOut.current ? null : props.togglePan,
      (toggle: any) => {
        return toggle
      },
      {
        from: {
          transform: _panOut.current
            ? 'translate(' +
              horizTransLevel +
              horizSuffix +
              ', ' +
              vertTransLevel +
              vertSuffix +
              ')'
            : 'translate(' +
              horizTransLevelNeg +
              horizSuffix +
              ', ' +
              vertTransLevelNeg +
              vertSuffix +
              ')'
        },
        enter: {
          transform: _panOut.current
            ? 'translate(' +
              horizTransLevelNeg +
              horizSuffix +
              ', ' +
              vertTransLevelNeg +
              vertSuffix +
              ')'
            : 'translate(' +
              horizTransLevel +
              horizSuffix +
              ', ' +
              vertTransLevel +
              vertSuffix +
              ')'
        },
        leave: {
          transform: _panOut.current
            ? 'translate(' +
              horizTransLevel +
              horizSuffix +
              ', ' +
              vertTransLevel +
              vertSuffix +
              ')'
            : 'translate(' +
              horizTransLevelNeg +
              horizSuffix +
              ', ' +
              vertTransLevelNeg +
              vertSuffix +
              ')'
        },
        config: {
          duration: calcDuration(),
          easing: _panOut.current
            ? getEaseFunction(
              panEndEase,
              panEndExp,
              panEndAmp,
              panEndPer,
              panEndOv
            )
            : getEaseFunction(
              panStartEase,
              panStartExp,
              panStartAmp,
              panStartPer,
              panStartOv
            )
        }
      }
    )
    clearTimeout(_panTimeout.current)
    if (_panOut.current) {
      props.panFunction()
      _panTimeout.current = window.setTimeout(() => {
        _panOut.current = false
      }, calcDuration())
    } else {
      _panTimeout.current = window.setTimeout(() => {
        _panOut.current = true
        setTogglePan(!togglePan)
      }, calcDuration())
    }
  } else {
    panTransitions = useTransition(
      togglePan,
      (toggle: any) => {
        return toggle
      },
      {
        from: {
          transform: togglePan
            ? 'translate(' +
              horizTransLevelNeg +
              horizSuffix +
              ', ' +
              vertTransLevelNeg +
              vertSuffix +
              ')'
            : 'translate(' +
              horizTransLevel +
              horizSuffix +
              ', ' +
              vertTransLevel +
              vertSuffix +
              ')'
        },
        enter: {
          transform: togglePan
            ? 'translate(' +
              horizTransLevel +
              horizSuffix +
              ', ' +
              vertTransLevel +
              vertSuffix +
              ')'
            : 'translate(' +
              horizTransLevelNeg +
              horizSuffix +
              ', ' +
              vertTransLevelNeg +
              vertSuffix +
              ')'
        },
        leave: {
          transform: togglePan
            ? 'translate(' +
              horizTransLevelNeg +
              horizSuffix +
              ', ' +
              vertTransLevelNeg +
              vertSuffix +
              ')'
            : 'translate(' +
              horizTransLevel +
              horizSuffix +
              ', ' +
              vertTransLevel +
              vertSuffix +
              ')'
        },
        config: {
          duration,
          easing: togglePan
            ? getEaseFunction(
              panStartEase,
              panStartExp,
              panStartAmp,
              panStartPer,
              panStartOv
            )
            : getEaseFunction(
              panEndEase,
              panEndExp,
              panEndAmp,
              panEndPer,
              panEndOv
            )
        }
      }
    )
  }

  return (
    <React.Fragment>
      {panTransitions.map((transition) => {
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

;(Panning as any).displayName = 'Panning'

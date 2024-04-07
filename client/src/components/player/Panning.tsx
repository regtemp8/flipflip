import React, { useRef, type PropsWithChildren, useMemo } from 'react'
import { animated, useSpring } from '@react-spring/web'

import { getEaseFunction } from '../../data/utils'
import {
  PanningData,
  PanningLoopData
} from '../../store/player/ContentPreloadService'
import { IT } from 'flipflip-common'

const toTranslate = (
  data: PanningLoopData,
  measurements: ImageMeasurements
) => {
  let x = data.translateX
  let amountX = x?.amount
  if (x != null && x.unit === 'px') {
    // amountX is either 1 or -1 depending on its direction
    amountX = x.amount
    const direction = amountX
    const { imageType, imageWidth, imageHeight } = measurements
    const parentWidth = measurements.parentWidth as number
    const parentHeight = measurements.parentHeight as number
    if (imageType === IT.fitBestClip) {
      const heightRatio = parentHeight / imageHeight
      const widthRatio = parentWidth / imageWidth
      if (widthRatio > heightRatio) {
        amountX = 0
      } else {
        amountX = (imageWidth * heightRatio - parentWidth) / 2
      }
    } else if (imageType === IT.fitHeight) {
      const heightRatio = parentHeight / imageHeight
      amountX = (imageWidth * heightRatio - parentWidth) / 2
    } else if (imageType === IT.center) {
      amountX = (imageWidth - parentWidth) / 2
    }
    if (amountX <= 0) {
      x = undefined
    } else {
      amountX *= direction
    }
  }

  let y = data.translateY
  let amountY = y?.amount
  if (y != null && y.unit === 'px') {
    // amountY is either 1 or -1 depending on its direction
    amountY = y.amount
    const direction = amountY
    const { imageType, imageWidth, imageHeight } = measurements
    const parentWidth = measurements.parentWidth ?? window.innerWidth
    const parentHeight = measurements.parentHeight ?? window.innerHeight
    if (imageType === IT.fitBestClip) {
      const heightRatio = parentHeight / imageHeight
      const widthRatio = parentWidth / imageWidth
      if (heightRatio > widthRatio) {
        amountY = 0
      } else {
        amountY = (imageHeight * widthRatio - parentHeight) / 2
      }
    } else if (imageType === IT.fitWidth) {
      const widthRatio = parentWidth / imageWidth
      amountY = (imageHeight * widthRatio - parentHeight) / 2
    } else if (imageType === IT.center) {
      amountY = (imageHeight - parentHeight) / 2
    }
    if (amountY <= 0) {
      y = undefined
    } else {
      amountY *= direction
    }
  }

  if (x != null && y != null) {
    return `translate(${amountX}${x.unit},${amountY}${y.unit})`
  } else if (x != null) {
    return `translateX(${amountX}${x.unit})`
  } else if (y != null) {
    return `translateY(${amountY}${y.unit})`
  } else {
    return undefined
  }
}

interface EffectProps {
  data: PanningData
  measurements: ImageMeasurements
  show: boolean
  isPlaying: boolean
  className?: string
}

function Effect(props: PropsWithChildren<EffectProps>) {
  const { data, measurements, show, isPlaying, className, children } = props

  const _prevShow = useRef<boolean>(false)
  const _reset = useRef<boolean>(false)

  const animation = useMemo(() => {
    let to: any[] | undefined = undefined
    const from = toTranslate(data.start, measurements)
    if (from != null) {
      let startEasing: ((time: number) => number) | undefined = undefined
      if (data.startEasing != null) {
        const { ea, exp, amp, per, ov } = data.startEasing
        startEasing = getEaseFunction(ea, exp, amp, per, ov)
      }

      let endEasing: ((time: number) => number) | undefined = undefined
      if (data.endEasing != null) {
        const { ea, exp, amp, per, ov } = data.endEasing
        endEasing = getEaseFunction(ea, exp, amp, per, ov)
      }

      to = data.loops.map((loop, index) => {
        const panIn = index % 2 === 0
        const easing = panIn ? startEasing : endEasing
        const translate = toTranslate(loop, measurements) as string
        return {
          transform: translate,
          config: { duration: loop.duration, easing }
        }
      })
    }

    return {
      from: {
        transform: from
      },
      to
    }
  }, [data, measurements])

  _reset.current = _prevShow.current !== show
  _prevShow.current = show

  const style = useSpring({
    ...animation,
    reset: _reset.current,
    pause: !isPlaying
  })

  return (
    <animated.div
      className={className}
      style={animation.from.transform != null ? style : undefined}
    >
      {children}
    </animated.div>
  )
}

export interface ImageMeasurements {
  imageType: string
  imageWidth: number
  imageHeight: number
  parentWidth?: number
  parentHeight?: number
}

export interface PanningProps {
  data?: PanningData
  measurements: ImageMeasurements
  className?: string
  show: boolean
  isPlaying: boolean
}

export default function Panning(props: PropsWithChildren<PanningProps>) {
  const { data, measurements, show, isPlaying, className, children } = props
  if (data != null) {
    return (
      <Effect
        data={data}
        measurements={measurements}
        show={show}
        isPlaying={isPlaying}
        className={className}
      >
        {children}
      </Effect>
    )
  } else {
    return <>{children}</>
  }
}

;(Panning as any).displayName = 'Panning'

import React, { useRef, type PropsWithChildren, useMemo } from 'react'
import { animated, useSpring } from '@react-spring/web'
import { ZoomMoveData } from '../../store/player/ContentPreloadService'
import { getEaseFunction } from '../../data/utils'

interface EffectProps {
  data: ZoomMoveData
  show: boolean
  isPlaying: boolean
  className?: string
}

function Effect(props: PropsWithChildren<EffectProps>) {
  const { data, show, isPlaying, className, children } = props

  const _prevShow = useRef<boolean>(false)

  const animation = useMemo(() => {
    const toTransform: string[] = []
    const fromTransform: string[] = []
    if (data.translateX !== 0 && data.translateY !== 0) {
      fromTransform.push('translate(0%, 0%)')
      toTransform.push(`translate(${data.translateX}%, ${data.translateY}%)`)
    } else if (data.translateX !== 0) {
      fromTransform.push('translateX(0%)')
      toTransform.push(`translateX(${data.translateX}%)`)
    } else if (data.translateY !== 0) {
      fromTransform.push('translateY(0%)')
      toTransform.push(`translateY(${data.translateY}%)`)
    }
    if (data.scaleFrom !== 1 || data.scaleTo !== 1) {
      fromTransform.push(`scale(${data.scaleFrom})`)
      toTransform.push(`scale(${data.scaleTo})`)
    }

    let easing: ((time: number) => number) | undefined = undefined
    if (data.easing != null) {
      const { ea, exp, amp, per, ov } = data.easing
      easing = getEaseFunction(ea, exp, amp, per, ov)
    }

    return {
      from: {
        transform: fromTransform.join(' ')
      },
      to: {
        transform: toTransform.join(' ')
      },
      config: {
        duration: data.duration,
        easing
      }
    }
  }, [data])

  const reset = _prevShow.current !== show && show
  _prevShow.current = show
  const style = useSpring({
    ...animation,
    reset,
    pause: !isPlaying
  })
  return (
    <animated.div className={className} style={style}>
      {children}
    </animated.div>
  )
}

export interface ZoomMoveProps {
  show: boolean
  isPlaying: boolean
  data?: ZoomMoveData
  className?: string
}

export default function ZoomMove(props: PropsWithChildren<ZoomMoveProps>) {
  const { show, isPlaying, data, className, children } = props
  if (data != null) {
    return (
      <Effect
        data={data}
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

;(ZoomMove as any).displayName = 'ZoomMove'

import React, { useRef, type PropsWithChildren, useMemo } from 'react'
import { animated, useSpring } from '@react-spring/web'
import { type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import { getEaseFunction } from '../../data/utils'
import { FadeInOutData } from '../../store/player/ContentPreloadService'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    fadeInOutContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 2
    }
  }
})

interface EffectProps {
  data: FadeInOutData
  show: boolean
  isPlaying: boolean
}

function Effect(props: PropsWithChildren<EffectProps>) {
  const { data, show, isPlaying, children } = props
  const { classes } = useStyles()

  const loops = useMemo(() => {
    return data.loops.map((loop) => {
      let easing: ((time: number) => number) | undefined = undefined
      if (loop.easing != null) {
        const { ea, exp, amp, per, ov } = loop.easing
        easing = getEaseFunction(ea, exp, amp, per, ov)
      }

      const { opacity, duration } = loop
      return { opacity, config: { duration, easing } }
    })
  }, [data])

  const _prevShow = useRef<boolean>(false)
  const to = _prevShow.current !== show && show ? loops : undefined
  _prevShow.current = show
  const style = useSpring({ from: { opacity: 0 }, to, pause: !isPlaying })

  return (
    <animated.div className={classes.fadeInOutContainer} style={style}>
      {children}
    </animated.div>
  )
}

export interface FadeInOutProps {
  show: boolean
  isPlaying: boolean
  data?: FadeInOutData
}

export default function FadeInOut(props: PropsWithChildren<FadeInOutProps>) {
  const { show, isPlaying, data, children } = props
  if (data != null) {
    return (
      <Effect data={data} show={show} isPlaying={isPlaying}>
        {children}
      </Effect>
    )
  } else {
    return <>{children}</>
  }
}

;(FadeInOut as any).displayName = 'FadeInOut'

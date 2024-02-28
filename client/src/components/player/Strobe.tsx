import React, { useRef, type PropsWithChildren, useEffect } from 'react'
import { animated, useSpring } from '@react-spring/web'
import { type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { StrobeData } from '../../store/player/ContentPreloadService'
import { getEaseFunction } from '../../data/utils'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    strobeContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  }
})

interface EffectProps {
  zIndex: number
  show: boolean
  isPlaying: boolean
  data: StrobeData
}

function Effect(props: PropsWithChildren<EffectProps>) {
  const { data, show, isPlaying, zIndex, children } = props
  const { classes } = useStyles()

  const _prevShow = useRef<boolean>(false)

  const play = _prevShow.current !== show && show
  _prevShow.current = show

  const [style, api] = useSpring(
    () => ({
      from: { opacity: data.opacity, background: '' },
      to: async (next) => {
        let easing: ((time: number) => number) | undefined = undefined
        if (data.easing != null) {
          const { ea, exp, amp, per, ov } = data.easing
          easing = getEaseFunction(ea, exp, amp, per, ov)
        }

        for (const { opacity, color, delay, duration } of data.loops) {
          api.set({ background: color })
          await next({
            opacity,
            reset: true,
            delay,
            config: { duration, easing }
          })
        }
      },
      immediate: !play
    }),
    [play, data]
  )

  useEffect(() => {
    if (isPlaying) {
      api.resume()
    } else {
      api.pause()
    }
  }, [isPlaying, api])

  return (
    <animated.div
      className={classes.strobeContainer}
      style={{
        zIndex,
        ...style
      }}
    >
      {children}
    </animated.div>
  )
}

export interface StrobeProps {
  show: boolean
  isPlaying: boolean
  zIndex: number
  data?: StrobeData
  enable: (data: StrobeData) => boolean
}

export default function Strobe(props: PropsWithChildren<StrobeProps>) {
  const { data, show, isPlaying, zIndex, children } = props
  if (data != null && props.enable(data)) {
    return (
      <Effect data={data} zIndex={zIndex} show={show} isPlaying={isPlaying}>
        {children}
      </Effect>
    )
  } else {
    return <>{children}</>
  }
}

;(Strobe as any).displayName = 'Strobe'

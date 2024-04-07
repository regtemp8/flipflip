import { PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { animated, useSpring } from '@react-spring/web'
import { type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import {
  CrossFadeData,
  EasingParams,
  SlideData
} from '../../store/player/ContentPreloadService'
import { getEaseFunction } from '../../data/utils'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    container: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  }
})

export interface ImageTransitionProps {
  show: boolean
  isPlaying: boolean
  zIndex: number
  slide?: SlideData
  crossFade?: CrossFadeData
  onHide: () => void
}

export default function ImageTransition(
  props: PropsWithChildren<ImageTransitionProps>
) {
  const { slide, crossFade, children } = props
  if (slide != null || crossFade != null) {
    return <Effect {...props}>{children}</Effect>
  } else {
    return <NoEffect {...props}>{children}</NoEffect>
  }
}

interface SpringProps {
  opacity?: number
  transform?: string
}

function toEasing(params?: EasingParams) {
  if (params == null) {
    return undefined
  }

  const { ea, exp, amp, per, ov } = params
  return getEaseFunction(ea, exp, amp, per, ov)
}

function Effect(props: PropsWithChildren<ImageTransitionProps>) {
  const { classes } = useStyles()
  const { show, isPlaying, onHide, zIndex, slide, crossFade, children } = props

  const _prevShow = useRef<boolean>(false)
  const _from = useRef<SpringProps>({ opacity: 0 })
  const _to = useRef<SpringProps>({ opacity: 0 })
  const _applyEffect = useRef<boolean>(false)
  const _reset = useRef<boolean>(false)

  const config = useCallback(
    (key: string) => {
      if (crossFade != null && key === 'opacity') {
        return {
          easing: toEasing(crossFade.easing),
          duration: crossFade.duration
        }
      }
      if (slide != null && key === 'transform') {
        return {
          easing: toEasing(slide.easing),
          duration: slide.duration
        }
      }

      return {}
    },
    [crossFade, slide]
  )

  const onRest = useCallback(() => {
    if (!_prevShow.current) {
      onHide()
      _applyEffect.current = false
    }
  }, [onHide])

  const change = _prevShow.current !== show
  _reset.current = change
  if (change) {
    _prevShow.current = show
    _from.current = { opacity: 1 }
    _to.current = { opacity: 1 }
    if (crossFade != null) {
      _from.current.opacity = show ? 0 : 1
      _to.current.opacity = show ? 1 : 0
    }
    if (slide != null) {
      const slideFrom = show ? [slide.horizStart, slide.vertStart] : [0, 0]
      const slideTo = show ? [0, 0] : [slide.horizEnd, slide.vertEnd]
      _from.current.transform = `translate(${slideFrom[0]}%, ${slideFrom[1]}%)`
      _to.current.transform = `translate(${slideTo[0]}%, ${slideTo[1]}%)`
    }
    if (show) {
      _applyEffect.current = true
    }
  }

  const effect = useSpring({
    from: _from.current,
    to: _to.current,
    reset: _reset.current,
    pause: !isPlaying,
    config,
    onRest
  })

  const style = _applyEffect.current
    ? { ...effect, zIndex }
    : { opacity: 0, zIndex }
  return (
    <animated.div className={classes.container} style={style}>
      {children}
    </animated.div>
  )
}

function NoEffect(props: PropsWithChildren<ImageTransitionProps>) {
  const { show, zIndex, children, onHide } = props
  const _prevShow = useRef<boolean>(false)

  useEffect(() => {
    if (!show && _prevShow.current) {
      onHide()
    }

    _prevShow.current = show
  }, [show, onHide])

  return (
    <div
      style={{
        zIndex,
        opacity: show ? 1 : 0
      }}
    >
      {children}
    </div>
  )
}

;(ImageTransition as any).displayName = 'ImageTransition'

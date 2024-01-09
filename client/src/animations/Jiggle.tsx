import React, { type PropsWithChildren, useRef, useState } from 'react'
import { Keyframes, animated } from 'react-spring/renderprops'

const JiggleAnimation: any = Keyframes.Spring(
  async (next: any, cancel: any, props: any) => {
    const bounce = props.bounce
    if (props.started) {
      await next({
        from: {
          transform: bounce
            ? 'scale(1.0, 1.0) translate(0, 0)'
            : 'scale(1.0, 1.0)'
        },
        transform: bounce
          ? 'scale(1.1, 0.9) translate(0, -5px)'
          : 'scale(1.1, 0.9)',
        config: { duration: bounce ? 80 : 100 }
      })
      await next({
        from: {
          transform: bounce
            ? 'scale(1.1, 0.9) translate(0, -5px)'
            : 'scale(1.1, 0.9)'
        },
        transform: bounce
          ? 'scale(0.9, 1.1) translate(0, -5px)'
          : 'scale(0.9, 1.1)',
        config: { duration: bounce ? 80 : 100 }
      })
      await next(
        {
          from: {
            transform: bounce
              ? 'scale(0.9, 1.1) translate(0, -5px)'
              : 'scale(0.9, 1.1)'
          },
          transform: bounce
            ? 'scale(1.0, 1.0)  translate(0, 0)'
            : 'scale(1.0, 1.0)',
          config: { duration: bounce ? 80 : 100 }
        },
        true
      )
    } else {
      next(
        {
          from: {
            transform: 'scale(1, 1)'
          }
        },
        true
      )
    }
  }
)

export interface JiggleProps {
  bounce?: boolean
  id?: string
  className?: string
  style?: any
  disable?: boolean
  onClick?: () => void
}

export default function Jiggle(props: PropsWithChildren<JiggleProps>) {
  const _jiggling = useRef<string[]>([])
  const [hasStarted, setHasStarted] = useState(false)

  const jiggle = (e: any) => {
    const target = e.currentTarget
    if (!_jiggling.current.includes(target)) {
      _jiggling.current.push(target)
      setHasStarted(true)
    }
  }

  const stopJiggle = (e: any) => {
    _jiggling.current.splice(_jiggling.current.indexOf(e), 1)
  }

  if (props.disable) {
    return (
      <div
        className={props.className}
        style={props.style}
        onClick={props.onClick}
      >
        {props.children}
      </div>
    )
  } else {
    return (
      <JiggleAnimation
        reset
        native
        started={hasStarted}
        bounce={props.bounce ? props.bounce : false}
        onRest={stopJiggle}
      >
        {(animation: any) => (
          <animated.div
            id={props.id}
            className={props.className}
            style={props.style ? { ...animation, ...props.style } : animation}
            onMouseEnter={jiggle}
            onClick={props.onClick}
          >
            {props.children}
          </animated.div>
        )}
      </JiggleAnimation>
    )
  }
}

;(Jiggle as any).displayName = 'Jiggle'

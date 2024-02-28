import React, {
  type PropsWithChildren,
  useMemo,
  useState,
  CSSProperties,
  useCallback,
  useRef
} from 'react'
import { useSpring, animated } from '@react-spring/web'

interface JiggleAnimationProps {
  bounce: boolean
  id?: string
  className?: string
  style?: CSSProperties
}

function JiggleAnimation(props: PropsWithChildren<JiggleAnimationProps>) {
  const [toggleJiggle, setToggleJiggle] = useState<boolean>()
  const _canPlay = useRef<boolean>(true)

  const jiggle = useCallback(() => {
    if (_canPlay.current) {
      _canPlay.current = false
      setToggleJiggle((value) => (value == null ? true : !value))
    }
  }, [])

  const jiggleEnd = useCallback(() => {
    _canPlay.current = true
  }, [])

  const { bounce } = props
  const animation = useMemo(() => {
    const config = { duration: bounce ? 80 : 100 }
    const from = { transform: 'scale(1.0, 1.0)' }
    const jiggleX = { transform: 'scale(1.1, 0.9)', config }
    const jiggleY = { transform: 'scale(0.9, 1.1)', config }
    if (bounce) {
      from.transform += ' translate(0, 0)'
      jiggleX.transform += ' translate(0, -5px)'
      jiggleY.transform += ' translate(0, -5px)'
    }

    const to: object[] = [jiggleX, jiggleY, { ...from, config }]
    return { from, to, reset: true, onRest: jiggleEnd }
  }, [bounce, jiggleEnd])

  const style = useSpring(toggleJiggle != null ? animation : {})
  return (
    <animated.div
      id={props.id}
      className={props.className}
      style={props.style != null ? { ...style, ...props.style } : style}
      onMouseEnter={jiggle}
    >
      {props.children}
    </animated.div>
  )
}

export interface JiggleProps {
  bounce?: boolean
  id?: string
  className?: string
  style?: any
  disable?: boolean
}

export default function Jiggle(props: PropsWithChildren<JiggleProps>) {
  if (props.disable) {
    return (
      <div className={props.className} style={props.style}>
        {props.children}
      </div>
    )
  } else {
    return (
      <JiggleAnimation
        id={props.id}
        className={props.className}
        bounce={props.bounce ?? false}
      >
        {props.children}
      </JiggleAnimation>
    )
  }
}

;(Jiggle as any).displayName = 'Jiggle'

import React, { type PropsWithChildren, useState } from 'react'
import { animated, useSpring } from '@react-spring/web'

export default function VSpin(props: PropsWithChildren<any>) {
  const [toggle, setToggle] = useState(false)
  const toggleSpin = () => setToggle((value) => !value)

  const degrees = toggle ? 360 : 0
  const animation = useSpring({
    from: { transform: 'rotateX(0deg)' },
    to: { transform: `rotateX(${degrees}deg)` }
  })

  return (
    <animated.div style={animation} onMouseEnter={toggleSpin}>
      {props.children}
    </animated.div>
  )
}

;(VSpin as any).displayName = 'VSpin'

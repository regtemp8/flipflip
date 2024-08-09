import React, { type PropsWithChildren, useState } from 'react'
import { Spring, animated } from 'react-spring/renderprops'

export default function VSpin(props: PropsWithChildren<any>) {
  const [toggle, setToggle] = useState(false)

  return (
    <Spring
      from={{ transform: 'rotateX(0deg)' }}
      to={{
        transform: toggle ? 'rotateX(360deg)' : 'rotateX(0deg)'
      }}
    >
      {(animation) => (
        <animated.div
          style={animation}
          onMouseEnter={() => {
            setToggle(!toggle)
          }}
        >
          {props.children}
        </animated.div>
      )}
    </Spring>
  )
}

;(VSpin as any).displayName = 'VSpin'

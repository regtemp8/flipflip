import React, { type PropsWithChildren, useState } from 'react'
import { Spring, animated } from 'react-spring/renderprops'

export interface SpinProps {
  className?: string
  title?: string
  style?: any
  onClick?: () => void
}

export default function Spin(props: PropsWithChildren<SpinProps>) {
  const [toggle, setToggle] = useState(false)

  return (
    <Spring
      from={{ transform: 'rotateY(0deg)' }}
      to={{
        transform: toggle ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}
    >
      {(animation) => (
        <animated.div
          className={props.className}
          style={props.style ? { ...animation, ...props.style } : animation}
          title={props.title}
          onMouseEnter={() => {
            setToggle(!toggle)
          }}
          onClick={props.onClick}
        >
          <Spring
            from={{ transform: 'rotateY(0deg)' }}
            to={{
              transform: toggle ? 'rotateY(-180deg)' : 'rotateY(0deg)'
            }}
          >
            {(animation) => (
              <animated.div style={animation}>{props.children}</animated.div>
            )}
          </Spring>
        </animated.div>
      )}
    </Spring>
  )
}

;(Spin as any).displayName = 'Spin'

import React, { type PropsWithChildren } from 'react'
import { withIdleTimer } from 'react-idle-timer'

function IdleTimerComponent (props: PropsWithChildren<void>) {
  return <>{props.children}</>
}

export const IdleTimer = withIdleTimer(IdleTimerComponent as any)

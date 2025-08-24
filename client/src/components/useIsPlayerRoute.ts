import { useMemo } from 'react'
import { useLocation } from 'react-router'

export function useIsPlayerRoute() {
  const location = useLocation()
  return useMemo(() => location.pathname === '/player', [location.pathname])
}

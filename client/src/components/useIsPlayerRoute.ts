import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

export function useIsPlayerRoute() {
  const location = useLocation()
  const [isPlayer, setIsPlayer] = useState(false)

  useEffect(() => {
    const newIsPlayer = location.pathname === '/player'
    if (newIsPlayer !== isPlayer) {
      setIsPlayer(newIsPlayer)
    }
  }, [location.pathname])

  return isPlayer
}

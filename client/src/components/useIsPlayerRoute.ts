import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

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

import { createSelector } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import { PlayerOverlayState, PlayerState } from './slice'

export const selectPlayerState = (uuid?: string) => {
  return (state: RootState) => state.players[uuid ?? 'root']
}

export const selectPlayerSceneID = (uuid?: string) => {
  return (state: RootState) => state.players[uuid ?? 'root'].sceneID
}

export const selectPlayerMainLoaded = (uuid?: string) => {
  return (state: RootState) => state.players[uuid ?? 'root'].mainLoaded
}

export const selectPlayerFirstImageLoaded = (uuid?: string) => {
  return (state: RootState) => state.players[uuid ?? 'root'].firstImageLoaded
}

export const selectPlayerHasStarted = (uuid?: string) => {
  return (state: RootState) => state.players[uuid ?? 'root'].hasStarted
}

export const selectPlayerOverlaySceneID = (index: number, uuid?: string) => {
  return (state: RootState) => state.players[uuid ?? 'root'].overlays[index].sceneID
}

export const selectPlayerOverlayOpacity = (index: number, uuid?: string) => {
  return (state: RootState) => state.players[uuid ?? 'root'].overlays[index].opacity
}

export const selectPlayerOverlaysLoaded = (uuid?: string) => {
  return createSelector(
    [(state: RootState) => state.players[uuid ?? 'root'].overlays], 
    (overlays) => overlays.map((s) => s.loaded))
}

export const selectGridPlayerFirstNotLoaded = (index: number, parentUUID?: string) => {
  return createSelector(
    [(state: RootState) => state.players], 
    (players) => {
      console.log('parentUUID: ' + parentUUID)
      const overlay = players[parentUUID ?? 'root'].overlays[index]
      for(let r = 0; r < overlay.grid.length; r++) {
        const row = overlay.grid[r]
        for(let c = 0; c < row.length; c++) {
          const uuid = row[c]
          if(!players[uuid].mainLoaded) {
            return [r, c]
          }
        }
      }

      return [-1, -1]
    }
  )
}

export const selectGridPlayerAllLoaded = (index: number, parentUUID?: string) => {
  return createSelector(
    [(state: RootState) => state.players], 
    (players) => {
      const overlay = players[parentUUID ?? 'root'].overlays[index]
      return isGridLoaded(players, overlay.grid)
    }
  )
}

const isGridLoaded = (players: Record<string, PlayerState>, grid: string[][]) => {
  return grid.flatMap((row) => row).every((uuid) => players[uuid].mainLoaded)
}

export const selectPlayerCanStart = (uuid?: string) => {
  return (state: RootState) => {
    const player = state.players[uuid ?? 'root']
    return player.firstImageLoaded 
      || (!hasSources(state, player.sceneID) && isAtLeastOneOverlayLoaded(state, player.overlays)) 
  }
}

const hasSources = (state: RootState, sceneID: number) => {
  return state.scene.entries[sceneID].sources.length > 0
}

const isAtLeastOneOverlayLoaded = (state: RootState, overlays: PlayerOverlayState[]) => {
  return overlays.length > 0 && (overlays.find((o) => o.loaded) != null || isAtLeastOneGridCellLoaded(state, overlays))
}

const isAtLeastOneGridCellLoaded = (state: RootState, overlays: PlayerOverlayState[]) => {
  return overlays
    .filter((o) => o.isGrid)
    .flatMap((o) => o.grid)
    .flatMap((arr) => arr)
    .map((uuid) => state.players[uuid])
    .find((p) => p.firstImageLoaded) != null
}

export const selectPlayerCaptcha = (uuid?: string) => {
  return (state: RootState) => state.players[uuid ?? 'root'].captcha
}
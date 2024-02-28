import { createSelector } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import { PlayerOverlayState, PlayerState } from './slice'

export const selectPlayerState = (uuid: string) => {
  return (state: RootState) => state.players[uuid]
}

export const selectPlayerSceneID = (uuid: string) => {
  return (state: RootState) => state.players[uuid].sceneID
}

export const selectPlayerMainLoaded = (uuid: string) => {
  return (state: RootState) => state.players[uuid].mainLoaded
}

export const selectPlayerFirstImageLoaded = (uuid: string) => {
  return (state: RootState) => state.players[uuid].firstImageLoaded
}

export const selectPlayerHasStarted = (uuid: string) => {
  return (state: RootState) => state.players[uuid].hasStarted
}

export const selectPlayerOverlaySceneID = (index: number, uuid: string) => {
  return (state: RootState) => state.players[uuid].overlays[index].sceneID
}

export const selectPlayerOverlayOpacity = (index: number, uuid: string) => {
  return (state: RootState) => state.players[uuid].overlays[index].opacity
}

export const selectPlayerOverlaysLoaded = (uuid: string) => {
  return createSelector(
    [(state: RootState) => state.players[uuid].overlays],
    (overlays) => overlays.map((s) => s.loaded)
  )
}

export const selectGridPlayerFirstNotLoaded = (
  index: number,
  parentUUID: string
) => {
  return createSelector([(state: RootState) => state.players], (players) => {
    const overlay = players[parentUUID].overlays[index]
    for (let r = 0; r < overlay.grid.length; r++) {
      const row = overlay.grid[r]
      for (let c = 0; c < row.length; c++) {
        const uuid = row[c]
        if (!players[uuid].mainLoaded) {
          return [r, c]
        }
      }
    }

    return [-1, -1]
  })
}

export const selectGridPlayerAllLoaded = (
  index: number,
  parentUUID: string
) => {
  return createSelector([(state: RootState) => state.players], (players) => {
    const overlay = players[parentUUID].overlays[index]
    return isGridLoaded(players, overlay.grid)
  })
}

const isGridLoaded = (
  players: Record<string, PlayerState>,
  grid: string[][]
) => {
  return grid.flatMap((row) => row).every((uuid) => players[uuid].mainLoaded)
}

export const selectPlayerCanStart = (uuid: string) => {
  return (state: RootState) => {
    const player = state.players[uuid]
    return (
      player.firstImageLoaded ||
      (!hasSources(state, player.sceneID as number) &&
        isAtLeastOneOverlayLoaded(state, player.overlays))
    )
  }
}

const hasSources = (state: RootState, sceneID: number) => {
  return state.scene.entries[sceneID].sources.length > 0
}

const isAtLeastOneOverlayLoaded = (
  state: RootState,
  overlays: PlayerOverlayState[]
) => {
  return (
    overlays.length > 0 &&
    (overlays.find((o) => o.loaded) != null ||
      isAtLeastOneGridCellLoaded(state, overlays))
  )
}

const isAtLeastOneGridCellLoaded = (
  state: RootState,
  overlays: PlayerOverlayState[]
) => {
  return (
    overlays
      .filter((o) => o.isGrid)
      .flatMap((o) => o.grid)
      .flatMap((arr) => arr)
      .map((uuid) => state.players[uuid])
      .find((p) => p.firstImageLoaded) != null
  )
}

export const selectPlayerCaptcha = (uuid: string) => {
  return (state: RootState) => state.players[uuid].captcha
}

export const selectPlayerImageViews = (uuid: string, overlayIndex?: number) => {
  return (state: RootState) => {
    const player =
      overlayIndex != null
        ? state.players[uuid].overlays[overlayIndex]
        : state.players[uuid]
    return player.loader.imageViews
  }
}

export const selectPlayerNextSceneID = (uuid: string) => {
  return (state: RootState) => state.players[uuid].nextSceneID
}

export const selectPlayerIsEmpty = (uuid: string) => {
  return (state: RootState) => state.players[uuid].isEmpty
}

export const selectPlayerOverlays = (uuid: string) => {
  return createSelector(
    [(state: RootState) => state.players[uuid].overlays],
    (overlays) => {
      return overlays.map((o) => {
        const gridSize = o.isGrid ? o.grid[0].length * o.grid.length : 0
        const opacity = o.show ? o.opacity : 0
        return { opacity, isGrid: o.isGrid, gridSize }
      })
    }
  )
}

export const selectPlayerOverlayGrid = (overlayIndex: number, uuid: string) => {
  return (state: RootState) => state.players[uuid].overlays[overlayIndex].grid
}

import { createSelector } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import { selectDisplayViews } from '../display/selectors'
import { getDisplayViewEntries } from '../displayView/selectors'
import { PlayersState } from './slice'

export const getPlayerEntries = (state: RootState): PlayersState =>
  state.players

export const selectPlayerState = (uuid: string) => {
  return (state: RootState) => state.players[uuid]
}

export const selectPlayerSceneID = (uuid: string) => {
  return (state: RootState) => {
    const { playlist } = state.players[uuid]
    return playlist.items[playlist.player.index].sceneID
  }
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

export const selectPlayerCaptcha = (uuid: string) => {
  return (state: RootState) => state.players[uuid].captcha
}

export const selectPlayerImageViews = (uuid: string) => {
  return (state: RootState) => {
    return state.players[uuid].loader.imageViews
  }
}

export const selectPlayerIsEmpty = (uuid: string) => {
  return (state: RootState) => state.players[uuid].isEmpty
}

export const selectPlayerPlaylistPlayerSceneID = (uuid: string) => {
  return (state: RootState) => {
    const { playlist } = state.players[uuid]
    return playlist.items[playlist.player.index].sceneID
  }
}

export const selectDisplayHasStarted = (displayID: number) => {
  return createSelector(
    [selectDisplayViews(displayID), getDisplayViewEntries, getPlayerEntries],
    (views, viewEntries, playerEntries) => {
      const loading = views
        .filter((viewID) => {
          const view = viewEntries[viewID]
          return view.visible && !view.sync
        })
        .map((viewID) => viewEntries[viewID].playerUUID)
        .filter((playerUUID) => playerUUID != null)
        .map((playerUUID) => playerEntries[playerUUID as string].hasStarted)
        .includes(false)

      return !loading
    }
  )
}

export const selectDisplayCanStart = (id: number) => {
  return (state: RootState) => {
    return state.display.entries[id].views
      .map((id) => state.displayView.entries[id])
      .filter((view) => view.visible && !view.sync)
      .map((view) => view.playerUUID as string)
      .every((uuid) => {
        const { firstImageLoaded, playlist, loader } = state.players[uuid]
        return (
          loader.onlyIframes ||
          (firstImageLoaded &&
            (playlist.loader.index > 0 || loader.readyToLoad.length === 0))
        )
      })
  }
}

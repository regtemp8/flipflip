import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'

export const selectImagePlayerHasStarted = (uuid: string) => {
  return (state: RootState) => {
    return state.imagePlayer[uuid]?.hasStarted === true
  }
}

export const selectImagePlayerCurrentSceneID = (uuid: string) => {
  return (state: RootState) => {
    return state.imagePlayer[uuid]?.currentSceneID
  }
}

export const selectImagePlayerImageViews = (uuid: string) => {
  return (state: RootState) => {
    return state.imagePlayer[uuid]?.loader?.imageViews ?? []
  }
}

export const selectPlayerHasStarted = () =>
  createSelector([(state: RootState) => state.imagePlayer], (imagePlayer) =>
    Object.values(imagePlayer).every((value) => value.hasStarted)
  )

export const selectPlayerIsPlaying = () =>
  createSelector([(state: RootState) => state.imagePlayer], (imagePlayer) =>
    Object.values(imagePlayer).every((value) => value.isPlaying)
  )

export const selectPlayerCanStart = () =>
  createSelector([(state: RootState) => state.imagePlayer], (imagePlayer) =>
    Object.values(imagePlayer).every((value) => {
      const { firstImageLoaded, hasStarted } = value
      return !hasStarted && firstImageLoaded
    })
  )

export const selectPlayerProgress = () =>
  createSelector([(state: RootState) => state.imagePlayer], (imagePlayer) => {
    let total = 0
    let current = 0
    Object.values(imagePlayer).forEach((player) => {
      total += player.loader.maxCanLoad
      Object.values(player.readyToDisplay).forEach(
        (ready) => (current += ready.length)
      )
    })

    return { total, current }
  })

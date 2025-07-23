import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"

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
  createSelector(
    [(state: RootState) => state.imagePlayer],
    (imagePlayer) => Object.values(imagePlayer).every((value) => value.hasStarted)
  )

export const selectPlayerCanStart = () =>
  createSelector(
    [(state: RootState) => state.imagePlayer],
    (imagePlayer) => Object.values(imagePlayer).every((value) => {
        const { firstImageLoaded, hasStarted, loader } = value
        return !hasStarted && firstImageLoaded && loader.readyToLoad.length === 0
    })
  )

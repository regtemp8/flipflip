import { RootState } from "../store"

export const selectDisplayHasStarted = () => {
  return (state: RootState) => {
    return Object.entries(state.imagePlayer).every(([_key, value]) => value.hasStarted)
  }
}

export const selectDisplayCanStart = () => {
  return (state: RootState) => {
    return Object.entries(state.imagePlayer).every(([_key, value]) => {
        const { firstImageLoaded, playlist, loader } = value
        return firstImageLoaded && (playlist.loader.index > 0 || loader.readyToLoad.length === 0)
    })
  }
}

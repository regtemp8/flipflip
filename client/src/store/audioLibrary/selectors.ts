import { type RootState } from '../store'

export const selectAudioLibraryYOffset = () => {
  return (state: RootState) => state.audioLibrary.yOffset
}

export const selectAudioLibraryFilters = () => {
  return (state: RootState) => state.audioLibrary.filters
}

export const selectAudioLibraryIsLastSelected = (audioID: number) => {
  return (state: RootState) => state.audioLibrary.lastSelected === audioID
}

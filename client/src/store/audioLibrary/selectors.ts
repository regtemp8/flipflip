import { type RootState } from '../store'

export const selectAudioLibraryYOffset = () => {
  return (state: RootState) => state.audioLibrary.yOffset
}

export const selectAudioLibraryFilters = () => {
  return (state: RootState) => state.audioLibrary.filters
}

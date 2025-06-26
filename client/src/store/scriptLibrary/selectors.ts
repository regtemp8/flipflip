import { type RootState } from '../store'

export const selectScriptLibraryYOffset = () => {
  return (state: RootState) => state.scriptLibrary.yOffset
}

export const selectScriptLibraryFilters = () => {
  return (state: RootState) => state.scriptLibrary.filters
}

export const selectScriptLibraryIsLastSelected = (scriptID: number) => {
  return (state: RootState) => state.scriptLibrary.lastSelected === scriptID
}

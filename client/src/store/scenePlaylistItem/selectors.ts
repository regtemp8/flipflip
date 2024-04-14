import { getEntry } from '../EntryState'
import { RootState } from '../store'

export const selectScenePlaylistItem = (id: number) => {
  return (state: RootState) => getEntry(state.scenePlaylistItem, id)
}

export const selectScenePlaylistItemSceneID = (id: number) => {
  return (state: RootState) => getEntry(state.scenePlaylistItem, id).sceneID
}

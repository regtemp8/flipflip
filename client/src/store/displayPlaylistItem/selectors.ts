import { getEntry } from '../EntryState'
import { RootState } from '../store'

export const selectDisplayPlaylistItem = (id: number) => {
  return (state: RootState) => getEntry(state.displayPlaylistItem, id)
}

export const selectDisplayPlaylistItemDisplayID = (id: number) => {
  return (state: RootState) => getEntry(state.displayPlaylistItem, id).displayID
}

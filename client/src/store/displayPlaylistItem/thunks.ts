import { AppDispatch, RootState } from '../store'
import { DisplayPlaylistItem } from './DisplayPlaylistItem'
import { setDisplayPlaylistItem } from './slice'
import { setPlaylistAddItems } from '../playlist/slice'

export function addToPlaylist(playlistID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const id = state.displayPlaylistItem.nextID
    const item: DisplayPlaylistItem = {
      id,
      displayID: 0,
      duration: 90000,
      randomDisplays: []
    }
    dispatch(setDisplayPlaylistItem(item))
    dispatch(setPlaylistAddItems({ id: playlistID, value: [id] }))
  }
}

import { PLT } from 'flipflip-common'
import { addPlaylist } from '../playlist/thunks'
import { AppDispatch, RootState } from '../store'
import { setDisplayViewScenePlaylistID } from './slice'

export function createScenePlaylist(id: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const value = dispatch(addPlaylist(PLT.scene))
    dispatch(setDisplayViewScenePlaylistID({ id, value }))
  }
}

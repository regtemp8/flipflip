import { AppDispatch, RootState } from '../store'
import { ScenePlaylistItem } from './ScenePlaylistItem'
import { setScenePlaylistItem } from './slice'
import { setPlaylistAddItems } from '../playlist/slice'

export function addToPlaylist(playlistID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const id = state.scenePlaylistItem.nextID
    const scene = state.app.config.defaultScene
    const sceneID = scene.nextSceneID
    const duration = scene.nextSceneTime
    const randomScenes = scene.nextSceneRandoms
    const playAfterAllImages = scene.nextSceneAllImages
    const item: ScenePlaylistItem = {
      id,
      sceneID,
      duration,
      randomScenes,
      playAfterAllImages
    }
    dispatch(setScenePlaylistItem(item))
    dispatch(setPlaylistAddItems({ id: playlistID, value: [id] }))
  }
}

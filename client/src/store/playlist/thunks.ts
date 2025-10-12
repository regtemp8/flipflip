import {
  PLT,
  SCENE_DURATION,
  SCENE_NONE,
  SCENE_RANDOM,
  ScenePlaylistItem
} from 'flipflip-common'
import { AppDispatch, RootState } from '../store'
import {
  ScenePlaylistItemEditDialog,
  setScenePlaylistItemEditDialog
} from './slice'
import { flipflipApi } from '../api/slice'
import { updatePlaylistItem } from '../api/thunks'

export const showScenePlaylistItemEditDialog = (
  playlistID: number,
  item?: ScenePlaylistItem
) => {
  return (dispatch: AppDispatch) => {
    const data = {
      playlistID,
      itemID: item?.id,
      sceneID: item?.sceneID ?? SCENE_NONE,
      randomScenes: item?.randomScenes ?? [],
      duration: item?.duration ?? SCENE_DURATION,
      playAfterAllImages: item?.playAfterAllImages ?? false
    }

    dispatch(setScenePlaylistItemEditDialog(data))
  }
}

export const saveScenePlaylistItemEditDialog = () => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const data = state.playlist
      .scenePlaylistItemEditDialog as ScenePlaylistItemEditDialog

    const { itemID, playlistID, sceneID, duration, playAfterAllImages } = data
    const randomScenes = sceneID === SCENE_RANDOM ? data.randomScenes : []
    if (itemID == null) {
      const item = {
        id: playlistID,
        type: PLT.scene,
        index: 0,
        sceneID,
        randomScenes,
        duration,
        playAfterAllImages
      }

      dispatch(flipflipApi.endpoints.createPlaylistItem.initiate(item))
    } else {
      const item = {
        playlistID,
        itemID,
        sceneID,
        randomScenes,
        duration,
        playAfterAllImages
      }

      dispatch(updatePlaylistItem(item))
    }

    dispatch(setScenePlaylistItemEditDialog(undefined))
  }
}

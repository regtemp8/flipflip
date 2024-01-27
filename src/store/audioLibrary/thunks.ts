import { type AppDispatch, type RootState } from '../store'
import { MO, SP } from '../../renderer/data/const'
import {
  setOpenMenu,
  setPlaylistID,
  setDrawerOpen,
  setImportURL,
  setSelectedTags
} from './slice'
import { setPlaylistAddAudios } from '../playlist/slice'
import {
  setAudioSelected,
  batchEdit,
  batchTag,
  addToPlaylist
} from '../app/slice'
import { setRouteGoBack } from '../app/thunks'

export function changePlaylistId (playlistID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    if (playlistID === -1) {
      dispatch(setOpenMenu(MO.newPlaylist))
    } else {
      // Check to see if playlist already has any of these tracks
      const state = getState()
      const playlist = state.playlist.entries[playlistID]
      for (const id of state.app.audioSelected) {
        if (playlist.audios.includes(id)) {
          // If so, show alert before adding to playlist
          dispatch(setOpenMenu(MO.playlistDuplicates))
          dispatch(setPlaylistID(playlistID))
          return
        }
      }

      // Otherwise, add tracks to playlist
      dispatch(
        setPlaylistAddAudios({ id: playlistID, value: state.app.audioSelected })
      )
      dispatch(goBack())
      dispatch(closeDialog())
    }
  }
}

export function closeDialog () {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(setOpenMenu(undefined))
    dispatch(setDrawerOpen(false))
    dispatch(setImportURL(undefined))
    dispatch(setPlaylistID(undefined))
  }
}

export function goBack () {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const specialMode = getState().app.specialMode
    if (specialMode === SP.batchTag) {
      dispatch(setAudioSelected([]))
      dispatch(setSelectedTags([]))
      dispatch(batchTag())
    } else if (specialMode === SP.batchEdit) {
      dispatch(setAudioSelected([]))
      dispatch(setSelectedTags([]))
      dispatch(batchEdit())
    } else if (specialMode === SP.addToPlaylist) {
      dispatch(setAudioSelected([]))
      dispatch(setSelectedTags([]))
      dispatch(addToPlaylist())
    } else {
      dispatch(setRouteGoBack())
    }
  }
}

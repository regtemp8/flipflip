import { type AppDispatch, type RootState } from '../store'
import { MO, PLT, SP } from 'flipflip-common'
import {
  setOpenMenu,
  setPlaylistID,
  setDrawerOpen,
  setImportURL,
  setSelectedTags,
  setAudioLibraryPlaylistID
} from './slice'
import { setPlaylistAddItems } from '../playlist/slice'
import {
  setAudioSelected,
  batchEdit,
  batchTag,
  addToPlaylist
} from '../app/slice'
import { setRouteGoBack } from '../app/thunks'
import { addPlaylist } from '../playlist/thunks'

export function changePlaylistId(playlistID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    if (playlistID === -1) {
      dispatch(setOpenMenu(MO.newPlaylist))
    } else {
      // Check to see if playlist already has any of these tracks
      const state = getState()
      const playlist = state.playlist.entries[playlistID]
      for (const id of state.app.audioSelected) {
        if (playlist.items.includes(id)) {
          // If so, show alert before adding to playlist
          dispatch(setOpenMenu(MO.playlistDuplicates))
          dispatch(setPlaylistID(playlistID))
          return
        }
      }

      // Otherwise, add tracks to playlist
      dispatch(
        setPlaylistAddItems({ id: playlistID, value: state.app.audioSelected })
      )
      dispatch(goBack())
      dispatch(closeDialog())
    }
  }
}

export function closeDialog() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(setOpenMenu(undefined))
    dispatch(setDrawerOpen(false))
    dispatch(setImportURL(undefined))
    dispatch(setPlaylistID(undefined))
  }
}

export function goBack() {
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

export function createAudioLibraryPlaylist() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const value = dispatch(addPlaylist(PLT.audio))
    dispatch(setAudioLibraryPlaylistID(value.toString()))
  }
}

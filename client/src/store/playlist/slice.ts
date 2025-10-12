import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { flipflipApi } from '../api/slice'

export interface ScenePlaylistItemEditDialog {
  playlistID: number
  itemID?: number
  sceneID: number
  randomScenes: number[]
  duration: number
  playAfterAllImages: boolean
}

interface PlaylistState {
  autoEdit: boolean
  editingName?: string
  scenePlaylistItemEditDialog?: ScenePlaylistItemEditDialog
}

export const initialState: PlaylistState = {
  autoEdit: false
}
export const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setPlaylistEditingName: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.editingName = action.payload
    },
    setScenePlaylistItemEditDialog: (
      state,
      action: PayloadAction<ScenePlaylistItemEditDialog | undefined>
    ) => {
      state.scenePlaylistItemEditDialog = action.payload
    },
    setScenePlaylistItemEditDialogScene: (
      state,
      action: PayloadAction<number>
    ) => {
      if (state.scenePlaylistItemEditDialog != null) {
        state.scenePlaylistItemEditDialog.sceneID = action.payload
      }
    },
    setScenePlaylistItemEditDialogRandomScenes: (
      state,
      action: PayloadAction<number[]>
    ) => {
      if (state.scenePlaylistItemEditDialog != null) {
        state.scenePlaylistItemEditDialog.randomScenes = action.payload
      }
    },
    setScenePlaylistItemEditDialogDuration: (
      state,
      action: PayloadAction<number>
    ) => {
      if (state.scenePlaylistItemEditDialog != null) {
        state.scenePlaylistItemEditDialog.duration = action.payload
      }
    },
    setScenePlaylistItemEditDialogPlayAfterAllImages: (
      state,
      action: PayloadAction<boolean>
    ) => {
      if (state.scenePlaylistItemEditDialog != null) {
        state.scenePlaylistItemEditDialog.playAfterAllImages = action.payload
      }
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      flipflipApi.endpoints.createPlaylist.matchFulfilled,
      (state) => {
        state.autoEdit = true
      }
    )
    builder.addMatcher(
      flipflipApi.endpoints.clonePlaylist.matchFulfilled,
      (state) => {
        state.autoEdit = true
      }
    )
    builder.addMatcher(
      flipflipApi.endpoints.getPlaylist.matchFulfilled,
      (state, action) => {
        if (state.autoEdit) {
          state.autoEdit = false
          state.editingName = action.payload.name
        }
      }
    )
  }
})

export const {
  setPlaylistEditingName,
  setScenePlaylistItemEditDialog,
  setScenePlaylistItemEditDialogScene,
  setScenePlaylistItemEditDialogRandomScenes,
  setScenePlaylistItemEditDialogDuration,
  setScenePlaylistItemEditDialogPlayAfterAllImages
} = playlistSlice.actions

export default playlistSlice.reducer

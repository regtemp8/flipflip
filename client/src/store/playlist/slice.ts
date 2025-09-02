import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { flipflipApi } from '../api/slice'

interface PlaylistState {
  autoEdit: boolean
  editingName?: string
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

export const { setPlaylistEditingName } = playlistSlice.actions

export default playlistSlice.reducer

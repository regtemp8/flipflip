import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type Playlist from './Playlist'
import {
  type EntryState,
  type EntryUpdate,
  setEntrySlice,
  setEntry
} from '../EntryState'

export const initialPlaylistState: EntryState<Playlist> = {
  name: 'playlistSlice',
  nextID: 1,
  entries: {}
}
export const playlistSlice = createSlice({
  name: 'playlists',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialPlaylistState,
  reducers: {
    setPlaylistSlice: (state, action: PayloadAction<EntryState<Playlist>>) => {
      setEntrySlice(state, action.payload)
    },
    setPlaylist: (state, action: PayloadAction<Playlist>) => {
      setEntry(state, action.payload)
    },
    setPlaylistAudios: (
      state,
      action: PayloadAction<EntryUpdate<number[]>>
    ) => {
      state.entries[action.payload.id].audios = action.payload.value
    },
    setPlaylistAddAudios: (
      state,
      action: PayloadAction<EntryUpdate<number[]>>
    ) => {
      state.entries[action.payload.id].audios.push(...action.payload.value)
    },
    setPlaylistAddAudiosUnique: (
      state,
      action: PayloadAction<EntryUpdate<number[]>>
    ) => {
      const audios = state.entries[action.payload.id].audios
      action.payload.value
        .filter((id) => !audios.includes(id))
        .forEach((id) => audios.push(id))
    }
  }
})

export const {
  setPlaylistSlice,
  setPlaylist,
  setPlaylistAudios,
  setPlaylistAddAudios,
  setPlaylistAddAudiosUnique
} = playlistSlice.actions

export default playlistSlice.reducer

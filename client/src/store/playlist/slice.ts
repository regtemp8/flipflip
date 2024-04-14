import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  deleteEntry,
  EntryState,
  EntryUpdate,
  getEntry,
  setEntry
} from '../EntryState'
import Playlist from './Playlist'
import { RP } from 'flipflip-common'
import { arrayMove } from '../../data/utils'

export const initialPlaylistState: EntryState<Playlist> = {
  name: 'playlistSlice',
  nextID: 1,
  entries: {}
}

export default function createPlaylistReducer(
  playlistState?: EntryState<Playlist>
) {
  return createPlaylistSlice(playlistState).reducer
}

function createPlaylistSlice(playlistState?: EntryState<Playlist>) {
  const initialState = playlistState ?? initialPlaylistState
  return createSlice({
    name: 'playlists',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setPlaylistSlice: (
        state,
        action: PayloadAction<EntryState<Playlist>>
      ) => {
        return action.payload
      },
      setPlaylist: (state, action: PayloadAction<Playlist>) => {
        setEntry(state, action.payload)
      },
      deletePlaylist: (state, action: PayloadAction<number>) => {
        deleteEntry(state, action.payload)
      },
      setPlaylistName: (state, action: PayloadAction<EntryUpdate<string>>) => {
        const { id, value } = action.payload
        getEntry(state, id).name = value
      },
      setPlaylistItems: (
        state,
        action: PayloadAction<EntryUpdate<number[]>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).items = value
      },
      setPlaylistAddItems: (
        state,
        action: PayloadAction<EntryUpdate<number[]>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).items.push(...value)
      },
      setPlaylistAddItemsUnique: (
        state,
        action: PayloadAction<EntryUpdate<number[]>>
      ) => {
        const { id, value } = action.payload
        const entry = getEntry(state, id)
        for (const item of value) {
          if (entry.items.indexOf(item) === -1) {
            entry.items.push(item)
          }
        }
      },
      setPlaylistToggleShuffle: (state, action: PayloadAction<number>) => {
        const playlist = getEntry(state, action.payload)
        playlist.shuffle = !playlist.shuffle
      },
      setPlaylistChangeRepeat: (state, action: PayloadAction<number>) => {
        const playlist = getEntry(state, action.payload)
        switch (playlist.repeat) {
          case RP.all:
            playlist.repeat = RP.one
            break
          case RP.one:
            playlist.repeat = RP.none
            break
          case RP.none:
            playlist.repeat = RP.all
            break
        }
      },
      setPlaylistRemoveItem: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const { id, value } = action.payload
        const playlist = getEntry(state, id)
        playlist.items.splice(value, 1)
      },
      setPlaylistSortItems: (
        state,
        action: PayloadAction<
          EntryUpdate<{ oldIndex: number; newIndex: number }>
        >
      ) => {
        const { id, value } = action.payload
        const playlist = getEntry(state, id)
        arrayMove(playlist.items, value.oldIndex, value.newIndex)
      }
    }
  })
}

export const {
  setPlaylistSlice,
  setPlaylist,
  deletePlaylist,
  setPlaylistName,
  setPlaylistItems,
  setPlaylistAddItems,
  setPlaylistAddItemsUnique,
  setPlaylistToggleShuffle,
  setPlaylistChangeRepeat,
  setPlaylistRemoveItem,
  setPlaylistSortItems
} = createPlaylistSlice().actions

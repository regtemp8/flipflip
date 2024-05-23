import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { EntryState, setEntry } from '../EntryState'
import { DisplayPlaylistItem } from './DisplayPlaylistItem'

export const initialDisplayPlaylistItemState: EntryState<DisplayPlaylistItem> =
  {
    name: 'displayPlaylistItemSlice',
    nextID: 1,
    entries: {}
  }

export default function createDisplayPlaylistItemReducer(
  displayPlaylistItemState?: EntryState<DisplayPlaylistItem>
) {
  return createDisplayPlaylistItemSlice(displayPlaylistItemState).reducer
}

function createDisplayPlaylistItemSlice(
  displayPlaylistItemState?: EntryState<DisplayPlaylistItem>
) {
  const initialState =
    displayPlaylistItemState ?? initialDisplayPlaylistItemState
  return createSlice({
    name: 'displayPlaylistItems',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setDisplayPlaylistItemSlice: (
        state,
        action: PayloadAction<EntryState<DisplayPlaylistItem>>
      ) => {
        return action.payload
      },
      setDisplayPlaylistItem: (
        state,
        action: PayloadAction<DisplayPlaylistItem>
      ) => {
        setEntry(state, action.payload)
      }
    }
  })
}

export const { setDisplayPlaylistItemSlice, setDisplayPlaylistItem } =
  createDisplayPlaylistItemSlice().actions

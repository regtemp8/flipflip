import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  setEntry,
  type EntryState,
  EntryUpdate,
  getEntry,
  deleteEntry
} from '../EntryState'
import View from './View'

export const initialDisplayViewState: EntryState<View> = {
  name: 'displayViewSlice',
  nextID: 1,
  entries: {}
}

export default function createDisplayViewReducer(
  displayViewState?: EntryState<View>
) {
  return createDisplaySlice(displayViewState).reducer
}

function createDisplaySlice(displayViewState?: EntryState<View>) {
  const initialState = displayViewState ?? initialDisplayViewState
  return createSlice({
    name: 'displayViews',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setDisplayViewSlice: (state, action: PayloadAction<EntryState<View>>) => {
        return action.payload
      },
      setDisplayView: (state, action: PayloadAction<View>) => {
        setEntry(state, action.payload)
      },
      deleteDisplayViews: (state, action: PayloadAction<number[]>) => {
        action.payload.forEach((id) => deleteEntry(state, id))
      },
      deleteDisplayView: (state, action: PayloadAction<number>) => {
        deleteEntry(state, action.payload)
      },
      resetDisplayViewPlaylistID: (state, action: PayloadAction<number[]>) => {
        action.payload.forEach((id) => (state.entries[id].playlistID = 0))
      },
      setDisplayViewName: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).name = value
      },
      setDisplayViewX: (state, action: PayloadAction<EntryUpdate<number>>) => {
        const { id, value } = action.payload
        getEntry(state, id).x = value
      },
      setDisplayViewY: (state, action: PayloadAction<EntryUpdate<number>>) => {
        const { id, value } = action.payload
        getEntry(state, id).y = value
      },
      setDisplayViewZ: (state, action: PayloadAction<EntryUpdate<number>>) => {
        const { id, value } = action.payload
        getEntry(state, id).z = value
      },
      setDisplayViewWidth: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).width = value
      },
      setDisplayViewHeight: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).height = value
      },
      setDisplayViewColor: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).color = value
      },
      setDisplayViewOpacity: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).opacity = value
      },
      setDisplayViewVisible: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).visible = value
      },
      setDisplayViewSync: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).sync = value
      },
      setDisplayViewSyncWithView: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).syncWithView = value
      },
      setDisplayViewMirrorSyncedView: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).mirrorSyncedView = value
      },
      setDisplayViewScenePlaylistID: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).playlistID = value
      },
      setDisplayViewPlayerUUID: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).playerUUID = value
      }
    }
  })
}

export const {
  setDisplayViewSlice,
  setDisplayView,
  deleteDisplayViews,
  deleteDisplayView,
  resetDisplayViewPlaylistID,
  setDisplayViewName,
  setDisplayViewX,
  setDisplayViewY,
  setDisplayViewZ,
  setDisplayViewWidth,
  setDisplayViewHeight,
  setDisplayViewColor,
  setDisplayViewOpacity,
  setDisplayViewVisible,
  setDisplayViewSync,
  setDisplayViewSyncWithView,
  setDisplayViewMirrorSyncedView,
  setDisplayViewScenePlaylistID,
  setDisplayViewPlayerUUID
} = createDisplaySlice().actions

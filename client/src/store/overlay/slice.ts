import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type Overlay from './Overlay'
import { newOverlay } from './Overlay'
import { getOverlay } from './selectors'
import {
  type EntryState,
  type EntryUpdate,
  createEntry,
  deleteEntry,
  setEntry,
  setEntrySlice
} from '../EntryState'

export const initialOverlayState: EntryState<Overlay> = {
  name: 'overlaySlice',
  nextID: 1,
  entries: {}
}
export const overlaySlice = createSlice({
  name: 'overlays',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialOverlayState,
  reducers: {
    setOverlaySlice: (state, action: PayloadAction<EntryState<Overlay>>) => {
      setEntrySlice(state, action.payload)
    },
    setOverlay: (state, action: PayloadAction<Overlay>) => {
      setEntry(state, action.payload)
    },
    createOverlay: (state, action: PayloadAction<number>) => {
      createEntry(state, newOverlay({ id: action.payload }))
    },
    deleteOverlay: (state, action: PayloadAction<number>) => {
      deleteEntry(state, action.payload)
    },
    setOverlayOpacity: (state, action: PayloadAction<EntryUpdate<number>>) => {
      getOverlay(state, action.payload.id).opacity = action.payload.value
    },
    setOverlaySceneID: (state, action: PayloadAction<EntryUpdate<number>>) => {
      getOverlay(state, action.payload.id).sceneID = action.payload.value
    }
  }
})

export const setOverlayOpacity = (id: number) => (value: number) =>
  overlaySlice.actions.setOverlayOpacity({ id, value })

export const {
  setOverlaySlice,
  setOverlay,
  createOverlay,
  deleteOverlay,
  setOverlaySceneID
} = overlaySlice.actions

export default overlaySlice.reducer

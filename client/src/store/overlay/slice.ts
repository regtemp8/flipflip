import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type Overlay from './Overlay'
import { newOverlay } from './Overlay'
import {
  type EntryState,
  type EntryUpdate,
  createEntry,
  deleteEntry,
  getEntry,
  setEntry
} from '../EntryState'

export const initialOverlayState: EntryState<Overlay> = {
  name: 'overlaySlice',
  nextID: 1,
  entries: {}
}

export default function createOverlayReducer(
  overlayState?: EntryState<Overlay>
) {
  return createOverlaySlice(overlayState).reducer
}

function createOverlaySlice(overlayState?: EntryState<Overlay>) {
  const initialState = overlayState ?? initialOverlayState
  return createSlice({
    name: 'overlays',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setOverlaySlice: (state, action: PayloadAction<EntryState<Overlay>>) => {
        return action.payload
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
      setOverlayOpacity: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).opacity = action.payload.value
      },
      setOverlaySceneID: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).sceneID = action.payload.value
      }
    }
  })
}

const slice = createOverlaySlice()
export const setOverlayOpacity = (id: number) => (value: number) =>
  slice.actions.setOverlayOpacity({ id, value })

export const {
  setOverlaySlice,
  setOverlay,
  createOverlay,
  deleteOverlay,
  setOverlaySceneID
} = slice.actions

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type Display from './Display'
import {
  setEntry,
  type EntryState,
  EntryUpdate,
  getEntry,
  deleteEntry
} from '../EntryState'

export interface DisplayViewUpdate<T> extends EntryUpdate<T> {
  index: number
}

export const initialDisplayState: EntryState<Display> = {
  name: 'displaySlice',
  nextID: 1,
  entries: {}
}

export default function createDisplayReducer(
  displayState?: EntryState<Display>
) {
  return createDisplaySlice(displayState).reducer
}

function createDisplaySlice(displayState?: EntryState<Display>) {
  const initialState = displayState ?? initialDisplayState
  return createSlice({
    name: 'displays',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setDisplaySlice: (state, action: PayloadAction<EntryState<Display>>) => {
        return action.payload
      },
      setDisplay: (state, action: PayloadAction<Display>) => {
        setEntry(state, action.payload)
      },
      deleteDisplay: (state, action: PayloadAction<number>) => {
        deleteEntry(state, action.payload)
      },
      setDisplayName: (state, action: PayloadAction<EntryUpdate<string>>) => {
        const { id, value } = action.payload
        getEntry(state, id).name = value
      },
      setDisplayAddView: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const { id, value } = action.payload
        const entry = getEntry(state, id)
        entry.views.unshift(value)
        entry.selectedView = value
      },
      setDisplayRemoveView: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const { id, value } = action.payload
        const entry = getEntry(state, id)
        const index = entry.views.indexOf(value)
        entry.views.splice(index, 1)
        entry.selectedView =
          entry.views[Math.min(index, entry.views.length - 1)]
      },
      setDisplayViewsListYOffset: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).displayViewsListYOffset = value
      },
      setDisplaySelectedView: (
        state,
        action: PayloadAction<EntryUpdate<number | undefined>>
      ) => {
        const { id, value } = action.payload
        getEntry(state, id).selectedView = value
      },
      swapDisplayViews: (
        state,
        action: PayloadAction<EntryUpdate<number[]>>
      ) => {
        const { id, value } = action.payload
        const entry = getEntry(state, id)
        const oldID = entry.views[value[0]]
        entry.views[value[0]] = entry.views[value[1]]
        entry.views[value[1]] = oldID
      }
    }
  })
}

export const {
  setDisplaySlice,
  setDisplay,
  deleteDisplay,
  setDisplayName,
  setDisplayAddView,
  setDisplayRemoveView,
  setDisplayViewsListYOffset,
  setDisplaySelectedView,
  swapDisplayViews
} = createDisplaySlice().actions

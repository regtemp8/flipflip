import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type Clip from './Clip'
import {
  type EntryState,
  type EntryUpdate,
  setEntrySlice,
  setEntry
} from '../EntryState'

export const initialClipState: EntryState<Clip> = {
  name: 'clipSlice',
  nextID: 1,
  entries: {}
}

export default function createClipReducer(clipState?: EntryState<Clip>) {
  return createClipSlice(clipState).reducer
}

function createClipSlice(clipState?: EntryState<Clip>) {
  const initialState = clipState ?? initialClipState
  return createSlice({
    name: 'clips',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setClipSlice: (state, action: PayloadAction<EntryState<Clip>>) => {
        setEntrySlice(state, action.payload)
      },
      setClip: (state, action: PayloadAction<Clip>) => {
        setEntry(state, action.payload)
      },
      setClips: (state, action: PayloadAction<Clip[]>) => {
        action.payload.forEach((s) => setEntry(state, s))
      },
      setClipToggleTag: (state, action: PayloadAction<EntryUpdate<number>>) => {
        const clip = state.entries[action.payload.id]
        const index = clip.tags.indexOf(action.payload.value)
        if (index === -1) {
          clip.tags.push(action.payload.value)
        } else {
          clip.tags.splice(index, 1)
        }
      },
      setClipVolume: (
        state,
        action: PayloadAction<EntryUpdate<number | undefined>>
      ) => {
        state.entries[action.payload.id].volume = action.payload.value
      },
      setClipTags: (state, action: PayloadAction<EntryUpdate<number[]>>) => {
        state.entries[action.payload.id].tags = action.payload.value
      },
      setClipStartEnd: (
        state,
        action: PayloadAction<EntryUpdate<number[]>>
      ) => {
        const clip = state.entries[action.payload.id]
        clip.start = action.payload.value[0]
        clip.end = action.payload.value[1]
      }
    }
  })
}

export const {
  setClipSlice,
  setClip,
  setClips,
  setClipToggleTag,
  setClipTags,
  setClipVolume,
  setClipStartEnd
} = createClipSlice().actions

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type Tag from './Tag'
import { type EntryState, setEntrySlice, setEntry } from '../EntryState'

export const initialTagState: EntryState<Tag> = {
  name: 'tagSlice',
  nextID: 1,
  entries: {}
}
export const tagSlice = createSlice({
  name: 'tags',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialTagState,
  reducers: {
    setTagSlice: (state, action: PayloadAction<EntryState<Tag>>) => {
      setEntrySlice(state, action.payload)
    },
    setTag: (state, action: PayloadAction<Tag>) => {
      if (!action.payload.name) {
        throw new Error('tagSlice: tag must have a name')
      }

      setEntry(state, action.payload)
    },
    setTags: (state, action: PayloadAction<Tag[]>) => {
      if (action.payload.find((s) => s.name === undefined) != null) {
        throw new Error('tagSlice: tag must have a name')
      }

      action.payload.forEach((s) => setEntry(state, s))
    }
  }
})

export const { setTagSlice, setTag, setTags } = tagSlice.actions

export default tagSlice.reducer

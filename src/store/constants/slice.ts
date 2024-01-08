import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type SystemConstants from './SystemConstants'
import { initialSystemConstants } from './SystemConstants'

export const constantsSlice = createSlice({
  name: 'constants',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialSystemConstants,
  reducers: {
    setConstants: (state, action: PayloadAction<SystemConstants>) => {
      Object.assign(state, action.payload)
    }
  }
})

export const { setConstants } = constantsSlice.actions

export default constantsSlice.reducer

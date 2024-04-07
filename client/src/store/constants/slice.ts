import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialSystemConstants } from './SystemConstants'
import { SystemConstants, copy } from 'flipflip-common'

export default function createConstantsReducer(constants?: SystemConstants) {
  return createConstantsSlice(constants).reducer
}

function createConstantsSlice(constants?: SystemConstants) {
  let initialState = copy<SystemConstants>(initialSystemConstants)
  if (constants != null) {
    initialState = Object.assign(initialState, constants)
  }

  return createSlice({
    name: 'constants',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setConstants: (state, action: PayloadAction<SystemConstants>) => {
        return action.payload
      }
    }
  })
}

export const { setConstants } = createConstantsSlice().actions

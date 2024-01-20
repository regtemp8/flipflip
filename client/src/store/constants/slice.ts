import { createSlice } from '@reduxjs/toolkit'
import { initialSystemConstants } from './SystemConstants'
import { SystemConstants, copy } from 'flipflip-common'

export default function createConstantsReducer(constants?: SystemConstants) {
  let initialState = copy<SystemConstants>(initialSystemConstants)
  if(constants != null) {
    initialState = Object.assign(initialState, constants)
  }

  return createSlice({
    name: 'constants',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {}
  }).reducer
}
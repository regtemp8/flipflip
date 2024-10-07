import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { Message } from 'flipflip-common'
import { RootState } from '../store'

export interface SystemSnackState {
  open: boolean
  message?: string
  severity?: string
}

export const initialState: SystemSnackState = {
  open: false
}
export const systemSnackSlice = createSlice({
  name: 'systemSnack',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    showSystemSnack: (state, action: PayloadAction<Message>) => {
      const { error, warning, success } = action.payload
      if (error != null) {
        state.message = error
        state.severity = 'error'
      } else if (warning != null) {
        state.message = warning
        state.severity = 'warning'
      } else if (success != null) {
        state.message = success
        state.severity = 'success'
      }

      state.open = state.message != null
    },
    closeSystemSnack: (state) => {
      state.open = false
      state.message = undefined
      state.severity = undefined
    }
  }
})

export const { showSystemSnack, closeSystemSnack } = systemSnackSlice.actions

export default systemSnackSlice.reducer

export const selectSystemSnack = () => {
  return (state: RootState): SystemSnackState => state.systemSnack
}

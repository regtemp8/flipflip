import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AuthenticationState {
  authenticated?: boolean
}
const initialState: AuthenticationState = {}

const authSlice = createSlice({
  name: 'authentication',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.authenticated = action.payload
    }
  }
})

export const {
    setAuthenticated
} = authSlice.actions

export default authSlice.reducer
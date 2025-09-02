import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AppState {
  specialMode?: string
}

const initialState: AppState = {}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSpecialMode: (state, action: PayloadAction<string | undefined>) => {
      state.specialMode = action.payload
    }
  }
})

export const { setSpecialMode } = appSlice.actions

export default appSlice.reducer

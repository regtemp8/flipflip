import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const appSlice = createSlice({
  name: 'app',
  initialState: { specialMode: '' },
  reducers: {
    setSpecialMode: (state, action: PayloadAction<string>) => {
      state.specialMode = action.payload
    }
  }
})

export const { setSpecialMode } = appSlice.actions

export default appSlice.reducer

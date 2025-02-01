import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface ScriptLibraryState {
  yOffset: number
  filters: string[]
}

export const initialState: ScriptLibraryState = {
  yOffset: 0,
  filters: []
}
export const scriptLibrarySlice = createSlice({
  name: 'scriptLibrary',
  initialState,
  reducers: {
    setScriptLibraryYOffset: (state, action: PayloadAction<number>) => {
      state.yOffset = action.payload
    },
    setScriptLibraryFilters: (state, action: PayloadAction<string[]>) => {
      state.filters = action.payload
    }
  }
})

export const { setScriptLibraryYOffset, setScriptLibraryFilters } =
scriptLibrarySlice.actions

export default scriptLibrarySlice.reducer

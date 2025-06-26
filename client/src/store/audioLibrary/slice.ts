import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AudioLibraryState {
  yOffset: number
  filters: string[]
  lastSelected?: number
}

export const initialState: AudioLibraryState = {
  yOffset: 0,
  filters: []
}
export const audioLibrarySlice = createSlice({
  name: 'audioLibrary',
  initialState,
  reducers: {
    setAudioLibraryYOffset: (state, action: PayloadAction<number>) => {
      state.yOffset = action.payload
    },
    setAudioLibraryFilters: (state, action: PayloadAction<string[]>) => {
      state.filters = action.payload
    },
    setAudioLibraryLastSelected: (
      state,
      action: PayloadAction<number | undefined>
    ) => {
      state.lastSelected = action.payload
    }
  }
})

export const {
  setAudioLibraryYOffset,
  setAudioLibraryFilters,
  setAudioLibraryLastSelected
} = audioLibrarySlice.actions

export default audioLibrarySlice.reducer

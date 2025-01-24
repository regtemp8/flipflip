import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AudioLibraryState {
  yOffset: number
  filters: string[]
}

export const initialState: AudioLibraryState = {
  yOffset: 0,
  filters: []
}
export const captionScriptorSlice = createSlice({
  name: 'audioLibrary',
  initialState,
  reducers: {
    setAudioLibraryYOffset: (state, action: PayloadAction<number>) => {
      state.yOffset = action.payload
    },
    setAudioLibraryFilters: (state, action: PayloadAction<string[]>) => {
      state.filters = action.payload
    }
  }
})

export const { setAudioLibraryYOffset, setAudioLibraryFilters } =
  captionScriptorSlice.actions

export default captionScriptorSlice.reducer

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface ScenePickerState {
  filters: string[]
}

export const initialState: ScenePickerState = { filters: [] }
export const scenePickerSlice = createSlice({
  name: 'scenePicker',
  initialState: initialState,
  reducers: {
    setScenePickerFilters: (state, action: PayloadAction<string[]>) => {
      state.filters = action.payload
    }
  }
})

export const { setScenePickerFilters } = scenePickerSlice.actions

export default scenePickerSlice.reducer

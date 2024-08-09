import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface ScenePickerState {
  filters: string[]
}

export const initialScenePickerState: ScenePickerState = { filters: [] }
export const scenePickerSlice = createSlice({
  name: 'scenePicker',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialScenePickerState,
  reducers: {
    setScenePickerFilters: (state, action: PayloadAction<string[]>) => {
      state.filters = action.payload
    }
  }
})

export const { setScenePickerFilters } = scenePickerSlice.actions

export default scenePickerSlice.reducer

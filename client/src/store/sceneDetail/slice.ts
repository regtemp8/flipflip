import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface SceneDetailState {
  filters: string[]
}

export const initialState: SceneDetailState = { filters: [] }
export const sceneDetailSlice = createSlice({
  name: 'sceneDetail',
  initialState,
  reducers: {
    setSceneDetailFilters: (state, action: PayloadAction<string[]>) => {
      state.filters = action.payload
    }
  }
})

export const { setSceneDetailFilters } = sceneDetailSlice.actions

export default sceneDetailSlice.reducer

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface SceneDetailState {
  filters: string[]
}

export const initialSceneDetailState: SceneDetailState = { filters: [] }
export const sceneDetailSlice = createSlice({
  name: 'sceneDetail',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialSceneDetailState,
  reducers: {
    setSceneDetailFilters: (state, action: PayloadAction<string[]>) => {
      state.filters = action.payload
    }
  }
})

export const { setSceneDetailFilters } = sceneDetailSlice.actions

export default sceneDetailSlice.reducer

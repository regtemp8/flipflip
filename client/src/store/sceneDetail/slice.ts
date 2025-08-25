import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { flipflipApi } from '../api/slice'

interface SceneDetailState {
  filters: string[]
  autoEdit: boolean
  editingName?: string
}

export const initialState: SceneDetailState = { filters: [], autoEdit: false }
export const sceneDetailSlice = createSlice({
  name: 'sceneDetail',
  initialState,
  reducers: {
    setSceneDetailFilters: (state, action: PayloadAction<string[]>) => {
      state.filters = action.payload
    },
    setSceneDetailEditingName: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.editingName = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      flipflipApi.endpoints.createScene.matchFulfilled,
      (state) => {
        state.autoEdit = true
      }
    )
    builder.addMatcher(
      flipflipApi.endpoints.cloneScene.matchFulfilled,
      (state) => {
        state.autoEdit = true
      }
    )
    builder.addMatcher(
      flipflipApi.endpoints.getScene.matchFulfilled,
      (state, action) => {
        if (state.autoEdit) {
          state.autoEdit = false
          state.editingName = action.payload.name
        }
      }
    )
  }
})

export const { setSceneDetailFilters, setSceneDetailEditingName } =
  sceneDetailSlice.actions

export default sceneDetailSlice.reducer

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { flipflipApi } from '../api/slice'

interface DisplayState {
  selectedView?: number
  displayViewsListYOffset: number
  addedView: boolean
  autoEdit: boolean
  editingName?: string
}

export const initialState: DisplayState = {
  displayViewsListYOffset: 0,
  addedView: false,
  autoEdit: false
}
export const displaySlice = createSlice({
  name: 'display',
  initialState,
  reducers: {
    setDisplayEditingName: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.editingName = action.payload
    },
    setDisplaySelectedView: (
      state,
      action: PayloadAction<{ viewID: number; yOffset?: number }>
    ) => {
      const { viewID, yOffset } = action.payload
      state.selectedView = viewID
      if (yOffset != null) {
        state.displayViewsListYOffset = yOffset
      }
    },
    setDisplayAddedView: (state, action: PayloadAction<boolean>) => {
      state.addedView = action.payload
    },
    setDisplayViewsListYOffset: (state, action: PayloadAction<number>) => {
      state.displayViewsListYOffset = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      flipflipApi.endpoints.createDisplay.matchFulfilled,
      (state) => {
        state.autoEdit = true
      }
    )
    builder.addMatcher(
      flipflipApi.endpoints.getDisplay.matchFulfilled,
      (state, action) => {
        if (state.autoEdit) {
          state.autoEdit = false
          state.editingName = action.payload.name
        }

        const views = action.payload.views
        if (views.length > 0) {
          const index = state.addedView ? views.length - 1 : 0
          state.selectedView = views[index]
        } else {
          state.selectedView = undefined
        }

        // TODO if addedView, then scroll to bottom (displayViewsListYOffset)
        state.addedView = false
      }
    )
  }
})

export const {
  setDisplayEditingName,
  setDisplaySelectedView,
  setDisplayAddedView,
  setDisplayViewsListYOffset
} = displaySlice.actions

export default displaySlice.reducer

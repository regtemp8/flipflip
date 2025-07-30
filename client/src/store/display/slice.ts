import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { flipflipApi } from '../api/slice'

interface DisplayState {
  selectedView?: number
  displayViewsListYOffset: number
  addedView: boolean
}

export const initialState: DisplayState = {
  displayViewsListYOffset: 0,
  addedView: false
}
export const displaySlice = createSlice({
  name: 'display',
  initialState,
  reducers: {
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
      flipflipApi.endpoints.getDisplay.matchFulfilled,
      (state, action) => {
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
  setDisplaySelectedView,
  setDisplayAddedView,
  setDisplayViewsListYOffset
} = displaySlice.actions

export default displaySlice.reducer

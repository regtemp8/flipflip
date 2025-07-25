import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { flipflipApi } from '../api/slice'

interface DisplayState {
  selectedView?: number
  displayViewsListYOffset: number
}

export const initialState: DisplayState = {
  displayViewsListYOffset: 0
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
    setDisplayViewsListYOffset: (state, action: PayloadAction<number>) => {
      state.displayViewsListYOffset = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        flipflipApi.endpoints.getDisplay.matchFulfilled,
        (state, action) => {
          const views = action.payload.views
          state.selectedView = views.length > 0 ? views[0] : undefined
        }
      )
  }
})

export const { setDisplaySelectedView, setDisplayViewsListYOffset } =
  displaySlice.actions

export default displaySlice.reducer

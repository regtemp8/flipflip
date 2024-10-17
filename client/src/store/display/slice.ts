import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface DisplayState {
  selectedView: number
  displayViewsListYOffset: number
}

export const initialState: DisplayState = {
  selectedView: 0,
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
  }
})

export const { setDisplaySelectedView, setDisplayViewsListYOffset } =
  displaySlice.actions

export default displaySlice.reducer

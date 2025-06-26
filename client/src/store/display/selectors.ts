import { RootState } from '../store'

export const selectDisplaySelectedView = () => (state: RootState) =>
  state.display.selectedView
export const selectDisplayViewsListYOffset = () => (state: RootState) =>
  state.display.displayViewsListYOffset

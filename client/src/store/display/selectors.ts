import { RootState } from '../store'

export const selectDisplayEditingName = () => (state: RootState) =>
  state.display.editingName
export const selectDisplayEditingViewName = () => (state: RootState) =>
  state.display.editingViewName
export const selectDisplaySelectedView = () => (state: RootState) =>
  state.display.selectedView
export const selectDisplayViewsListYOffset = () => (state: RootState) =>
  state.display.displayViewsListYOffset

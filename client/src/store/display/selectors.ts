import { RootState } from '../store'

export const selectDisplayEditingName = () => (state: RootState) =>
  state.display.editingName
export const selectDisplaySelectedView = () => (state: RootState) =>
  state.display.selectedView
export const selectDisplayViewsListYOffset = () => (state: RootState) =>
  state.display.displayViewsListYOffset

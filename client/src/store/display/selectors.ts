import { RootState } from '../store'

export const selectDisplaySelectedView = (id: number) => (state: RootState) =>
  state.display.selectedView
export const selectDisplayViewsListYOffset =
  (id: number) => (state: RootState) =>
    state.display.displayViewsListYOffset

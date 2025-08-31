import { createSelector } from '@reduxjs/toolkit'
import { flipflipApi } from '../api/slice'
import { RootState } from '../store'

export const selectDisplayEditingName = () => (state: RootState) =>
  state.display.editingName
export const selectDisplayEditingViewName = () => (state: RootState) =>
  state.display.editingViewName
export const selectDisplaySelectedView = () => (state: RootState) =>
  state.display.selectedView
export const selectDisplayViewsListYOffset = () => (state: RootState) =>
  state.display.displayViewsListYOffset

export const selectDisplaySelectedViewName = () => (state: RootState) => {
  let name: string | undefined = undefined
  const id = state.display.selectedView
  if (id != null) {
    const displayView = selectDisplayView(id)(state)
    name = displayView?.name
  }

  return name
}

const selectDisplayViewResult = (id: number) =>
  flipflipApi.endpoints.getDisplayView.select(id)

const selectDisplayView = (id: number) => {
  return createSelector(selectDisplayViewResult(id), (result) => result?.data)
}

const SYNCED_VIEW_DISABLED_ERROR = 'Synced view is disabled'
const SYNCED_VIEW_HIDDEN_ERROR = 'Synced view is hidden'
export const selectDisplayViewError = (id: number) => {
  return (state: RootState) => {
    let error: string | undefined = undefined
    const displayView = selectDisplayView(id)(state)
    if (displayView?.error != null) {
      error = displayView.error
    } else if (
      displayView?.sync === true &&
      displayView?.syncWithView != null
    ) {
      const syncedDisplayView = selectDisplayView(displayView.syncWithView)(
        state
      )
      if (syncedDisplayView?.error != null) {
        error = SYNCED_VIEW_DISABLED_ERROR
      } else if (syncedDisplayView?.visible === false) {
        error = SYNCED_VIEW_HIDDEN_ERROR
      }
    }

    return error
  }
}

const selectDisplayResult = (id: number) =>
  flipflipApi.endpoints.getDisplay.select(id)
const selectDisplay = (id: number) => {
  return createSelector(selectDisplayResult(id), (result) => result?.data)
}

export const selectDisplayPlayDisabled = (id: number) => {
  return (state: RootState) => {
    const display = selectDisplay(id)(state)
    const views = display?.views ?? []
    return views
      .filter((view) => selectDisplayView(view)(state)?.visible === true)
      .map((view) => selectDisplayViewError(view)(state))
      .every((error) => error != null)
  }
}

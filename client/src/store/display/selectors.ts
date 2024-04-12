import { createSelector } from '@reduxjs/toolkit'
import Display from './Display'
import { RootState } from '../store'
import { getAppDisplays } from '../app/selectors'
import { getEntry } from '../EntryState'

export const getDisplayEntries = (state: RootState): Record<number, Display> =>
  state.display.entries

export const selectDisplays = () => {
  return createSelector([getAppDisplays, getDisplayEntries], (ids, entries) =>
    ids.map((id) => entries[id] as Display)
  )
}

export const selectDisplayViews = (id: number) => {
  return (state: RootState) => getEntry(state.display, id).views
}

export const selectDisplayName = (id: number) => {
  return (state: RootState) => getEntry(state.display, id).name ?? ''
}

export const selectDisplaySelectedView = (id: number) => {
  return (state: RootState) => getEntry(state.display, id).selectedView
}

export const selectDisplaySelectedViewName = (id: number) => {
  return (state: RootState) => {
    const viewID = getEntry(state.display, id).selectedView
    return viewID != null ? getEntry(state.displayView, viewID).name : undefined
  }
}

export const selectDisplayViewsListYOffset = (id: number) => {
  return (state: RootState) =>
    getEntry(state.display, id).displayViewsListYOffset
}

export const selectDisplayVisibleViews = (id: number) => {
  return createSelector(
    [selectDisplayViews(id), (state: RootState) => state.displayView.entries],
    (viewIDs, entries) => {
      return viewIDs.filter((id) => entries[id].visible)
    }
  )
}

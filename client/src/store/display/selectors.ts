import { createSelector } from '@reduxjs/toolkit'
import Display from './Display'
import { RootState } from '../store'
import { getAppDisplays } from '../app/selectors'
import { getEntry } from '../EntryState'
import { getDisplayViewEntries } from '../displayView/selectors'

export const getDisplayEntries = (state: RootState): Record<number, Display> =>
  state.display.entries

export const selectDisplays = () => {
  return createSelector([getAppDisplays, getDisplayEntries], (ids, entries) =>
    ids.map((id) => entries[id] as Display)
  )
}

export const selectDisplay = (id: number) => {
  return (state: RootState) => getEntry(state.display, id)
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

export const selectDisplayViewSyncOptions = (id: number) => {
  return createSelector(
    [selectDisplay(id), getDisplayViewEntries],
    (display, viewEntries) => {
      const { selectedView, views } = display
      const optionKeys = views.filter((id) => id !== selectedView)
      const options: Record<string, string> = {}
      options['0'] = 'None'
      for (const key of optionKeys) {
        const { sync, name } = viewEntries[key]
        if (!sync) {
          options[key.toString()] = name
        }
      }
      return options
    }
  )
}

export const selectDisplaySelectOptions = (
  onlyExtra?: boolean,
  includeExtra?: boolean
) => {
  return createSelector(
    [(state) => onlyExtra, (state) => includeExtra, selectDisplays()],
    (onlyExtra, includeExtra, displays) => {
      const options: Record<string, string> = {}
      displays.forEach((s) => (options[s.id.toString()] = s.name))

      if (includeExtra === true) {
        options['0'] = 'None'
        options['-1'] = 'Random'
      } else if (onlyExtra === true) {
        options['-1'] = '~~EMPTY~~'
      } else {
        options['0'] = 'None'
      }

      return options
    }
  )
}

export const selectMultiDisplaySelectOptions = () => {
  return createSelector(
    [selectDisplays()],
    (displays: Display[]): Record<string, string> => {
      const options: Record<string, string> = {}
      displays.forEach((s) => (options[s.id.toString()] = s.name))

      return options
    }
  )
}

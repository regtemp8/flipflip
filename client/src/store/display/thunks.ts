import { SP, SS, copy, newDisplay as newDisplayStorage } from 'flipflip-common'
import { getRandomColor } from '../../data/utils'
import {
  addToDisplays,
  removeFromDisplays,
  setRoute,
  setSpecialMode,
  setSystemSnack,
  systemMessage
} from '../app/slice'
import View, { newView } from '../displayView/View'
import {
  deleteDisplayView,
  deleteDisplayViews,
  setDisplayView
} from '../displayView/slice'
import { type AppDispatch, type RootState } from '../store'
import {
  deleteDisplay,
  setDisplay,
  setDisplayAddView,
  setDisplayRemoveView
} from './slice'
import Display from './Display'
import { newRoute } from '../app/data/Route'
import { toDisplayStorage, fromDisplayStorage } from '../app/convert'
import flipflip from '../../FlipFlipService'
import { AppStorageImport, initialAppStorageImport } from '../AppStorageImport'
import {
  incrementIDValue,
  incrementIDsList,
  incrementSliceIDs
} from '../../data/import'

export function removeDisplay(id: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    dispatch(deleteDisplayViews(state.display.entries[id].views))
    dispatch(removeFromDisplays([id]))
    dispatch(deleteDisplay(id))
    dispatch(setRoute([]))
    dispatch(setSpecialMode(undefined))
  }
}

export function addDisplayView(id: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const view = newView({
      id: state.displayView.nextID,
      color: getRandomColor()
    })
    dispatch(setDisplayView(view))
    dispatch(setDisplayAddView({ id, value: view.id }))
  }
}

export function cloneDisplayView(id: number, viewID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const oldView = state.displayView.entries[viewID]
    const view = newView({
      ...oldView,
      id: state.displayView.nextID
    })

    const names = view.name.split('#')
    if (names.length === 2) {
      const nextNumber = Number(names[1]) + 1
      view.name = names[0] + '#' + nextNumber
    } else {
      view.name += ' #1'
    }
    dispatch(setDisplayView(view))
    dispatch(setDisplayAddView({ id, value: view.id }))
  }
}

export function removeDisplayView(id: number, viewID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(setDisplayRemoveView({ id, value: viewID }))
    dispatch(deleteDisplayView(viewID))
  }
}

export function cloneDisplay(displayID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const displayCopy = copy<Display>(state.display.entries[displayID])
    displayCopy.id = state.display.nextID
    const viewCopies = displayCopy.views
      .map((id) => state.displayView.entries[id])
      .map((view) => {
        const viewCopy = copy<View>(view)
        viewCopy.id += state.displayView.nextID
        return viewCopy
      })

    viewCopies.forEach((view) => dispatch(setDisplayView(view)))
    displayCopy.views = viewCopies.map((view) => view.id)
    dispatch(setDisplay(displayCopy))
    dispatch(addToDisplays(displayCopy.id))
    dispatch(setRoute([newRoute({ kind: 'display', value: displayCopy.id })]))
    dispatch(setSpecialMode(SP.autoEdit))
    dispatch(
      setSystemSnack({
        message: 'Clone successful!',
        severity: SS.success
      })
    )
  }
}

export function exportDisplay(displayID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const displayCopy = toDisplayStorage(displayID, state)
    const displayExport = JSON.stringify(displayCopy)
    const fileName = (displayCopy.name ?? '') + '_export.json'
    flipflip().api.saveJsonFile(fileName, displayExport)
  }
}

export function importDisplay(displayToImport: any) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    if (!displayToImport.id || !displayToImport.views) {
      dispatch(systemMessage('Not a valid display file'))
      return
    }

    // map to redux state
    const state = getState()
    const slice = copy<AppStorageImport>(initialAppStorageImport)
    const display = newDisplayStorage(displayToImport)
    fromDisplayStorage(display, slice.display, slice.displayView)

    // prepare for merge into existing slices
    const displayNextID = state.display.nextID
    const displayViewNextID = state.displayView.nextID

    Object.values(slice.display.entries).forEach((s) => {
      s.views = incrementIDsList<View>(
        s.views,
        slice.displayView,
        displayViewNextID
      )

      s.selectedView = incrementIDValue<View>(
        s.selectedView ?? -1,
        slice.displayView,
        displayViewNextID,
        -1
      )

      if (s.selectedView === -1) {
        s.selectedView = undefined
      }
    })

    slice.display = incrementSliceIDs<Display>(slice.display, displayNextID)
    slice.displayView = incrementSliceIDs<View>(
      slice.displayView,
      displayViewNextID
    )

    Object.values(slice.displayView.entries).forEach((s) =>
      dispatch(setDisplayView(s))
    )

    const displayID = Number(Object.keys(slice.display.entries)[0])
    const displayEntry = slice.display.entries[displayID]
    dispatch(setDisplay(displayEntry))
    dispatch(addToDisplays(displayID))

    dispatch(setRoute([newRoute({ kind: 'display', value: displayID })]))
  }
}

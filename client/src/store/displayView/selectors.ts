import { RootState } from '../store'
import { getEntry } from '../EntryState'
import View from './View'

export const getDisplayViewEntries = (state: RootState): Record<number, View> =>
  state.displayView.entries

export const selectDisplayView = (id: number) => {
  return (state: RootState) => getEntry(state.displayView, id)
}

export const selectDisplayViewName = (id?: number) => {
  return (state: RootState) =>
    id != null ? getEntry(state.displayView, id).name : ''
}

export const selectDisplayViewX = (id: number) => {
  return (state: RootState) => getEntry(state.displayView, id).x
}

export const selectDisplayViewY = (id: number) => {
  return (state: RootState) => getEntry(state.displayView, id).y
}

export const selectDisplayViewZ = (id: number) => {
  return (state: RootState) => getEntry(state.displayView, id).z
}

export const selectDisplayViewWidth = (id: number) => {
  return (state: RootState) => getEntry(state.displayView, id).width
}

export const selectDisplayViewHeight = (id: number) => {
  return (state: RootState) => getEntry(state.displayView, id).height
}

export const selectDisplayViewColor = (id: number) => {
  return (state: RootState) => getEntry(state.displayView, id).color
}

export const selectDisplayViewOpacity = (id: number) => {
  return (state: RootState) => getEntry(state.displayView, id).opacity
}

export const selectDisplayViewSync = (id: number) => {
  return (state: RootState) => getEntry(state.displayView, id).sync
}

export const selectDisplayViewSyncWithView = (id: number) => {
  return (state: RootState) =>
    getEntry(state.displayView, id).syncWithView.toString()
}

export const selectDisplayViewMirrorSyncedView = (id: number) => {
  return (state: RootState) => getEntry(state.displayView, id).mirrorSyncedView
}

export const selectDisplayViewVisible = (id: number) => {
  return (state: RootState) => getEntry(state.displayView, id).visible
}

export const selectDisplayViewScenePlaylistID = (id: number) => {
  return (state: RootState) =>
    getEntry(state.displayView, id).playlistID.toString()
}

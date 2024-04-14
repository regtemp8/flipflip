import * as slice from './slice'

export const setDisplayViewName = (id: number) => (value: string) =>
  slice.setDisplayViewName({ id, value })

export const setDisplayViewX = (id: number) => (value: number) =>
  slice.setDisplayViewX({ id, value })

export const setDisplayViewY = (id: number) => (value: number) =>
  slice.setDisplayViewY({ id, value })

export const setDisplayViewZ = (id: number) => (value: number) =>
  slice.setDisplayViewZ({ id, value })

export const setDisplayViewWidth = (id: number) => (value: number) =>
  slice.setDisplayViewWidth({ id, value })

export const setDisplayViewHeight = (id: number) => (value: number) =>
  slice.setDisplayViewHeight({ id, value })

export const setDisplayViewColor = (id: number) => (value: string) =>
  slice.setDisplayViewColor({ id, value })

export const setDisplayViewOpacity = (id: number) => (value: number) =>
  slice.setDisplayViewOpacity({ id, value })

export const setDisplayViewSync = (id: number) => (value: boolean) =>
  slice.setDisplayViewSync({ id, value })

export const setDisplayViewSyncWithView = (id: number) => (value: string) =>
  slice.setDisplayViewSyncWithView({ id, value: Number(value) })

export const setDisplayViewMirrorSyncedView = (id: number) => (value: string) =>
  slice.setDisplayViewMirrorSyncedView({ id, value })

export const setDisplayViewScenePlaylistID = (id: number) => (value: string) =>
  slice.setDisplayViewScenePlaylistID({ id, value: Number(value) })

import { type AppDispatch, type RootState } from '../store'
import { createOverlay, deleteOverlay, setOverlaySceneID } from './slice'
import { setSceneAddOverlay, setSceneRemoveOverlay } from '../scene/actions'
import { selectAppLastRouteIsPlayer } from '../app/selectors'
import { generateScenes } from '../scene/thunks'

export function addOverlay(sceneID?: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const overlayID = getState().overlay.nextID
    dispatch(createOverlay(overlayID))
    dispatch(setSceneAddOverlay(overlayID, sceneID))
  }
}

export function removeOverlay(overlayID: number, sceneID?: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(deleteOverlay(overlayID))
    dispatch(setSceneRemoveOverlay(overlayID, sceneID))
  }
}

export function changeOverlaySceneID(overlayID: number, sceneID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    if (!sceneID) return

    const state = getState()
    if (selectAppLastRouteIsPlayer()(state)) {
      dispatch(generateScenes(sceneID))
    }
    dispatch(setOverlaySceneID({ id: overlayID, value: sceneID }))
  }
}

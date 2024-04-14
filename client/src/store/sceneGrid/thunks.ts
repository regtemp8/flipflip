import { setRoute, setSpecialMode } from '../app/slice'
import { deleteOverlay } from '../overlay/slice'
import { setSceneRemoveOverlay } from '../scene/slice'
import { type AppDispatch, type RootState } from '../store'
import { deleteSceneGrid } from './slice'

export function removeSceneGrid(id: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    dispatch(deleteSceneGrid(id))
    const overlaySceneID = parseInt('999' + id.toString())
    const overlayIDs = Object.values(state.overlay.entries)
      .filter((o) => o.sceneID === overlaySceneID)
      .map((o) => o.id)
    for (const overlayID of overlayIDs) {
      Object.values(state.scene.entries).forEach((s) => {
        if (s.overlays.includes(overlayID)) {
          dispatch(setSceneRemoveOverlay({ id: s.id, value: overlayID }))
        }
      })
      dispatch(deleteOverlay(overlayID))
    }

    dispatch(setRoute([]))
    dispatch(setSpecialMode(undefined))
  }
}

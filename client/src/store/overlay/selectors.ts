import { areWeightsValid } from '../../data/utils'
import { type RootState } from '../store'
import type Overlay from './Overlay'
import { EntryState, getEntry } from '../EntryState'

export const getOverlay = (state: EntryState<Overlay>, id: number) =>
  state.entries[id]

export const selectOverlayOpacity = (id: number) => {
  return (state: RootState) => getOverlay(state.overlay, id).opacity
}

export const selectOverlaySceneID = (id: number) => {
  return (state: RootState) => getOverlay(state.overlay, id).sceneID
}

export const selectOverlayRegenerate = (id: number) => {
  return (state: RootState) => {
    const overlay = getOverlay(state.overlay, id)
    const scene = getEntry(state.scene, overlay.sceneID)
    return scene?.generatorWeights && scene.regenerate
  }
}

export const selectOverlayIsInvalid = (id: number) => {
  return (state: RootState) => {
    let invalid = false
    const regenerate = selectOverlayRegenerate(id)(state)
    if (regenerate) {
      const overlay = getOverlay(state.overlay, id)
      const scene = getEntry(state.scene, overlay.sceneID)
      invalid = !areWeightsValid(scene)
    }

    return invalid
  }
}

export const getOverlayEntries = (state: RootState) => state.overlay.entries

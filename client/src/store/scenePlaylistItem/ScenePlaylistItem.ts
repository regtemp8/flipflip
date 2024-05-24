import { copy } from 'flipflip-common'
import { Identifiable } from '../EntryState'

export interface ScenePlaylistItem extends Identifiable {
  sceneID: number
  randomScenes: number[]
  duration: number
  playAfterAllImages: boolean
}

export const initialScenePlaylistItem: ScenePlaylistItem = {
  id: 0,
  sceneID: 0,
  randomScenes: [],
  duration: 0,
  playAfterAllImages: false
}

export function newScenePlaylistItem(
  init?: Partial<ScenePlaylistItem>
): ScenePlaylistItem {
  return Object.assign(copy<ScenePlaylistItem>(initialScenePlaylistItem), init)
}

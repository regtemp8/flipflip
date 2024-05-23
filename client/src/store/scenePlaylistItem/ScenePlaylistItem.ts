import { Identifiable } from '../EntryState'

export interface ScenePlaylistItem extends Identifiable {
  sceneID: number
  randomScenes: number[]
  duration: number
  playAfterAllImages: boolean
}

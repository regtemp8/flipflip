import { Identifiable } from '../EntryState'

export interface DisplayPlaylistItem extends Identifiable {
  displayID: number
  randomDisplays: number[]
  duration: number
}

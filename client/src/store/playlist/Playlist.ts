import { PLT, RP, copy } from 'flipflip-common'
import { Identifiable } from '../EntryState'

export type PlaylistType =
  | typeof PLT.audio
  | typeof PLT.display
  | typeof PLT.scene
  | typeof PLT.script

export default interface Playlist extends Identifiable {
  name: string
  type: PlaylistType
  items: number[]
  shuffle: boolean
  repeat: string
}

export const initialPlaylist: Playlist = {
  id: 0,
  name: 'New Playlist',
  type: PLT.audio,
  items: [],
  shuffle: false,
  repeat: RP.all
}

export function newPlaylist(init?: Partial<Playlist>): Playlist {
  return Object.assign(copy<Playlist>(initialPlaylist), init)
}

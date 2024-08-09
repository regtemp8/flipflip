import { copy } from '../../renderer/data/utils'

export default interface Playlist {
  id: number
  name?: string
  audios: number[] // Array of Audio IDs
}

export const initialPlaylist: Playlist = {
  id: 0,
  audios: []
}

export function newPlaylist (init?: Partial<Playlist>) {
  return Object.assign(copy<Playlist>(initialPlaylist), init)
}

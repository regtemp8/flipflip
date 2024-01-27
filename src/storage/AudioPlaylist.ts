import type Audio from './Audio'

export default interface AudioPlaylist {
  audios: Audio[]
  shuffle: boolean
  repeat: string
}

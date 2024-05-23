import { PlaylistType } from './Playlist'
import * as thunks from './thunks'

export const addPlaylist = (type: PlaylistType) => () =>
  thunks.addPlaylist(type)

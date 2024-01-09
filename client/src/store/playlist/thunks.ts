import { type RootState, type AppDispatch } from '../store'
import Playlist from './Playlist'
import { setPlaylistAudios } from './slice'

export function setPlaylistsRemoveAudio(audioID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const playlists = state.app.playlists.map(
      (id) => state.playlist.entries[id]
    )
    for (const playlist of playlists) {
      const index = playlist.audios.indexOf(audioID)
      playlist.audios.splice(index, 1)
      dispatch(setPlaylistAudios({ id: playlist.id, value: playlist.audios }))
    }
  }
}

export function setPlaylistRemoveAudio(playlistName: string, sourceId: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const playlist = state.app.playlists
      .map((id) => state.playlist.entries[id])
      .find((p) => p.name === playlistName) as Playlist
    const index = playlist.audios.indexOf(sourceId)
    playlist.audios.splice(index, 1)
    dispatch(setPlaylistAudios({ id: playlist.id, value: playlist.audios }))
  }
}

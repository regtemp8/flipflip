import { createSelector } from '@reduxjs/toolkit'
import { selectAppPlaylists } from '../app/selectors'
import { RootState } from '../store'
import Playlist from './Playlist'
import Audio from '../audio/Audio'
import { getAudioEntries } from '../audio/selectors'

const getPlaylistEntries = (state: RootState) => state.playlist.entries

export const selectPlaylists = () => {
  return createSelector(
    [selectAppPlaylists(), getPlaylistEntries],
    (ids, entries) => ids.map((id) => entries[id] as Playlist)
  )
}

export const selectAppPlaylistOptions = () => {
  return createSelector([selectPlaylists()], (playlists) => {
    const options: Record<string, string> = {}
    playlists.forEach((s) => (options[s.id.toString()] = s.name as string))
    return options
  })
}

export const selectAppPlaylistThumbs = () => {
  return createSelector(
    [selectPlaylists(), getAudioEntries],
    (playlists, audioEntries) => {
      const options: Record<string, string[]> = {}
      playlists.forEach((playlist) => {
        const thumbs: string[] = []
        for (const audioID of playlist.audios) {
          const audio = audioEntries[audioID] as Audio
          if (audio?.thumb !== undefined && !thumbs.includes(audio.thumb)) {
            thumbs.push(audio.thumb)
          }
          if (thumbs.length === 4) {
            break
          }
        }

        options[playlist?.name as string] = thumbs
      })
      return options
    }
  )
}

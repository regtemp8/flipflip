import { RootState } from '../store'
import { getEntry } from '../EntryState'
import { createSelector } from '@reduxjs/toolkit'
import Playlist, { PlaylistType } from './Playlist'
import { getAppPlaylists } from '../app/selectors'
import SelectOption from '../../components/common/SelectOption'
import { PLT } from 'flipflip-common'
import { getAudioEntries } from '../audio/selectors'
import Audio from '../audio/Audio'

export const getPlaylistEntries = (
  state: RootState
): Record<number, Playlist> => state.playlist.entries

export const selectPlaylists = () => {
  return createSelector([getAppPlaylists, getPlaylistEntries], (ids, entries) =>
    ids.map((id) => entries[id] as Playlist)
  )
}

export const selectPlaylistOptions = (type: PlaylistType) => {
  return createSelector([selectPlaylists()], (playlists) => {
    const options: SelectOption[] = playlists
      .filter((playlist) => playlist.type === type)
      .map(({ id, name }) => ({ id, value: name }))

    options.unshift({ id: 0, value: 'None' })
    return options
  })
}

export const selectPlaylist = (id: number) => {
  return (state: RootState) => getEntry(state.playlist, id)
}

export const selectPlaylistType = (id: number) => {
  return (state: RootState) => getEntry(state.playlist, id).type
}

export const selectPlaylistName = (id: number) => {
  return (state: RootState) => getEntry(state.playlist, id).name
}

export const selectAudioPlaylistDuration = (id: number) => {
  return (state: RootState): number => {
    const playlist = getEntry(state.playlist, id)
    if (playlist.type !== PLT.audio) {
      throw new Error('Playlist is not an audio playlist')
    }

    return playlist.items.reduce(
      (total, audioID) => total + (state.audio.entries[audioID]?.duration ?? 0),
      0
    )
  }
}

export const selectPlaylistThumbs = () => {
  return createSelector(
    [selectPlaylists(), getAudioEntries],
    (playlists, audioEntries) => {
      const options: Record<string, string[]> = {}
      playlists
        .filter((playlist) => playlist.type === PLT.audio)
        .forEach((playlist) => {
          const thumbs: string[] = []
          for (const audioID of playlist.items) {
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

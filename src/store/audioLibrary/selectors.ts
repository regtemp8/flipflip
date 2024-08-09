import { type RootState } from '../store'
import type Audio from '../audio/Audio'
import { newAudio } from '../audio/Audio'
import { createSelector } from '@reduxjs/toolkit'
import { selectAppAudioFilters, selectAppAudios } from '../app/selectors'
import { selectPlaylists } from '../playlist/selectors'
import { getAudioEntries } from '../audio/selectors'
import { getTagEntries } from '../tag/selectors'

export function selectAudioLibraryLoadingMetadata () {
  return (state: RootState) => state.audioLibrary.loadingMetadata
}

export function selectAudioLibraryLoadingSources () {
  return (state: RootState) => state.audioLibrary.loadingSources
}

export function selectAudioLibraryError () {
  return (state: RootState) => state.audioLibrary.error
}

export function selectAudioLibraryOpenMenu () {
  return (state: RootState) => state.audioLibrary.openMenu
}

export function selectAudioLibraryPlaylistID () {
  return (state: RootState) => state.audioLibrary.playlistID
}

export function selectAudioLibrarySelectedTags () {
  return (state: RootState) => state.audioLibrary.selectedTags
}

export function selectAudioLibraryDisplaySources () {
  return createSelector(
    [
      selectAppAudioFilters(), 
      selectPlaylists(), 
      selectAppAudios(), 
      getAudioEntries,
      getTagEntries
    ],
    (filters, playlists, audios, audioEntries, tagEntries) => {
      let displaySources: number[] = []
      const filtering = filters.length > 0
      if (filtering) {
        const playlistName = filters
          .find((f) => f.startsWith('playlist:'))
          ?.replace('playlist:', '')
        const playlist = playlists.find((p) => p.name === playlistName)
        const library = playlist ? playlist.audios : audios
        for (const sourceID of library) {
          const source = audioEntries[sourceID] as Audio
          let matchesFilter = true
          let countRegex
          for (let filter of filters) {
            if (filter === '<Marked>') {
              // This is a marked filter
              matchesFilter = source.marked
            } else if (filter === '<Untagged>') {
              // This is untagged filter
              matchesFilter = source.tags.length === 0
            } else if (
              (filter.startsWith('[') || filter.startsWith('-[')) &&
              filter.endsWith(']')
            ) {
              // This is a tag filter
              if (filter.startsWith('-')) {
                const tag = filter.substring(2, filter.length - 1)
                matchesFilter =
                  source.tags
                    .map((id) => tagEntries[id])
                    .find((t) => t.name === tag) == null
              } else {
                const tag = filter.substring(1, filter.length - 1)
                matchesFilter =
                  source.tags
                    .map((id) => tagEntries[id])
                    .find((t) => t.name === tag) != null
              }
            } else if (
              filter.startsWith('artist:') ||
              filter.startsWith('-artist:')
            ) {
              filter = filter.replace('artist:', '')
              if (filter.startsWith('-')) {
                filter = filter.substring(1, filter.length)
                if (filter.length === 0) {
                  matchesFilter = source.artist && source.artist.length > 0
                } else {
                  matchesFilter = filter !== source.artist
                }
              } else {
                if (filter.length === 0) {
                  matchesFilter = !source.artist || source.artist.length === 0
                } else {
                  matchesFilter = filter === source.artist
                }
              }
            } else if (
              filter.startsWith('album:') ||
              filter.startsWith('-album:')
            ) {
              filter = filter.replace('album:', '')
              if (filter.startsWith('-')) {
                filter = filter.substring(1, filter.length)
                if (filter.length === 0) {
                  matchesFilter = source.album && source.album.length > 0
                } else {
                  matchesFilter = filter !== source.album
                }
              } else {
                if (filter.length === 0) {
                  matchesFilter = !source.album || source.album.length === 0
                } else {
                  matchesFilter = filter === source.album
                }
              }
            } else if (filter.startsWith('playlist:')) {
              filter = filter.replace('playlist:', '')
              const playlist = playlists.find((p) => p.name === filter)
              if (playlist) {
                matchesFilter = playlist.audios.includes(source.id)
              } else {
                matchesFilter = false
              }
            } else if (
              filter.startsWith('comment:') ||
              filter.startsWith('-comment:')
            ) {
              filter = filter.replace('comment:', '')
              if (filter.startsWith('-')) {
                filter = filter.substring(1, filter.length)
                if (filter.length === 0) {
                  matchesFilter = source.comment && source.comment.length > 0
                } else {
                  const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
                  matchesFilter = !regex.test(source.comment)
                }
              } else {
                if (filter.length === 0) {
                  matchesFilter = !source.comment || source.comment.length === 0
                } else {
                  const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
                  matchesFilter = regex.test(source.comment)
                }
              }
            } else if (
              (countRegex = /^count([>=<])(\d*)$/.exec(filter)) != null
            ) {
              const symbol = countRegex[1]
              const value = parseInt(countRegex[2])
              const count = source.playedCount
              switch (symbol) {
                case '=':
                  matchesFilter = count === value
                  break
                case '>':
                  matchesFilter = count > value
                  break
                case '<':
                  matchesFilter = count < value
                  break
              }
            } else if (
              ((filter.startsWith('"') || filter.startsWith('-"')) &&
                filter.endsWith('"')) ||
              ((filter.startsWith("'") || filter.startsWith("-'")) &&
                filter.endsWith("'"))
            ) {
              if (filter.startsWith('-')) {
                filter = filter.substring(2, filter.length - 1)
                const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
                matchesFilter =
                  !regex.test(source.url) &&
                  !regex.test(source.name) &&
                  !regex.test(source.artist) &&
                  !regex.test(source.album)
              } else {
                filter = filter.substring(1, filter.length - 1)
                const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
                matchesFilter =
                  regex.test(source.url) ||
                  regex.test(source.name) ||
                  regex.test(source.artist) ||
                  regex.test(source.album)
              }
            } else {
              // This is a search filter
              filter = filter.replace('\\', '\\\\')
              if (filter.startsWith('-')) {
                filter = filter.substring(1, filter.length)
                const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
                matchesFilter =
                  !regex.test(source.url) &&
                  !regex.test(source.name) &&
                  !regex.test(source.artist) &&
                  !regex.test(source.album)
              } else {
                const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
                matchesFilter =
                  regex.test(source.url) ||
                  regex.test(source.name) ||
                  regex.test(source.artist) ||
                  regex.test(source.album)
              }
            }
            if (!matchesFilter) break
          }
          if (matchesFilter) {
            displaySources.push(source.id)
          }
        }
      } else {
        displaySources = audios
      }
      return displaySources
    }
  )
}

export function selectCommonAudio () {
  return (state: RootState) => {
    const keys = ['thumb', 'name', 'artist', 'album', 'comment', 'trackNum']
    const common = newAudio()
    for (const id of state.app.audioSelected) {
      const source: any = state.audio.entries[id]
      for (const key of keys) {
        if (common[key] === undefined) {
          common[key] = source[key]
        } else if (common[key] != null && common[key] !== source[key]) {
          common[key] = null
        }
      }
    }
    for (const key of keys) {
      if (common[key] == null) {
        common[key] = undefined
      }
    }
    return common
  }
}

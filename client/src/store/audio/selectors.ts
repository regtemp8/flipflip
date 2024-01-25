import { type RootState } from '../store'
import { getEntry } from '../EntryState'
import { createSelector } from '@reduxjs/toolkit'

export const getAudioEntries = (state: RootState) => state.audio.entries

export const selectAudios = (ids: number[]) => {
  return createSelector([(state) => ids, getAudioEntries], (ids, entries) =>
    ids.map((id) => entries[id])
  )
}

export const selectAudio = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id)
}

export const selectAudioHasBPM = (id: number) => {
  return (state: RootState) => !!getEntry(state.audio, id).bpm
}

export const selectAudioTickTF = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tickMode
}

export const selectAudioTickDuration = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tickDelay
}

export const selectAudioTickDurationMin = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tickMinDelay
}

export const selectAudioTickDurationMax = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tickMaxDelay
}

export const selectAudioTickSinRate = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tickSinRate
}

export const selectAudioTickBPMMulti = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tickBPMMulti
}

export const selectAudioStopAtEnd = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).stopAtEnd
}

export const selectAudioNextSceneAtEnd = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).nextSceneAtEnd
}

export const selectAudioTick = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tick
}

export const selectAudioSpeed = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).speed
}

export const selectAudioVolume = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).volume
}

export const selectAudioTrackNum = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).trackNum
}

export const selectAudioComment = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).comment
}

export const selectAudioTags = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tags
}

export const selectAudioThumb = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).thumb
}

export const selectAudioArtist = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).artist
}

export const selectAudioAlbum = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).album
}

export const selectAudioName = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).name
}

export const selectAudioUrl = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).url
}

export const selectAudioDuration = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).duration
}

export const selectAudioBPM = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).bpm
}

export const selectAudioMarked = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).marked
}

export const selectAudioPlayedCount = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).playedCount
}

export const selectAudioTickMode = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tickMode
}

export const selectAudioTickDelay = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tickDelay
}

export const selectAudioTickMaxDelay = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tickMaxDelay
}

export const selectAudioTickMinDelay = (id: number) => {
  return (state: RootState) => getEntry(state.audio, id).tickMinDelay
}

export const selectAudioArtists = (ids: number[]) => {
  return createSelector(
    [(state: RootState) => ids, (state: RootState) => state.audio.entries],
    (ids, entries) => {
      const artistsMap = new Map<string, string | undefined>()
      const songs = ids
        .map((id) => entries[id])
        .sort((a, b) => {
          const artistA = a.artist as string
          const artistB = b.artist as string
          if (artistA > artistB) {
            return 1
          } else if (artistA < artistB) {
            return -1
          } else {
            const nameA = a.name as string
            const nameB = b.name as string
            const reA = /^(A\s|a\s|The\s|the\s)/g
            const valueA = nameA.replace(reA, '')
            const valueB = nameB.replace(reA, '')
            return valueA.localeCompare(valueB, 'en', { numeric: true })
          }
        })
      for (const song of songs) {
        if (
          song.artist &&
          (!artistsMap.has(song.artist) || !artistsMap.get(song.artist))
        ) {
          artistsMap.set(song.artist, song.thumb)
        }
      }
      return artistsMap
    }
  )
}

export const selectAudioAlbums = (ids: number[]) => {
  return createSelector(
    [(state: RootState) => ids, (state: RootState) => state.audio.entries],
    (ids, entries) => {
      const va = 'Various Artists'
      const albumMap = new Map<
        string,
        { artist: string; thumb?: string; count: number }
      >()
      const songs = ids
        .map((id) => entries[id])
        .sort((a, b) => {
          const albumA = a.album as string
          const albumB = b.album as string
          if (albumA > albumB) {
            return 1
          } else if (albumA < albumB) {
            return -1
          } else {
            const trackNumA = a.trackNum as number
            const trackNumB = b.trackNum as number
            if (trackNumA > trackNumB) {
              return 1
            } else if (trackNumA < trackNumB) {
              return -1
            } else {
              const nameA = a.name as string
              const nameB = b.name as string
              const reA = /^(A\s|a\s|The\s|the\s)/g
              const valueA = nameA.replace(reA, '')
              const valueB = nameB.replace(reA, '')
              return valueA.localeCompare(valueB, 'en', { numeric: true })
            }
          }
        })
      for (const song of songs) {
        if (
          song.album &&
          (!albumMap.has(song.album) ||
            !albumMap.get(song.album)?.thumb ||
            (albumMap.get(song.album)?.artist !== song.artist &&
              albumMap.get(song.album)?.artist !== va))
        ) {
          if (
            albumMap.has(song.album) &&
            albumMap.get(song.album)?.artist !== song.artist
          ) {
            albumMap.set(song.album, {
              artist: va,
              thumb: song.thumb,
              count: 0
            })
          } else {
            albumMap.set(song.album, {
              artist: song.artist as string,
              thumb: song.thumb,
              count: 0
            })
          }
        }
      }
      for (const song of songs) {
        if (song.album) {
          const album = albumMap.get(song.album)
          albumMap.set(song.album, {
            artist: album?.artist as string,
            thumb: album?.thumb,
            count: (album?.count as number) + 1
          })
        }
      }
      return albumMap
    }
  )
}

import { type RootState } from '../store'
import { RF, RT } from 'flipflip-common'
import type LibrarySource from './LibrarySource'
import { createSelector } from '@reduxjs/toolkit'
import { selectAppLibrary } from '../app/selectors'
import { getClipEntries } from '../clip/selectors'
import { getTagEntries } from '../tag/selectors'
import Clip from '../clip/Clip'
import { selectSceneSources } from '../scene/selectors'
import Tag from '../tag/Tag'

export const selectLibrarySource = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id]
}

export const selectLibrarySourceClips = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].clips
}

export const selectLibrarySourceClipsIncludes = (
  id: number,
  clipID?: number
) => {
  return (state: RootState) => {
    if (clipID == null) {
      return false
    }

    const source = state.librarySource.entries[id]
    return source.clips && source.clips.includes(clipID)
  }
}

export const selectLibrarySourceDisabledClipsIncludes = (
  id: number,
  clipID?: number
) => {
  return (state: RootState) => {
    if (clipID == null) {
      return false
    }

    const source = state.librarySource.entries[id]
    return source.disabledClips && source.disabledClips.includes(clipID)
  }
}

export const selectLibrarySourceURL = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id]?.url
}

export const selectLibrarySourceSubtitleFile = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].subtitleFile
}

export const selectCurrentImageTags = (
  currentImage:
    | HTMLImageElement
    | HTMLVideoElement
    | HTMLIFrameElement
    | undefined
) => {
  return createSelector(
    [
      (state) => currentImage,
      selectLibrarySources(),
      getTagEntries,
      getClipEntries
    ],
    (currentImage, sources, tagEntries, clipEntries) => {
      if (currentImage === undefined) return []

      const source = currentImage.getAttribute('source')
      const clipIDAttr = currentImage.getAttribute('clip')
      const librarySource = sources.find((s) => s.url === source)
      if (librarySource) {
        let tags: number[]
        if (clipIDAttr) {
          const clipID = Number(clipIDAttr)
          if (librarySource.clips.includes(clipID)) {
            const clip = clipEntries[clipID] as Clip
            if (clip.tags && clip.tags.length > 0) {
              tags = clip.tags
            }
          }
        }
        tags = librarySource.tags ?? []
        return tags
          .map((tagID) => tagEntries[tagID] as Tag)
          .filter((t) => t.phraseString !== undefined && t.phraseString !== '')
      } else {
        return []
      }
    }
  )
}

export const selectLibrarySourceDirOfSources = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].dirOfSources
}

export const selectLibrarySourceIncludeReplies = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].includeReplies
}

export const selectLibrarySourceIncludeRetweets = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].includeRetweets
}

export const selectLibrarySourceIsEnabledClip = (
  id: number,
  clipID: number
) => {
  return (state: RootState) => {
    const source = state.librarySource.entries[id]
    return !source.disabledClips || !source.disabledClips.includes(clipID)
  }
}

export const selectLibrarySourceWeight = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].weight
}

export const selectLibrarySourceRedditFunc = (id: number) => {
  return (state: RootState) =>
    state.librarySource.entries[id].redditFunc || RF.hot
}

export const selectLibrarySourceRedditTime = (id: number) => {
  return (state: RootState) =>
    state.librarySource.entries[id].redditTime || RT.day
}

export const selectLibrarySourceOffline = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].offline
}

export const selectLibrarySourceMarked = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].marked
}

export const selectLibrarySourceDuration = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].duration
}

export const selectLibrarySourceResolution = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].resolution
}

export const selectLibrarySourceCount = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].count
}

export const selectLibrarySourceCountComplete = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].countComplete
}

export const selectLibrarySourceTags = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].tags
}

export const selectLibrarySourceDisabledClips = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].disabledClips
}

export const selectLibrarySourceBlacklist = (id: number) => {
  return (state: RootState) => state.librarySource.entries[id].blacklist
}

export const getLibrarySourceEntries = (state: RootState) =>
  state.librarySource.entries

export const selectLibrarySources = () => {
  return createSelector(
    [selectAppLibrary(), getLibrarySourceEntries],
    (ids, entries) => ids.map((id) => entries[id] as LibrarySource)
  )
}

export const selectSceneLibrarySources = (sceneID: number) => {
  return createSelector(
    [selectSceneSources(sceneID), getLibrarySourceEntries],
    (ids, entries) => ids.map((id) => entries[id] as LibrarySource)
  )
}

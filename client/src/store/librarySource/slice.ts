import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type LibrarySource from './LibrarySource'
import {
  type EntryState,
  type EntryUpdate,
  setEntrySlice,
  setEntry,
  createEntries
} from '../EntryState'

export const initialLibrarySourceState: EntryState<LibrarySource> = {
  name: 'librarySourceSlice',
  nextID: 1,
  entries: {}
}

export default function createLibrarySourceReducer(librarySourceState?: EntryState<LibrarySource>) {
  return createLibrarySourceSlice(librarySourceState).reducer
}

function createLibrarySourceSlice(librarySourceState?: EntryState<LibrarySource>) {
  const initialState = librarySourceState ?? initialLibrarySourceState
  return createSlice({
    name: 'librarySources',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setLibrarySourceSlice: (
        state,
        action: PayloadAction<EntryState<LibrarySource>>
      ) => {
        setEntrySlice(state, action.payload)
      },
      setLibrarySource: (state, action: PayloadAction<LibrarySource>) => {
        setEntry(state, action.payload)
      },
      setLibrarySources: (state, action: PayloadAction<LibrarySource[]>) => {
        action.payload.forEach((s) => setEntry(state, s))
      },
      addLibrarySources: (state, action: PayloadAction<LibrarySource[]>) => {
        createEntries(state, action.payload)
      },
      setLibrarySourceTags: (
        state,
        action: PayloadAction<EntryUpdate<number[]>>
      ) => {
        state.entries[action.payload.id].tags = action.payload.value
      },
      setLibrarySourceAddClip: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        state.entries[action.payload.id].clips.push(action.payload.value)
      },
      setLibrarySourceRemoveClip: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const clipID = action.payload.value
        const source = state.entries[action.payload.id]
        const clipIndex = source.clips.indexOf(clipID)
        source.clips.splice(clipIndex, 1)
        const disabledClipIndex = source.disabledClips
          ? source.disabledClips.indexOf(clipID)
          : -1
        if (disabledClipIndex !== -1) {
          source.disabledClips.splice(disabledClipIndex, 1)
        }
      },
      setLibrarySourceDisabledClips: (
        state,
        action: PayloadAction<EntryUpdate<number[]>>
      ) => {
        state.entries[action.payload.id].disabledClips = action.payload.value
      },
      setLibrarySourceToggleDisabledClip: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const clipID = action.payload.value
        const source = state.entries[action.payload.id]
        if (!source.disabledClips) {
          source.disabledClips = [clipID]
          return
        }

        const index = source.disabledClips.indexOf(clipID)
        if (index === -1) {
          source.disabledClips.push(clipID)
        } else {
          source.disabledClips.splice(index, 1)
        }
      },
      setLibrarySourceAddFileToBlacklist: (
        state,
        action: PayloadAction<{ sourceURL: string; fileToBlacklist?: string }>
      ) => {
        const { sourceURL, fileToBlacklist } = action.payload
        Object.values(state.entries)
          .filter((s) => s.url === sourceURL)
          .forEach((s) => {
            if (s.blacklist == null || fileToBlacklist == null) {
              s.blacklist = []
            }
            if (
              fileToBlacklist != null &&
              !s.blacklist.includes(fileToBlacklist)
            ) {
              s.blacklist.push(fileToBlacklist)
            }
          })
      },
      setLibrarySourceToggleTag: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const source = state.entries[action.payload.id]
        const index = source.tags.indexOf(action.payload.value)
        if (index === -1) {
          source.tags.push(action.payload.value)
        } else {
          source.tags.splice(index, 1)
        }
      },
      setLibrarySourceCount: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        state.entries[action.payload.id].count = action.payload.value
      },
      setLibrarySourceCountComplete: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        state.entries[action.payload.id].countComplete = action.payload.value
      },
      setLibrarySourceMarked: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        state.entries[action.payload.id].marked = action.payload.value
      },
      setLibrarySourceLastCheck: (
        state,
        action: PayloadAction<EntryUpdate<number | undefined>>
      ) => {
        state.entries[action.payload.id].lastCheck = action.payload.value
      },
      setLibrarySourceOffline: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        state.entries[action.payload.id].offline = action.payload.value
      },
      setLibrarySourceMove: (
        state,
        action: PayloadAction<{ id: number; url: string; count: number }>
      ) => {
        const source = state.entries[action.payload.id]
        source.url = action.payload.url
        source.offline = false
        source.lastCheck = undefined
        source.count = action.payload.count
        source.countComplete = true
      },
      setLibrarySourceDirOfSources: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        state.entries[action.payload.id].dirOfSources = action.payload.value
      },
      setLibrarySourceIncludeReplies: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        state.entries[action.payload.id].includeReplies = action.payload.value
      },
      setLibrarySourceIncludeRetweets: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        state.entries[action.payload.id].includeRetweets = action.payload.value
      },
      setLibrarySourceToggleEnabledClip: (
        state,
        action: PayloadAction<{ id: number; clipID: number; enabled: boolean }>
      ) => {
        const { id, clipID, enabled } = action.payload
        const source = state.entries[id]
        if (enabled) {
          const index = source.disabledClips.indexOf(clipID)
          if (index !== -1) {
            source.disabledClips.splice(index, 1)
          }
        } else if (source.disabledClips) {
          source.disabledClips.push(clipID)
        } else {
          source.disabledClips = [clipID]
        }
      },
      setLibrarySourceWeight: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        state.entries[action.payload.id].weight = action.payload.value
      },
      setLibrarySourceSubtitleFile: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        state.entries[action.payload.id].subtitleFile = action.payload.value
      },
      setLibrarySourceRedditFunc: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        state.entries[action.payload.id].redditFunc = action.payload.value
      },
      setLibrarySourceRedditTime: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        state.entries[action.payload.id].redditTime = action.payload.value
      },
      setLibrarySourceBlacklist: (
        state,
        action: PayloadAction<EntryUpdate<string[]>>
      ) => {
        state.entries[action.payload.id].blacklist = action.payload.value
      }
    }
  })
}

export const {
  setLibrarySourceSlice,
  setLibrarySource,
  setLibrarySources,
  addLibrarySources,
  setLibrarySourceTags,
  setLibrarySourceAddClip,
  setLibrarySourceRemoveClip,
  setLibrarySourceDisabledClips,
  setLibrarySourceToggleDisabledClip,
  setLibrarySourceAddFileToBlacklist,
  setLibrarySourceToggleTag,
  setLibrarySourceCount,
  setLibrarySourceCountComplete,
  setLibrarySourceMarked,
  setLibrarySourceLastCheck,
  setLibrarySourceOffline,
  setLibrarySourceMove,
  setLibrarySourceDirOfSources,
  setLibrarySourceIncludeReplies,
  setLibrarySourceIncludeRetweets,
  setLibrarySourceToggleEnabledClip,
  setLibrarySourceWeight,
  setLibrarySourceSubtitleFile,
  setLibrarySourceRedditFunc,
  setLibrarySourceRedditTime,
  setLibrarySourceBlacklist
} = createLibrarySourceSlice().actions
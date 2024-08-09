import * as slice from './slice'

export const setLibrarySourceDirOfSources = (id: number) => (value: boolean) =>
  slice.setLibrarySourceDirOfSources({ id, value })
export const setLibrarySourceIncludeReplies =
  (id: number) => (value: boolean) =>
    slice.setLibrarySourceIncludeReplies({ id, value })
export const setLibrarySourceIncludeRetweets =
  (id: number) => (value: boolean) =>
    slice.setLibrarySourceIncludeRetweets({ id, value })
export const setLibrarySourceToggleEnabledClip =
  (id: number, clipID: number) => (enabled: boolean) =>
    slice.setLibrarySourceToggleEnabledClip({ id, clipID, enabled })
export const setLibrarySourceWeight = (id: number) => (value: number) =>
  slice.setLibrarySourceWeight({ id, value })
export const setLibrarySourceSubtitleFile = (id: number) => (value: string) =>
  slice.setLibrarySourceSubtitleFile({ id, value })
export const setLibrarySourceRedditFunc = (id: number) => (value: string) =>
  slice.setLibrarySourceRedditFunc({ id, value })
export const setLibrarySourceRedditTime = (id: number) => (value: string) =>
  slice.setLibrarySourceRedditTime({ id, value })

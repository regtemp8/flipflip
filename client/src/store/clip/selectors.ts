import { createSelector } from '@reduxjs/toolkit'
import { type RootState } from '../store'

export const selectClipNextID = () => {
  return (state: RootState) => state.clip.nextID
}

export const selectClipTagsIncludes = (clipID: number, tagID: number) => {
  return (state: RootState) => state.clip.entries[clipID].tags.includes(tagID)
}

export const selectClipVolume = (id: number) => {
  return (state: RootState) => state.clip.entries[id].volume
}

export const selectClipStart = (id: number) => {
  return (state: RootState) => state.clip.entries[id].start
}

export const selectClipEnd = (id: number) => {
  return (state: RootState) => state.clip.entries[id].end
}

export const selectClipStartMarks = (ids?: number[]) => {
  return createSelector([(state) => ids, getClipEntries], (ids, entries) => {
    return ids && ids.length > 0
      ? ids
          .map((id) => entries[id].start)
          .filter((start) => start != null)
          .map((start) => start as number)
      : undefined
  })
}

export const getClipEntries = (state: RootState) => state.clip.entries

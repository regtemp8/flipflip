import { createSelector } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import { selectAppTags } from '../app/selectors'
import Tag from './Tag'

export const selectTagNextID = () => {
  return (state: RootState): number => state.tag.nextID
}

export const selectTagName = (id: number) => {
  return (state: RootState): string | undefined => state.tag.entries[id].name
}

export const getTagEntries = (state: RootState) => state.tag.entries

export const selectTags = () => {
  return createSelector([selectAppTags(), getTagEntries], (ids, entries) =>
    ids.map((id) => entries[id] as Tag)
  )
}

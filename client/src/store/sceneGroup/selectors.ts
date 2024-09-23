import { type RootState } from '../store'
import { getEntry } from '../EntryState'
import { getAppSceneGroups } from '../app/selectors'
import { createSelector } from '@reduxjs/toolkit'
import { getSceneEntries } from '../scene/selectors'
import { getDisplayEntries } from '../display/selectors'
import { getPlaylistEntries } from '../playlist/selectors'

export const selectSceneGroupName = (id: number) => {
  return (state: RootState): string => getEntry(state.sceneGroup, id).name
}

export const selectSceneGroupType = (id: number) => {
  return (state: RootState): string => getEntry(state.sceneGroup, id).type
}

const getSceneGroupEntries = (state: RootState) => state.sceneGroup.entries

export const selectSceneGroups = () => {
  return createSelector(
    [getAppSceneGroups, getSceneGroupEntries],
    (ids, entries) => ids.map((id) => entries[id])
  )
}

const getSceneGroupScenes = (id: number) => (state: RootState) =>
  state.sceneGroup.entries[id].scenes

export const selectSceneGroupScenes = (id: number) => {
  return createSelector(
    [getSceneGroupScenes(id), getSceneEntries],
    (ids, entries) => ids.map((id) => entries[id])
  )
}

export const selectSceneGroupDisplays = (id: number) => {
  return createSelector(
    [getSceneGroupScenes(id), getDisplayEntries],
    (ids, entries) => ids.map((id) => entries[id])
  )
}

export const selectSceneGroupPlaylists = (id: number) => {
  return createSelector(
    [getSceneGroupScenes(id), getPlaylistEntries],
    (ids, entries) => ids.map((id) => entries[id])
  )
}

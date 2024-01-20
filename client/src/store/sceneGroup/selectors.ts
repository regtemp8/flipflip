import { type RootState } from '../store'
import { getEntry } from '../EntryState'
import { getAppSceneGroups } from '../app/selectors'
import { createSelector } from '@reduxjs/toolkit'
import { getSceneEntries } from '../scene/selectors'
import { getSceneGridEntries } from '../sceneGrid/selectors'
import { convertSceneIDToGridID } from '../../data/utils'

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

export const selectSceneGroupGrids = (id: number) => {
  return createSelector(
    [getSceneGroupScenes(id), getSceneGridEntries],
    (ids, entries) =>
      ids.map((id) => {
        const gridID = convertSceneIDToGridID(id) as number
        return entries[gridID]
      })
  )
}

import { type RootState } from '../store'
import { type EntryState } from '../EntryState'
import { getAppSceneGroups } from '../app/selectors'
import type SceneGroup from './SceneGroup'
import { createSelector } from '@reduxjs/toolkit'
import { getSceneEntries } from '../scene/selectors'
import SceneGrid from '../sceneGrid/SceneGrid'
import { getSceneGridEntries } from '../sceneGrid/selectors'
import Scene from '../scene/Scene'
import { convertSceneIDToGridID } from '../../renderer/data/utils'

export const getSceneGroup = (state: EntryState<SceneGroup>, id: number): SceneGroup | undefined => {
  return state.entries[id]
}

export const selectSceneGroupName = (id: number) => {
  return (state: RootState): string | undefined => getSceneGroup(state.sceneGroup, id)?.name
}

export const selectSceneGroupType = (id: number) => {
  return (state: RootState): string | undefined => getSceneGroup(state.sceneGroup, id)?.type
}

const getSceneGroupEntries = (state: RootState) => state.sceneGroup.entries

export const selectSceneGroups = () => {
  return createSelector(
    [getAppSceneGroups, getSceneGroupEntries], 
    (ids, entries) => ids.map((id => entries[id] as SceneGroup))
  )
}

const getSceneGroupScenes = (id: number) => (state: RootState) => state.sceneGroup.entries[id]?.scenes

export const selectSceneGroupScenes = (id: number) => {
  return createSelector(
    [getSceneGroupScenes(id), getSceneEntries],
    (ids, entries) => ids?.map((id) => entries[id] as Scene)
  )
}

export const selectSceneGroupGrids = (id: number) => {
  return createSelector(
    [getSceneGroupScenes(id), getSceneGridEntries],
    (ids, entries) => ids?.map((id) => {
      const gridID = convertSceneIDToGridID(id) as number
      return entries[gridID] as SceneGrid
    })
  )
}
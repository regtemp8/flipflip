import { type RootState } from '../store'
import { createSelector } from '@reduxjs/toolkit'
import { SG } from 'flipflip-common'
import {
  selectSceneGroups,
  selectSceneGroupScenes,
  selectSceneGroupGrids
} from '../sceneGroup/selectors'
import { selectScenes } from '../scene/selectors'
import Scene from '../scene/Scene'
import SceneGrid from '../sceneGrid/SceneGrid'
import { selectSceneGrids } from '../sceneGrid/selectors'
import {
  convertDisplayIDToSceneID,
  convertGridIDToSceneID
} from '../../data/utils'
import { selectDisplays } from '../display/selectors'
import Display from '../display/Display'

const getScenePickerFilters = (state: RootState) => state.scenePicker.filters
export const selectScenePickerFilters = () => {
  return getScenePickerFilters
}

const selectGroupedScenes = (type: string) => {
  return createSelector(
    [(state) => type, selectSceneGroups()],
    (type, groups) =>
      groups.filter((g) => g.type === type).flatMap((g) => g.scenes)
  )
}

export const selectScenePickerUngroupedScenes = () => {
  return createSelector(
    [selectGroupedScenes(SG.scene), selectScenes(), getScenePickerFilters],
    (groupedScenes, scenes, filters) => {
      return scenes
        .filter(
          (s) =>
            !groupedScenes.includes(s.id) &&
            !isGeneratorScene(s) &&
            isDisplayScene(s, filters)
        )
        .map((s) => s.id)
    }
  )
}

export const selectScenePickerUngroupedGenerators = () => {
  return createSelector(
    [selectGroupedScenes(SG.generator), selectScenes(), getScenePickerFilters],
    (groupedScenes, scenes, filters) => {
      return scenes
        .filter(
          (s) =>
            !groupedScenes.includes(s.id) &&
            isGeneratorScene(s) &&
            isDisplayScene(s, filters)
        )
        .map((s) => s.id)
    }
  )
}

export const selectScenePickerUngroupedGrids = () => {
  return createSelector(
    [selectGroupedScenes(SG.grid), selectSceneGrids(), getScenePickerFilters],
    (groupedScenes, grids, filters) => {
      return grids
        .filter(
          (s) =>
            !groupedScenes.includes(convertGridIDToSceneID(s.id)) &&
            isDisplayGrid(s, filters)
        )
        .map((s) => s.id)
    }
  )
}

export const selectScenePickerUngroupedDisplays = () => {
  return createSelector(
    [selectGroupedScenes(SG.display), selectDisplays(), getScenePickerFilters],
    (groupedScenes, displays, filters) => {
      return displays
        .filter(
          (s) =>
            !groupedScenes.includes(convertDisplayIDToSceneID(s.id)) &&
            isDisplayDisplay(s, filters)
        )
        .map((s) => s.id)
    }
  )
}

export const selectScenePickerSceneGroups = () => {
  return createSelector([selectSceneGroups()], (groups) =>
    groups.filter((s) => s.type === SG.scene).map((s) => s.id)
  )
}

export const selectScenePickerGeneratorGroups = () => {
  return createSelector([selectSceneGroups()], (groups) =>
    groups.filter((s) => s.type === SG.generator).map((s) => s.id)
  )
}

export const selectScenePickerGridGroups = () => {
  return createSelector([selectSceneGroups()], (groups) =>
    groups.filter((s) => s.type === SG.grid).map((s) => s.id)
  )
}

export const selectScenePickerDisplayGroups = () => {
  return createSelector([selectSceneGroups()], (groups) =>
    groups.filter((s) => s.type === SG.display).map((s) => s.id)
  )
}

export const selectScenePickerGroupItems = (groupID: number, type: string) => {
  switch (type) {
    case SG.scene:
      return selectScenePickerSceneGroupItems(groupID)
    case SG.grid:
      return selectScenePickerGridGroupItems(groupID)
    case SG.generator:
      return selectScenePickerGeneratorGroupItems(groupID)
    default:
      throw new Error('Invalid type: ' + type)
  }
}

const selectScenePickerSceneGroupItems = (groupID: number) => {
  return createSelector(
    [selectSceneGroupScenes(groupID), getScenePickerFilters],
    (scenes, filters) =>
      scenes
        ?.filter((s) => !isGeneratorScene(s) && isDisplayScene(s, filters))
        .map((s) => s.id)
  )
}

const selectScenePickerGeneratorGroupItems = (groupID: number) => {
  return createSelector(
    [selectSceneGroupScenes(groupID), getScenePickerFilters],
    (scenes, filters) =>
      scenes
        ?.filter((s) => isGeneratorScene(s) && isDisplayScene(s, filters))
        .map((s) => s.id)
  )
}

const selectScenePickerGridGroupItems = (groupID: number) => {
  return createSelector(
    [selectSceneGroupGrids(groupID), getScenePickerFilters],
    (grids, filters) =>
      grids?.filter((s) => isDisplayGrid(s, filters)).map((s) => s.id)
  )
}

export const selectScenePickerSceneCount = () => {
  return createSelector(
    [selectScenes()],
    (scenes) => scenes.filter((s) => !isGeneratorScene(s)).length
  )
}

export const selectScenePickerGeneratorCount = () => {
  return createSelector(
    [selectScenes()],
    (scenes) => scenes.filter((s) => isGeneratorScene(s)).length
  )
}

export const selectScenePickerDisplayCount = () => {
  return (state: RootState) => state.app.displays.length
}

export const selectScenePickerGridCount = () => {
  return (state: RootState) => state.app.grids.length
}

export const selectScenePickerAllScenesCount = () => {
  return (state: RootState) => state.app.scenes.length
}

const isGeneratorScene = (scene: Scene) => {
  return !!scene.generatorWeights
}

const isDisplayScene = (scene: Scene, filters: string[]) => {
  return filters.length === 0 || nameMatchesFilter(scene.name, filters)
}

const isDisplayGrid = (grid: SceneGrid, filters: string[]) => {
  return (
    filters.length === 0 ||
    (grid.name !== undefined && nameMatchesFilter(grid.name, filters))
  )
}

const isDisplayDisplay = (display: Display, filters: string[]) => {
  return (
    filters.length === 0 ||
    (display.name !== undefined && nameMatchesFilter(display.name, filters))
  )
}

const nameMatchesFilter = (name: string, filters: string[]) => {
  let matchesFilter = true
  for (let filter of filters) {
    if (
      ((filter.startsWith('"') || filter.startsWith('-"')) &&
        filter.endsWith('"')) ||
      ((filter.startsWith("'") || filter.startsWith("-'")) &&
        filter.endsWith("'"))
    ) {
      if (filter.startsWith('-')) {
        filter = filter.substring(2, filter.length - 1)
        const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
        matchesFilter = !regex.test(name)
      } else {
        filter = filter.substring(1, filter.length - 1)
        const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
        matchesFilter = regex.test(name)
      }
    } else {
      // This is a search filter
      filter = filter.replace('\\', '\\\\')
      if (filter.startsWith('-')) {
        filter = filter.substring(1, filter.length)
        const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
        matchesFilter = !regex.test(name)
      } else {
        const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
        matchesFilter = regex.test(name)
      }
    }
    if (!matchesFilter) break
  }

  return matchesFilter
}

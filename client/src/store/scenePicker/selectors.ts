import { type RootState } from '../store'
import { createSelector } from '@reduxjs/toolkit'
import { SG } from 'flipflip-common'
import {
  selectSceneGroups,
  selectSceneGroupScenes,
  selectSceneGroupDisplays,
  selectSceneGroupPlaylists
} from '../sceneGroup/selectors'
import { selectScenes } from '../scene/selectors'
import Scene from '../scene/Scene'
import { selectDisplays } from '../display/selectors'
import Display from '../display/Display'
import { selectPlaylists } from '../playlist/selectors'
import Playlist from '../playlist/Playlist'

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

export const selectScenePickerUngroupedDisplays = () => {
  return createSelector(
    [selectGroupedScenes(SG.display), selectDisplays(), getScenePickerFilters],
    (groupedScenes, displays, filters) => {
      return displays
        .filter(
          (s) => !groupedScenes.includes(s.id) && isDisplayDisplay(s, filters)
        )
        .map((s) => s.id)
    }
  )
}

export const selectScenePickerUngroupedPlaylists = () => {
  return createSelector(
    [
      selectGroupedScenes(SG.playlist),
      selectPlaylists(),
      getScenePickerFilters
    ],
    (groupedScenes, playlists, filters) => {
      return playlists
        .filter(
          (s) => !groupedScenes.includes(s.id) && isDisplayPlaylist(s, filters)
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

export const selectScenePickerDisplayGroups = () => {
  return createSelector([selectSceneGroups()], (groups) =>
    groups.filter((s) => s.type === SG.display).map((s) => s.id)
  )
}

export const selectScenePickerPlaylistGroups = () => {
  return createSelector([selectSceneGroups()], (groups) =>
    groups.filter((s) => s.type === SG.playlist).map((s) => s.id)
  )
}

export const selectScenePickerGroupItems = (groupID: number, type: string) => {
  switch (type) {
    case SG.scene:
      return selectScenePickerSceneGroupItems(groupID)
    case SG.generator:
      return selectScenePickerGeneratorGroupItems(groupID)
    case SG.display:
      return selectScenePickerDisplayGroupItems(groupID)
    case SG.playlist:
      return selectScenePickerPlaylistGroupItems(groupID)
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

const selectScenePickerDisplayGroupItems = (groupID: number) => {
  return createSelector(
    [selectSceneGroupDisplays(groupID), getScenePickerFilters],
    (displays, filters) =>
      displays?.filter((s) => isDisplayDisplay(s, filters)).map((s) => s.id)
  )
}

const selectScenePickerPlaylistGroupItems = (groupID: number) => {
  return createSelector(
    [selectSceneGroupPlaylists(groupID), getScenePickerFilters],
    (playlists, filters) =>
      playlists?.filter((s) => isDisplayPlaylist(s, filters)).map((s) => s.id)
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

export const selectScenePickerPlaylistCount = () => {
  return (state: RootState) => state.app.playlists.length
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

const isDisplayDisplay = (display: Display, filters: string[]) => {
  return (
    filters.length === 0 ||
    (display.name != null && nameMatchesFilter(display.name, filters))
  )
}

const isDisplayPlaylist = (playlist: Playlist, filters: string[]) => {
  return (
    filters.length === 0 ||
    (playlist.name != null && nameMatchesFilter(playlist.name, filters))
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

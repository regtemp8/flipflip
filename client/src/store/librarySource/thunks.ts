import { type AppDispatch, type RootState } from '../store'
import { setLibrary } from '../app/slice'
import {
  setLibrarySource,
  setLibrarySourceTags,
  setLibrarySourceMarked,
  setLibrarySourceBlacklist
} from './slice'
import { getActiveScene } from '../app/thunks'
import { setSceneSources } from '../scene/slice'
import { newLibrarySource } from './LibrarySource'
import Scene from '../scene/Scene'

export function inheritTagsFromClips(sourceID: number) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    const state = getState()
    const source = state.librarySource.entries[sourceID]
    if (!source) return

    const clipTags = new Set<number>()
    for (const clipID of source.clips) {
      const tags = state.clip.entries[clipID].tags
      for (const tag of tags) {
        clipTags.add(tag)
      }
    }

    dispatch(setLibrarySourceTags({ id: sourceID, value: [...clipTags] }))
  }
}

export function setLibrarySourcesTags(
  sourceIDs: number[],
  selectedTags: string[]
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const tags = state.app.tags
      .map((id) => state.tag.entries[id])
      .filter((t) => selectedTags.includes(t.name as string))
      .map((t) => t.id)

    sourceIDs.forEach((id) =>
      dispatch(setLibrarySourceTags({ id, value: tags }))
    )
  }
}

export function setLibrarySourcesAddTags(
  sourceIDs: number[],
  selectedTags: string[]
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const tags = state.app.tags
      .map((id) => state.tag.entries[id])
      .filter((t) => selectedTags.includes(t.name as string))
      .map((t) => t.id)

    sourceIDs.forEach((id) => {
      const source = state.librarySource.entries[id]
      const newTags = new Set([...source.tags, ...tags])
      dispatch(setLibrarySourceTags({ id, value: [...newTags] }))
    })
  }
}

export function setLibrarySourcesRemoveTags(
  sourceIDs: number[],
  selectedTags: string[]
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const tags = state.app.tags
      .map((id) => state.tag.entries[id])
      .filter((t) => selectedTags.includes(t.name as string))
      .map((t) => t.id)

    sourceIDs.forEach((id) => {
      const newTags = state.librarySource.entries[id].tags.filter(
        (id) => !tags.includes(id)
      )
      dispatch(setLibrarySourceTags({ id, value: newTags }))
    })
  }
}

export function setLibrarySourcesToggleMarked(sourceIDs: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const value =
      state.app.library
        .map((id) => state.librarySource.entries[id])
        .find((s) => s.marked) == null
    if (!value) {
      sourceIDs = state.app.library
    }

    sourceIDs.forEach((id) => dispatch(setLibrarySourceMarked({ id, value })))
  }
}

export function setLibraryEditUrl(sourceId: number, newURL: string) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const editSource = state.librarySource.entries[sourceId]
    const sourceChanged = editSource.url !== newURL
    editSource.offline = sourceChanged ? false : editSource.offline
    editSource.lastCheck = sourceChanged ? undefined : editSource.lastCheck
    editSource.url = newURL
    editSource.count = sourceChanged ? 0 : editSource.count
    editSource.countComplete = sourceChanged ? false : editSource.countComplete
    editSource.duration = sourceChanged ? undefined : editSource.duration
    editSource.resolution = sourceChanged ? undefined : editSource.resolution

    const newSources = new Map<string, number>()
    for (const sourceID of state.app.library) {
      const source = state.librarySource.entries[sourceID]
      const sourceURL = source.url
      if (/^\s*$/.exec(sourceURL) == null) {
        const existingID = newSources.get(sourceURL)
        if (existingID == null || existingID > sourceID) {
          newSources.set(sourceURL, sourceID)
        }
      }
    }

    dispatch(setLibrarySource(editSource))
    dispatch(setLibrary([...newSources.values()]))
  }
}

export function setSceneSourcesEditUrl(sourceID: number, newURL: string) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    console.log('setSceneSourcesEditUrl: ' + sourceID)
    const state = getState()
    const librarySource = state.app.library
      .map((id) => state.librarySource.entries[id])
      .find((source) => source.url === newURL)
    const scene = getActiveScene(state) as Scene
    if (scene.sources.includes(sourceID)) {
      throw new Error('LibrarySource is not part of scene ')
    }

    const editSource = state.librarySource.entries[sourceID]
    const newSource = newLibrarySource(editSource)
    const sourceChanged = editSource.url !== newURL
    newSource.offline = sourceChanged ? false : editSource.offline
    newSource.lastCheck = sourceChanged ? undefined : editSource.lastCheck
    newSource.url = newURL
    newSource.tags = librarySource?.tags ? librarySource.tags : editSource.tags
    newSource.clips = librarySource?.clips
      ? librarySource.clips
      : newSource.clips
    newSource.blacklist = librarySource?.blacklist
      ? librarySource.blacklist
      : newSource.blacklist
    newSource.count = librarySource
      ? librarySource.count
      : sourceChanged
        ? 0
        : editSource.count
    newSource.countComplete = librarySource
      ? librarySource.countComplete
      : sourceChanged
        ? false
        : editSource.countComplete
    newSource.duration = librarySource
      ? librarySource.duration
      : sourceChanged
        ? undefined
        : editSource.duration
    newSource.resolution = librarySource
      ? librarySource.resolution
      : sourceChanged
        ? undefined
        : editSource.resolution

    const newSources = new Map<string, number>()
    for (const sourceID of scene.sources) {
      const sourceURL = state.librarySource.entries[sourceID].url
      if (/^\s*$/.exec(sourceURL) == null) {
        const existingID = newSources.get(sourceURL)
        if (existingID == null || existingID > sourceID) {
          newSources.set(sourceURL, sourceID)
        }
      }
    }

    dispatch(setLibrarySource(newSource))
    dispatch(setSceneSources({ id: scene.id, value: [...newSources.values()] }))
  }
}

export function editBlacklist(sourceURL: string, blacklist: string) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const newBlacklist = blacklist
      .split('\n')
      .filter((s) => /^\w*$/.exec(s) == null)
    const source = state.app.library
      .map((id) => state.librarySource.entries[id])
      .find((s) => s.url === sourceURL)
    if (source) {
      dispatch(
        setLibrarySourceBlacklist({ id: source.id, value: newBlacklist })
      )
    }

    const sourceIDs = state.app.scenes
      .map((id) => state.scene.entries[id])
      .flatMap((s) => s.sources)
      .map((id) => state.librarySource.entries[id])
      .filter((s) => s.url === sourceURL)
      .map((s) => s.id)

    new Set(sourceIDs).forEach((id) =>
      dispatch(setLibrarySourceBlacklist({ id, value: newBlacklist }))
    )
  }
}

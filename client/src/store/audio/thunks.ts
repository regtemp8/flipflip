import wretch from 'wretch'
import { type RootState, type AppDispatch } from '../store'
import { isAudio } from 'flipflip-common'
import type Audio from './Audio'
import { newAudio } from './Audio'
import { extractMusicMetadata } from '../../data/utils'
import { setAudiosAddAtStart } from '../app/slice'
import { setRouteGoBack, getActiveScene } from '../app/thunks'
import {
  setError,
  setLoadingMetadata,
  setLoadingSources
} from '../audioLibrary/slice'
import { setSceneAudioPlaylistAddAudios } from '../scene/slice'
import { setAudio, setAudioMarked, setAudioTags } from './slice'
import FlipFlipService from '../../FlipFlipService'
import Scene from '../scene/Scene'

export function onAddAudioUrl(importURL: string, cachePath: string) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    // dedup
    if (
      state.app.audios.find(
        (id) => state.audio.entries[id].url === importURL
      ) != null ||
      !isAudio(importURL, false)
    ) {
      console.error('File is not valid')
      dispatch(setLoadingMetadata(false))
      dispatch(setError(true))
      setTimeout(() => {
        dispatch(setError(false))
      }, 3000)
      return
    }

    const audio = newAudio({
      url: importURL,
      id: state.audio.nextID,
      tags: []
    })

    dispatch(setAudio(audio))
    dispatch(setLoadingMetadata(true))
    const error = (err: any) => {
      console.error('File is not available:', err.message)
      dispatch(setLoadingMetadata(false))
      dispatch(setError(true))
      setTimeout(() => {
        dispatch(setError(false))
      }, 3000)
    }
    wretch(importURL)
      .get()
      .unauthorized(error)
      .notFound(error)
      .timeout(error)
      .internalError(error)
      .arrayBuffer((arrayBuffer) => {
        const flipflip = FlipFlipService.getInstance()
        flipflip.api
          .parseMusicMetadataBuffer(arrayBuffer, cachePath)
          .then(async (metadata: any) => {
            return await extractMusicMetadata(audio, newAudio(metadata))
          })
          .then((newAudio: Audio) => {
            if (!newAudio.name) {
              newAudio.name = importURL.substring(
                importURL.lastIndexOf(state.constants.pathSep) + 1,
                importURL.lastIndexOf('.')
              )
            }
            dispatch(setAudiosAddAtStart(newAudio.id))
            dispatch(setLoadingMetadata(false))
          })
          .catch((err: any) => {
            console.error('Error reading metadata:', err.message)
            dispatch(setLoadingMetadata(false))
            dispatch(setError(true))
            setTimeout(() => {
              dispatch(setError(false))
            }, 3000)
          })
      })
      .catch(error)
  }
}

export function onAddAudioSources(newSources: string[], cachePath: string) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    const state = getState()
    // dedup
    const sourceURLs = state.app.audios
      .map((id) => state.audio.entries[id])
      .map((s) => s.url)
    newSources = newSources.filter(
      (s) => !sourceURLs.includes(s) && isAudio(s, true)
    )

    let index = 0
    const addSourceLoop = async () => {
      if (index === newSources.length) {
        dispatch(setLoadingSources(false))
        return
      }

      index++
      const url = newSources[index]
      const flipflip = FlipFlipService.getInstance()
      if (url.startsWith('http') || (await flipflip.api.pathExists(url))) {
        const audio = newAudio({
          url,
          id: state.audio.nextID,
          tags: []
        })

        dispatch(setAudio(audio))
        flipflip.api
          .parseMusicMetadataFile(url, cachePath)
          .then(async (metadata: any) => {
            return await extractMusicMetadata(audio, newAudio(metadata))
          })
          .then(async (newAudio: Audio) => {
            if (!newAudio.name) {
              newAudio.name = url.substring(
                url.lastIndexOf(state.constants.pathSep) + 1,
                url.lastIndexOf('.')
              )
            }
            dispatch(setAudiosAddAtStart(newAudio.id))
            await addSourceLoop()
          })
          .catch(async (err: any) => {
            console.error('Error reading metadata:', err.message)
            await addSourceLoop()
          })
      } else {
        await addSourceLoop()
      }
    }

    await addSourceLoop()
  }
}

export function importAudioFromLibrary(selected: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const audios = selected.filter((id) => state.audio.entries[id])

    const playlistIndex = state.app.route[state.app.route.length - 1]
      .value as number
    const sceneID = (getActiveScene(state) as Scene).id
    dispatch(setSceneAudioPlaylistAddAudios({ sceneID, playlistIndex, audios }))
    dispatch(setRouteGoBack())
  }
}

export function toggleAudiosMarked(audios: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const value =
      state.app.audios
        .map((id) => state.audio.entries[id])
        .find((s) => s.marked) == null
    if (!value) {
      audios = state.app.audios
    }

    audios.forEach((id) => dispatch(setAudioMarked({ id, value })))
  }
}

export function setAudiosRemoveTags(
  audioIDs: number[],
  selectedTags: string[]
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const tagIDs = state.app.tags
      .map((id) => state.tag.entries[id])
      .filter((t) => selectedTags.includes(t.name as string))
      .map((t) => t.id)

    audioIDs.forEach((id) => {
      const value = state.audio.entries[id].tags.filter(
        (id) => !tagIDs.includes(id)
      )
      dispatch(setAudioTags({ id, value }))
    })
  }
}

export function setAudiosAddTags(audioIDs: number[], selectedTags: string[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const tagIDs = state.app.tags
      .map((id) => state.tag.entries[id])
      .filter((t) => selectedTags.includes(t.name as string))
      .map((t) => t.id)

    audioIDs.forEach((id) => {
      const value = state.audio.entries[id].tags
      tagIDs.filter((id) => !value.includes(id)).forEach((id) => value.push(id))
      dispatch(setAudioTags({ id, value }))
    })
  }
}

export function setAudiosTags(audioIDs: number[], selectedTags: string[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const tagIDs = state.app.tags
      .map((id) => state.tag.entries[id])
      .filter((t) => selectedTags.includes(t.name as string))
      .map((t) => t.id)

    audioIDs.forEach((id) => dispatch(setAudioTags({ id, value: tagIDs })))
  }
}

export function setAudiosChangeKeys(
  audioIDs: number[],
  keys: string[],
  common: Audio
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const audios = audioIDs.map((id) => state.audio.entries[id])
    for (const audio of audios) {
      for (const key of keys) {
        if (common[key] != null && common[key] !== '') {
          audio[key] = common[key]
        }
      }

      dispatch(setAudio(audio))
    }
  }
}

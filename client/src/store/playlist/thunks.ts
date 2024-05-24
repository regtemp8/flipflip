import {
  PLT,
  SP,
  SS,
  copy,
  newAudioPlaylist as newAudioPlaylistStorage,
  newDisplayPlaylist as newDisplayPlaylistStorage
} from 'flipflip-common'
import { newRoute } from '../app/data/Route'
import {
  addRoutes,
  addToDisplays,
  addToPlaylists,
  setRoute,
  setSpecialMode,
  setSystemSnack,
  systemMessage
} from '../app/slice'
import { AppDispatch, RootState } from '../store'
import Playlist, { PlaylistType, newPlaylist } from './Playlist'
import { setPlaylist, setPlaylistItems } from './slice'
import flipflip from '../../FlipFlipService'
import {
  fromAudioPlaylistStorage,
  fromDisplayPlaylistStorage,
  toAudioPlaylistStorage,
  toDisplayPlaylistStorage,
  toScenePlaylistStorage,
  toScriptPlaylistStorage
} from '../app/convert'
import { AppStorageImport, initialAppStorageImport } from '../AppStorageImport'
import Audio from '../audio/Audio'
import {
  incrementIDValue,
  incrementIDsList,
  incrementSliceIDs
} from '../../data/import'
import Tag from '../tag/Tag'
import { setTag } from '../tag/slice'
import { setAudio } from '../audio/slice'
import Display from '../display/Display'
import View from '../displayView/View'
import { setDisplayView } from '../displayView/slice'
import { setDisplay } from '../display/slice'
import Scene from '../scene/Scene'

export function addPlaylist(type: PlaylistType) {
  return (dispatch: AppDispatch, getState: () => RootState): number => {
    const state = getState()
    const playlist = newPlaylist({ id: state.playlist.nextID, type })
    dispatch(setPlaylist(playlist))
    dispatch(addToPlaylists([playlist.id]))
    dispatch(addRoutes([newRoute({ kind: 'playlist', value: playlist.id })]))
    return playlist.id
  }
}

export function clonePlaylist(id: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const playlistCopy = copy<Playlist>(state.playlist.entries[id])
    playlistCopy.id = state.playlist.nextID

    dispatch(setPlaylist(playlistCopy))
    dispatch(addToPlaylists([playlistCopy.id]))
    dispatch(setRoute([newRoute({ kind: 'playlist', value: playlistCopy.id })]))
    dispatch(setSpecialMode(SP.autoEdit))
    dispatch(
      setSystemSnack({
        message: 'Clone successful!',
        severity: SS.success
      })
    )
  }
}

export function exportPlaylist(id: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const playlist = state.playlist.entries[id]
    let playlistExport = undefined
    switch (playlist.type) {
      case PLT.audio:
        playlistExport = toAudioPlaylistStorage(id, state)
        break
      case PLT.display:
        playlistExport = toDisplayPlaylistStorage(id, state)
        break
      case PLT.scene:
        playlistExport = toScenePlaylistStorage(id, state)
        break
      case PLT.script:
        playlistExport = toScriptPlaylistStorage(id, state)
        break
      default:
        throw new Error('Unsupported playlist type')
    }

    const fileName = playlist.name + '_export.json'
    flipflip().api.saveJsonFile(fileName, JSON.stringify(playlistExport))
  }
}

export function importPlaylist(playlistToImport: any) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    if (!playlistToImport.type) {
      dispatch(systemMessage('Not a valid playlist file'))
      return
    }

    switch (playlistToImport.type) {
      case PLT.audio:
        dispatch(importAudioPlaylist(playlistToImport))
        break
      case PLT.display:
        dispatch(importDisplayPlaylist(playlistToImport))
        break
      case PLT.scene:
        dispatch(importScenePlaylist(playlistToImport))
        break
      case PLT.script:
        dispatch(importScriptPlaylist(playlistToImport))
        break
      default:
        dispatch(
          systemMessage(`Unsupported playlist type: ${playlistToImport.type}`)
        )
    }
  }
}

export function importAudioPlaylist(playlistToImport: any) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const playlist = newAudioPlaylistStorage(playlistToImport)

    // map to redux state
    const state = getState()
    const slice = copy<AppStorageImport>(initialAppStorageImport)
    fromAudioPlaylistStorage(playlist, slice.playlist, slice.audio, slice.tag)

    // prepare for merge into existing slices
    const playlistNextID = state.playlist.nextID
    const audioNextID = state.audio.nextID
    const tagNextID = state.tag.nextID

    Object.values(slice.playlist.entries).forEach((s) => {
      s.items = incrementIDsList<Audio>(s.items, slice.audio, audioNextID)
    })

    Object.values(slice.audio.entries).forEach((s) => {
      s.tags = incrementIDsList<Tag>(s.tags, slice.tag, tagNextID)
    })

    slice.playlist = incrementSliceIDs<Playlist>(slice.playlist, playlistNextID)
    slice.audio = incrementSliceIDs<Audio>(slice.audio, audioNextID)
    slice.tag = incrementSliceIDs<Tag>(slice.tag, tagNextID)

    Object.values(slice.tag.entries).forEach((s) => dispatch(setTag(s)))

    Object.values(slice.audio.entries).forEach((s) => dispatch(setAudio(s)))

    const playlistID = Number(Object.keys(slice.playlist.entries)[0])
    const playlistEntry = slice.playlist.entries[playlistID]
    dispatch(setPlaylist(playlistEntry))
    dispatch(addToPlaylists([playlistID]))
    dispatch(setRoute([newRoute({ kind: 'playlist', value: playlistID })]))
  }
}

export function importDisplayPlaylist(playlistToImport: any) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const playlist = newDisplayPlaylistStorage(playlistToImport)

    // map to redux state
    const state = getState()
    const slice = copy<AppStorageImport>(initialAppStorageImport)
    fromDisplayPlaylistStorage(
      playlist,
      slice.playlist,
      slice.display,
      slice.displayView
    )

    // prepare for merge into existing slices
    const playlistNextID = state.playlist.nextID
    const displayNextID = state.display.nextID
    const sceneNextID = state.scene.nextID
    const displayViewNextID = state.displayView.nextID

    Object.values(slice.playlist.entries)
      .filter((s) => s.type === PLT.display)
      .forEach((s) => {
        s.items = incrementIDsList<Display>(
          s.items,
          slice.display,
          displayNextID
        )
      })
    Object.values(slice.playlist.entries)
      .filter((s) => s.type === PLT.scene)
      .forEach((s) => {
        s.items = incrementIDsList<Scene>(s.items, slice.scene, sceneNextID)
      })

    Object.values(slice.display.entries).forEach((s) => {
      s.views = incrementIDsList<View>(
        s.views,
        slice.displayView,
        displayViewNextID
      )

      s.selectedView = incrementIDValue<View>(
        s.selectedView ?? -1,
        slice.displayView,
        displayViewNextID,
        -1
      )

      if (s.selectedView === -1) {
        s.selectedView = undefined
      }
    })

    slice.playlist = incrementSliceIDs<Playlist>(slice.playlist, playlistNextID)
    slice.display = incrementSliceIDs<Display>(slice.display, displayNextID)
    slice.displayView = incrementSliceIDs<View>(
      slice.displayView,
      displayViewNextID
    )

    Object.values(slice.displayView.entries).forEach((s) =>
      dispatch(setDisplayView(s))
    )

    Object.values(slice.display.entries).forEach((s) => {
      dispatch(setDisplay(s))
      dispatch(addToDisplays(s.id))
    })

    const playlistID = Number(Object.keys(slice.playlist.entries)[0])
    const playlistEntry = slice.playlist.entries[playlistID]
    dispatch(setPlaylist(playlistEntry))
    dispatch(addToPlaylists([playlistID]))
    dispatch(setRoute([newRoute({ kind: 'playlist', value: playlistID })]))
  }
}

export function importScenePlaylist(playlistToImport: any) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    // TODO use AppStorage subset for import/export
  }
}

export function importScriptPlaylist(playlistToImport: any) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    // TODO use AppStorage subset for import/export
  }
}

export function setPlaylistsRemoveAudio(audioID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const playlists = state.app.playlists.map(
      (id) => state.playlist.entries[id]
    )
    for (const playlist of playlists) {
      const index = playlist.items.indexOf(audioID)
      if (index !== -1) {
        playlist.items.splice(index, 1)
        dispatch(setPlaylistItems({ id: playlist.id, value: playlist.items }))
      }
    }
  }
}

export function setPlaylistRemoveAudio(playlistName: string, sourceId: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const playlist = state.app.playlists
      .map((id) => state.playlist.entries[id])
      .find((p) => p.name === playlistName) as Playlist
    const index = playlist.items.indexOf(sourceId)
    if (index !== -1) {
      playlist.items.splice(index, 1)
      dispatch(setPlaylistItems({ id: playlist.id, value: playlist.items }))
    }
  }
}

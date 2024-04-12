import wretch from 'wretch'
import { type AppDispatch, type RootState } from '../store'
import { type EntryState, getEntry } from '../EntryState'
import { AppStorageImport, initialAppStorageImport } from '../AppStorageImport'
import {
  audioSortFunction,
  getSourceUrl,
  scriptSortFunction,
  sortFunction
} from '../../data/actions'
import { analyze } from 'web-audio-beat-detector'
import type Progress from './data/Progress'
import {
  arrayMove,
  convertGridIDToSceneID,
  convertSceneIDToGridID,
  getCachePath,
  isSceneIDAGridID,
  randomizeList,
  applyEffects,
  getEffects,
  convertSceneIDToDisplayID
} from '../../data/utils'
import {
  setAppSlice,
  setAppScenes,
  setTutorial,
  setDisplayedSources,
  setConfigTutorialsScenePicker,
  setConfigTutorialsSceneGenerator,
  setConfigTutorialsSceneDetail,
  setConfigTutorialsPlayer,
  setConfigTutorialsLibrary,
  setConfigTutorialsAudios,
  setConfigTutorialsScripts,
  setConfigTutorialsScriptor,
  setConfigTutorialsSceneGrid,
  setConfigTutorialsVideoClipper,
  setSpecialMode,
  setRoutePop,
  setRoute,
  setAppTags,
  addToTags,
  addToScenes,
  addToGrids,
  addToSceneGroups,
  removeFromGrids,
  removeFromScenes,
  removeFromSceneGroups,
  systemMessage,
  setSystemSnack,
  setLibrary,
  addToLibrary,
  addToAudios,
  addToScripts,
  addRoutes,
  setAudios,
  setScripts,
  setPlaylists,
  setProgress,
  importScriptToScriptor,
  addToScriptsAtStart,
  setLibraryRemove,
  setConfigServerSettingsOnBlur,
  setConfigServerSettingsChanged,
  addToDisplays,
  removeFromDisplays
} from './slice'
import {
  toAppStorage,
  toLibrarySourceStorage,
  fromAppStorage,
  fromSceneStorage,
  fromSceneGridStorage,
  fromLibrarySourceStorage,
  toConfigStorage
} from './convert'
import type Route from '../app/data/Route'
import type Audio from '../audio/Audio'
import { setAudioSlice, setAudioTags, setAudioToggleTag } from '../audio/slice'
import type CaptionScript from '../captionScript/CaptionScript'
import { newCaptionScript } from '../captionScript/CaptionScript'
import Playlist, { newPlaylist } from '../playlist/Playlist'
import {
  setPlaylist,
  setPlaylistAudios,
  setPlaylistSlice
} from '../playlist/slice'
import type Scene from '../scene/Scene'
import { newScene } from '../scene/Scene'
import { videoClipperSceneName } from '../scene/selectors'
import {
  deleteScene,
  setScene,
  setSceneNextSceneID,
  setSceneNextSceneRandoms,
  setSceneRemoveOverlay,
  setSceneSlice,
  setSceneSources,
  setSceneScriptPlaylistScripts
} from '../scene/slice'
import { setVideoClipperSceneVideoVolume } from '../scene/thunks'
import type SceneGrid from '../sceneGrid/SceneGrid'
import { newSceneGrid } from '../sceneGrid/SceneGrid'
import { newSceneGridCell } from '../sceneGrid/SceneGridCell'
import { newRoute } from '../app/data/Route'
import type LibrarySource from '../librarySource/LibrarySource'
import { newLibrarySource } from '../librarySource/LibrarySource'
import {
  getAppIsRoute,
  getAppLastRoute,
  getAudioSource,
  getLibrarySource,
  getScriptSource
} from './selectors'
import {
  setCaptionScript,
  setCaptionScriptSlice,
  setCaptionScriptTags,
  setCaptionScriptToggleTag,
  setCaptionScriptURL
} from '../captionScript/slice'
import { setClip, setClipSlice, setClipTags, setClips } from '../clip/slice'
import {
  setLibrarySource,
  setLibrarySourceAddClip,
  setLibrarySourceAddFileToBlacklist,
  setLibrarySourceSlice,
  setLibrarySourceTags,
  setLibrarySourceToggleTag,
  setLibrarySourceCount,
  setLibrarySourceCountComplete,
  setLibrarySourceLastCheck,
  setLibrarySourceOffline,
  setLibrarySourceDisabledClips,
  setLibrarySources
} from '../librarySource/slice'
import { deleteOverlay, setOverlaySlice, setOverlay } from '../overlay/slice'
import {
  deleteSceneGrid,
  setSceneGrid,
  setSceneGridCellSceneID,
  setSceneGridSlice,
  setSceneGridGrid
} from '../sceneGrid/slice'
import {
  setSceneGroupSlice,
  setSceneGroup,
  deleteSceneGroup
} from '../sceneGroup/slice'
import { newSceneGroup } from '../sceneGroup/SceneGroup'
import { setTagSlice, setTag, setTags } from '../tag/slice'
import type Tag from '../tag/Tag'
import type Clip from '../clip/Clip'
import { newClip } from '../clip/Clip'
import {
  type AppStorage,
  initialAppStorage,
  newConfig as newConfigStorage,
  newScene as newSceneStorage,
  newSceneGrid as newSceneGridStorage,
  newSceneGroup as newSceneGroupStorage,
  LibrarySource as LibrarySourceStorage,
  newLibrarySource as newLibrarySourceStorage,
  newTag as newTagStorage,
  newRoute as newRouteStorage,
  newAudio as newAudioStorage,
  newCaptionScript as newCaptionScriptStorage,
  newPlaylist as newPlaylistStorage,
  copy,
  getFileGroup,
  getSourceType,
  ASF,
  SP,
  SPT,
  DONE,
  SDT,
  SDGT,
  PT,
  LT,
  ALT,
  SLT,
  CST,
  SGT,
  VCT,
  ST,
  VO,
  TF,
  OF,
  BT,
  IF,
  SOF,
  SF,
  SS,
  PR,
  en
} from 'flipflip-common'
import { getFileName } from '../../components/player/Scrapers'
import { setVideoClipperSourceID } from '../videoClipper/slice'
import { setCaptionScriptorCaptionScriptID } from '../captionScriptor/slice'
import flipflip from '../../FlipFlipService'
import { newDisplay } from '../display/Display'
import { deleteDisplay, setDisplay } from '../display/slice'
import {
  incrementIDValue,
  incrementIDsList,
  incrementSliceIDs
} from '../../data/import'
import Overlay from '../overlay/Overlay'

export function fetchAppStorage() {
  return async function fetchAppStorageThunk(
    dispatch: AppDispatch,
    getState: () => RootState
  ) {
    const appStorage: AppStorage =
      await flipflip().api.getAppStorageInitialState()
    setAppStorage(appStorage, dispatch)
  }
}

export function setAppStorage(appStorage: AppStorage, dispatch: AppDispatch) {
  const state = fromAppStorage(appStorage)
  dispatch(setAppSlice(state.app))
  dispatch(setAudioSlice(state.audio))
  dispatch(setCaptionScriptSlice(state.captionScript))
  dispatch(setClipSlice(state.clip))
  dispatch(setLibrarySourceSlice(state.librarySource))
  dispatch(setOverlaySlice(state.overlay))
  dispatch(setPlaylistSlice(state.playlist))
  dispatch(setSceneSlice(state.scene))
  dispatch(setSceneGridSlice(state.sceneGrid))
  dispatch(setSceneGroupSlice(state.sceneGroup))
  dispatch(setTagSlice(state.tag))
}

function shouldSaveState(prev: RootState, next: RootState) {
  return (
    prev.app !== next.app ||
    prev.audio !== next.audio ||
    prev.captionScript !== next.captionScript ||
    prev.clip !== next.clip ||
    prev.constants !== next.constants ||
    prev.librarySource !== next.librarySource ||
    prev.overlay !== next.overlay ||
    prev.playlist !== next.playlist ||
    prev.scene !== next.scene ||
    prev.sceneGrid !== next.sceneGrid ||
    prev.sceneGroup !== next.sceneGroup ||
    prev.tag !== next.tag
  )
}

export function saveAppStorageInterval() {
  return async function saveAppStorageIntervalThunk(
    dispatch: AppDispatch,
    getState: () => RootState
  ) {
    let oldState = getState()
    let lastSaved = 0

    setInterval(() => {
      const newState = getState()
      const now = new Date().getTime()
      if (shouldSaveState(oldState, newState) && now - lastSaved > 3000) {
        lastSaved = now
        oldState = newState
        flipflip()
          .api.saveAppStorage(toAppStorage(newState))
          .then((saved) => {
            const { changed, onBlur } = newState.app.config.serverSettings
            if (saved && onBlur && changed) {
              dispatch(setConfigServerSettingsChanged(false))
              dispatch(
                setSystemSnack({
                  message:
                    'Server settings changed. Restart FlipFlip to apply the new settings.',
                  severity: SS.success
                })
              )
            }

            dispatch(setConfigServerSettingsOnBlur(false))
          })
      }
    }, 500)
  }
}

export function routeToScene(id: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(setRoute([newRoute({ kind: 'scene', value: id })]))
  }
}

export function routeToConfig() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(setRoute([newRoute({ kind: 'config' })]))
  }
}

export function routeToAudios() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const newTutorial =
      getState().app.config.tutorials.audios == null ? ALT.welcome : undefined

    dispatch(setRoute([newRoute({ kind: 'audios' })]))
    dispatch(setTutorial(newTutorial))
  }
}

export function routeToScripts() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const newTutorial =
      getState().app.config.tutorials.scripts == null ? SLT.welcome : undefined

    dispatch(setRoute([newRoute({ kind: 'scripts' })]))
    dispatch(setTutorial(newTutorial))
  }
}

export function openScriptInScriptor(scriptID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(setCaptionScriptorCaptionScriptID(scriptID))
    dispatch(addRoutes([{ kind: 'scriptor', value: scriptID }]))
  }
}

export function routeToScriptor() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const startTutorial = state.app.config.tutorials.scriptor == null
    const newTutorial = startTutorial ? CST.welcome : undefined
    let newValue = null
    if (startTutorial) {
      const testScript =
        'setBlinkDuration 300\n' +
        'setBlinkDelay 100\n' +
        'setBlinkGroupDelay 1200\n' +
        'setCaptionDuration 2000\n' +
        'setCaptionDelay 1200\n' +
        '\n' +
        'bigcap YOU LOVE FLUFFY KITTENS\n' +
        'blink KITTENS / ARE / YOUR / LIFE\n' +
        'cap Cuddle all the kittens forever because you love them.'

      newValue = newCaptionScript({
        id: state.captionScript.nextID,
        script: testScript
      })
      dispatch(setCaptionScript(newValue))
    }

    dispatch(setCaptionScriptorCaptionScriptID(newValue?.id))
    dispatch(setRoute([newRoute({ kind: 'scriptor', value: newValue?.id })]))
    dispatch(setTutorial(newTutorial))
  }
}

export function routeToLibrary() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const newTutorial =
      getState().app.config.tutorials.library == null ? LT.welcome : undefined

    dispatch(setRoute([newRoute({ kind: 'library' })]))
    dispatch(setTutorial(newTutorial))
  }
}

export function routeToGrid(id: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(setRoute([newRoute({ kind: 'grid', value: id })]))
  }
}

export function routeToDisplay(id: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(setRoute([newRoute({ kind: 'display', value: id })]))
  }
}

export function addGenerator() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const id = state.scene.nextID

    const scene = newScene({
      id,
      name: 'New Generator',
      generatorWeights: [],
      openTab: 4,
      ...state.app.config.defaultScene
    })

    dispatch(setScene(scene))
    dispatch(addToScenes(scene.id))
    dispatch(setSpecialMode(SP.autoEdit))
    const newTutorial =
      state.app.config.tutorials.sceneGenerator == null
        ? SDGT.welcome
        : undefined
    dispatch(setTutorial(newTutorial))
    dispatch(routeToScene(scene.id))
  }
}

export function addDisplay() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const display = newDisplay({
      id: state.display.nextID,
      name: 'New Display'
    })

    dispatch(setDisplay(display))
    dispatch(addToDisplays(display.id))
    dispatch(setSpecialMode(SP.autoEdit))
    // TODO add tutorial for displays
    // const newTutorial =
    //   state.app.config.tutorials.display == null ? DT.welcome : undefined
    // dispatch(setTutorial(newTutorial))
    dispatch(routeToDisplay(display.id))
  }
}

export function addGrid() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const grid = newSceneGrid({
      id: state.sceneGrid.nextID,
      name: 'New Grid',
      grid: [[newSceneGridCell()]]
    })

    dispatch(setSceneGrid(grid))
    dispatch(addToGrids(grid.id))
    dispatch(setSpecialMode(SP.autoEdit))
    const newTutorial =
      state.app.config.tutorials.sceneGrid == null ? SGT.welcome : undefined
    dispatch(setTutorial(newTutorial))
    dispatch(routeToGrid(grid.id))
  }
}

export function addScene() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scene = newScene({
      id: state.scene.nextID,
      name: 'New scene',
      ...state.app.config.defaultScene
    })

    let newTutorial: string | undefined
    const startTutorial = state.app.config.tutorials.sceneDetail == null
    if (startTutorial) {
      scene.name = 'Cute Stuff'
      scene.timingFunction = TF.constant
      scene.timingConstant = 1000
      scene.nextSceneID = 0
      scene.overlayEnabled = false
      scene.imageTypeFilter = IF.any
      scene.sourceOrderFunction = SOF.random
      scene.orderFunction = OF.random
      scene.zoom = false
      scene.zoomStart = 1
      scene.zoomEnd = 2
      scene.transTF = TF.constant
      scene.transSinRate = 97
      scene.transDuration = 5000
      scene.transDurationMin = 2000
      scene.transDurationMax = 5000
      scene.crossFade = false
      scene.fadeTF = TF.constant
      scene.fadeDuration = 500
      scene.backgroundType = BT.blur
      newTutorial = SDT.welcome
    }

    dispatch(setScene(scene))
    dispatch(addToScenes(scene.id))
    dispatch(setTutorial(newTutorial))
    dispatch(setSpecialMode(!startTutorial ? SP.autoEdit : undefined))
    dispatch(routeToScene(scene.id))
  }
}

export function addSceneGroup(type: string) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const sceneGroup = newSceneGroup({
      id: state.sceneGroup.nextID,
      type
    })

    dispatch(setSceneGroup(sceneGroup))
    dispatch(addToSceneGroups(sceneGroup.id))
  }
}

export function deleteScenes(sceneIDs: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const deleteScenes: number[] = []
    const deleteGrids: number[] = []
    const deleteDisplays: number[] = []
    for (const sceneID of sceneIDs) {
      const gridID = convertSceneIDToGridID(sceneID)
      if (gridID != null) {
        deleteGrids.push(gridID)
        continue
      }

      const displayID = convertSceneIDToDisplayID(sceneID)
      if (displayID != null) {
        deleteDisplays.push(displayID)
        continue
      }

      deleteScenes.push(sceneID)
    }

    let state = getState()
    dispatch(removeFromScenes(deleteScenes))
    deleteScenes.forEach((id) => dispatch(deleteScene(id)))
    dispatch(removeFromGrids(deleteGrids))
    deleteGrids.forEach((id) => dispatch(deleteSceneGrid(id)))
    dispatch(removeFromDisplays(deleteDisplays))
    deleteGrids.forEach((id) => dispatch(deleteDisplay(id)))

    state = getState()
    const scenes = state.app.scenes.map((s) => state.scene.entries[s])
    scenes
      .filter((s) => deleteScenes.includes(s.nextSceneID))
      .forEach((s) => dispatch(setSceneNextSceneID({ id: s.id, value: 0 })))

    scenes.forEach((s) => {
      const nextSceneRandoms = s.nextSceneRandoms.filter(
        (s) => !deleteScenes.includes(s)
      )
      if (nextSceneRandoms.length < s.nextSceneRandoms.length) {
        dispatch(
          setSceneNextSceneRandoms({ id: s.id, value: nextSceneRandoms })
        )
      }
    })

    scenes.forEach((s) => {
      s.overlays
        .filter((o) => {
          const id = state.overlay.entries[o].sceneID
          if (deleteScenes.includes(id)) {
            return true
          }

          const gridID = convertSceneIDToGridID(id)
          return gridID != null && deleteGrids.includes(gridID)
        })
        .forEach((o) => {
          dispatch(setSceneRemoveOverlay({ id: s.id, value: o }))
          dispatch(deleteOverlay(o))
        })
    })

    const grids = state.app.grids.map((s) => state.sceneGrid.entries[s])
    for (const grid of grids) {
      for (let row = 0; row < grid.grid.length; row++) {
        const r = grid.grid[row]
        for (let col = 0; col < r.length; col++) {
          const cell = r[col]
          if (deleteScenes.includes(cell.sceneID)) {
            dispatch(
              setSceneGridCellSceneID({ id: grid.id, row, col, value: -1 })
            )
          }
        }
      }
    }

    dispatch(setRoute([]))
    dispatch(setSpecialMode(undefined))
  }
}

export function removeSceneGroup(id: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(removeFromSceneGroups(id))
    dispatch(deleteSceneGroup(id))
  }
}

export function doneTutorial(tutorial: string) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const route = getAppLastRoute(state.app)
    if (!route) {
      if (tutorial === SPT.add2) {
        dispatch(setTutorial(undefined))
        dispatch(setConfigTutorialsScenePicker(DONE))
      } else {
        dispatch(setConfigTutorialsScenePicker(tutorial))
      }
    } else if (getAppIsRoute(route, 'scene')) {
      if (getActiveScene(state)?.generatorWeights) {
        if (tutorial === SDGT.final || tutorial === SDGT.finalError) {
          dispatch(setTutorial(undefined))
          dispatch(setConfigTutorialsSceneGenerator(DONE))
        } else {
          dispatch(setConfigTutorialsSceneGenerator(tutorial))
        }
      } else {
        if (tutorial === SDT.play) {
          dispatch(setTutorial(undefined))
          dispatch(setConfigTutorialsSceneDetail(DONE))
        } else {
          dispatch(setConfigTutorialsSceneDetail(tutorial))
        }
      }
    } else if (getAppIsRoute(route, 'play')) {
      if (tutorial === PT.final) {
        dispatch(setTutorial(undefined))
        dispatch(setConfigTutorialsPlayer(DONE))
      } else {
        dispatch(setConfigTutorialsPlayer(tutorial))
      }
    } else if (getAppIsRoute(route, 'library')) {
      if (tutorial === LT.final) {
        dispatch(setTutorial(undefined))
        dispatch(setConfigTutorialsLibrary(DONE))
      } else {
        dispatch(setConfigTutorialsLibrary(tutorial))
      }
    } else if (getAppIsRoute(route, 'audios')) {
      if (tutorial === ALT.final) {
        dispatch(setTutorial(undefined))
        dispatch(setConfigTutorialsAudios(DONE))
      } else {
        dispatch(setConfigTutorialsAudios(tutorial))
      }
    } else if (getAppIsRoute(route, 'scripts')) {
      if (tutorial === SLT.final) {
        dispatch(setTutorial(undefined))
        dispatch(setConfigTutorialsScripts(DONE))
      } else {
        dispatch(setConfigTutorialsScripts(tutorial))
      }
    } else if (getAppIsRoute(route, 'scriptor')) {
      if (tutorial === CST.final) {
        dispatch(setTutorial(undefined))
        dispatch(setConfigTutorialsScriptor(DONE))
      } else {
        dispatch(setConfigTutorialsScriptor(tutorial))
      }
    } else if (getAppIsRoute(route, 'grid')) {
      if (tutorial === SGT.final) {
        dispatch(setTutorial(undefined))
        dispatch(setConfigTutorialsSceneGrid(DONE))
      } else {
        dispatch(setConfigTutorialsSceneGrid(tutorial))
      }
    } else if (getAppIsRoute(route, 'clip')) {
      if (tutorial === VCT.final) {
        dispatch(setTutorial(undefined))
        dispatch(setConfigTutorialsVideoClipper(DONE))
      } else {
        dispatch(setConfigTutorialsVideoClipper(tutorial))
      }
    }
  }
}

export function doneDimensionsTutorial(sceneGridID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(doneTutorial(SGT.dimensions))
    const state = getState()
    const sceneID = state.app.scenes[0]
    const newGrid = state.sceneGrid.entries[sceneGridID].grid
    newGrid[0][0].sceneID = sceneID
    newGrid[0][1].sceneID = sceneID
    newGrid[1][0].sceneID = sceneID
    newGrid[1][1].sceneID = sceneID
    dispatch(setSceneGridGrid({ id: sceneGridID, value: newGrid }))
  }
}

export function getActiveSceneID(state: RootState): number | undefined {
  for (const r of state.app.route.slice().reverse()) {
    if (r.kind === 'scene') {
      return r.value as number
    }
  }
  return undefined
}

export function getActiveScene(state: RootState): Scene | undefined {
  const sceneID = getActiveSceneID(state)
  return sceneID !== undefined ? state.scene.entries[sceneID] : undefined
}

export function getActiveGrid(state: RootState): SceneGrid | undefined {
  for (const r of state.app.route.slice().reverse()) {
    if (r.kind === 'grid') {
      return state.sceneGrid.entries[r.value as number]
    }
  }
  return undefined
}

export function getActiveSource(state: RootState): LibrarySource | undefined {
  for (const r of state.app.route.slice().reverse()) {
    if (r.kind === 'clip') {
      return state.librarySource.entries[r.value as number]
    }
  }
  return undefined
}

export function setRouteGoBack() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const route = getAppLastRoute(state.app) as Route
    if (getAppIsRoute(route, 'libraryplay')) {
      let librarySource
      const scene = getActiveScene(state) as Scene
      if (scene.audioScene) {
        librarySource = getAudioSource(state)
      } else if (scene.scriptScene) {
        librarySource = getScriptSource(state)
      } else {
        librarySource = getLibrarySource(state)
      }
      dispatch(deleteScene(route.value as number))
      if (librarySource != null) {
        const tagNames = Object.values(state.tag.entries)
          .map((t) => t.name)
          .sort()
        // Re-order the tags of the source we were playing
        const sortedTags = librarySource.tags.sort((a: number, b: number) => {
          const aIndex = tagNames.indexOf(state.tag.entries[a].name)
          const bIndex = tagNames.indexOf(state.tag.entries[b].name)
          if (aIndex < bIndex) {
            return -1
          } else if (aIndex > bIndex) {
            return 1
          } else {
            return 0
          }
        })
        dispatch(
          setLibrarySourceTags({ id: librarySource.id, value: sortedTags })
        )
      }

      dispatch(setRoutePop(2))
    } else if (getAppIsRoute(route, 'gridplay')) {
      const sceneID = state.players[route.value as string].sceneID as number
      dispatch(deleteScene(sceneID))
      dispatch(setRoutePop(2))
    } else {
      dispatch(setRoutePop(1))
      dispatch(setSpecialMode(undefined))
    }
  }
}

export function cleanBackups() {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    const state = getState()
    await flipflip().api.cleanBackups(toConfigStorage(state.app.config, state))
  }
}

export function restoreAppStorageFromBackup(backupFile: string) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    const state = getState()
    const text = await flipflip().api.readTextFile(backupFile)
    const data = JSON.parse(text)
    const backupState = copy<AppStorage>(initialAppStorage)
    backupState.version = data.version
    backupState.config = newConfigStorage(data.config)
    backupState.scenes = data.scenes.map((s: any) =>
      newSceneStorage(state.constants, s)
    )
    backupState.library = data.library.map((s: any) =>
      newLibrarySourceStorage(s)
    )
    backupState.tags = data.tags.map((t: any) => newTagStorage(t))
    backupState.route = data.route.map((s: any) => newRouteStorage(s))
    if (data.specialMode) {
      backupState.specialMode = data.specialMode
    }
    if (data.openTab) {
      backupState.openTab = data.openTab
    }
    if (data.sceneGroups) {
      backupState.sceneGroups = data.sceneGroups.map((g: any) =>
        newSceneGroupStorage(g)
      )
    }
    if (data.grids) {
      backupState.grids = data.grids.map((g: any) => newSceneGridStorage(g))
    }
    if (data.audios) {
      backupState.audios = data.audios.map((a: any) => newAudioStorage(a))
    }
    if (data.scripts) {
      backupState.scripts = data.scripts.map((a: any) =>
        newCaptionScriptStorage(a)
      )
    }
    if (data.playlists) {
      backupState.playlists = data.playlists.map((p: any) =>
        newPlaylistStorage(p)
      )
    }
    if (data.audioOpenTab) {
      backupState.audioOpenTab = data.audioOpenTab
    }
    if (data.theme) {
      backupState.theme = data.theme
    }

    setAppStorage(backupState, dispatch)
  }
}

export function playSceneFromLibrary(
  sourceID: number | string,
  displayed: number[]
) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    const state = getState()
    if (typeof sourceID === 'string') {
      const source = state.app.library
        .map((id) => state.librarySource.entries[id])
        .find((s) => s.url === sourceID) as LibrarySource
      sourceID = source.id
    }

    const source = state.librarySource.entries[sourceID]
    const sourceType = getSourceType(source.url)
    const defaultScene = state.app.config.defaultScene
    const tempScene = newScene({
      id: state.scene.nextID,
      name: 'library_scene_temp',
      forceAll: defaultScene.forceAll,
      backgroundType: defaultScene.backgroundType,
      backgroundColor: defaultScene.backgroundColor,
      backgroundColorSet: defaultScene.backgroundColorSet,
      backgroundBlur: defaultScene.backgroundBlur,
      imageOrientation: defaultScene.imageOrientation,
      videoOrientation: defaultScene.videoOrientation,
      randomVideoStart: defaultScene.randomVideoStart,
      videoOption: sourceType === ST.video ? VO.full : defaultScene.videoOption,
      continueVideo: sourceType === ST.video || defaultScene.continueVideo,
      playVideoClips: defaultScene.playVideoClips,
      videoVolume: defaultScene.videoVolume,
      videoSkip: defaultScene.videoSkip
    })

    const sourceURL = getSourceUrl(source, state.constants.pathSep)
    const librarySource = Object.values(state.librarySource.entries).find(
      (s) => s.url === sourceURL
    )
    if (librarySource == null) {
      dispatch(setLibrarySourceDisabledClips({ id: source.id, value: [] }))

      tempScene.sources = [source.id]
      tempScene.libraryID = -1
      if (getLibrarySource(state) != null) {
        const activeScene = getActiveScene(state) as Scene
        applyEffects(tempScene, getEffects(activeScene))
        tempScene.overlayEnabled = activeScene.overlayEnabled
        tempScene.overlays = activeScene.overlays
        dispatch(setRoutePop(2))
        dispatch(deleteScene(activeScene.id))
      }

      dispatch(setDisplayedSources(displayed))
      dispatch(setScene(tempScene))
      state.app.route.push(
        newRoute({ kind: 'scene', value: tempScene.id }),
        newRoute({ kind: 'libraryplay', value: tempScene.id })
      )
      dispatch(setRoute(state.app.route))
    } else {
      dispatch(
        setLibrarySourceDisabledClips({ id: librarySource.id, value: [] })
      )

      tempScene.sources = [librarySource.id]
      tempScene.libraryID = librarySource.id
      tempScene.orderFunction = defaultScene.orderFunction
      if (getActiveScene(state)?.libraryID !== -1) {
        const activeScene = getActiveScene(state) as Scene
        applyEffects(tempScene, getEffects(activeScene))
        tempScene.overlayEnabled = activeScene.overlayEnabled
        tempScene.overlays = activeScene.overlays
        dispatch(setRoutePop(2))
        dispatch(deleteScene(activeScene.id))
      }

      dispatch(setDisplayedSources(displayed))
      dispatch(setScene(tempScene))
      state.app.route.push(
        newRoute({ kind: 'scene', value: tempScene.id }),
        newRoute({ kind: 'libraryplay', value: tempScene.id })
      )
      dispatch(setRoute(state.app.route))
    }
  }
}

export function blacklistFile(sourceURL: string, fileToBlacklist?: string) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    dispatch(setLibrarySourceAddFileToBlacklist({ sourceURL, fileToBlacklist }))
    if (fileToBlacklist != null) {
      const state = getState()
      const cachingDirectory = state.app.config.caching.directory
      const pathSep = state.constants.pathSep
      const cachePath =
        (await getCachePath(cachingDirectory, sourceURL)) +
        getFileName(fileToBlacklist, pathSep)

      if (await flipflip().api.pathExists(cachePath)) {
        try {
          await flipflip().api.unlink(cachePath)
        } catch (err) {
          console.error(err)
        }
      }
    }
  }
}

export function clipVideo(sourceID: number | string, displayed: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    if (typeof sourceID === 'string') {
      const source = state.app.library
        .map((id) => state.librarySource.entries[id])
        .find((s) => s.url === sourceID) as LibrarySource

      sourceID = source.id
    }

    const source = state.librarySource.entries[sourceID]
    const pathSep = state.constants.pathSep
    const sourceURL = getSourceUrl(source, pathSep)
    const librarySource = state.app.library
      .map((id) => state.librarySource.entries[id])
      .find((s) => s.url === sourceURL) as LibrarySource

    if (
      !Object.values(state.scene.entries).find(
        (s) => s.name === videoClipperSceneName
      )
    ) {
      const scene = newScene()
      scene.id = state.scene.nextID
      scene.name = videoClipperSceneName
      scene.backgroundType = BT.color
      scene.backgroundColor = '#010101'
      scene.videoVolume = state.app.config.defaultScene.videoVolume
      dispatch(setScene(scene))
    } else {
      dispatch(
        setVideoClipperSceneVideoVolume(
          state.app.config.defaultScene.videoVolume
        )
      )
    }

    dispatch(setVideoClipperSourceID(librarySource.id))
    if (getActiveSource(state) != null) {
      dispatch(setRoutePop(1))
    }

    dispatch(addRoutes([newRoute({ kind: 'clip', value: librarySource.id })]))
    dispatch(setDisplayedSources(displayed))
  }
}

export function downloadSource(sourceID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const source = state.librarySource.entries[sourceID]
    const pathSep = state.constants.pathSep
    const sourceURL = getSourceUrl(source, pathSep)
    const defaultScene = state.app.config.defaultScene
    const tempScene = newScene({
      id: state.scene.nextID,
      name: 'download_scene_temp',
      timingFunction: TF.constant,
      timingConstant: 1,
      backgroundType: defaultScene.backgroundType,
      backgroundColor: defaultScene.backgroundColor,
      backgroundColorSet: defaultScene.backgroundColorSet,
      backgroundBlur: defaultScene.backgroundBlur,
      imageOrientation: defaultScene.imageOrientation,
      videoOrientation: defaultScene.videoOrientation,
      playVideoClips: false,
      videoVolume: 0,
      orderFunction: OF.strict,
      downloadScene: true
    })

    const librarySource = Object.values(state.librarySource.entries).find(
      (s) => s.url === sourceURL
    )
    if (librarySource != null) {
      librarySource.disabledClips = []
      tempScene.sources = [librarySource.id]
      tempScene.libraryID = librarySource.id

      if (getLibrarySource(state) != null) {
        const activeScene = getActiveScene(state) as Scene
        applyEffects(tempScene, getEffects(activeScene))
        tempScene.overlayEnabled = activeScene.overlayEnabled
        tempScene.overlays = activeScene.overlays
        dispatch(setRoutePop(2))
        dispatch(deleteScene(activeScene.id))
      }
    } else {
      source.disabledClips = []
      tempScene.sources = [source.id]
      tempScene.libraryID = -1

      if (getActiveScene(state)?.libraryID !== -1) {
        const activeScene = getActiveScene(state) as Scene
        applyEffects(tempScene, getEffects(activeScene))
        tempScene.overlayEnabled = activeScene.overlayEnabled
        tempScene.overlays = activeScene.overlays
        dispatch(setRoutePop(2))
        dispatch(deleteScene(activeScene.id))
      }
    }

    dispatch(setScene(tempScene))
    state.app.route.push(
      newRoute({ kind: 'scene', value: tempScene.id }),
      newRoute({ kind: 'libraryplay', value: tempScene.id })
    )

    dispatch(setRoute(state.app.route))
  }
}

export function navigateDisplayedLibrary(offset: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const activeScene = getActiveScene(state) as Scene
    const librarySource = getLibrarySource(state)
    if (librarySource != null) {
      const tagNames = state.app.tags
        .map((tagID) => state.tag.entries[tagID].name)
        .sort()
      // Re-order the tags of the source we were playing
      librarySource.tags = librarySource.tags.sort((aID, bID) => {
        const aIndex = tagNames.indexOf(state.tag.entries[aID].name)
        const bIndex = tagNames.indexOf(state.tag.entries[bID].name)
        if (aIndex < bIndex) {
          return -1
        } else if (aIndex > bIndex) {
          return 1
        } else {
          return 0
        }
      })
    }
    const displayed = Array.from(state.app.displayedSources)
    const indexOf = displayed.indexOf(activeScene.sources[0])
    let newIndexOf = indexOf + offset
    if (newIndexOf < 0) {
      newIndexOf = displayed.length - 1
    } else if (newIndexOf >= displayed.length) {
      newIndexOf = 0
    }

    dispatch(playSceneFromLibrary(displayed[newIndexOf], displayed))
  }
}

export function sortScenes(algorithm: string, ascending: boolean) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scenes =
      algorithm === SF.random
        ? randomizeList(state.app.scenes)
        : state.app.scenes.sort(
            sortFunction(
              algorithm,
              ascending,
              (a) => state.scene.entries[a].name.toLowerCase(),
              undefined,
              (a) => state.scene.entries[a].sources.length,
              (a) => (state.scene.entries[a].generatorWeights ? '1' : '0'),
              algorithm === SF.type ? SF.alpha : undefined
            )
          )

    dispatch(setAppScenes(scenes))
  }
}

export function sortTags(algorithm: string, ascending: boolean) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const getName = (a: Tag) => a.name!.toLowerCase()
    const sortedTags = state.app.tags
      .map((id) => state.tag.entries[id])
      .sort(
        sortFunction(
          algorithm,
          ascending,
          getName,
          undefined,
          undefined,
          undefined,
          undefined
        )
      )
      .map((s) => s.id)
    dispatch(setAppTags(sortedTags))
  }
}

export function saveTag(tag: Tag) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(setTag(tag))
    dispatch(addToTags([tag.id]))
  }
}

export function cacheImage(i: HTMLImageElement | HTMLVideoElement) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    const state = getState()
    const pathSep = state.constants.pathSep
    const caching = state.app.config.caching
    if (caching.enabled) {
      const source = i.getAttribute('source') as string
      const fileType = getSourceType(source)
      if (fileType === ST.hydrus || fileType === ST.piwigo) return

      if (fileType !== ST.local && i.src.startsWith('http')) {
        const cachePath = (await getCachePath(caching.directory)) as string
        if (!(await flipflip().api.pathExists(cachePath))) {
          await flipflip().api.mkdir(cachePath)
        }
        const maxSize = caching.maxSize
        const sourceCachePath = await getCachePath(caching.directory, source)
        const filePath = sourceCachePath + getFileName(i.src, pathSep)
        const downloadImage = async () => {
          if (!(await flipflip().api.pathExists(filePath))) {
            wretch(i.src)
              .get()
              .arrayBuffer((arrayBuffer: ArrayBuffer) => {
                flipflip().api.outputFile(filePath, arrayBuffer)
              })
          }
        }
        if (maxSize === 0) {
          await downloadImage()
        } else {
          const size = await flipflip().api.getFolderSize(cachePath)
          const mbSize = size / 1024 / 1024
          if (mbSize < maxSize) {
            await downloadImage()
          }
        }
      }
    }
  }
}

export function importScenes(scenesToImport: any, importToLibrary: boolean) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    if (
      !scenesToImport[0].id ||
      !scenesToImport[0].name ||
      !scenesToImport[0].sources
    ) {
      dispatch(systemMessage('Not a valid scene file'))
      return
    }

    // map to redux state
    const state = getState()
    const slice = copy<AppStorageImport>(initialAppStorageImport)
    for (let i = 0; i < scenesToImport.length; i++) {
      if (scenesToImport[i].grid) {
        const grid = newSceneGridStorage(scenesToImport[i])
        fromSceneGridStorage(grid, slice.sceneGrid)
      } else {
        const scene = newSceneStorage(scenesToImport[i])
        fromSceneStorage(
          scene,
          slice.scene,
          slice.librarySource,
          slice.tag,
          slice.clip,
          slice.overlay,
          slice.audio,
          slice.captionScript
        )
      }
    }

    // prepare for merge into existing slices
    const clipNextID = state.clip.nextID
    const librarySourceNextID = state.librarySource.nextID
    const sceneNextID = state.scene.nextID
    const sceneGridNextID = state.sceneGrid.nextID
    const tagNextID = state.tag.nextID
    const audioNextID = state.audio.nextID
    const captionScriptNextID = state.captionScript.nextID
    const overlayNextID = state.overlay.nextID

    Object.values(slice.scene.entries).forEach((s) => {
      s.sources = incrementIDsList<LibrarySource>(
        s.sources,
        slice.librarySource,
        librarySourceNextID
      )
      s.overlays = incrementIDsList<Overlay>(
        s.overlays,
        slice.overlay,
        overlayNextID
      )
      s.audioPlaylists.forEach(
        (p) =>
          (p.audios = incrementIDsList<Audio>(
            p.audios,
            slice.audio,
            audioNextID
          ))
      )
      s.scriptPlaylists.forEach(
        (p) =>
          (p.scripts = incrementIDsList<CaptionScript>(
            p.scripts,
            slice.captionScript,
            captionScriptNextID
          ))
      )

      s.libraryID = incrementIDValue<LibrarySource>(
        s.libraryID,
        slice.librarySource,
        librarySourceNextID,
        -1
      )
      s.nextSceneID = incrementIDValue<Scene>(
        s.nextSceneID,
        slice.scene,
        sceneNextID,
        0
      )
      s.nextSceneRandomID = incrementIDValue<Scene>(
        s.nextSceneRandomID,
        slice.scene,
        sceneNextID,
        0
      )
      s.nextSceneRandoms = incrementIDsList<Scene>(
        s.nextSceneRandoms,
        slice.scene,
        sceneNextID
      )
    })

    Object.values(slice.librarySource.entries).forEach((s) => {
      s.tags = incrementIDsList<Tag>(s.tags, slice.tag, tagNextID)
      s.clips = incrementIDsList<Clip>(s.clips, slice.clip, clipNextID)
      s.disabledClips = incrementIDsList<Clip>(
        s.disabledClips,
        slice.clip,
        clipNextID
      )
    })

    Object.values(slice.clip.entries).forEach(
      (s) => (s.tags = incrementIDsList<Tag>(s.tags, slice.tag, tagNextID))
    )
    Object.values(slice.audio.entries).forEach(
      (s) => (s.tags = incrementIDsList<Tag>(s.tags, slice.tag, tagNextID))
    )
    Object.values(slice.captionScript.entries).forEach(
      (s) => (s.tags = incrementIDsList<Tag>(s.tags, slice.tag, tagNextID))
    )

    Object.values(slice.sceneGrid.entries)
      .flatMap((s) => s.grid)
      .flatMap((s) => s)
      .forEach((s) => {
        s.sceneID = incrementIDValue<Scene>(
          s.sceneID,
          slice.scene,
          sceneNextID,
          0
        )
      })

    Object.values(slice.overlay.entries).forEach((s) => {
      if (isSceneIDAGridID(s.sceneID)) {
        const gridID = convertSceneIDToGridID(s.sceneID) as number
        s.sceneID = incrementIDValue<SceneGrid>(
          gridID,
          slice.sceneGrid,
          convertGridIDToSceneID(sceneGridNextID),
          0
        )
      } else {
        s.sceneID = incrementIDValue<Scene>(
          s.sceneID,
          slice.scene,
          sceneNextID,
          0
        )
      }
    })

    incrementSliceIDs<Scene>(slice.scene, sceneNextID)
    incrementSliceIDs<LibrarySource>(slice.librarySource, librarySourceNextID)
    incrementSliceIDs<Clip>(slice.clip, clipNextID)
    incrementSliceIDs<Audio>(slice.audio, audioNextID)
    incrementSliceIDs<CaptionScript>(slice.captionScript, captionScriptNextID)
    incrementSliceIDs<SceneGrid>(slice.sceneGrid, sceneGridNextID)
    incrementSliceIDs<Overlay>(slice.overlay, overlayNextID)

    Object.values(slice.scene.entries).forEach((s) => dispatch(setScene(s)))
    Object.values(slice.librarySource.entries).forEach((s) =>
      dispatch(setLibrarySource(s))
    )
    Object.values(slice.clip.entries).forEach((s) => dispatch(setClip(s)))
    Object.values(slice.captionScript.entries).forEach((s) =>
      dispatch(setCaptionScript(s))
    )
    Object.values(slice.sceneGrid.entries).forEach((s) =>
      dispatch(setSceneGrid(s))
    )
    Object.values(slice.overlay.entries).forEach((s) => dispatch(setOverlay(s)))

    if (importToLibrary) {
      const sourceURLs = state.app.library
        .map((id) => state.librarySource.entries[id])
        .map((s) => s.url)

      const sources = Object.values(slice.librarySource.entries)
        .filter((s) => !sourceURLs.includes(s.url))
        .map((s) => s.id)
      const audioURLs = state.app.audios.map(
        (id) => state.audio.entries[id].url
      )
      const audios = Object.values(slice.audio.entries)
        .filter((a) => !audioURLs.includes(a.url))
        .map((a) => a.id)
      const scriptURLs = state.app.scripts.map(
        (id) => state.captionScript.entries[id].url
      )
      const scripts = Object.values(slice.captionScript.entries)
        .filter((s) => !scriptURLs.includes(s.url))
        .map((s) => s.id)

      if (sources.length > 0 || audios.length > 0 || scripts.length > 0) {
        let message = 'Added '
        if (sources.length > 0) {
          message += sources.length + ' new source'
          if (sources.length > 1) {
            message += 's'
          }
        }
        if (audios.length > 0) {
          if (!message.endsWith(' ')) {
            message += ', '
          }
          message += audios.length + ' new audio'
          if (audios.length > 1) {
            message += 's'
          }
        }
        if (scripts.length > 0) {
          if (!message.endsWith(' ')) {
            message += ', '
          }
          message += scripts.length + ' new script'
          if (scripts.length > 1) {
            message += 's'
          }
        }

        dispatch(setSystemSnack({ message, severity: SS.info }))
        dispatch(addToLibrary(sources))
        dispatch(addToAudios(audios))
        dispatch(addToScripts(scripts))
      } else {
        dispatch(
          setSystemSnack({
            message: 'No new sources detected',
            severity: SS.info
          })
        )
      }
    }

    dispatch(
      setRoute([newRoute({ kind: 'scene', value: scenesToImport[0].id })])
    )
  }
}

export function addToScriptsIfNotExists(newScriptID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    if (!state.app.scripts.includes(newScriptID)) {
      dispatch(addToScripts([newScriptID]))
    }
  }
}

export function playerToggleTag(
  sceneID: number,
  libraryID: number,
  tagID: number
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    let action
    const state = getState()
    const scene = state.scene.entries[sceneID]
    if (scene.audioScene) {
      action = setAudioToggleTag
    } else if (scene.scriptScene) {
      action = setCaptionScriptToggleTag
    } else {
      action = setLibrarySourceToggleTag
    }

    dispatch(action({ id: libraryID, value: tagID }))
  }
}

export function sortSources(
  algorithm: string,
  ascending: boolean,
  sceneID?: number
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const pathSep = state.constants.pathSep
    const scene = sceneID ? getEntry(state.scene, sceneID) : null
    if (algorithm === SF.random) {
      if (scene != null) {
        dispatch(
          setSceneSources({ id: scene.id, value: randomizeList(scene.sources) })
        )
      } else {
        dispatch(setLibrary(randomizeList(state.app.library)))
      }

      return
    }

    const getName = (a: LibrarySource) => {
      const sourceType = getSourceType(a.url)
      const name =
        sourceType === ST.video || sourceType === ST.playlist
          ? getFileName(a.url, pathSep)
          : (getFileGroup(a.url, pathSep) as string)

      return name.toLowerCase()
    }

    const getFullName = (a: LibrarySource) => a.url.toLowerCase()
    const getCount = (a: LibrarySource) => {
      if (a.count === undefined) a.count = 0
      if (a.countComplete === undefined) a.countComplete = false
      return getSourceType(a.url) === ST.video ? a.clips.length : a.count
    }
    const getType = (a: LibrarySource) => getSourceType(a.url)
    let secondary: string | undefined
    if (algorithm === SF.alpha) {
      secondary = SF.type
    }
    if (algorithm === SF.type) {
      secondary = SF.alpha
    }
    if (scene != null) {
      scene.sources.sort(
        sortFunction(
          algorithm,
          ascending,
          getName,
          getFullName,
          getCount,
          getType,
          secondary
        )
      )
      dispatch(setSceneSources({ id: scene.id, value: scene.sources }))
    } else {
      state.app.library.sort(
        sortFunction(
          algorithm,
          ascending,
          getName,
          getFullName,
          getCount,
          getType,
          secondary
        )
      )
      dispatch(setLibrary(state.app.library))
    }
  }
}

export function clipLibrarySource(
  sourceURL: string,
  duration: number,
  clipOffset: number[]
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const source = state.app.library
      .map((id) => state.librarySource.entries[id])
      .find((s) => s.url === sourceURL) as LibrarySource

    const clip = newClip({
      id: state.clip.nextID,
      start: clipOffset[0] / 1000,
      end: duration - clipOffset[1] / 1000
    })

    dispatch(setClip(clip))
    dispatch(setLibrarySourceAddClip({ id: source.id, value: clip.id }))
  }
}

export function setCount(
  sourceURL: string,
  count: number,
  countComplete: boolean
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const updateLibrarySourceCount = (source: LibrarySource) => {
      let sCount: number | undefined
      let sCountComplete: boolean | undefined
      if (source.count === undefined) sCount = 0
      if (source.countComplete === undefined) sCountComplete = false
      if (countComplete) {
        sCount = count
        sCountComplete = true
      } else if (count > source.count) {
        sCount = count
      }
      if (sCount != null) {
        dispatch(setLibrarySourceCount({ id: source.id, value: sCount }))
      }
      if (sCountComplete != null) {
        dispatch(
          setLibrarySourceCountComplete({
            id: source.id,
            value: sCountComplete
          })
        )
      }
    }

    const state = getState()
    const source = state.app.library
      .map((id) => state.librarySource.entries[id])
      .find((s) => s.url === sourceURL)
    if (source) {
      updateLibrarySourceCount(source)
    }

    state.app.scenes
      .map((id) => state.scene.entries[id])
      .flatMap((s) => s.sources)
      .map((id) => state.librarySource.entries[id])
      .filter((s) => s.url === sourceURL)
      .forEach((s) => {
        updateLibrarySourceCount(s)
      })
  }
}

export function sortAudioSources(algorithm: string, ascending: boolean) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const audios = state.app.audios.map((id) => state.audio.entries[id])
    if (algorithm === ASF.random) {
      randomizeList(audios)
    } else {
      audios.sort(audioSortFunction(algorithm, ascending))
    }

    dispatch(setAudios(audios.map((s) => s.id)))
  }
}

export function sortScripts(algorithm: string, ascending: boolean) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scripts = state.app.scripts.map(
      (id) => state.captionScript.entries[id]
    )
    if (algorithm === SF.random) {
      randomizeList(scripts)
    } else {
      scripts.sort(
        scriptSortFunction(algorithm, ascending, state.constants.pathSep)
      )
    }

    dispatch(setScripts(scripts.map((s) => s.id)))
  }
}

export function addPlaylist(name: string, selected: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const exists =
      state.app.playlists
        .map((id) => state.playlist.entries[id])
        .find((p) => p.name === name) != null
    if (exists) {
      return
    }

    const playlist = newPlaylist({
      id: state.playlist.nextID,
      name,
      audios: selected
    })
    dispatch(setPlaylist(playlist))

    const playlists = state.app.playlists
    playlists.push(playlist.id)
    dispatch(setPlaylists(playlists))
  }
}

export function removePlaylist(name: string) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const playlists = state.app.playlists
      .map((id) => state.playlist.entries[id])
      .filter((p) => p.name !== name)
      .map((p) => p.id)

    dispatch(setPlaylists(playlists))
  }
}

export function sortPlaylist(
  playlistName: string,
  algorithm: string,
  ascending: boolean
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const playlist = state.app.playlists
      .map((id) => state.playlist.entries[id])
      .find((p) => p.name === playlistName)
    if (playlist) {
      const sorted = playlist.audios
        .map((aID) => state.audio.entries[aID])
        .sort(audioSortFunction(algorithm, ascending))
        .map((a) => a.id)

      dispatch(setPlaylistAudios({ id: playlist.id, value: sorted }))
    }
  }
}

export function setPlaylistsSwapPlaylist(
  playlistName: string,
  oldSourceId: number,
  newSourceId: number
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const playlist = state.app.playlists
      .map((id) => state.playlist.entries[id])
      .find((p) => p.name === playlistName) as Playlist
    const oldPlaylistIndex = playlist.audios.indexOf(oldSourceId)
    const newPlaylistIndex = playlist.audios.indexOf(newSourceId)
    arrayMove(playlist.audios, oldPlaylistIndex, newPlaylistIndex)
    dispatch(setPlaylistAudios({ id: playlist.id, value: playlist.audios }))
  }
}

export function swapAudios(oldSourceId: number, newSourceId: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const oldLibraryIndex = state.app.audios.indexOf(oldSourceId)
    const newLibraryIndex = state.app.audios.indexOf(newSourceId)
    arrayMove(state.app.audios, oldLibraryIndex, newLibraryIndex)
    dispatch(setAudios(state.app.audios))
  }
}

export function swapScripts(oldSourceId: number, newSourceId: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const oldLibraryIndex = state.app.scripts.indexOf(oldSourceId)
    const newLibraryIndex = state.app.scripts.indexOf(newSourceId)
    arrayMove(state.app.scripts, oldLibraryIndex, newLibraryIndex)
    dispatch(setScripts(state.app.scripts))
  }
}

export function detectBPMs() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    let progress: Progress = { current: 0, total: 0 }
    const readMetadata = (audio: Audio) => {
      flipflip()
        .api.parseMusicMetadataBpm(audio.url as string)
        .then((bpm: number | undefined) => {
          if (bpm) {
            audio.bpm = bpm
            const current = progress.current as number
            const total = progress.total as number
            progress.current = current + 1
            dispatch(setProgress(progress))
            flipflip().api.setProgressBar(progress.current / total)
            setTimeout(detectBPMLoop, 100)
          } else {
            detectBPM(audio)
          }
        })
        .catch((e: any) => {
          console.error('Error reading track metadata: ' + audio.url)
          console.error(e)
          detectBPM(audio)
        })
    }

    const detectBPM = async (audio: Audio) => {
      const bpmError = (e: any) => {
        console.error('Error detecting track BPM: ' + audio.url)
        console.error(e)
        const current = progress.current as number
        const total = progress.total as number
        progress.current = current + 1
        dispatch(setProgress(progress))
        flipflip().api.setProgressBar(progress.current / total)
        setTimeout(detectBPMLoop, 100)
      }

      const detectBPM = (data: ArrayBuffer) => {
        const maxByteSize = 200000000
        if (data.byteLength < maxByteSize) {
          const context = new AudioContext()
          context.decodeAudioData(
            data,
            (audioBuffer) => {
              analyze(audioBuffer)
                .then((tempo: number) => {
                  audio.bpm = Number.parseFloat(tempo.toFixed(2))
                  const current = progress.current as number
                  const total = progress.total as number
                  progress.current = current + 1
                  dispatch(setProgress(progress))
                  flipflip().api.setProgressBar(progress.current / total)
                  setTimeout(detectBPMLoop, 100)
                })
                .catch((e: any) => {
                  bpmError(e)
                })
            },
            (e) => {
              bpmError(e)
            }
          )
        } else {
          console.error("'" + audio.url + "' is too large to decode")
        }
      }

      try {
        const url = audio.url as string
        if (await flipflip().api.pathExists(url)) {
          const arrayBuffer = await flipflip().api.readBinaryFile(url)
          detectBPM(arrayBuffer)
        } else {
          wretch(url).get().arrayBuffer(detectBPM).catch(bpmError)
        }
      } catch (e) {
        bpmError(e)
      }
    }

    const detectBPMLoop = () => {
      const state = getState()
      if (state.app.progressMode === PR.cancel) {
        flipflip().api.setProgressBar(-1)
        progress = { current: 0, total: 0, title: '' }
        dispatch(setProgress(progress))
      } else if (actionableLibrary.length === progress.current) {
        flipflip().api.setProgressBar(-1)
        dispatch(
          setSystemSnack({
            message: 'BPM Detection has completed.',
            severity: SS.success
          })
        )
        progress = { current: 0, total: 0, title: '' }
        dispatch(setProgress(progress))
      } else {
        const actionSource = actionableLibrary[progress.current as number]
        progress.title = actionSource.url
        dispatch(setProgress(progress))

        const librarySource = state.app.audios
          .map((id) => state.audio.entries[id])
          .find((s) => s.url === actionSource.url)
        if (librarySource) {
          readMetadata(librarySource)
        } else {
          // Skip if removed from library during check
          const current = progress.current as number
          const total = progress.total as number
          progress.current = current + 1
          dispatch(setProgress(progress))
          flipflip().api.setProgressBar(progress.current / total)
          detectBPMLoop()
        }
      }
    }

    const state = getState()
    const actionableLibrary = state.app.audios
      .map((id) => state.audio.entries[id])
      .filter((a) => a.bpm === 0)

    // If we don't have an import running
    if (!state.app.progressMode) {
      progress.mode = PR.bpm
      progress.current = 0
      progress.total = actionableLibrary.length
      dispatch(setProgress(progress))
      flipflip().api.setProgressBar(progress.current / progress.total)
      detectBPMLoop()
    }
  }
}

export function importScriptFromLibrary(ids: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    ids = ids.filter(
      (id) =>
        state.app.scripts.includes(id) && !!state.captionScript.entries[id]
    )

    const playlistIndex = state.app.route[state.app.route.length - 1]
      .value as number
    const scene = getActiveScene(state) as Scene
    const scripts = scene.scriptPlaylists[playlistIndex].scripts.concat(ids)
    dispatch(
      setSceneScriptPlaylistScripts({
        sceneID: scene.id,
        playlistIndex,
        scripts
      })
    )
    dispatch(setRouteGoBack())
  }
}

export function importSingleScriptFromLibrary(ids: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const id = ids.find(
      (id) =>
        state.app.scripts.includes(id) && !!state.captionScript.entries[id]
    )
    if (id) {
      dispatch(importScriptToScriptor(id))
    }
  }
}

export function setScriptsAddAtStart() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const script = newCaptionScript({
      url: '',
      id: state.captionScript.nextID,
      tags: []
    })

    dispatch(setCaptionScript(script))
    dispatch(addToScriptsAtStart([script.id]))
  }
}

export function setScriptsAddAllAtStart(newURLs: string[]) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    const state = getState()
    const scripts = state.app.scripts

    // dedup
    const sourceURLs = scripts.map((id) => state.captionScript.entries[id].url)
    const newSources = newURLs.filter((s) => !sourceURLs.includes(s))
    let id = state.captionScript.nextID
    for (const url of newSources) {
      if (await flipflip().api.pathExists(url)) {
        dispatch(
          setCaptionScript(
            newCaptionScript({
              url,
              id,
              tags: []
            })
          )
        )
        scripts.unshift(id)
        id++
      }
    }

    dispatch(setScripts(scripts))
  }
}

export function importInstagram() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    let igLogin = true
    let session: any = null
    let progress: Progress = {}

    const processItems = (items: any, next: any) => {
      let following = []
      for (const account of items) {
        const accountURL = 'https://www.instagram.com/' + account.username + '/'
        following.push(accountURL)
      }

      // dedup
      const newestState = getState()
      const sourceURLs = newestState.app.library.map(
        (id) => newestState.librarySource.entries[id].url
      )
      following = following.filter((s) => !sourceURLs.includes(s))

      // Add to Library
      let id = state.librarySource.nextID
      const newLibrary = newestState.app.library
      for (const url of following) {
        const source = newLibrarySource({
          id,
          url,
          tags: []
        })

        dispatch(setLibrarySource(source))
        newLibrary.push(source.id)
        id++
      }
      dispatch(setLibrary(newLibrary))

      // Loop until we run out of blogs
      setTimeout(instagramImportLoop, 1500)
      progress.next = next
      progress.current = (progress.current as number) + 1
      dispatch(setProgress(progress))
      flipflip().api.setProgressBar(2)
    }

    const error = (error: string) => {
      flipflip().api.setProgressBar(-1)
      dispatch(systemMessage(error))
      progress = { current: 0 }
      dispatch(setProgress(progress))
      console.error(error)
      igLogin = true
    }

    // Define our loop
    const instagramImportLoop = async () => {
      const state = getState()
      if (state.app.progressMode === PR.cancel) {
        flipflip().api.setProgressBar(-1)
        progress = { current: 0 }
        dispatch(setProgress(progress))
        return
      }
      if (igLogin) {
        try {
          const userPk = await flipflip().api.igLogin(
            state.app.config.remoteSettings.instagramUsername,
            state.app.config.remoteSettings.instagramPassword
          )
          session = await flipflip().api.igSerializeCookieJar()
          const followingItems = await flipflip().api.igFollowingFeed(userPk)
          processItems(followingItems.items, userPk + '~' + followingItems.feed)
        } catch (e: any) {
          error(e)
        }
      } else {
        const next = (progress.next as string).split('~')
        const id = Number(next[0])
        const feedSession = next[1]
        const followingItems = await flipflip().api.igGetMoreFollowingFeed(
          session,
          id,
          feedSession
        )
        if (followingItems) {
          processItems(followingItems.items, id + '~' + followingItems.feed)
        } else {
          igLogin = true
          flipflip().api.setProgressBar(-1)
          dispatch(
            setSystemSnack({
              message: 'Instagram Following Import has completed',
              severity: SS.success
            })
          )
          progress = { current: 0 }
          dispatch(setProgress(progress))
        }
      }
    }

    const state = getState()
    if (!state.app.progressMode) {
      // Show progress bar and kick off loop
      const message =
        'Your Instagram Following is being imported... You will recieve an alert when the import is finished.'
      dispatch(setSystemSnack({ message, severity: SS.info }))
      progress.mode = PR.instagram
      progress.current = 0
      dispatch(setProgress(progress))
      flipflip().api.setProgressBar(2)
      instagramImportLoop()
    }
  }
}

export function importReddit() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    let progress: Progress = { current: 0 }

    const redditImportLoop = async () => {
      const state = getState()
      if (state.app.progressMode === PR.cancel) {
        flipflip().api.setProgressBar(-1)
        progress = { current: 0 }
        dispatch(setProgress(progress))
        return
      }

      try {
        const subscriptionListing = await flipflip().api.redditGetSubscriptions(
          state.app.config.remoteSettings.redditUserAgent,
          state.app.config.remoteSettings.redditClientID,
          state.app.config.remoteSettings.redditRefreshToken,
          state.app.progressNext
        )

        if (subscriptionListing.length === 0) {
          flipflip().api.setProgressBar(-1)
          dispatch(
            setSystemSnack({
              message: 'Reddit Subscription Import has completed',
              severity: SS.success
            })
          )
          progress = { current: 0 }
          dispatch(setProgress(progress))
        } else {
          // Get the next 20 blogs
          let subscriptions = []
          for (const sub of subscriptionListing) {
            const subURL = 'http://www.reddit.com' + sub.url
            subscriptions.push(subURL)
          }

          // dedup
          const sourceURLs = state.app.library
            .map((id) => state.librarySource.entries[id])
            .map((s) => s.url)
          subscriptions = subscriptions.filter((s) => !sourceURLs.includes(s))

          // Add to Library
          let id = state.librarySource.nextID
          const newLibrary = state.app.library
          for (const url of subscriptions) {
            const source = newLibrarySource({
              id,
              url,
              tags: []
            })

            dispatch(setLibrarySource(source))
            newLibrary.push(source.id)
            id++
          }
          dispatch(setLibrary(newLibrary))

          progress.next =
            subscriptionListing[subscriptionListing.length - 1].name
          progress.current = (progress.current as number) + 1
          dispatch(setProgress(progress))
          flipflip().api.setProgressBar(2)

          // Loop until we run out of blogs
          setTimeout(redditImportLoop, 1500)
        }
      } catch (err) {
        console.error(err)
        flipflip().api.setProgressBar(-1)
        dispatch(
          setSystemSnack({
            message: 'Error retrieving subscriptions: ' + err,
            severity: SS.error
          })
        )
        progress = { current: 0 }
        dispatch(setProgress(progress))
      }
    }

    const state = getState()
    if (!state.app.progressMode) {
      // Show progress bar and kick off loop
      const message =
        'Your Reddit subscriptions are being imported... You will recieve an alert when the import is finished.'
      dispatch(setSystemSnack({ message, severity: SS.info }))

      progress.mode = PR.reddit
      progress.current = 0
      dispatch(setProgress(progress))
      flipflip().api.setProgressBar(2)
      redditImportLoop()
    }
  }
}

export function importTumblr() {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    let progress: Progress = {}

    // Define our loop
    const tumblrImportLoop = async () => {
      const state = getState()
      if (state.app.progressMode === PR.cancel) {
        flipflip().api.setProgressBar(-1)
        progress = { current: 0, total: 0 }
        dispatch(setProgress(progress))
        return
      }
      // Get the next page of blogs
      try {
        let following = await flipflip().api.tumblrBlogs(
          state.app.config.remoteSettings.tumblrKey,
          state.app.config.remoteSettings.tumblrSecret,
          state.app.config.remoteSettings.tumblrOAuthToken,
          state.app.config.remoteSettings.tumblrOAuthTokenSecret,
          progress.current as number
        )

        // dedup
        const sourceURLs = state.app.library
          .map((id) => state.librarySource.entries[id])
          .map((s) => s.url)
        following = following.filter((b) => !sourceURLs.includes(b))

        // Add to Library
        let id = state.librarySource.nextID
        const newLibrary = state.app.library
        for (const url of following) {
          const source = newLibrarySource({
            id,
            url,
            tags: []
          })

          dispatch(setLibrarySource(source))
          newLibrary.push(source.id)
          id++
        }
        dispatch(setLibrary(newLibrary))

        progress.current = (progress.current as number) + 20
        if (progress.current > state.app.progressTotal) {
          progress.current = state.app.progressTotal
        }

        // Update progress
        dispatch(setProgress(progress))
        flipflip().api.setProgressBar(
          progress.current / (progress.total as number)
        )

        // Loop until we run out of blogs
        if (progress.current < state.app.progressTotal) {
          setTimeout(tumblrImportLoop, 1500)
        } else {
          flipflip().api.setProgressBar(-1)
          dispatch(
            setSystemSnack({
              message: 'Tumblr Following Import has completed',
              severity: SS.success
            })
          )
          progress = { current: 0, total: 0 }
          dispatch(setProgress(progress))
        }
      } catch (err) {
        flipflip().api.setProgressBar(-1)
        dispatch(
          setSystemSnack({
            message: 'Error retrieving following: ' + err,
            severity: SS.error
          })
        )
        progress = { current: 0, total: 0 }
        dispatch(setProgress(progress))
        console.error(err)
      }
    }

    // If we don't have an import running
    const state = getState()
    if (!state.app.progressMode) {
      try {
        const totalBlogs = await flipflip().api.tumblrTotalBlogs(
          state.app.config.remoteSettings.tumblrKey,
          state.app.config.remoteSettings.tumblrSecret,
          state.app.config.remoteSettings.tumblrOAuthToken,
          state.app.config.remoteSettings.tumblrOAuthTokenSecret
        )

        progress.mode = PR.tumblr
        progress.current = 0
        progress.total = totalBlogs
        dispatch(setProgress(progress))
        flipflip().api.setProgressBar(
          progress.current / (progress.total as number)
        )
        tumblrImportLoop()
      } catch (err) {
        flipflip().api.setProgressBar(-1)
        dispatch(systemMessage('Error retrieving following: ' + err))
        progress = { current: 0, total: 0 }
        dispatch(setProgress(progress))
        console.error(err)
      }
    }
  }
}

export function importTwitter() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    let progress: Progress = {}

    const twitterImportLoop = async () => {
      const state = getState()
      if (state.app.progressMode === PR.cancel) {
        flipflip().api.setProgressBar(-1)
        progress = { current: 0 }
        dispatch(setProgress(progress))
        return
      }

      try {
        const friends = await flipflip().api.twitterFriendsList(
          state.app.config.remoteSettings.twitterConsumerKey,
          state.app.config.remoteSettings.twitterConsumerSecret,
          state.app.config.remoteSettings.twitterAccessTokenKey,
          state.app.config.remoteSettings.twitterAccessTokenSecret,
          state.app.progressCurrent ? Number(state.app.progressNext) : undefined
        )

        // dedup
        let following = friends.following
        const sourceURLs = state.app.library
          .map((id) => state.librarySource.entries[id])
          .map((s) => s.url)
        following = following.filter((s) => !sourceURLs.includes(s))

        // Add to Library
        let id = state.librarySource.nextID
        const newLibrary = state.app.library
        for (const url of following) {
          const source = newLibrarySource({
            id,
            url,
            tags: []
          })

          dispatch(setLibrarySource(source))
          newLibrary.push(source.id)
          id++
        }
        dispatch(setLibrary(newLibrary))

        if (friends.cursor === 0) {
          // We're done
          flipflip().api.setProgressBar(-1)
          dispatch(
            setSystemSnack({
              message: 'Twitter Following Import has completed',
              severity: SS.success
            })
          )
          progress = { current: 0 }
          dispatch(setProgress(progress))
        } else {
          // Loop until we run out of blogs
          setTimeout(twitterImportLoop, 1500)
          progress.next = friends.cursor?.toString()
          progress.current = (progress.current as number) + 1
          dispatch(setProgress(progress))
          flipflip().api.setProgressBar(2)
        }
      } catch (error: any) {
        let message = 'Error retrieving following:'
        for (const e of error) {
          message = message + '\n' + e.code + ' - ' + e.message
          console.error(
            'Error retrieving following: ' + e.code + ' - ' + e.message
          )
        }
        flipflip().api.setProgressBar(-1)

        dispatch(systemMessage(message))
        progress = { current: 0 }
        dispatch(setProgress(progress))
      }
    }

    const state = getState()
    if (!state.app.progressMode) {
      // Show progress bar and kick off loop
      const message =
        'Your Twitter Following is being imported... You will recieve an alert when the import is finished.'
      dispatch(setSystemSnack({ message, severity: SS.info }))

      progress.mode = PR.twitter
      progress.current = 0
      dispatch(setProgress(progress))

      flipflip().api.setProgressBar(2)
      twitterImportLoop()
    }
  }
}

export function markOffline() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    let progress: Progress = {}

    const actionableLibrary = state.app.library
      .map((id) => state.librarySource.entries[id])
      .filter((ls) => {
        // If this link was checked within the last week, skip
        return (
          new Date().getTime() - new Date(ls.lastCheck as number).getTime() >=
          604800000
        )
      })

    const offlineLoop = async () => {
      const state = getState()
      if (state.app.progressMode === PR.cancel) {
        flipflip().api.setProgressBar(-1)
        progress = { title: '', current: 0, total: 0 }
        dispatch(setProgress(progress))
      } else if (actionableLibrary.length === progress.current) {
        flipflip().api.setProgressBar(-1)
        const message =
          'Offline Check has completed. Sources not available are now marked.'
        dispatch(setSystemSnack({ message, severity: SS.success }))
        progress = { title: '', current: 0, total: 0 }
        dispatch(setProgress(progress))
      } else if (
        actionableLibrary[progress.current as number].url.startsWith(
          'http://'
        ) ||
        actionableLibrary[progress.current as number].url.startsWith('https://')
      ) {
        const actionSource = actionableLibrary[progress.current as number]
        progress.title = actionSource.url
        dispatch(setProgress(progress))

        const librarySource = state.app.library
          .map((id) => state.librarySource.entries[id])
          .find((s) => s.url === actionSource.url)
        if (librarySource) {
          dispatch(
            setLibrarySourceLastCheck({
              id: librarySource.id,
              value: new Date().getTime()
            })
          )
          wretch(librarySource.url)
            .get()
            .notFound((res) => {
              dispatch(
                setLibrarySourceOffline({ id: librarySource.id, value: true })
              )
              const current = progress.current as number
              const total = progress.total as number
              progress.current = current + 1
              dispatch(setProgress(progress))
              flipflip().api.setProgressBar(progress.current / total)
              setTimeout(offlineLoop, 1000)
            })
            .res((res) => {
              dispatch(
                setLibrarySourceOffline({ id: librarySource.id, value: false })
              )
              const current = progress.current as number
              const total = progress.total as number
              progress.current = current + 1
              dispatch(setProgress(progress))
              flipflip().api.setProgressBar(progress.current / total)
              setTimeout(offlineLoop, 1000)
            })
            .catch((e) => {
              console.error(e)
              dispatch(
                setLibrarySourceLastCheck({
                  id: librarySource.id,
                  value: undefined
                })
              )
              const current = progress.current as number
              const total = progress.total as number
              progress.current = current + 1
              dispatch(setProgress(progress))
              flipflip().api.setProgressBar(progress.current / total)
              setTimeout(offlineLoop, 100)
            })
        } else {
          // Skip if removed from library during check
          const current = progress.current as number
          const total = progress.total as number
          progress.current = current + 1
          dispatch(setProgress(progress))
          flipflip().api.setProgressBar(progress.current / total)
          setTimeout(offlineLoop, 100)
        }
      } else {
        const current = progress.current as number
        const total = progress.total as number
        const actionSource = actionableLibrary[current]
        progress.title = actionSource.url
        progress.current = current + 1
        dispatch(setProgress(progress))
        flipflip().api.setProgressBar(progress.current / total)
        dispatch(
          setLibrarySourceLastCheck({
            id: actionSource.id,
            value: new Date().getTime()
          })
        )
        const exists = await flipflip().api.pathExists(actionSource.url)
        if (!exists) {
          dispatch(
            setLibrarySourceOffline({ id: actionSource.id, value: true })
          )
        }
        setTimeout(offlineLoop, 10)
      }
    }

    // If we don't have an import running
    if (!state.app.progressMode) {
      progress.mode = PR.offline
      progress.current = 0
      progress.total = actionableLibrary.length
      dispatch(setProgress(progress))
      flipflip().api.setProgressBar(progress.current / progress.total)
      offlineLoop()
    }
  }
}

export function updateVideoMetadata() {
  return function updateVideoMetadataThunk(
    dispatch: AppDispatch,
    getState: () => RootState
  ) {
    let progress: Progress = {}
    const state = getState()

    const actionableLibrary = state.app.library
      .map((id) => state.librarySource.entries[id])
      .filter(
        (ls) =>
          getSourceType(ls.url) === ST.video &&
          (ls.duration == null || ls.resolution == null)
      )

    const videoMetadataLoop = () => {
      const state = getState()
      const offset = state.app.progressCurrent
      if (state.app.progressMode === PR.cancel) {
        flipflip().api.setProgressBar(-1)
        progress = { current: 0, total: 0, title: '' }
        dispatch(setProgress(progress))
      } else if (actionableLibrary.length === offset) {
        flipflip().api.setProgressBar(-1)
        dispatch(
          setSystemSnack({
            message: 'Video Metadata update has completed.',
            severity: SS.success
          })
        )
        progress = { current: 0, total: 0, title: '' }
        dispatch(setProgress(progress))
      } else {
        const actionSource = actionableLibrary[offset]
        progress.title = actionSource.url
        dispatch(setProgress(progress))

        const librarySource = state.app.library
          .map((id) => state.librarySource.entries[id])
          .find((s) => s.url === actionSource.url)
        if (librarySource) {
          const video = document.createElement('video')
          video.preload = 'metadata'

          video.onloadedmetadata = () => {
            const height = video.videoHeight
            const width = video.videoWidth
            librarySource.resolution = Math.min(height, width)
            librarySource.duration = video.duration
            dispatch(setLibrarySource(librarySource))
            video.remove()
            const current = progress.current as number
            const total = progress.total as number
            progress.current = current + 1
            dispatch(setProgress(progress))
            flipflip().api.setProgressBar(progress.current / total)
            setTimeout(videoMetadataLoop, 100)
          }
          video.onerror = () => {
            video.remove()
            const current = progress.current as number
            const total = progress.total as number
            progress.current = current + 1
            dispatch(setProgress(progress))
            flipflip().api.setProgressBar(progress.current / total)
            setTimeout(videoMetadataLoop, 100)
          }

          video.src = librarySource.url
        } else {
          // Skip if removed from library during check
          const current = progress.current as number
          const total = progress.total as number
          progress.current = current + 1
          dispatch(setProgress(progress))
          flipflip().api.setProgressBar(progress.current / total)
          videoMetadataLoop()
        }
      }
    }

    // If we don't have an import running
    if (!state.app.progressMode && actionableLibrary.length > 0) {
      progress.mode = PR.videoMetadata
      progress.current = 0
      progress.total = actionableLibrary.length
      dispatch(setProgress(progress))
      flipflip().api.setProgressBar(progress.current / progress.total)
      videoMetadataLoop()
    }
  }
}

export function exportLibrary() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const sources = state.app.library.map((id) =>
      toLibrarySourceStorage(id, state)
    )
    const fileName = 'library_export-' + new Date().getTime() + '.json'
    flipflip().api.saveJsonFile(fileName, JSON.stringify(sources))
  }
}

export function importLibrary(libraryImport: LibrarySourceStorage[]) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    if (!libraryImport?.length) return

    await flipflip().api.backupAppStorage()
    const state = getState()
    const existingSources = new Map<string, number>()
    state.app.library
      .map((id) => state.librarySource.entries[id])
      .forEach((s) => {
        existingSources.set(s.url, s.id)
      })
    const existingTags = new Map<string, number>()
    state.app.tags
      .map((id) => state.tag.entries[id])
      .filter((s) => s.name != null)
      .forEach((s) => {
        existingTags.set(s.name as string, s.id)
      })

    const slice = copy<AppStorageImport>(initialAppStorageImport)
    libraryImport.forEach((s) =>
      fromLibrarySourceStorage(s, slice.librarySource, slice.tag, slice.clip)
    )
    const updateSliceIDs = (
      slice: EntryState<LibrarySource | Tag | Clip>,
      nextID: number
    ) => {
      Object.keys(slice.entries).forEach((key) => {
        const id = Number(key)
        const entry = slice.entries[id]
        entry.id += nextID
        slice.entries[nextID + id] = entry
        delete slice.entries[id]
      })
    }

    updateSliceIDs(slice.librarySource, state.librarySource.nextID)
    updateSliceIDs(slice.tag, state.tag.nextID)
    updateSliceIDs(slice.clip, state.clip.nextID)

    const mergeTagIDs = new Map<number, number>()
    Object.values(slice.tag.entries).forEach((t) => {
      const tagID = existingTags.get(t.name as string)
      if (tagID) {
        mergeTagIDs.set(t.id, tagID)
      }
    })
    mergeTagIDs.forEach((importID: number, existingID: number) => {
      delete slice.tag.entries[importID]
      ;[slice.librarySource, slice.clip].forEach((slice) => {
        Object.values(slice.entries).forEach((s) => {
          const index = s.tags.indexOf(importID)
          if (index !== -1) {
            s.tags[index] = existingID
          }
        })
      })
    })

    const mergeClipIDs = new Map<number, number>()
    Object.values(slice.clip.entries).forEach((c) => {
      const existingClip = Object.values(state.clip.entries).find(
        (s) => s.start === c.start && s.end === c.end
      )
      if (existingClip) {
        mergeClipIDs.set(c.id, existingClip.id)
      }
    })
    mergeClipIDs.forEach((importID: number, existingID: number) => {
      delete slice.clip.entries[importID]
      Object.values(slice.librarySource.entries).forEach((s) => {
        const index = s.clips.indexOf(importID)
        if (index !== -1) {
          s.clips[index] = existingID
        }
      })
    })

    const newLibrary = state.app.library
    const changedSources: LibrarySource[] = []
    Object.values(slice.librarySource.entries).forEach((s) => {
      const sourceID = existingSources.get(s.url)
      if (sourceID) {
        let changed = false
        const existingSource = state.librarySource.entries[sourceID]

        // If this source is untagged, add imported tags
        if (existingSource.tags.length === 0) {
          existingSource.tags = s.tags
          changed = true
        }

        // Add new blacklist urls
        const blacklist = new Set(existingSource.blacklist)
        const blacklistSize = blacklist.size
        s.blacklist.forEach((url) => blacklist.add(url))
        if (blacklist.size > blacklistSize) {
          existingSource.blacklist = [...blacklist]
          changed = true
        }

        // Add new clips
        const clips = new Set(existingSource.clips)
        const clipsSize = clips.size
        s.clips.forEach((id) => clips.add(id))
        if (clips.size > clipsSize) {
          existingSource.clips = [...clips]
          changed = true
        }

        if (changed) {
          changedSources.push(existingSource)
        }
      } else {
        changedSources.push(s)
        newLibrary.push(s.id)
      }
    })

    const newTags = Object.values(slice.tag.entries)
    dispatch(setTags(newTags))
    dispatch(addToTags(newTags.map((s) => s.id)))

    const newClips = Object.values(slice.clip.entries)
    dispatch(setClips(newClips))
    dispatch(setLibrarySources(changedSources))
    dispatch(setLibrary(newLibrary))
    dispatch(
      setSystemSnack({
        message: 'Library Import complete!',
        severity: SS.success
      })
    )
  }
}

export function importFromLibrary(sourceIDs: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scene = getActiveScene(state) as Scene

    // dedup
    const sourceURLs = scene.sources.map(
      (id) => state.librarySource.entries[id].url
    )
    const sources = sourceIDs
      .filter((id) => state.app.library.includes(id))
      .map((id) => state.librarySource.entries[id])
      .filter((s) => s && !sourceURLs.includes(s.url))

    let id = state.librarySource.nextID
    for (const source of sources) {
      const newSource = newLibrarySource(source)
      newSource.id = id
      dispatch(setLibrarySource(newSource))
      scene.sources.unshift(newSource.id)
      id++
    }

    dispatch(setSceneSources({ id: scene.id, value: scene.sources }))
    dispatch(setRouteGoBack())
  }
}

export function setLibraryRemoveVisible(displayIDs: number[]) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    const state = getState()
    const sourceURLs = displayIDs
      .filter((id) => state.app.library.includes(id))
      .map((id) => state.librarySource.entries[id])
      .map((s) => s.url)

    const cachePath = async (url: string): Promise<string> => {
      const baseDir = state.app.config.caching.directory
      const typeDir = (en.get(getSourceType(url)) as string).toLowerCase()
      return flipflip()
        .api.cachePath(baseDir, url, typeDir)
        .then((path) => path as string)
    }

    for (const url of sourceURLs) {
      const fileType = getSourceType(url)
      try {
        if (fileType === ST.local) {
          await flipflip().api.rimrafSync(url)
        } else if (
          fileType === ST.video ||
          fileType === ST.playlist ||
          fileType === ST.list
        ) {
          await flipflip().api.unlink(url)

          const path = await cachePath(url)
          const fileName = getFileName(url, state.constants.pathSep)
          await flipflip().api.rimrafSync(path + fileName)
        } else {
          const path = await cachePath(url)
          await flipflip().api.rimrafSync(path)
        }
      } catch (e) {
        console.error(e)
      }
    }

    dispatch(setLibraryRemove(displayIDs))
  }
}

export function setScriptsEditUrl(scriptId: number, newURL: string) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    dispatch(setCaptionScriptURL({ id: scriptId, value: newURL }))
    const state = getState()

    const newSources: CaptionScript[] = []
    const sources = state.app.scripts.map(
      (id) => state.captionScript.entries[id]
    )
    for (const source of sources) {
      if (/^\s*$/.exec(source.url as string) == null) {
        if (!newSources.map((s) => s.url).includes(source.url)) {
          newSources.push(source)
        } else {
          for (const existingSource of newSources) {
            if (existingSource.url === source.url) {
              if (existingSource.id > source.id) {
                newSources[newSources.indexOf(existingSource)] = source
              }
              break
            }
          }
        }
      }
    }

    newSources.forEach((s) => dispatch(setCaptionScript(s)))
    dispatch(setScripts(newSources.map((s) => s.id)))
  }
}

export function removeAllTags() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    state.app.library.forEach((id) =>
      dispatch(setLibrarySourceTags({ id, value: [] }))
    )
    state.app.library
      .map((id) => state.librarySource.entries[id])
      .flatMap((s) => s.clips)
      .forEach((id) => dispatch(setClipTags({ id, value: [] })))
    state.app.audios.forEach((id) => dispatch(setAudioTags({ id, value: [] })))
    state.app.scripts.forEach((id) =>
      dispatch(setCaptionScriptTags({ id, value: [] }))
    )
    state.app.scenes
      .map((id) => state.scene.entries[id])
      .flatMap((s) => s.sources)
      .forEach((id) => dispatch(setLibrarySourceTags({ id, value: [] })))
    state.app.scenes
      .map((id) => state.scene.entries[id])
      .flatMap((s) => s.sources)
      .map((id) => state.librarySource.entries[id])
      .flatMap((s) => s.clips)
      .forEach((id) => dispatch(setClipTags({ id, value: [] })))
    dispatch(setAppTags([]))
  }
}

import { v4 as uuidv4 } from 'uuid'

import { PT } from 'flipflip-common'
import { setRoute, addRoutes, setTutorial } from '../app/slice'
import { setScene } from '../scene/slice'
import { type AppDispatch, type RootState } from '../store'
import { newOverlay } from '../overlay/Overlay'
import { newRoute } from '../app/data/Route'
import type Scene from '../scene/Scene'
import { newScene } from '../scene/Scene'
import {
  type PlayersState,
  setPlayersState,
  setPlayerStates,
  PlayerOverlayState,
  setPlayerHasStarted,
  PlayerState,
  PlayerUpdate
} from './slice'
import {
  convertGridIDToSceneID,
  convertSceneIDToGridID,
  getRandomListItem,
  isSceneIDAGridID
} from '../../data/utils'
import { type EntryState, getEntry } from '../EntryState'
import { setOverlay } from '../overlay/slice'
import { scrapeSources } from '../sourceScraper/thunks'

function getNextSceneID(scene: Scene, scenes: EntryState<Scene>) {
  if (scene.nextSceneID === -1) {
    return scene.nextSceneRandoms.length === 0
      ? getRandomListItem(Object.keys(scenes.entries).map((key) => Number(key)))
      : getRandomListItem(scene.nextSceneRandoms)
  } else {
    return scene.nextSceneID
  }
}

function createPlayerState(
  uuid: string,
  scene: Scene,
  playersState: PlayersState,
  state: RootState
) {
  const nextSceneID = getNextSceneID(scene, state.scene)
  const overlays =
    scene.overlayEnabled && scene.overlays
      ? scene.overlays.map((overlayID) => {
          const grid: string[][] = []
          const overlay = state.overlay.entries[overlayID]
          let sceneID = overlay.sceneID
          const isGrid = isSceneIDAGridID(overlay.sceneID)
          if (isGrid) {
            sceneID = convertSceneIDToGridID(overlay.sceneID) as number
            const sceneGrid = state.sceneGrid.entries[sceneID]
            for (const row of sceneGrid.grid) {
              const gridRow: string[] = []
              for (const col of row) {
                const colUuid = uuidv4()
                const colScene = state.scene.entries[col.sceneID]
                createPlayerState(colUuid, colScene, playersState, state)
                gridRow.push(colUuid)
              }

              grid.push(gridRow)
            }
          }

          const overlayState: PlayerOverlayState = {
            id: overlay.id,
            opacity: overlay.opacity,
            sceneID,
            isGrid,
            grid,
            loaded: false
          }

          return overlayState
        })
      : []

  playersState[uuid] = {
    sceneID: scene.id,
    nextSceneID,
    overlays,
    firstImageLoaded: false,
    mainLoaded: scene.gridScene || scene.audioScene,
    isEmpty: false,
    hasStarted: scene.audioScene
  }
}

export function startPlaying(sceneID: number) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const uuid = 'root'
    const state = getState()
    const scene = getEntry(state.scene, sceneID)
    const playersState: PlayersState = {}
    createPlayerState(uuid, scene, playersState, state)
    dispatch(setPlayersState(playersState))
    Object.keys(playersState).forEach((uuid) => dispatch(scrapeSources(uuid)))
  }
}

export function nextScene(uuid: string = 'root') {
  return function nextSceneThunk(
    dispatch: AppDispatch,
    getState: () => RootState
  ) {
    const state = getState()
    const sceneID = state.players[uuid].nextSceneID
    const scene = state.scene.entries[sceneID]
    if (scene != null) {
      const newPlayerState: PlayersState = {}
      newPlayerState[uuid] = state.players[uuid]
      createPlayerState(uuid, scene, newPlayerState, state)
      const updates: PlayerUpdate<PlayerState>[] = Object.keys(
        newPlayerState
      ).map((uuid) => {
        const value = newPlayerState[uuid]
        value.hasStarted = true
        value.firstImageLoaded = true
        dispatch(scrapeSources(uuid))
        return { uuid, value }
      })

      dispatch(setPlayerStates(updates))
      if (uuid === 'root') {
        dispatch(
          setRoute([
            newRoute({ kind: 'scene', value: sceneID }),
            newRoute({ kind: 'play', value: uuid })
          ])
        )
      }
    }
  }
}

export function playGrid(gridID: number) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const grid = state.sceneGrid.entries[gridID]
    const overlayID = state.overlay.nextID
    const tempOverlay = newOverlay({
      id: overlayID,
      sceneID: convertGridIDToSceneID(grid.id),
      opacity: 100
    })
    dispatch(setOverlay(tempOverlay))

    const tempScene = newScene({
      id: state.scene.nextID,
      name: grid.name,
      overlayEnabled: true,
      gridScene: true,
      overlays: [overlayID]
    })

    dispatch(setScene(tempScene))

    const uuid = 'root'
    const playersState: PlayersState = {}
    createPlayerState(uuid, tempScene, playersState, getState())
    dispatch(setPlayersState(playersState))
    Object.keys(playersState).forEach((uuid) => dispatch(scrapeSources(uuid)))
    dispatch(
      addRoutes([
        newRoute({ kind: 'scene', value: tempScene.id }),
        newRoute({ kind: 'gridplay', value: uuid })
      ])
    )
  }
}

export function playScene(id: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scene = getEntry(state.scene, id) as Scene
    const tutorial =
      state.app.config.tutorials.player == null ? PT.welcome : undefined

    const uuid = 'root'
    const playersState: PlayersState = {}
    createPlayerState(uuid, scene, playersState, state)
    dispatch(setPlayersState(playersState))
    Object.keys(playersState).forEach((uuid) => dispatch(scrapeSources(uuid)))
    dispatch(setTutorial(tutorial))
    dispatch(addRoutes([newRoute({ kind: 'play', value: uuid })]))
  }
}

export function setPlayerHasStartedRecursive(
  uuid: string,
  hasStarted: boolean
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    state.players[uuid].overlays
      .filter((s) => s.isGrid)
      .flatMap((s) => s.grid)
      .flatMap((s) => s)
      .forEach((s) => dispatch(setPlayerHasStartedRecursive(s, hasStarted)))

    dispatch(setPlayerHasStarted({ uuid, value: hasStarted }))
  }
}

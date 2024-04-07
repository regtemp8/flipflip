import { v4 as uuidv4 } from 'uuid'

import { OF, PT, ST, getSourceType } from 'flipflip-common'
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
  PlayerUpdate,
  setPlayerStartLoading,
  setPlayerLoadingComplete,
  setPlayerSetImageView,
  setPlayerIncrementDisplayIndex,
  setPlayerIncrementIFrameCount
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
import preload from './ContentPreloadService'
import { setSourceScraperState } from '../sourceScraper/slice'

function getNextSceneID(scene: Scene, scenes: EntryState<Scene>): number {
  if (scene.nextSceneID === -1) {
    return scene.nextSceneRandoms.length === 0
      ? getRandomListItem(Object.keys(scenes.entries).map((key) => Number(key)))
      : getRandomListItem(scene.nextSceneRandoms)
  } else {
    return scene.nextSceneID
  }
}

function containsOnlyIframes(sceneID: number, state: RootState): boolean {
  return state.scene.entries[sceneID].sources
    .map((id) => state.librarySource.entries[id])
    .every((s) => getSourceType(s.url) === ST.nimja)
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
            show: true,
            opacity: overlay.opacity,
            sceneID,
            isGrid,
            grid,
            loaded: false,
            loader: {
              zIndex: 0,
              displayIndex: 0,
              loadingCount: 0,
              iframeCount: 0,
              onlyIframes: containsOnlyIframes(sceneID, state),
              readyToLoad: [
                ...Array(state.app.config.displaySettings.maxInMemory).keys()
              ],
              imageViews: []
            }
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
    hasStarted: scene.audioScene,
    loader: {
      zIndex: 0,
      displayIndex: 0,
      loadingCount: 0,
      iframeCount: 0,
      onlyIframes: containsOnlyIframes(scene.id, state),
      readyToLoad: [
        ...Array(state.app.config.displaySettings.maxInMemory).keys()
      ],
      imageViews: []
    }
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
    dispatch(setSourceScraperState({}))
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
    dispatch(setSourceScraperState({}))
    preload().init()

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

export function loadImageViews(uuid: string, overlayIndex?: number) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const maxLoadingAtOnce = state.app.config.displaySettings.maxLoadingAtOnce
    const { mainLoaded } = state.players[uuid]
    const { loader, sceneID } =
      overlayIndex != null
        ? state.players[uuid].overlays[overlayIndex]
        : state.players[uuid]

    const canLoad = Math.min(
      maxLoadingAtOnce - loader.loadingCount,
      loader.readyToLoad.length
    )
    if (canLoad <= 0) {
      return
    }

    dispatch(
      setPlayerStartLoading({
        uuid,
        overlayIndex,
        value: canLoad
      })
    )

    const maxIframeCount = 2
    const scene = state.scene.entries[sceneID]
    const loadCriteria = {
      minImageSize: state.app.config.displaySettings.minImageSize,
      minVideoSize: state.app.config.displaySettings.minVideoSize,
      imageOrientation: scene.imageOrientation,
      videoOrientation: scene.videoOrientation,
      imageTypeFilter: scene.imageTypeFilter
    }
    const transformCriteria = {
      imageOrientation: scene.imageOrientation,
      videoOrientation: scene.videoOrientation
    }

    const promises = loader.readyToLoad
      .slice(0, canLoad)
      .map((index): Promise<boolean> => {
        return preload()
          .getData(uuid, state)
          .then(
            (data) => {
              if (
                data.error ||
                !preload().shouldLoad(data, loadCriteria) ||
                loader.imageViews[index]?.data.url === data.url
              ) {
                // if url hasn't changed, then onload event isn't triggered
                const payload = { uuid, overlayIndex, value: index }
                dispatch(setPlayerLoadingComplete(payload))
                return false
              }
              if (data.type === 'iframe') {
                const { loader } =
                  overlayIndex != null
                    ? getState().players[uuid].overlays[overlayIndex]
                    : getState().players[uuid]

                if (loader.iframeCount < maxIframeCount) {
                  dispatch(
                    setPlayerIncrementIFrameCount({
                      uuid,
                      overlayIndex,
                      value: undefined
                    })
                  )
                } else {
                  const payload = { uuid, overlayIndex, value: index }
                  dispatch(setPlayerLoadingComplete(payload))
                  return loader.onlyIframes
                }
              }

              const view = preload().getViewData(data, uuid, sceneID, state)
              const transform = preload().getTransform(data, transformCriteria)
              const effects = preload().getEffects(
                data,
                view.timeToNextFrame,
                uuid,
                sceneID,
                state
              )

              const imageView = preload().getImageView(
                data,
                effects,
                view,
                transform
              )
              if (scene.orderFunction === OF.strict) {
                const { loader } =
                  overlayIndex != null
                    ? getState().players[uuid].overlays[overlayIndex]
                    : getState().players[uuid]

                imageView.displayIndex = loader.displayIndex
                dispatch(
                  setPlayerIncrementDisplayIndex({
                    uuid,
                    overlayIndex,
                    value: undefined
                  })
                )
              }

              dispatch(
                setPlayerSetImageView({
                  uuid,
                  overlayIndex,
                  value: { index, view: imageView }
                })
              )

              return true
            },
            () => {
              const payload = { uuid, overlayIndex, value: index }
              dispatch(setPlayerLoadingComplete(payload))
              return false
            }
          )
      })

    Promise.all(promises).then(
      (values: boolean[]): void => {
        if (!mainLoaded) {
          return
        }

        const didLoad = values.filter((succeeded) => succeeded).length
        if (didLoad < canLoad) {
          dispatch(loadImageViews(uuid, overlayIndex))
        }
      },
      (): void => {
        if (mainLoaded) {
          dispatch(loadImageViews(uuid, overlayIndex))
        }
      }
    )
  }
}

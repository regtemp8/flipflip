import { OF, PLT, RP, ST, copy, getSourceType } from 'flipflip-common'
import { addRoutes } from '../app/slice'
import { type AppDispatch, type RootState } from '../store'
import { newRoute } from '../app/data/Route'
import {
  type PlayersState,
  setPlayersState,
  setPlayerStartLoading,
  setPlayerLoadingComplete,
  setPlayerSetImageView,
  setPlayerIncrementDisplayIndex,
  setPlayerIncrementIFrameCount,
  PlaylistState,
  setPlayerDecrementTimeToNextScene,
  setPlayerPlaylist,
  setPlayerLoaderOnlyIframes,
  setPlayerHasStarted
} from './slice'
import { getRandomListItem, randomizeList } from '../../data/utils'
import { scrapeSources } from '../sourceScraper/thunks'
import preload from './ContentPreloadService'
import { setSourceScraperState } from '../sourceScraper/slice'
import { setDisplayView, setDisplayViewPlayerUUID } from '../displayView/slice'
import { setDisplay } from '../display/slice'
import { newDisplay } from '../display/Display'
import { newView } from '../displayView/View'
import { newPlaylist } from '../playlist/Playlist'
import { newScenePlaylistItem } from '../scenePlaylistItem/ScenePlaylistItem'
import { setScenePlaylistItem } from '../scenePlaylistItem/slice'
import { setPlaylist } from '../playlist/slice'
import Scene from '../scene/Scene'
import { setScene } from '../scene/slice'

function containsOnlyIframes(sceneID: number, state: RootState): boolean {
  return state.scene.entries[sceneID].sources
    .map((id) => state.librarySource.entries[id])
    .every((s) => getSourceType(s.url) === ST.nimja)
}

function calcRepeats(playlistID: number, state: RootState) {
  const { repeat } = state.playlist.entries[playlistID]
  switch (repeat) {
    case RP.all:
      return -1
    case RP.one:
      return 2
    default:
      return 1
  }
}

function createPlaylistItems(playlistID: number, state: RootState) {
  const { items, shuffle } = state.playlist.entries[playlistID]
  const playlistItems = items
    .map((id) => state.scenePlaylistItem.entries[id])
    .map((entry) => {
      let { sceneID, duration } = entry
      if (sceneID === -1) {
        const randomScenes =
          entry.randomScenes.length > 0 ? entry.randomScenes : state.app.scenes
        sceneID = getRandomListItem(randomScenes)
      }

      return { sceneID, duration }
    })

  if (shuffle && playlistItems.length > 1) {
    randomizeList(playlistItems)
  }

  return playlistItems
}

function createPlaylist(playlistID: number, state: RootState): PlaylistState {
  const playlistItems = createPlaylistItems(playlistID, state)
  const timeToNextScene = playlistItems[0].duration
  return {
    playlistID,
    player: {
      index: 0,
      timeToNextScene
    },
    loader: {
      index: 0,
      timeToNextScene
    },
    items: playlistItems,
    repeat: calcRepeats(playlistID, state)
  }
}

function advancePlaylist(
  playlistState: PlaylistState,
  type: 'player' | 'loader',
  state: RootState
): PlaylistState {
  const newPlaylistState = copy<PlaylistState>(playlistState)
  const itemState = playlistState[type]
  const nextIndex = itemState.index + 1
  const playlistItems = state.playlist.entries[playlistState.playlistID].items
  if (nextIndex % playlistItems.length === 0) {
    if (type === 'loader') {
      // loader reached end of playlist, but player still needs the old playlist items
      newPlaylistState.items.push(
        ...createPlaylistItems(playlistState.playlistID, state)
      )
      newPlaylistState.loader.index = nextIndex
      newPlaylistState.loader.timeToNextScene =
        newPlaylistState.items[nextIndex].duration
      newPlaylistState.repeat-- // TODO stop loading when repeat === 0
    } else {
      // player also reached end of playlist, remove old playlist items
      newPlaylistState.items.splice(0, playlistItems.length)
      newPlaylistState.loader.index -= playlistItems.length
      newPlaylistState.player.index = 0
      newPlaylistState.player.timeToNextScene =
        newPlaylistState.items[0].duration
    }
  } else {
    newPlaylistState[type].index = nextIndex
    newPlaylistState[type].timeToNextScene =
      newPlaylistState.items[nextIndex].duration
  }

  return newPlaylistState
}

export function playDisplay(displayID: number) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    dispatch(setSourceScraperState({}))
    preload().init()

    const playersState: PlayersState = {}
    const { views } = state.display.entries[displayID]
    views.forEach((viewID) => {
      const view = state.displayView.entries[viewID]
      if (view.sync) {
        const uuid = `player-${view.syncWithView}`
        dispatch(setDisplayViewPlayerUUID({ id: viewID, value: uuid }))
      } else {
        const uuid = `player-${viewID}`
        dispatch(setDisplayViewPlayerUUID({ id: viewID, value: uuid }))
        const playlist = createPlaylist(view.playlistID, state)
        const sceneID = playlist.items[0].sceneID
        playersState[uuid] = {
          playlist,
          firstImageLoaded: false,
          mainLoaded: false,
          isEmpty: false,
          hasStarted: false,
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
      }
    })

    dispatch(setPlayersState(playersState))
    Object.keys(playersState).forEach((uuid) => dispatch(scrapeSources(uuid)))
    dispatch(addRoutes([newRoute({ kind: 'playdisplay', value: displayID })]))
  }
}

export function playScenePlaylist(playlistID: number) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const { name } = state.playlist.entries[playlistID]
    const viewID = state.displayView.nextID
    const view = newView({
      id: viewID,
      name,
      width: 100,
      height: 100,
      playlistID
    })
    dispatch(setDisplayView(view))

    const displayID = state.display.nextID
    const display = newDisplay({ id: displayID, name, views: [viewID] })
    dispatch(setDisplay(display))
    dispatch(playDisplay(displayID))
  }
}

export function playScene(sceneID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const { name } = state.scene.entries[sceneID]
    const playlistItemID = state.scenePlaylistItem.nextID
    const playlistItem = newScenePlaylistItem({
      id: playlistItemID,
      sceneID,
      duration: Infinity
    })
    dispatch(setScenePlaylistItem(playlistItem))
    const playlistID = state.playlist.nextID
    const playlist = newPlaylist({
      id: playlistID,
      type: PLT.scene,
      name,
      items: [playlistItemID]
    })
    dispatch(setPlaylist(playlist))
    dispatch(playScenePlaylist(playlistID))
  }
}

export function playScriptPlaylist(playlistID: number, sceneID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    if (sceneID === -1) {
      sceneID = getRandomListItem(state.app.scenes)
    }
    const sceneCopy = copy<Scene>(state.scene.entries[sceneID])
    sceneCopy.id = state.scene.nextID
    sceneCopy.name = state.playlist.entries[playlistID].name
    sceneCopy.textEnabled = true
    sceneCopy.scriptPlaylists = [playlistID]
    dispatch(setScene(sceneCopy))
    dispatch(playScene(sceneCopy.id))
  }
}

export function playAudioPlaylist(playlistID: number, sceneID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    if (sceneID === -1) {
      sceneID = getRandomListItem(state.app.scenes)
    }
    const sceneCopy = copy<Scene>(state.scene.entries[sceneID])
    sceneCopy.id = state.scene.nextID
    sceneCopy.name = state.playlist.entries[playlistID].name
    sceneCopy.audioEnabled = true
    sceneCopy.audioPlaylists = [playlistID]
    dispatch(setScene(sceneCopy))
    dispatch(playScene(sceneCopy.id))
  }
}

export function playDisplayPlaylist(playlistID: number) {
  // TODO implement display playlist feature
  return (dispatch: AppDispatch, getState: () => RootState) => {}
}

export function loadImageViews(uuid: string) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const player = state.players[uuid]
    if (player == null) {
      return
    }

    const maxLoadingAtOnce = state.app.config.displaySettings.maxLoadingAtOnce
    const { mainLoaded, loader, playlist } = player
    const canLoad = Math.min(
      maxLoadingAtOnce - loader.loadingCount,
      loader.readyToLoad.length
    )
    if (canLoad <= 0) {
      return
    }

    dispatch(setPlayerStartLoading({ uuid, value: canLoad }))

    const maxIframeCount = 2
    const { sceneID } = playlist.items[playlist.loader.index]
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

    let timeToNextScene = playlist.loader.timeToNextScene
    const promises = loader.readyToLoad
      .slice(0, canLoad)
      .map((index): Promise<boolean> => {
        return preload()
          .getData(uuid, sceneID, state)
          .then(
            (data) => {
              if (
                data.error ||
                !preload().shouldLoad(data, loadCriteria) ||
                loader.imageViews[index]?.data.url === data.url
              ) {
                // if url hasn't changed, then onload event isn't triggered
                const payload = { uuid, value: [index] }
                dispatch(setPlayerLoadingComplete(payload))
                return false
              }
              if (data.type === 'iframe') {
                const { loader } = getState().players[uuid]
                if (loader.iframeCount < maxIframeCount) {
                  dispatch(setPlayerIncrementIFrameCount(uuid))
                } else {
                  const payload = { uuid, value: [index] }
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
                sceneID,
                data,
                effects,
                view,
                transform
              )

              const latestState = getState()
              const player = latestState.players[uuid]
              const playlist = player.playlist
              if (
                playlist.items[playlist.loader.index].sceneID === sceneID &&
                timeToNextScene > 0
              ) {
                timeToNextScene -= imageView.view.timeToNextFrame
                if (scene.orderFunction === OF.strict) {
                  imageView.displayIndex = player.loader.displayIndex
                  dispatch(setPlayerIncrementDisplayIndex(uuid))
                }

                dispatch(
                  setPlayerSetImageView({
                    uuid,
                    value: { index, view: imageView }
                  })
                )

                return true
              } else {
                const payload = { uuid, value: [index] }
                dispatch(setPlayerLoadingComplete(payload))
                return false
              }
            },
            () => {
              const payload = { uuid, value: [index] }
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
          setTimeout(() => dispatch(loadImageViews(uuid)), 1000) // TODO remove setTimeout after debugging
        }
      },
      (): void => {
        if (mainLoaded) {
          dispatch(loadImageViews(uuid))
        }
      }
    )
  }
}

export function playerShouldDisplay(
  uuid: string,
  sceneID: number,
  duration: number
) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const { playlist } = state.players[uuid]
    const { sceneID: displaySceneID } = playlist.items[playlist.player.index]
    const { sceneID: displayNextSceneID } =
      playlist.items[(playlist.player.index + 1) % playlist.items.length]
    return sceneID === displaySceneID || sceneID === displayNextSceneID
  }
}

export function decreasePlayerLoaderPlaylistTimeLeft(
  uuid: string,
  sceneID: number,
  duration: number
) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const playlist = state.players[uuid].playlist
    if (playlist.loader.timeToNextScene - duration <= 0) {
      const newPlaylist = advancePlaylist(playlist, 'loader', state)
      dispatch(setPlayerPlaylist({ uuid, value: newPlaylist }))
      const { sceneID } = newPlaylist.items[newPlaylist.loader.index]
      dispatch(
        setPlayerLoaderOnlyIframes({
          uuid,
          value: containsOnlyIframes(sceneID, state)
        })
      )
      dispatch(scrapeSources(uuid))
      preload().onSceneChange(uuid, sceneID)
    } else {
      const newPlaylist = copy<PlaylistState>(playlist)
      newPlaylist.loader.timeToNextScene -= duration
      dispatch(setPlayerPlaylist({ uuid, value: newPlaylist }))
    }
  }
}

export function updatePlayerPlaylist(uuid: string, duration: number) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const { playlist } = state.players[uuid]
    const { timeToNextScene } = playlist.player
    if (timeToNextScene > 0) {
      dispatch(setPlayerDecrementTimeToNextScene({ uuid, value: duration }))
    }
    if (timeToNextScene - duration <= 0) {
      const value = advancePlaylist(playlist, 'player', state)
      dispatch(setPlayerPlaylist({ uuid, value }))
    }
  }
}

export function setDisplayHasStarted(displayID: number) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const uuids = state.display.entries[displayID].views
      .filter((viewID) => !state.displayView.entries[viewID].sync)
      .map((viewID) => state.displayView.entries[viewID].playerUUID)
      .filter((playerUUID) => playerUUID != null)
      .map((playerUUID) => playerUUID as string)

    dispatch(setPlayerHasStarted(uuids))
  }
}

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  ContentData,
  EffectsData,
  TransformData,
  ViewData
} from './ContentPreloadService'
import { flipflipApi } from '../api/slice'
import { ImagePlayerDataPlaylist, randomizeList, RP } from 'flipflip-common'
import { getRandomListItem } from '../../utils'

function calcRepeats(playlist: ImagePlayerDataPlaylist) {
  switch (playlist.repeat) {
    case RP.all:
      return -1
    case RP.one:
      return 2
    default:
      return 1
  }
}

function createPlaylistItems(playlist: ImagePlayerDataPlaylist) {
  const { items, shuffle } = playlist
  const playlistItems = items
    .map((item) => {
      const { scenes, duration } = item
      const sceneID = scenes.length === 1 ? scenes[0] : getRandomListItem(scenes)
      return { sceneID, scenes, duration }
    })

  if (shuffle && playlistItems.length > 1) {
    randomizeList(playlistItems)
  }

  return playlistItems
}

function createPlaylist(playlist: ImagePlayerDataPlaylist): PlaylistState {
  const playlistItems = createPlaylistItems(playlist)
  const timeToNextScene = playlistItems[0].duration
  return {
    playlistID: playlist.id,
    player: {
      index: 0,
      timeToNextScene
    },
    loader: {
      index: 0,
      timeToNextScene
    },
    items: playlistItems,
    repeat: calcRepeats(playlist)
  }
}

export interface ImagePlayerUpdate<T> {
  id: number
  value: T
}

export interface ImageViewState {
  show: boolean
  zIndex: number
  data: ContentData
  transform: TransformData
  view: ViewData
  effects: EffectsData
  sceneID: number
  displayIndex?: number
}

export interface PlaylistItem {
  sceneID: number
  scenes: number[]
  duration: number
}

export interface PlaylistItemState {
  index: number
  timeToNextScene: number
}

export interface PlaylistState {
  playlistID: number
  player: PlaylistItemState
  loader: PlaylistItemState
  items: PlaylistItem[]
  repeat: number
}

export interface ImageViewLoaderState {
  loadingCount: number
  iframeCount: number
  readyToLoad: number[]
  displayIndex: number
  zIndex: number
  shownIndex?: number
  imageViews: Array<ImageViewState | undefined>
}

export interface ImagePlayerState {
  playlist: PlaylistState
  firstImageLoaded: boolean
  mainLoaded: boolean
  loader: ImageViewLoaderState
  isEmpty: boolean
  hasStarted: boolean
  captcha?: ImagePlayerCaptcha
  currentAudio?: number
}

export interface ImagePlayerCaptcha {
  captcha: any
  source: any
  helpers: any
}

export const initialState: Record<number, ImagePlayerState> = {}
export const imagePlayerSlice = createSlice({
  name: 'imagePlayers',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setImagePlayerFirstImageLoaded: (
      state,
      action: PayloadAction<ImagePlayerUpdate<boolean>>
    ) => {
      state[action.payload.id].firstImageLoaded = action.payload.value
      if (action.payload.value === true) {
        state[action.payload.id].isEmpty = false
      }
    },
    setImagePlayerHasStarted: (state, action: PayloadAction<number[]>) => {
      action.payload.forEach((id) => (state[id].hasStarted = true))
    },
    setImagePlayerIsEmpty: (state, action: PayloadAction<ImagePlayerUpdate<boolean>>) => {
      state[action.payload.id].isEmpty = action.payload.value
    },
    setImagePlayerMainLoaded: (
      state,
      action: PayloadAction<ImagePlayerUpdate<boolean>>
    ) => {
      state[action.payload.id].mainLoaded = action.payload.value
    },
    setImagePlayersLoaded: (state, action: PayloadAction<number>) => {
      const sceneID = action.payload
      Object.keys(state)
        .map((key) => Number(key))
        .filter((id) => {
          const { playlist } = state[id]
          const { index } = playlist.loader
          return playlist.items[index].sceneID === sceneID
        })
        .forEach((id) => (state[id].mainLoaded = true))
    },
    setImagePlayerState: (
      state,
      action: PayloadAction<ImagePlayerUpdate<ImagePlayerState>>
    ) => {
      state[action.payload.id] = action.payload.value
    },
    setImagePlayerStates: (
      state,
      action: PayloadAction<ImagePlayerUpdate<ImagePlayerState>[]>
    ) => {
      action.payload.forEach((update) => (state[update.id] = update.value))
    },
    setImagePlayerCaptcha: (
      state,
      action: PayloadAction<ImagePlayerUpdate<ImagePlayerCaptcha | undefined>>
    ) => {
      const { id, value } = action.payload
      state[id].captcha = value
    },
    setImagePlayerStartLoading: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { id, value } = action.payload
      const { loader } = state[id]
      loader.loadingCount += value
      loader.readyToLoad.splice(0, value)
    },
    setImagePlayerLoadingComplete: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number[]>>
    ) => {
      const { id, value } = action.payload
      const { loader } = state[id]
      loader.loadingCount--
      loader.readyToLoad.push(...value)
    },
    setImagePlayerReadyToDisplay: (state, action: PayloadAction<number>) => {
      const id = action.payload
      const player = state[id]
      player.loader.loadingCount--
      if (!player.firstImageLoaded) {
        player.firstImageLoaded = true
      }
    },
    setImagePlayerShownImageView: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { id, value } = action.payload
      const { loader } = state[id]
      const oldShownIndex = loader.shownIndex
      const imageViews = loader.imageViews as ImageViewState[]
      if (oldShownIndex != null) {
        imageViews[oldShownIndex].show = false
      }

      imageViews[value].zIndex = loader.zIndex++
      imageViews[value].show = true
      loader.shownIndex = value
    },
    setImagePlayerPushReadyToLoad: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { id, value } = action.payload
      const { loader, playlist } = state[id]
      if (loader.imageViews[value]?.data.type === 'iframe') {
        loader.iframeCount--
      }
      if (playlist.repeat !== 0) {
        loader.readyToLoad.push(value)
      }
    },
    setImagePlayerSetImageView: (
      state,
      action: PayloadAction<
        ImagePlayerUpdate<{ index: number; view: ImageViewState }>
      >
    ) => {
      const { id, value } = action.payload
      const { loader } = state[id]
      loader.imageViews[value.index] = value.view
    },
    setImagePlayerIncrementDisplayIndex: (state, action: PayloadAction<number>) => {
      const id = action.payload
      const { loader } = state[id]
      loader.displayIndex++
    },
    setImagePlayerIncrementIFrameCount: (state, action: PayloadAction<number>) => {
      const id = action.payload
      const { loader } = state[id]
      loader.iframeCount++
    },
    setImagePlayerDecrementLoaderTimeToNextScene: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { id, value } = action.payload
      state[id].playlist.loader.timeToNextScene -= value
    },
    setImagePlayerLoaderPlaylist: (
      state,
      action: PayloadAction<ImagePlayerUpdate<PlaylistItemState>>
    ) => {
      const { id, value } = action.payload
      state[id].playlist.loader = value
    },
    setImagePlayerPlaylist: (
      state,
      action: PayloadAction<ImagePlayerUpdate<PlaylistState>>
    ) => {
      const { id, value } = action.payload
      state[id].playlist = value
    },
    setImagePlayerDecrementTimeToNextScene: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { id, value } = action.payload
      state[id].playlist.player.timeToNextScene -= value
    },
    setImagePlayersStarted: (state) => {
      Object.entries(state).forEach(([_key, value]) => value.hasStarted = true)
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(flipflipApi.endpoints.getImagePlayerData.matchFulfilled, (state, action) => {      
      const data = action.payload
      if(data == null) {
        return
      }

      state[data.displayViewId] = {
        playlist: createPlaylist(data.playlist),
        firstImageLoaded: false,
        mainLoaded: false,
        loader: {
          zIndex: 0,
          displayIndex: 0,
          loadingCount: 0,
          iframeCount: 0,
          readyToLoad: [
            ...Array(data.maxCanLoad).keys()
          ],
          imageViews: []
        },
        isEmpty: false,
        hasStarted: false
      }
    })
  }
})

export const {
  setImagePlayerFirstImageLoaded,
  setImagePlayerHasStarted,
  setImagePlayerIsEmpty,
  setImagePlayerMainLoaded,
  setImagePlayersLoaded,
  setImagePlayerState,
  setImagePlayerStates,
  setImagePlayerCaptcha,
  setImagePlayerStartLoading,
  setImagePlayerLoadingComplete,
  setImagePlayerShownImageView,
  setImagePlayerPushReadyToLoad,
  setImagePlayerSetImageView,
  setImagePlayerReadyToDisplay,
  setImagePlayerIncrementDisplayIndex,
  setImagePlayerIncrementIFrameCount,
  setImagePlayerDecrementLoaderTimeToNextScene,
  setImagePlayerLoaderPlaylist,
  setImagePlayerPlaylist,
  setImagePlayerDecrementTimeToNextScene,
  setImagePlayersStarted
} = imagePlayerSlice.actions

export default imagePlayerSlice.reducer

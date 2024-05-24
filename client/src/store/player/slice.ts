import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  ContentData,
  EffectsData,
  TransformData,
  ViewData
} from './ContentPreloadService'

export interface PlayerUpdate<T> {
  uuid: string
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
  onlyIframes: boolean
  readyToLoad: number[]
  displayIndex: number
  zIndex: number
  shownIndex?: number
  imageViews: Array<ImageViewState | undefined>
}

export interface PlayerState {
  playlist: PlaylistState
  firstImageLoaded: boolean
  mainLoaded: boolean
  loader: ImageViewLoaderState
  isEmpty: boolean
  hasStarted: boolean
  captcha?: PlayerCaptcha
  currentAudio?: number
}

export interface PlayerCaptcha {
  captcha: any
  source: any
  helpers: any
}

export type PlayersState = Record<string, PlayerState>

export const initialPlayersState: PlayersState = {}
export const playersSlice = createSlice({
  name: 'players',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialPlayersState,
  reducers: {
    setPlayersState: (state, action: PayloadAction<PlayersState>) => {
      return action.payload
    },
    setPlayerFirstImageLoaded: (
      state,
      action: PayloadAction<PlayerUpdate<boolean>>
    ) => {
      state[action.payload.uuid].firstImageLoaded = action.payload.value
      if (action.payload.value === true) {
        state[action.payload.uuid].isEmpty = false
      }
    },
    setPlayerHasStarted: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((uuid) => (state[uuid].hasStarted = true))
    },
    setPlayerIsEmpty: (state, action: PayloadAction<PlayerUpdate<boolean>>) => {
      state[action.payload.uuid].isEmpty = action.payload.value
    },
    setPlayerMainLoaded: (
      state,
      action: PayloadAction<PlayerUpdate<boolean>>
    ) => {
      state[action.payload.uuid].mainLoaded = action.payload.value
    },
    setPlayersLoaded: (state, action: PayloadAction<number>) => {
      const sceneID = action.payload
      Object.keys(state)
        .filter((uuid) => {
          const { playlist } = state[uuid]
          const { index } = playlist.loader
          return playlist.items[index].sceneID === sceneID
        })
        .forEach((uuid) => (state[uuid].mainLoaded = true))
    },
    setPlayerState: (
      state,
      action: PayloadAction<PlayerUpdate<PlayerState>>
    ) => {
      state[action.payload.uuid] = action.payload.value
    },
    setPlayerStates: (
      state,
      action: PayloadAction<PlayerUpdate<PlayerState>[]>
    ) => {
      action.payload.forEach((update) => (state[update.uuid] = update.value))
    },
    setPlayerCaptcha: (
      state,
      action: PayloadAction<PlayerUpdate<PlayerCaptcha | undefined>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].captcha = value
    },
    setPlayerStartLoading: (
      state,
      action: PayloadAction<PlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      const { loader } = state[uuid]
      loader.loadingCount += value
      loader.readyToLoad.splice(0, value)
    },
    setPlayerLoadingComplete: (
      state,
      action: PayloadAction<PlayerUpdate<number[]>>
    ) => {
      const { uuid, value } = action.payload
      const { loader } = state[uuid]
      loader.loadingCount--
      loader.readyToLoad.push(...value)
    },
    setPlayerReadyToDisplay: (state, action: PayloadAction<string>) => {
      const uuid = action.payload
      const player = state[uuid]
      player.loader.loadingCount--
      if (!player.firstImageLoaded) {
        player.firstImageLoaded = true
      }
    },
    setPlayerShownImageView: (
      state,
      action: PayloadAction<PlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      const { loader } = state[uuid]
      const oldShownIndex = loader.shownIndex
      const imageViews = loader.imageViews as ImageViewState[]
      if (oldShownIndex != null) {
        imageViews[oldShownIndex].show = false
      }

      imageViews[value].zIndex = loader.zIndex++
      imageViews[value].show = true
      loader.shownIndex = value
    },
    setPlayerPushReadyToLoad: (
      state,
      action: PayloadAction<PlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      const { loader, playlist } = state[uuid]
      if (loader.imageViews[value]?.data.type === 'iframe') {
        loader.iframeCount--
      }
      if (playlist.repeat !== 0) {
        loader.readyToLoad.push(value)
      }
    },
    setPlayerSetImageView: (
      state,
      action: PayloadAction<
        PlayerUpdate<{ index: number; view: ImageViewState }>
      >
    ) => {
      const { uuid, value } = action.payload
      const { loader } = state[uuid]
      loader.imageViews[value.index] = value.view
    },
    setPlayerIncrementDisplayIndex: (state, action: PayloadAction<string>) => {
      const uuid = action.payload
      const { loader } = state[uuid]
      loader.displayIndex++
    },
    setPlayerIncrementIFrameCount: (state, action: PayloadAction<string>) => {
      const uuid = action.payload
      const { loader } = state[uuid]
      loader.iframeCount++
    },
    setPlayerDecrementLoaderTimeToNextScene: (
      state,
      action: PayloadAction<PlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].playlist.loader.timeToNextScene -= value
    },
    setPlayerLoaderPlaylist: (
      state,
      action: PayloadAction<PlayerUpdate<PlaylistItemState>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].playlist.loader = value
    },
    setPlayerPlaylist: (
      state,
      action: PayloadAction<PlayerUpdate<PlaylistState>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].playlist = value
    },
    setPlayerDecrementTimeToNextScene: (
      state,
      action: PayloadAction<PlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].playlist.player.timeToNextScene -= value
    },
    setPlayerLoaderOnlyIframes: (
      state,
      action: PayloadAction<PlayerUpdate<boolean>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].loader.onlyIframes = value
    }
  }
})

export const {
  setPlayersState,
  setPlayerFirstImageLoaded,
  setPlayerHasStarted,
  setPlayerIsEmpty,
  setPlayerMainLoaded,
  setPlayersLoaded,
  setPlayerState,
  setPlayerStates,
  setPlayerCaptcha,
  setPlayerStartLoading,
  setPlayerLoadingComplete,
  setPlayerShownImageView,
  setPlayerPushReadyToLoad,
  setPlayerSetImageView,
  setPlayerReadyToDisplay,
  setPlayerIncrementDisplayIndex,
  setPlayerIncrementIFrameCount,
  setPlayerDecrementLoaderTimeToNextScene,
  setPlayerLoaderPlaylist,
  setPlayerPlaylist,
  setPlayerDecrementTimeToNextScene,
  setPlayerLoaderOnlyIframes
} = playersSlice.actions

export default playersSlice.reducer

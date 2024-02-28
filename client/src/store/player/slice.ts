import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  ContentData,
  EffectsData,
  TransformData,
  ViewData
} from './ContentPreloadService'

export interface PlayerUpdate<T> {
  uuid: string
  overlayIndex?: number
  value: T
}

export interface ImageViewState {
  show: boolean
  zIndex: number
  data: ContentData
  transform: TransformData
  view: ViewData
  effects: EffectsData
  displayIndex?: number
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

export interface PlayerOverlayState {
  id: number
  show: boolean
  opacity: number
  sceneID: number
  isGrid: boolean
  grid: string[][]
  loaded: boolean
  loader: ImageViewLoaderState
  captcha?: PlayerCaptcha
}

export interface PlayerState {
  sceneID: number
  nextSceneID: number
  overlays: PlayerOverlayState[]
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
    setPlayerSceneID: (state, action: PayloadAction<string>) => {
      state[action.payload].sceneID = state[action.payload].nextSceneID
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
    setPlayerHasStarted: (
      state,
      action: PayloadAction<PlayerUpdate<boolean>>
    ) => {
      state[action.payload.uuid].hasStarted = action.payload.value
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
      Object.keys(state).forEach((uuid) => {
        const player = state[uuid]
        if (player.sceneID === sceneID) {
          player.mainLoaded = true
        }

        player.overlays
          .filter((s) => s.sceneID === sceneID)
          .forEach((s) => (s.loaded = true))
      })
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
      const { uuid, overlayIndex, value } = action.payload
      const player =
        overlayIndex != null ? state[uuid].overlays[overlayIndex] : state[uuid]
      player.captcha = value
    },
    setPlayerStartLoading: (
      state,
      action: PayloadAction<PlayerUpdate<number>>
    ) => {
      const { uuid, value, overlayIndex } = action.payload
      const loader =
        overlayIndex != null
          ? state[uuid].overlays[overlayIndex].loader
          : state[uuid].loader
      loader.loadingCount += value
      loader.readyToLoad.splice(0, value)
    },
    setPlayerLoadingComplete: (
      state,
      action: PayloadAction<PlayerUpdate<number>>
    ) => {
      const { uuid, value, overlayIndex } = action.payload
      const loader =
        overlayIndex != null
          ? state[uuid].overlays[overlayIndex].loader
          : state[uuid].loader
      loader.loadingCount--
      loader.readyToLoad.push(value)
    },
    setPlayerShownImageView: (
      state,
      action: PayloadAction<PlayerUpdate<number>>
    ) => {
      const { uuid, value, overlayIndex } = action.payload
      const loader =
        overlayIndex != null
          ? state[uuid].overlays[overlayIndex].loader
          : state[uuid].loader
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
      action: PayloadAction<PlayerUpdate<number[]>>
    ) => {
      const { uuid, value, overlayIndex } = action.payload
      const loader =
        overlayIndex != null
          ? state[uuid].overlays[overlayIndex].loader
          : state[uuid].loader

      loader.iframeCount -= value.filter(
        (index) => loader.imageViews[index]?.data.type === 'iframe'
      ).length
      loader.readyToLoad.push(...value)
    },
    setPlayerSetImageView: (
      state,
      action: PayloadAction<
        PlayerUpdate<{ index: number; view: ImageViewState }>
      >
    ) => {
      const { uuid, value, overlayIndex } = action.payload
      const loader =
        overlayIndex != null
          ? state[uuid].overlays[overlayIndex].loader
          : state[uuid].loader

      loader.imageViews[value.index] = value.view
    },
    setPlayerReadyToDisplay: (
      state,
      action: PayloadAction<PlayerUpdate<undefined>>
    ) => {
      const { uuid, overlayIndex } = action.payload
      const player = state[uuid]
      const isPlayer = overlayIndex == null
      const loader = isPlayer
        ? player.loader
        : player.overlays[overlayIndex].loader

      loader.loadingCount--
      if (isPlayer && !player.firstImageLoaded) {
        player.firstImageLoaded = true
      }
    },
    setPlayerIncrementDisplayIndex: (
      state,
      action: PayloadAction<PlayerUpdate<undefined>>
    ) => {
      const { uuid, overlayIndex } = action.payload
      const player = state[uuid]
      const isPlayer = overlayIndex == null
      const loader = isPlayer
        ? player.loader
        : player.overlays[overlayIndex].loader

      loader.displayIndex++
    },
    setPlayerIncrementIFrameCount: (
      state,
      action: PayloadAction<PlayerUpdate<undefined>>
    ) => {
      const { uuid, overlayIndex } = action.payload
      const player = state[uuid]
      const isPlayer = overlayIndex == null
      const loader = isPlayer
        ? player.loader
        : player.overlays[overlayIndex].loader

      loader.iframeCount++
    }
  }
})

export const {
  setPlayersState,
  setPlayerSceneID,
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
  setPlayerIncrementIFrameCount
} = playersSlice.actions

export default playersSlice.reducer

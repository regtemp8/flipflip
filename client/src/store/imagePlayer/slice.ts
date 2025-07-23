import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { flipflipApi } from '../api/slice'
import { ImageViewData } from 'flipflip-common'

export interface ImagePlayerUpdate<T> {
  uuid: string
  value: T
}

export interface ImageViewState extends ImageViewData {
  show: boolean
  zIndex: number
  displayIndex?: number
}

export interface ImageViewLoaderState {
  loadingCount: number
  iframeCount: number
  maxCanLoadAtOnce: number
  readyToLoad: number[]
  displayIndex: number
  zIndex: number
  shownIndex?: number
  imageViews: Array<ImageViewState | undefined>
}

export interface ImagePlayerState {
  firstImageLoaded: boolean
  mainLoaded: boolean
  loader: ImageViewLoaderState
  isEmpty: boolean
  hasStarted: boolean
  captcha?: ImagePlayerCaptcha
  currentAudio?: number
  currentSceneID: number
  isLoading: boolean
}

export interface ImagePlayerCaptcha {
  captcha: any
  source: any
  helpers: any
}

export const initialState: Record<string, ImagePlayerState> = {}
export const imagePlayerSlice = createSlice({
  name: 'imagePlayers',
  initialState,
  reducers: {
    setImagePlayerFirstImageLoaded: (
      state,
      action: PayloadAction<ImagePlayerUpdate<boolean>>
    ) => {
      state[action.payload.uuid].firstImageLoaded = action.payload.value
      if (action.payload.value === true) {
        state[action.payload.uuid].isEmpty = false
      }
    },
    setImagePlayerHasStarted: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((uuid) => (state[uuid].hasStarted = true))
    },
    setImagePlayerIsEmpty: (
      state,
      action: PayloadAction<ImagePlayerUpdate<boolean>>
    ) => {
      state[action.payload.uuid].isEmpty = action.payload.value
    },
    setImagePlayerMainLoaded: (
      state,
      action: PayloadAction<ImagePlayerUpdate<boolean>>
    ) => {
      state[action.payload.uuid].mainLoaded = action.payload.value
    },
    setImagePlayersLoaded: (state) => {
      Object.keys(state).forEach((uuid) => (state[uuid].mainLoaded = true))
    },
    setImagePlayerState: (
      state,
      action: PayloadAction<ImagePlayerUpdate<ImagePlayerState>>
    ) => {
      state[action.payload.uuid] = action.payload.value
    },
    setImagePlayerStates: (
      state,
      action: PayloadAction<ImagePlayerUpdate<ImagePlayerState>[]>
    ) => {
      action.payload.forEach((update) => (state[update.uuid] = update.value))
    },
    setImagePlayerCaptcha: (
      state,
      action: PayloadAction<ImagePlayerUpdate<ImagePlayerCaptcha | undefined>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].captcha = value
    },
    setImagePlayerStartLoading: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      const { loader } = state[uuid]
      loader.loadingCount += value
      loader.readyToLoad.splice(0, value)
    },
    setImagePlayerLoadingComplete: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number[]>>
    ) => {
      const { uuid, value } = action.payload
      const { loader } = state[uuid]
      loader.loadingCount -= value.length
      loader.readyToLoad.push(...value)
    },
    setImagePlayerReadyToDisplay: (state, action: PayloadAction<string>) => {
      const uuid = action.payload
      const player = state[uuid]
      player.loader.loadingCount--
      if (!player.firstImageLoaded) {
        player.firstImageLoaded = true
      }
    },
    setImagePlayerShownImageView: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
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
    setImagePlayerPushReadyToLoad: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      const { loader } = state[uuid]
      loader.readyToLoad.push(value)
      if (loader.imageViews[value]?.data.type === 'iframe') {
        loader.iframeCount--
      }
    },
    setImagePlayerSetImageView: (
      state,
      action: PayloadAction<
        ImagePlayerUpdate<{ index: number; view: ImageViewState }>
      >
    ) => {
      const { uuid, value } = action.payload
      const { loader } = state[uuid]
      loader.imageViews[value.index] = value.view
    },
    setImagePlayerIncrementDisplayIndex: (
      state,
      action: PayloadAction<string>
    ) => {
      const uuid = action.payload
      const { loader } = state[uuid]
      loader.displayIndex++
    },
    setImagePlayerIncrementIFrameCount: (
      state,
      action: PayloadAction<string>
    ) => {
      const uuid = action.payload
      const { loader } = state[uuid]
      loader.iframeCount++
    },
    setImagePlayerIFrameCount: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].loader.iframeCount = value
    },
    setImagePlayerDecrementLoaderTimeToNextScene: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      // TODO still needed?
    },
    setImagePlayerLoaderPlaylist: (
      state,
      action: PayloadAction<ImagePlayerUpdate<any>>
    ) => {
      // TODO still needed?
    },
    setImagePlayerPlaylist: (
      state,
      action: PayloadAction<ImagePlayerUpdate<any>>
    ) => {
      // TODO still needed?
    },
    setImagePlayerDecrementTimeToNextScene: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      // TODO still needed?
    },
    setImagePlayersStarted: (state) => {
      Object.values(state).forEach((value) => (value.hasStarted = true))
    },
    setImagePlayerIsLoading: (
      state,
      action: PayloadAction<ImagePlayerUpdate<boolean>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].isLoading = value
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        flipflipApi.endpoints.getViewPlayerConfig.matchFulfilled,
        (state, action) => {
          const data = action.payload
          if (data == null) {
            return
          }

          const viewPlayerID = action.meta.arg.originalArgs
          state[viewPlayerID] = {
            firstImageLoaded: false,
            mainLoaded: false,
            isLoading: false,
            currentSceneID: data.sceneId,
            loader: {
              zIndex: 0,
              displayIndex: 0,
              loadingCount: 0,
              iframeCount: 0,
              maxCanLoadAtOnce: data.maxCanLoadAtOnce,
              readyToLoad: [...Array(data.maxCanLoad).keys()],
              imageViews: []
            },
            isEmpty: false,
            hasStarted: false
          }
        }
      )
      .addMatcher(
        flipflipApi.endpoints.playScene.matchPending,
        () => initialState
      )
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
  setImagePlayerIFrameCount,
  setImagePlayerDecrementLoaderTimeToNextScene,
  setImagePlayerLoaderPlaylist,
  setImagePlayerPlaylist,
  setImagePlayerDecrementTimeToNextScene,
  setImagePlayersStarted,
  setImagePlayerIsLoading
} = imagePlayerSlice.actions

export default imagePlayerSlice.reducer

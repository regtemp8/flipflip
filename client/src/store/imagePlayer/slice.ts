import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { flipflipApi } from '../api/slice'
import { ImageViewData } from 'flipflip-common'
import { DisplayItem } from '../../components/player/ImagePlayer'
import imageTimers from './ImageTimerService'

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
  isPlaying: boolean
  advanceTimeout?: number
  readyToDisplay: Record<number, DisplayItem[]>
  displayOffset: number
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
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      const { loader } = state[uuid]
      loader.loadingCount--
      loader.readyToLoad.push(value)
    },
    setImagePlayerReadyToDisplay: (
      state,
      action: PayloadAction<
        ImagePlayerUpdate<{ item: DisplayItem; displayIndex?: number }>
      >
    ) => {
      const { uuid, value } = action.payload
      const player = state[uuid]
      player.loader.loadingCount--
      if (!player.firstImageLoaded) {
        player.firstImageLoaded = true
      }

      const item = value.item
      if (player.readyToDisplay[item.sceneID] == null) {
        player.readyToDisplay[item.sceneID] = []
      }

      if (value.displayIndex == null) {
        player.readyToDisplay[item.sceneID].push(item)
      } else if (value.displayIndex >= player.displayOffset) {
        player.readyToDisplay[item.sceneID][
          value.displayIndex - player.displayOffset
        ] = item
      }
    },
    setImagePlayerShownImageView: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      const { loader, readyToDisplay, currentSceneID } = state[uuid]
      const oldShownIndex = loader.shownIndex
      const imageViews = loader.imageViews as ImageViewState[]
      if (oldShownIndex != null) {
        imageViews[oldShownIndex].show = false
      }

      const item = readyToDisplay[currentSceneID][value]
      imageViews[item.index].zIndex = loader.zIndex++
      imageViews[item.index].show = true
      loader.shownIndex = item.index
      const count = value + 1
      state[uuid].displayOffset += count
      readyToDisplay[currentSceneID] =
        readyToDisplay[currentSceneID].slice(count)
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
      // TODO implement strict order playback
      const uuid = action.payload
      const { loader } = state[uuid]
      loader.displayIndex++
    },
    setImagePlayerIFrameCount: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].loader.iframeCount = value
    },
    setImagePlayersPlaying: (
      state,
      action: PayloadAction<Record<string, number>>
    ) => {
      Object.keys(action.payload).forEach((key) => {
        state[key].advanceTimeout = action.payload[key]
        state[key].hasStarted = true
        state[key].isPlaying = true
      })
    },
    setImagePlayersPaused: (state) => {
      Object.values(state).forEach((value) => {
        if (value.hasStarted) {
          value.isPlaying = false
          value.advanceTimeout = undefined
        }
      })
    },
    setImagePlayerIsLoading: (
      state,
      action: PayloadAction<ImagePlayerUpdate<boolean>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].isLoading = value
    },
    setImagePlayerCurrentSceneID: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      const { loader, readyToDisplay, currentSceneID } = state[uuid]
      const indexes = readyToDisplay[currentSceneID].map((item) => item.index)

      loader.loadingCount -= indexes.length
      loader.readyToLoad.push(...indexes)

      state[uuid].readyToDisplay[currentSceneID] = []
      state[uuid].currentSceneID = value
    },
    setImagePlayerAdvanceTimeout: (
      state,
      action: PayloadAction<ImagePlayerUpdate<number>>
    ) => {
      const { uuid, value } = action.payload
      state[uuid].advanceTimeout = value
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        flipflipApi.endpoints.getViewPlayerConfig.matchFulfilled,
        (state, action) => {
          const data = action.payload
          if (data == null || data.view.sync) {
            return
          }

          const readyToDisplay: Record<number, DisplayItem[]> = {}
          readyToDisplay[data.sceneId] = []

          const viewPlayerID = action.meta.arg.originalArgs
          imageTimers().start(viewPlayerID)
          state[viewPlayerID] = {
            firstImageLoaded: false,
            mainLoaded: false,
            isLoading: false,
            isPlaying: false,
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
            hasStarted: false,
            readyToDisplay,
            displayOffset: 0
          }
        }
      )
      .addMatcher(
        flipflipApi.endpoints.playScene.matchPending,
        () => initialState
      )
      .addMatcher(
        flipflipApi.endpoints.playPlaylist.matchPending,
        () => initialState
      )
      .addMatcher(
        flipflipApi.endpoints.playDisplay.matchPending,
        () => initialState
      )
      .addMatcher(flipflipApi.endpoints.stopPlayer.matchPending, (state) => {
        Object.entries(state).forEach(([uuid, value]) => {
          value.isLoading = true // stop loadImageViews loop
          if (value.advanceTimeout != null) {
            window.cancelAnimationFrame(value.advanceTimeout)
            value.advanceTimeout = undefined
          }

          imageTimers().stop(uuid)
        })
      })
  }
})

export const {
  setImagePlayerStartLoading,
  setImagePlayerLoadingComplete,
  setImagePlayerShownImageView,
  setImagePlayerPushReadyToLoad,
  setImagePlayerSetImageView,
  setImagePlayerReadyToDisplay,
  setImagePlayerIncrementDisplayIndex,
  setImagePlayerIFrameCount,
  setImagePlayersPlaying,
  setImagePlayersPaused,
  setImagePlayerIsLoading,
  setImagePlayerCurrentSceneID,
  setImagePlayerAdvanceTimeout
} = imagePlayerSlice.actions

export default imagePlayerSlice.reducer

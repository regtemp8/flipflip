import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface PlayerUpdate<T> {
  uuid: string
  value: T
}

export interface PlayerOverlayState {
  id: number
  opacity: number
  sceneID: number
  isGrid: boolean
  grid: string[][]
  loaded: boolean
  captcha?: PlayerCaptcha
}

export interface PlayerState {
  sceneID?: number
  nextSceneID: number
  overlays: PlayerOverlayState[]
  firstImageLoaded: boolean
  mainLoaded: boolean
  isEmpty: boolean
  hasStarted: boolean
  captcha?: PlayerCaptcha
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
      Object.assign(state, action.payload)
    },
    setPlayerSceneID: (state, action: PayloadAction<string>) => {
      state[action.payload].sceneID = state[action.payload].nextSceneID
    },
    setPlayerFirstImageLoaded: (state, action: PayloadAction<PlayerUpdate<boolean>>) => {
      state[action.payload.uuid].firstImageLoaded = action.payload.value
      if(action.payload.value === true) {
        state[action.payload.uuid].isEmpty = false
      }
    },
    setPlayerHasStarted: (state, action: PayloadAction<PlayerUpdate<boolean>>) => {
      state[action.payload.uuid].hasStarted = action.payload.value
    },
    setPlayerIsEmpty: (state, action: PayloadAction<PlayerUpdate<boolean>>) => {
      state[action.payload.uuid].isEmpty = action.payload.value
    },
    setPlayerMainLoaded: (state, action: PayloadAction<PlayerUpdate<boolean>>) => {
      state[action.payload.uuid].mainLoaded = action.payload.value
    },
    setPlayersLoaded: (state, action: PayloadAction<number>) => {
      const sceneID = action.payload
      Object.keys(state).forEach((uuid) => {
        const player = state[uuid]
        if(player.sceneID === sceneID) {
          player.mainLoaded = true
        }

        player.overlays
          .filter((s) => s.sceneID === sceneID)
          .forEach((s) => s.loaded = true)
      })
    },
    setPlayerState: (state, action: PayloadAction<PlayerUpdate<PlayerState>>) => {
      state[action.payload.uuid] = action.payload.value
    },
    setPlayerStates: (state, action: PayloadAction<PlayerUpdate<PlayerState>[]>) => {
      action.payload.forEach((update) => state[update.uuid] = update.value)
    },
    setPlayerCaptcha: (state, action: PayloadAction<PlayerUpdate<{captcha: PlayerCaptcha, overlayIndex?: number }>>) => {
      const {uuid, value} = action.payload
      const {captcha, overlayIndex} = value
      const player = state[uuid]
      if(overlayIndex != null) {
        player.overlays[overlayIndex].captcha = captcha 
      } else {
        player.captcha = captcha
      }      
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
  setPlayerCaptcha
} = playersSlice.actions

export default playersSlice.reducer

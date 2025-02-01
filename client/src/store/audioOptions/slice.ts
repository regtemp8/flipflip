import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { Audio } from 'flipflip-common'

interface AudioOptionsState {
  editing?: Audio
}

export const initialState: AudioOptionsState = {}
export const audioOptionsSlice = createSlice({
  name: 'audioOptions',
  initialState,
  reducers: {
    setAudioOptionsEditing: (state, action: PayloadAction<Audio|undefined>) => {
      state.editing = action.payload
    },
    setAudioOptionsUrl: (state, action: PayloadAction<string>) => {
      if(state.editing != null) {
        state.editing.url = action.payload
      }
    },
    setAudioOptionsVolume: (state, action: PayloadAction<number>) => {
      if(state.editing != null) {
        state.editing.volume = action.payload
      }
    },
    setAudioOptionsStopAtEnd: (state, action: PayloadAction<boolean>) => {
      if(state.editing != null) {
        state.editing.stopAtEnd = action.payload
      }
    },
    setAudioOptionsNextSceneAtEnd: (state, action: PayloadAction<boolean>) => {
      if(state.editing != null) {
        state.editing.nextSceneAtEnd = action.payload
      }
    },
    setAudioOptionsTick: (state, action: PayloadAction<boolean>) => {
      if(state.editing != null) {
        state.editing.tick = action.payload
      }
    },
    setAudioOptionsBPM: (state, action: PayloadAction<number>) => {
      if(state.editing != null) {
        state.editing.bpm = action.payload
      }
    },
    setAudioOptionsSpeed: (state, action: PayloadAction<number>) => {
      if(state.editing != null) {
        state.editing.speed = action.payload
      }
    },
    setAudioOptionsTickTF: (state, action: PayloadAction<string>) => {
      if(state.editing != null) {
        state.editing.tickMode = action.payload
      }
    },
    setAudioOptionsTickDuration: (state, action: PayloadAction<number>) => {
      if(state.editing != null) {
        state.editing.tickDelay = action.payload
      }
    },
    setAudioOptionsTickDurationMin: (state, action: PayloadAction<number>) => {
      if(state.editing != null) {
        state.editing.tickMinDelay = action.payload
      }
    },
    setAudioOptionsTickDurationMax: (state, action: PayloadAction<number>) => {
      if(state.editing != null) {
        state.editing.tickMaxDelay = action.payload
      }
    },
    setAudioOptionsTickSinRate: (state, action: PayloadAction<number>) => {
      if(state.editing != null) {
        state.editing.tickSinRate = action.payload
      }
    },
    setAudioOptionsTickBPMMulti: (state, action: PayloadAction<number>) => {
      if(state.editing != null) {
        state.editing.tickBPMMulti = action.payload
      }
    }
  }
})

export const { 
  setAudioOptionsEditing, 
  setAudioOptionsUrl, 
  setAudioOptionsVolume,
  setAudioOptionsStopAtEnd,
  setAudioOptionsNextSceneAtEnd,
  setAudioOptionsTick,
  setAudioOptionsBPM,
  setAudioOptionsSpeed,
  setAudioOptionsTickTF,
  setAudioOptionsTickDuration,
  setAudioOptionsTickDurationMin,
  setAudioOptionsTickDurationMax,
  setAudioOptionsTickSinRate,
  setAudioOptionsTickBPMMulti
} = audioOptionsSlice.actions
export default audioOptionsSlice.reducer

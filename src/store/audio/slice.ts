import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type Audio from './Audio'
import { getAudio } from './selectors'
import {
  type EntryState,
  type EntryUpdate,
  setEntrySlice,
  setEntry,
  updateEntry
} from '../EntryState'

export const initialAudioState: EntryState<Audio> = {
  name: 'audioSlice',
  nextID: 1,
  entries: {}
}
export const audioSlice = createSlice({
  name: 'audios',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialAudioState,
  reducers: {
    setAudioSlice: (state, action: PayloadAction<EntryState<Audio>>) => {
      setEntrySlice(state, action.payload)
    },
    setAudio: (state, action: PayloadAction<Audio>) => {
      setEntry(state, action.payload)
    },
    updateAudio: (state, action: PayloadAction<Audio>) => {
      const id = action.payload.id
      Object.assign(state.entries[id], action.payload)
    },
    setAudioTickTF: (state, action: PayloadAction<EntryUpdate<string>>) => {
      getAudio(state, action.payload.id).tickTF = action.payload.value
    },
    setAudioTickDuration: (
      state,
      action: PayloadAction<EntryUpdate<number>>
    ) => {
      getAudio(state, action.payload.id).tickDelay = action.payload.value
    },
    setAudioTickDurationMin: (
      state,
      action: PayloadAction<EntryUpdate<number>>
    ) => {
      getAudio(state, action.payload.id).tickMinDelay = action.payload.value
    },
    setAudioTickDurationMax: (
      state,
      action: PayloadAction<EntryUpdate<number>>
    ) => {
      getAudio(state, action.payload.id).tickMaxDelay = action.payload.value
    },
    setAudioTickSinRate: (
      state,
      action: PayloadAction<EntryUpdate<number>>
    ) => {
      getAudio(state, action.payload.id).tickSinRate = action.payload.value
    },
    setAudioTickBPMMulti: (
      state,
      action: PayloadAction<EntryUpdate<number>>
    ) => {
      getAudio(state, action.payload.id).tickBPMMulti = action.payload.value
    },
    setAudioStopAtEnd: (state, action: PayloadAction<EntryUpdate<boolean>>) => {
      getAudio(state, action.payload.id).stopAtEnd = action.payload.value
    },
    setAudioNextSceneAtEnd: (
      state,
      action: PayloadAction<EntryUpdate<boolean>>
    ) => {
      getAudio(state, action.payload.id).nextSceneAtEnd = action.payload.value
    },
    setAudioTick: (state, action: PayloadAction<EntryUpdate<boolean>>) => {
      getAudio(state, action.payload.id).tick = action.payload.value
    },
    setAudioSpeed: (state, action: PayloadAction<EntryUpdate<number>>) => {
      getAudio(state, action.payload.id).speed = action.payload.value
    },
    setAudioVolume: (state, action: PayloadAction<EntryUpdate<number>>) => {
      getAudio(state, action.payload.id).volume = action.payload.value
    },
    setAudioUrl: (state, action: PayloadAction<EntryUpdate<string>>) => {
      getAudio(state, action.payload.id).url = action.payload.value
    },
    setAudioTags: (state, action: PayloadAction<EntryUpdate<number[]>>) => {
      getAudio(state, action.payload.id).tags = action.payload.value
    },
    setAudioBPM: (state, action: PayloadAction<EntryUpdate<number>>) => {
      getAudio(state, action.payload.id).bpm = action.payload.value
    },
    setAudioToggleTag: (state, action: PayloadAction<EntryUpdate<number>>) => {
      const audio = getAudio(state, action.payload.id)
      const index = audio.tags.indexOf(action.payload.value)
      if (index === -1) {
        audio.tags.push(action.payload.value)
      } else {
        audio.tags.splice(index, 1)
      }
    },
    setAudioMarked: (state, action: PayloadAction<EntryUpdate<boolean>>) => {
      getAudio(state, action.payload.id).marked = action.payload.value
    },
    playTrack: (state, action: PayloadAction<number>) => {
      state.entries[action.payload].playedCount++
    }
  }
})

export const {
  setAudioSlice,
  setAudio,
  updateAudio,
  setAudioTickTF,
  setAudioTickDuration,
  setAudioTickDurationMin,
  setAudioTickDurationMax,
  setAudioTickSinRate,
  setAudioTickBPMMulti,
  setAudioStopAtEnd,
  setAudioNextSceneAtEnd,
  setAudioTick,
  setAudioSpeed,
  setAudioVolume,
  setAudioUrl,
  setAudioTags,
  setAudioBPM,
  setAudioToggleTag,
  setAudioMarked,
  playTrack
} = audioSlice.actions

export default audioSlice.reducer

import { type RootState } from '../store'
import { type EntryState } from '../EntryState'
import type Audio from './Audio'

export const getAudioEntries = (state: RootState) => state.audio.entries

export const getAudio = (state: EntryState<Audio>, id: number): Audio => {
  return state.entries[id]
}

export const selectAudio = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id)
}

export const selectAudioHasBPM = (id: number) => {
  return (state: RootState) => !!getAudio(state.audio, id).bpm
}

export const selectAudioTickTF = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tickMode
}

export const selectAudioTickDuration = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tickDelay
}

export const selectAudioTickDurationMin = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tickMinDelay
}

export const selectAudioTickDurationMax = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tickMaxDelay
}

export const selectAudioTickSinRate = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tickSinRate
}

export const selectAudioTickBPMMulti = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tickBPMMulti
}

export const selectAudioStopAtEnd = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).stopAtEnd
}

export const selectAudioNextSceneAtEnd = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).nextSceneAtEnd
}

export const selectAudioTick = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tick
}

export const selectAudioSpeed = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).speed
}

export const selectAudioVolume = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).volume
}

export const selectAudioTrackNum = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).trackNum
}

export const selectAudioComment = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).comment
}

export const selectAudioTags = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tags
}

export const selectAudioThumb = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).thumb
}

export const selectAudioArtist = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).artist
}

export const selectAudioAlbum = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).album
}

export const selectAudioName = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).name
}

export const selectAudioUrl = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).url
}

export const selectAudioDuration = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).duration
}

export const selectAudioBPM = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).bpm
}

export const selectAudioMarked = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).marked
}

export const selectAudioPlayedCount = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).playedCount
}

export const selectAudioTickMode = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tickMode
}

export const selectAudioTickDelay = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tickDelay
}

export const selectAudioTickMaxDelay = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tickMaxDelay
}

export const selectAudioTickMinDelay = (id: number) => {
  return (state: RootState) => getAudio(state.audio, id).tickMinDelay
}

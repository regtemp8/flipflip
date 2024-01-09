import * as slice from './slice'

export const setAudioTickTF = (id: number) => (value: string) =>
  slice.setAudioTickTF({ id, value })
export const setAudioTickDuration = (id: number) => (value: number) =>
  slice.setAudioTickDuration({ id, value })
export const setAudioTickDurationMin = (id: number) => (value: number) =>
  slice.setAudioTickDurationMin({ id, value })
export const setAudioTickDurationMax = (id: number) => (value: number) =>
  slice.setAudioTickDurationMax({ id, value })
export const setAudioTickSinRate = (id: number) => (value: number) =>
  slice.setAudioTickSinRate({ id, value })
export const setAudioTickBPMMulti = (id: number) => (value: number) =>
  slice.setAudioTickBPMMulti({ id, value })
export const setAudioStopAtEnd = (id: number) => (value: boolean) =>
  slice.setAudioStopAtEnd({ id, value })
export const setAudioNextSceneAtEnd = (id: number) => (value: boolean) =>
  slice.setAudioNextSceneAtEnd({ id, value })
export const setAudioTick = (id: number) => (value: boolean) =>
  slice.setAudioTick({ id, value })
export const setAudioSpeed = (id: number) => (value: number) =>
  slice.setAudioSpeed({ id, value })
export const setAudioVolume = (id: number) => (value: number) =>
  slice.setAudioVolume({ id, value })
export const setAudioUrl = (id: number) => (value: string) =>
  slice.setAudioUrl({ id, value })
export const setAudioBPM = (id: number) => (value: number) =>
  slice.setAudioBPM({ id, value })

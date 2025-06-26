import { createSelector } from '@reduxjs/toolkit'
import { type RootState } from '../store'

export const selectAudioOptions = () => {
  return (state: RootState) => state.audioOptions.editing
}

export const selectAudioOptionsUrl = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.url ?? ''],
    (url) => ({ data: url })
  )

export const selectAudioOptionsStopAtEnd = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.stopAtEnd ?? false],
    (stopAtEnd) => ({ data: stopAtEnd })
  )

export const selectAudioOptionsNextSceneAtEnd = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.nextSceneAtEnd ?? false],
    (nextSceneAtEnd) => ({ data: nextSceneAtEnd })
  )

export const selectAudioOptionsTick = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.tick ?? false],
    (tick) => ({ data: tick })
  )

export const selectAudioOptionsBPM = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.bpm ?? 0],
    (bpm) => ({ data: bpm })
  )

export const selectAudioOptionsSpeed = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.speed ?? 10],
    (speed) => ({ data: speed })
  )

export const selectAudioOptionsHasBPM = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.bpm != null],
    (hasBPM) => ({ data: hasBPM })
  )

export const selectAudioOptionsTickTF = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.tickMode ?? ''],
    (tickMode) => ({ data: tickMode })
  )

export const selectAudioOptionsTickDuration = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.tickDelay ?? 0],
    (tickDelay) => ({ data: tickDelay })
  )

export const selectAudioOptionsTickDurationMin = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.tickMinDelay ?? 0],
    (tickMinDelay) => ({ data: tickMinDelay })
  )

export const selectAudioOptionsTickDurationMax = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.tickMaxDelay ?? 0],
    (tickMaxDelay) => ({ data: tickMaxDelay })
  )

export const selectAudioOptionsTickSinRate = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.tickSinRate ?? 0],
    (tickSinRate) => ({ data: tickSinRate })
  )

export const selectAudioOptionsTickBPMMulti = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.tickBPMMulti ?? 0],
    (tickBPMMulti) => ({ data: tickBPMMulti })
  )

export const selectAudioOptionsVolume = () =>
  createSelector(
    [(state: RootState) => state.audioOptions.editing?.volume ?? 0],
    (volume) => ({ data: volume })
  )

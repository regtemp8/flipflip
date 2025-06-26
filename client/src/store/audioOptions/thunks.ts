import { Audio } from 'flipflip-common'
import { flipflipApi } from '../api/slice'
import { AppDispatch, RootState } from '../store'
import { setAudioOptionsEditing } from './slice'
import { updateAudio } from '../api/thunks'

export function editAudioOptions(audioID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const { data } = flipflipApi.endpoints.getAudio.select(audioID)(state)
    dispatch(setAudioOptionsEditing(data))
  }
}

export function saveAudioOptions() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const newAudio = state.audioOptions.editing as Audio
    const { data } = flipflipApi.endpoints.getAudio.select(newAudio.id)(state)
    const oldAudio = data as Audio
    const update: Pick<Audio, 'id'> & Partial<Audio> = { id: newAudio.id }

    const keys = [
      'url',
      'volume',
      'stopAtEnd',
      'nextSceneAtEnd',
      'tick',
      'bpm',
      'speed',
      'tickMode',
      'tickDelay',
      'tickMinDelay',
      'tickMaxDelay',
      'tickSinRate',
      'tickBPMMulti'
    ]
    let dispatchUpdate = false
    keys.forEach((key) => {
      if (
        !(!newAudio[key] && !oldAudio[key]) &&
        newAudio[key] !== oldAudio[key]
      ) {
        update[key] = newAudio[key]
        dispatchUpdate = true
      }
    })

    if (dispatchUpdate) {
      dispatch(updateAudio(update))
    }
    dispatch(setAudioOptionsEditing(undefined))
  }
}

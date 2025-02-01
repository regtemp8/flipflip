import { Audio } from 'flipflip-common'
import { flipflipApi } from '../api/slice'
import { AppDispatch, RootState } from '../store'
import { setAudioEditEditing } from './slice'
import { updateAudio } from '../api/thunks'

export function editAudioEdit(audioIDs: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const audios = audioIDs.map((id) => flipflipApi.endpoints.getAudio.select(id)(state).data).filter((audio) => audio != null)
    dispatch(setAudioEditEditing(audios))
  }
}

export function saveAudioEdit() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const newAudio = state.audioEdit.editing as Audio
    const keys = ["thumb", "name", "artist", "album", "comment", "trackNum"];
    const ids = state.audioEdit.ids as number[]
    for(const id of ids) {
      const {data} = flipflipApi.endpoints.getAudio.select(id)(state)
      const oldAudio = data as Audio
      const update: Pick<Audio, 'id'> & Partial<Audio> = {id}
      let dispatchUpdate = false
      keys.forEach((key) => {
        if(!(!newAudio[key] && !oldAudio[key]) && newAudio[key] !== oldAudio[key]) {
          update[key] = newAudio[key]
          dispatchUpdate = true
        }
      })
  
      if(dispatchUpdate) {
        dispatch(updateAudio(update))
      }
    }

    dispatch(setAudioEditEditing(undefined))
  }
}
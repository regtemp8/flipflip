import { type AppDispatch, type RootState } from '../store'
import { setAudioTags } from '../audio/slice'
import { setCaptionScriptTags } from '../captionScript/slice'

export function orderAudioTags(audioID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    // Re-order the tags of the audio we were playing
    const tags = state.audio.entries[audioID].tags.sort((aID, bID) => {
      const aIndex = state.app.tags.indexOf(aID)
      const bIndex = state.app.tags.indexOf(bID)
      if (aIndex < bIndex) {
        return -1
      } else if (aIndex > bIndex) {
        return 1
      } else {
        return 0
      }
    })

    dispatch(setAudioTags({ id: audioID, value: tags }))
  }
}

export function orderScriptTags(scriptID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    // Re-order the tags of the script we were playing
    const tags = state.captionScript.entries[scriptID].tags.sort((aID, bID) => {
      const aIndex = state.app.tags.indexOf(aID)
      const bIndex = state.app.tags.indexOf(bID)
      if (aIndex < bIndex) {
        return -1
      } else if (aIndex > bIndex) {
        return 1
      } else {
        return 0
      }
    })

    dispatch(setCaptionScriptTags({ id: scriptID, value: tags }))
  }
}

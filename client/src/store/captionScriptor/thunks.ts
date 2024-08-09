import { type AppDispatch, type RootState } from '../store'
import { RP } from 'flipflip-common'
import {
  setCaptionScriptorCaptionScriptID,
  setCaptionScriptorSceneID,
  setCaptionScriptorSceneScripts
} from './slice'
import { setScene } from '../scene/slice'
import { setCaptionScript } from '../captionScript/slice'
import { newCaptionScript } from '../captionScript/CaptionScript'

export function onCaptionScriptorChangeScene(
  sceneID: number,
  captionScriptID: number
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const originalScripts: string[] = []
    if (sceneID !== 0) {
      const state = getState()
      const scene = state.scene.entries[sceneID]
      const originalPlaylists = scene.scriptPlaylists
      for (const playlist of originalPlaylists) {
        for (const scriptID of playlist.scripts) {
          originalScripts.push(
            state.captionScript.entries[scriptID].url as string
          )
        }
      }

      scene.id = state.scene.nextID
      scene.audioEnabled = false
      scene.videoVolume = 0
      scene.textEnabled = true
      scene.scriptPlaylists = [
        { scripts: [captionScriptID], shuffle: false, repeat: RP.one }
      ]
      dispatch(setScene(scene))
    }

    dispatch(setCaptionScriptorSceneID(sceneID))
    dispatch(setCaptionScriptorSceneScripts(originalScripts))
  }
}

export function onCaptionScriptorNewScript() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const id = getState().captionScript.nextID
    dispatch(setCaptionScript(newCaptionScript({ id, script: '' })))
    dispatch(setCaptionScriptorCaptionScriptID(id))
  }
}

export function onCaptionScriptorOpenScript(url: string) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const id = getState().captionScript.nextID
    dispatch(setCaptionScript(newCaptionScript({ id, url })))
    dispatch(setCaptionScriptorCaptionScriptID(id))
  }
}

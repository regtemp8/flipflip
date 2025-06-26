import { type AppDispatch, type RootState } from '../store'
// import { RP, copy } from 'flipflip-common'
import {
  setCaptionScriptorCaptionScriptID,
  setCaptionScriptorSceneID,
  setCaptionScriptorSceneScripts
} from './slice'
// import { setScene } from '../scene/slice'
// import { setCaptionScript } from '../captionScript/slice'
// import { newCaptionScript } from '../captionScript/CaptionScript'
// import Scene from '../scene/Scene'
// import { newPlaylist } from '../playlist/Playlist'
// import { setPlaylist } from '../playlist/slice'

export function onCaptionScriptorChangeScene(
  sceneID: number,
  _captionScriptID: number
) {
  return (dispatch: AppDispatch, _getState: () => RootState): void => {
    const originalScripts: string[] = []
    if (sceneID !== 0) {
      // TODO fix this
      // const state = getState()
      // const sceneCopy = copy<Scene>(state.scene.entries[sceneID])
      // const originalPlaylists = sceneCopy.scriptPlaylists.map(
      //   (id) => state.playlist.entries[id]
      // )
      // for (const playlist of originalPlaylists) {
      //   for (const scriptID of playlist.items) {
      //     originalScripts.push(
      //       state.captionScript.entries[scriptID].url as string
      //     )
      //   }
      // }
      // const scriptPlaylist = newPlaylist({
      //   id: state.playlist.nextID,
      //   items: [captionScriptID],
      //   shuffle: false,
      //   repeat: RP.one
      // })
      // dispatch(setPlaylist(scriptPlaylist))
      // sceneCopy.id = state.scene.nextID
      // sceneCopy.audioEnabled = false
      // sceneCopy.videoVolume = 0
      // sceneCopy.textEnabled = true
      // sceneCopy.scriptPlaylists = [scriptPlaylist.id]
      // dispatch(setScene(sceneCopy))
    }

    dispatch(setCaptionScriptorSceneID(sceneID))
    dispatch(setCaptionScriptorSceneScripts(originalScripts))
  }
}

export function onCaptionScriptorNewScript() {
  return (dispatch: AppDispatch, _getState: () => RootState): void => {
    const id = -1 //getState().captionScript.nextID
    // dispatch(setCaptionScript(newCaptionScript({ id, script: '' })))
    dispatch(setCaptionScriptorCaptionScriptID(id))
  }
}

export function onCaptionScriptorOpenScript(_url: string) {
  return (dispatch: AppDispatch, _getState: () => RootState): void => {
    const id = -1 //getState().captionScript.nextID
    // dispatch(setCaptionScript(newCaptionScript({ id, url })))
    dispatch(setCaptionScriptorCaptionScriptID(id))
  }
}

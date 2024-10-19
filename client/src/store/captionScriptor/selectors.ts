import { type RootState } from '../store'

export const selectCaptionScriptorSceneID = () => {
  return (state: RootState) => state.captionScriptor.sceneID
}

export const selectCaptionScriptorSceneScripts = () => {
  return (state: RootState) => state.captionScriptor.sceneScripts
}

export const selectCaptionScriptorCaptionScriptID = () => {
  return (state: RootState) => state.captionScriptor.captionScriptID
}

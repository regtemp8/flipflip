import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface CaptionScriptorState {
  sceneID: number
  captionScriptID: number
  sceneScripts: string[]
}

export const initialCaptionScriptorState: CaptionScriptorState = {
  sceneID: 0,
  captionScriptID: -1,
  sceneScripts: []
}
export const captionScriptorSlice = createSlice({
  name: 'captionScriptor',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialCaptionScriptorState,
  reducers: {
    setCaptionScriptorSceneID: (state, action: PayloadAction<number>) => {
      state.sceneID = action.payload
    },
    setCaptionScriptorSceneScripts: (
      state,
      action: PayloadAction<string[]>
    ) => {
      state.sceneScripts = action.payload
    },
    setCaptionScriptorCaptionScriptID: (
      state,
      action: PayloadAction<number | undefined>
    ) => {
      state.captionScriptID = action.payload ?? -1
    }
  }
})

export const {
  setCaptionScriptorSceneID,
  setCaptionScriptorSceneScripts,
  setCaptionScriptorCaptionScriptID
} = captionScriptorSlice.actions

export default captionScriptorSlice.reducer

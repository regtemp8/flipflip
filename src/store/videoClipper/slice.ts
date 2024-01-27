import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getTimestamp } from '../../renderer/data/utils'

export interface VideoClipperState {
  sourceID: number
  editingClipID?: number
  editingValue: number[]
  editingStartText: string
  editingEndText: string
}

export const initialVideoClipperState: VideoClipperState = {
  sourceID: -1,
  editingValue: [0, 0],
  editingStartText: '',
  editingEndText: ''
}
export const videoClipperSlice = createSlice({
  name: 'videoClipper',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialVideoClipperState,
  reducers: {
    setVideoClipperSourceID: (state, action: PayloadAction<number>) => {
      Object.assign(state, {
        ...initialVideoClipperState,
        sourceID: action.payload
      })
    },
    setVideoClipperResetState: (state, action: PayloadAction<void>) => {
      Object.assign(state, {
        ...initialVideoClipperState,
        sourceID: state.sourceID
      })
    },
    setVideoClipperState: (
      state,
      action: PayloadAction<{ id: number, start: number, end: number }>
    ) => {
      const { id, start, end } = action.payload
      state.editingClipID = id
      state.editingValue = [start, end]
      state.editingStartText = getTimestamp(start)
      state.editingEndText = getTimestamp(end)
    },
    setVideoClipperEditingValue: (
      state,
      action: PayloadAction<{ start: number, end: number }>
    ) => {
      const { start, end } = action.payload
      state.editingValue = [start, end]
      state.editingStartText = getTimestamp(start)
      state.editingEndText = getTimestamp(end)
    },
    setVideoClipperEditingStartText: (state, action: PayloadAction<string>) => {
      state.editingStartText = action.payload
    },
    setVideoClipperEditingEndText: (state, action: PayloadAction<string>) => {
      state.editingStartText = action.payload
    }
  }
})

export const {
  setVideoClipperSourceID,
  setVideoClipperResetState,
  setVideoClipperState,
  setVideoClipperEditingValue,
  setVideoClipperEditingStartText,
  setVideoClipperEditingEndText
} = videoClipperSlice.actions

export default videoClipperSlice.reducer

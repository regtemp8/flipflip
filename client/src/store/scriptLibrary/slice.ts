import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { flipflipApi } from '../api/slice'

export interface ScriptEdit {
  id: number
  url: string
}

interface ScriptLibraryState {
  yOffset: number
  filters: string[]
  lastSelected?: number
  addHttpUrl: boolean
  editingId?: number
  editing?: ScriptEdit
}

export const initialState: ScriptLibraryState = {
  yOffset: 0,
  filters: [],
  addHttpUrl: false
}
export const scriptLibrarySlice = createSlice({
  name: 'scriptLibrary',
  initialState,
  reducers: {
    setScriptLibraryYOffset: (state, action: PayloadAction<number>) => {
      state.yOffset = action.payload
    },
    setScriptLibraryFilters: (state, action: PayloadAction<string[]>) => {
      state.filters = action.payload
    },
    setScriptLibraryLastSelected: (
      state,
      action: PayloadAction<number | undefined>
    ) => {
      state.lastSelected = action.payload
    },
    setScriptLibraryAddHttpUrl: (state, action: PayloadAction<boolean>) => {
      state.addHttpUrl = action.payload
    },
    setScriptLibraryEditing: (
      state,
      action: PayloadAction<ScriptEdit | undefined>
    ) => {
      state.editing = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      flipflipApi.endpoints.getFilteredCaptionScripts.matchFulfilled,
      (state, action) => {
        if (state.addHttpUrl) {
          state.editingId = action.payload[0]
        }
      }
    )
    builder.addMatcher(
      flipflipApi.endpoints.getCaptionScript.matchFulfilled,
      (state, action) => {
        if (state.addHttpUrl && state.editingId === action.payload.id) {
          const { id, url } = action.payload
          state.editing = { id, url }
          state.addHttpUrl = false
          state.editingId = undefined
        }
      }
    )
  }
})

export const {
  setScriptLibraryYOffset,
  setScriptLibraryFilters,
  setScriptLibraryLastSelected,
  setScriptLibraryEditing,
  setScriptLibraryAddHttpUrl
} = scriptLibrarySlice.actions

export default scriptLibrarySlice.reducer

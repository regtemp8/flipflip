import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { flipflipApi } from '../api/slice'

export interface SourceEdit {
  id: number
  url: string
}

interface SourceLibraryState {
  yOffset: number
  filters: string[]
  lastSelected?: number
  addHttpUrl: boolean
  editingId?: number
  editing?: SourceEdit
}

export const initialState: SourceLibraryState = {
  yOffset: 0,
  filters: [],
  addHttpUrl: false
}
export const sourceLibrarySlice = createSlice({
  name: 'sourceLibrary',
  initialState,
  reducers: {
    setSourceLibraryYOffset: (state, action: PayloadAction<number>) => {
      state.yOffset = action.payload
    },
    setSourceLibraryFilters: (state, action: PayloadAction<string[]>) => {
      state.filters = action.payload
    },
    setSourceLibraryLastSelected: (
      state,
      action: PayloadAction<number | undefined>
    ) => {
      state.lastSelected = action.payload
    },
    setSourceLibraryAddHttpUrl: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.addHttpUrl = action.payload
    },
    setSourceLibraryEditing: (
      state,
      action: PayloadAction<SourceEdit|undefined>
    ) => {
      state.editing = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      flipflipApi.endpoints.getFilteredSceneContentSources.matchFulfilled,
      (state, action) => {
        if(state.addHttpUrl) {
          state.editingId = action.payload[0]
        }
      }
    )
    builder.addMatcher(
      flipflipApi.endpoints.getContentSource.matchFulfilled,
      (state, action) => {
        if(state.addHttpUrl && state.editingId === action.payload.id) {
          const {id, url} = action.payload
          state.editing = {id, url}
          state.addHttpUrl = false
          state.editingId = undefined
        }
      }
    )
  }
})

export const {
  setSourceLibraryYOffset,
  setSourceLibraryFilters,
  setSourceLibraryLastSelected,
  setSourceLibraryEditing,
  setSourceLibraryAddHttpUrl,
} = sourceLibrarySlice.actions

export default sourceLibrarySlice.reducer

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AudioLibraryState {
  error: boolean
  loadingMetadata: boolean
  loadingSources: boolean
  drawerOpen: boolean
  selectedTags: string[]
  openMenu?: string
  playlistID?: number
  importURL?: string
}

export const initialAudioLibraryState: AudioLibraryState = {
  error: false,
  loadingMetadata: false,
  loadingSources: false,
  drawerOpen: false,
  selectedTags: []
}

export const audioLibrarySlice = createSlice({
  name: 'audioLibrary',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialAudioLibraryState,
  reducers: {
    setError: (state, action: PayloadAction<boolean>) => {
      state.error = action.payload
    },
    setLoadingMetadata: (state, action: PayloadAction<boolean>) => {
      state.loadingMetadata = action.payload
    },
    setLoadingSources: (state, action: PayloadAction<boolean>) => {
      state.loadingSources = action.payload
    },
    setOpenMenu: (state, action: PayloadAction<string | undefined>) => {
      state.openMenu = action.payload
    },
    setPlaylistID: (state, action: PayloadAction<number | undefined>) => {
      state.playlistID = action.payload
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.drawerOpen = action.payload
    },
    setImportURL: (state, action: PayloadAction<string | undefined>) => {
      state.importURL = action.payload
    },
    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload
    },
    setAudioLibraryPlaylistID: (state, action: PayloadAction<string>) => {
      state.playlistID = Number(action.payload)
    }
  }
})

export const {
  setError,
  setLoadingMetadata,
  setLoadingSources,
  setOpenMenu,
  setPlaylistID,
  setDrawerOpen,
  setImportURL,
  setSelectedTags,
  setAudioLibraryPlaylistID
} = audioLibrarySlice.actions

export default audioLibrarySlice.reducer

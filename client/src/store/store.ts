import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { flipflipApi } from './api/slice'
import sceneDetailSlice from './sceneDetail/slice'
import scenePickerSlice from './scenePicker/slice'
import displaySlice from './display/slice'
import captionScriptorSlice from './captionScriptor/slice'
import appSlice from './app/slice'
import scriptLibrarySlice from './scriptLibrary/slice'
import sourceLibrarySlice from './sourceLibrary/slice'
import audioLibrarySlice from './audioLibrary/slice'
import audioOptionsSlice from './audioOptions/slice'
import audioEditSlice from './audioEdit/slice'
import imagePlayerSlice from './imagePlayer/slice'
import playlistSlice from './playlist/slice'

const store = configureStore({
  reducer: {
    [flipflipApi.reducerPath]: flipflipApi.reducer,
    app: appSlice,
    // components
    audioEdit: audioEditSlice,
    audioOptions: audioOptionsSlice,
    display: displaySlice,
    captionScriptor: captionScriptorSlice,
    sceneDetail: sceneDetailSlice,
    scenePicker: scenePickerSlice,
    scriptLibrary: scriptLibrarySlice,
    audioLibrary: audioLibrarySlice,
    imagePlayer: imagePlayerSlice,
    playlist: playlistSlice,
    sourceLibrary: sourceLibrarySlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(flipflipApi.middleware)
})

setupListeners(store.dispatch)

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

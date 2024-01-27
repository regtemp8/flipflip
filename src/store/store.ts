import { configureStore } from '@reduxjs/toolkit'
import appSlice from './app/slice'
import audioSlice from './audio/slice'
import constantsSlice from './constants/slice'
import playersSlice from './player/slice'
import captionScriptSlice from './captionScript/slice'
import clipSlice from './clip/slice'
import librarySourceSlice from './librarySource/slice'
import overlaySlice from './overlay/slice'
import playlistSlice from './playlist/slice'
import sceneSlice from './scene/slice'
import sceneGridSlice from './sceneGrid/slice'
import sceneGroupSlice from './sceneGroup/slice'
import tagSlice from './tag/slice'
import videoClipperSlice from './videoClipper/slice'
import scenePickerSlice from './scenePicker/slice'
import captionScriptorSlice from './captionScriptor/slice'
import sceneDetailSlice from './sceneDetail/slice'
import audioLibrarySlice from './audioLibrary/slice'
import sourceScraperSlice from './sourceScraper/slice'

const store = configureStore({
  reducer: {
    app: appSlice,
    audio: audioSlice,
    captionScript: captionScriptSlice,
    clip: clipSlice,
    constants: constantsSlice,
    librarySource: librarySourceSlice,
    overlay: overlaySlice,
    playlist: playlistSlice,
    scene: sceneSlice,
    sceneGrid: sceneGridSlice,
    sceneGroup: sceneGroupSlice,
    tag: tagSlice,
    // components
    players: playersSlice,
    videoClipper: videoClipperSlice,
    scenePicker: scenePickerSlice,
    captionScriptor: captionScriptorSlice,
    sceneDetail: sceneDetailSlice,
    audioLibrary: audioLibrarySlice,
    sourceScraper: sourceScraperSlice
  }
})

export default store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

import { configureStore } from '@reduxjs/toolkit'
import appSlice from './app/slice'
import audioSlice, { initialAudioState } from './audio/slice'
import constantsSlice from './constants/slice'
import playersSlice, { initialPlayersState } from './player/slice'
import captionScriptSlice, {
  initialCaptionScriptState
} from './captionScript/slice'
import clipSlice, { initialClipState } from './clip/slice'
import librarySourceSlice, {
  initialLibrarySourceState
} from './librarySource/slice'
import overlaySlice, { initialOverlayState } from './overlay/slice'
import playlistSlice, { initialPlaylistState } from './playlist/slice'
import sceneSlice, { initialSceneState } from './scene/slice'
import sceneGridSlice, { initialSceneGridState } from './sceneGrid/slice'
import sceneGroupSlice, { initialSceneGroupState } from './sceneGroup/slice'
import tagSlice, { initialTagState } from './tag/slice'
import videoClipperSlice, {
  initialVideoClipperState
} from './videoClipper/slice'
import scenePickerSlice, { initialScenePickerState } from './scenePicker/slice'
import captionScriptorSlice, {
  initialCaptionScriptorState
} from './captionScriptor/slice'
import sceneDetailSlice, { initialSceneDetailState } from './sceneDetail/slice'
import audioLibrarySlice, {
  initialAudioLibraryState
} from './audioLibrary/slice'
import { initialApp } from './app/data/App'
import { initialSystemConstants } from './constants/SystemConstants'
import sourceScraperSlice, {
  initialSourceScraperState
} from './sourceScraper/slice'

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
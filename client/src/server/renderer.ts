import createCache, { type EmotionCache } from '@emotion/cache'
import { configureStore } from '@reduxjs/toolkit'
import { AppStorage, SystemConstants } from 'flipflip-common'
import createAppReducer from '../store/app/slice'
import createAudioReducer from '../store/audio/slice'
import createCaptionScriptReducer from '../store/captionScript/slice'
import createClipReducer from '../store/clip/slice'
import createLibrarySourceReducer from '../store/librarySource/slice'
import createPlaylistReducer from '../store/playlist/slice'
import createSceneReducer from '../store/scene/slice'
import createSceneGroupReducer from '../store/sceneGroup/slice'
import createTagReducer from '../store/tag/slice'
import playersSlice from '../store/player/slice'
import videoClipperSlice from '../store/videoClipper/slice'
import scenePickerSlice from '../store/scenePicker/slice'
import captionScriptorSlice from '../store/captionScriptor/slice'
import sceneDetailSlice from '../store/sceneDetail/slice'
import audioLibrarySlice from '../store/audioLibrary/slice'
import sourceScraperSlice from '../store/sourceScraper/slice'
import createConstantsReducer from '../store/constants/slice'
import { fromAppStorage } from '../store/app/convert'
import createDisplayReducer from '../store/display/slice'
import createDisplayViewReducer from '../store/displayView/slice'
import createScenePlaylistItemReducer from '../store/scenePlaylistItem/slice'
import createDisplayPlaylistItemReducer from '../store/displayPlaylistItem/slice'

export function createEmotionCache(): EmotionCache {
  return createCache({ key: 'css' })
}

export function createReduxStore(
  appStorage?: AppStorage,
  constants?: SystemConstants
) {
  const state = appStorage != null ? fromAppStorage(appStorage) : undefined
  return configureStore({
    reducer: {
      app: createAppReducer(state?.app),
      audio: createAudioReducer(state?.audio),
      captionScript: createCaptionScriptReducer(state?.captionScript),
      clip: createClipReducer(state?.clip),
      librarySource: createLibrarySourceReducer(state?.librarySource),
      playlist: createPlaylistReducer(state?.playlist),
      displayPlaylistItem: createDisplayPlaylistItemReducer(
        state?.displayPlaylistItem
      ),
      scenePlaylistItem: createScenePlaylistItemReducer(
        state?.scenePlaylistItem
      ),
      scene: createSceneReducer(state?.scene),
      sceneGroup: createSceneGroupReducer(state?.sceneGroup),
      display: createDisplayReducer(state?.display),
      displayView: createDisplayViewReducer(state?.displayView),
      tag: createTagReducer(state?.tag),
      constants: createConstantsReducer(constants),
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
}

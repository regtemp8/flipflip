import { initialApp } from './app/data/App'
import { initialAudioState } from './audio/slice'
import { initialCaptionScriptState } from './captionScript/slice'
import { initialClipState } from './clip/slice'
import { initialLibrarySourceState } from './librarySource/slice'
import { initialOverlayState } from './overlay/slice'
import { initialPlaylistState } from './playlist/slice'
import { initialSceneState } from './scene/slice'
import { initialSceneGridState } from './sceneGrid/slice'
import { initialSceneGroupState } from './sceneGroup/slice'
import { initialTagState } from './tag/slice'
import { EntryState } from './EntryState'
import type Tag from './tag/Tag'
import type SceneGroup from './sceneGroup/SceneGroup'
import type SceneGrid from './sceneGrid/SceneGrid'
import type Scene from './scene/Scene'
import type Playlist from './playlist/Playlist'
import type Overlay from './overlay/Overlay'
import type LibrarySource from './librarySource/LibrarySource'
import type Clip from './clip/Clip'
import type CaptionScript from './captionScript/CaptionScript'
import type Audio from './audio/Audio'
import type App from './app/data/App'
import View from './displayView/View'
import Display from './display/Display'
import { initialDisplayViewState } from './displayView/slice'
import { initialDisplayState } from './display/slice'
import { initialScenePlaylistItemState } from './scenePlaylistItem/slice'
import { ScenePlaylistItem } from './scenePlaylistItem/ScenePlaylistItem'
import { DisplayPlaylistItem } from './displayPlaylistItem/DisplayPlaylistItem'
import { initialDisplayPlaylistItemState } from './displayPlaylistItem/slice'

export interface AppStorageImport {
  app: App
  audio: EntryState<Audio>
  captionScript: EntryState<CaptionScript>
  clip: EntryState<Clip>
  librarySource: EntryState<LibrarySource>
  overlay: EntryState<Overlay>
  playlist: EntryState<Playlist>
  scene: EntryState<Scene>
  sceneGrid: EntryState<SceneGrid>
  sceneGroup: EntryState<SceneGroup>
  scenePlaylistItem: EntryState<ScenePlaylistItem>
  displayPlaylistItem: EntryState<DisplayPlaylistItem>
  tag: EntryState<Tag>
  display: EntryState<Display>
  displayView: EntryState<View>
}

export const initialAppStorageImport: AppStorageImport = {
  app: initialApp,
  audio: initialAudioState,
  captionScript: initialCaptionScriptState,
  clip: initialClipState,
  librarySource: initialLibrarySourceState,
  overlay: initialOverlayState,
  playlist: initialPlaylistState,
  scene: initialSceneState,
  sceneGrid: initialSceneGridState,
  sceneGroup: initialSceneGroupState,
  scenePlaylistItem: initialScenePlaylistItemState,
  displayPlaylistItem: initialDisplayPlaylistItemState,
  tag: initialTagState,
  display: initialDisplayState,
  displayView: initialDisplayViewState
}

import { RootState } from "./store";
import { initialApp } from "./app/data/App";
import { initialAudioState } from "./audio/slice";
import { initialCaptionScriptState } from "./captionScript/slice";
import { initialClipState } from "./clip/slice";
import { initialSystemConstants } from "./constants/SystemConstants";
import { initialLibrarySourceState } from "./librarySource/slice";
import { initialOverlayState } from "./overlay/slice";
import { initialPlaylistState } from "./playlist/slice";
import { initialSceneState } from "./scene/slice";
import { initialSceneGridState } from "./sceneGrid/slice";
import { initialSceneGroupState } from "./sceneGroup/slice";
import { initialTagState } from "./tag/slice";
import { initialPlayersState } from "./player/slice";
import { initialVideoClipperState } from "./videoClipper/slice";
import { initialScenePickerState } from "./scenePicker/slice";
import { initialCaptionScriptorState } from "./captionScriptor/slice";
import { initialSceneDetailState } from "./sceneDetail/slice";
import { initialAudioLibraryState } from "./audioLibrary/slice";
import { initialSourceScraperState } from "./sourceScraper/slice";

export const initialRootState: RootState = {
  app: initialApp,
  audio: initialAudioState,
  captionScript: initialCaptionScriptState,
  clip: initialClipState,
  constants: initialSystemConstants,
  librarySource: initialLibrarySourceState,
  overlay: initialOverlayState,
  playlist: initialPlaylistState,
  scene: initialSceneState,
  sceneGrid: initialSceneGridState,
  sceneGroup: initialSceneGroupState,
  tag: initialTagState,
  players: initialPlayersState,
  videoClipper: initialVideoClipperState,
  scenePicker: initialScenePickerState,
  captionScriptor: initialCaptionScriptorState,
  sceneDetail: initialSceneDetailState,
  audioLibrary: initialAudioLibraryState,
  sourceScraper: initialSourceScraperState
}
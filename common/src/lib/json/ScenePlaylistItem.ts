import { PlaylistItem } from "./PlaylistItem";

export type ScenePlaylistItem = {
  sceneID: number;
  sceneName: string;
  randomScenes: number[];
  duration: number;
  playAfterAllImages: boolean;
} & PlaylistItem;

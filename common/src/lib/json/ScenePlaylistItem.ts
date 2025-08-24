import { PlaylistItem } from "./PlaylistItem";

export type ScenePlaylistItem = {
  sceneID: number;
  randomScenes: number[];
  duration: number;
  playAfterAllImages: boolean;
} & PlaylistItem;

import { PlaylistItem } from "./PlaylistItem";

export type DisplayPlaylistItem = {
  displayID: number;
  randomDisplays: number[];
  duration: number;
} & PlaylistItem;

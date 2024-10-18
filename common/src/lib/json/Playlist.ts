import { PLT } from '../const';

export type PlaylistType =
  | typeof PLT.audio
  | typeof PLT.display
  | typeof PLT.scene
  | typeof PLT.script;

export type Playlist = {
  id: number;
  name: string;
  type: PlaylistType;
  items: number[];
  shuffle: boolean;
  repeat: string;
};

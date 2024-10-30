import { PlaylistType } from './PlaylistType';

export type Playlist = {
  id: number;
  name: string;
  type: PlaylistType;
  items: number[];
  shuffle: boolean;
  repeat: string;
};

import { copy } from '../utils';

export type Playlist = {
  id: number;
  name?: string;
  audios: number[]; // Array of audio IDs
};

export const initialPlaylist: Playlist = {
  id: 0,
  audios: [],
};

export function newPlaylist(init?: Partial<Playlist>) {
  return Object.assign(copy<Playlist>(initialPlaylist), init);
}

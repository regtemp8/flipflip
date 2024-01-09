import { type Audio } from './Audio';

export type AudioPlaylist = {
  audios: Audio[];
  shuffle: boolean;
  repeat: string;
};

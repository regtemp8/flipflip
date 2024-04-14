import { RP } from '../const';
import { copy } from '../utils';

import { type Audio } from './Audio';

export type AudioPlaylist = {
  audios: Audio[];
  shuffle: boolean;
  repeat: string;
  name?: string;
};

export const initialAudioPlaylist: AudioPlaylist = {
  audios: [],
  shuffle: false,
  repeat: RP.all,
};

export function newAudioPlaylist(init?: Partial<AudioPlaylist>) {
  return Object.assign(copy<AudioPlaylist>(initialAudioPlaylist), init);
}

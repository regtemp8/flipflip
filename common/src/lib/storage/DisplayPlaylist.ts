import { RP } from '../const';
import { copy } from '../utils';

import { type Display } from './Display';

export type DisplayPlaylist = {
  displays: Display[];
  shuffle: boolean;
  repeat: string;
  name?: string;
};

export const initialDisplayPlaylist: DisplayPlaylist = {
  displays: [],
  shuffle: false,
  repeat: RP.all,
};

export function newDisplayPlaylist(init?: Partial<DisplayPlaylist>) {
  return Object.assign(copy<DisplayPlaylist>(initialDisplayPlaylist), init);
}

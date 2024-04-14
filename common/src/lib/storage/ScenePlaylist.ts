import { RP } from '../const';
import { copy } from '../utils';

import { type Scene } from './Scene';

export type ScenePlaylist = {
  scenes: Scene[];
  shuffle: boolean;
  repeat: string;
  name?: string;
};

export const initialScenePlaylist: ScenePlaylist = {
  scenes: [],
  shuffle: false,
  repeat: RP.all,
};

export function newScenePlaylist(init?: Partial<ScenePlaylist>) {
  return Object.assign(copy<ScenePlaylist>(initialScenePlaylist), init);
}

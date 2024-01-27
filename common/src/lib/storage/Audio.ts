import { TF } from '../const';
import { copy } from '../utils';

import { type Tag } from './Tag';

export type Audio = {
  id: number;
  url?: string;
  marked: boolean;
  tags: Tag[];
  volume: number;
  speed: number;
  stopAtEnd: boolean;
  nextSceneAtEnd: boolean;
  tick: boolean;
  tickMode: string;
  tickDelay: number;
  tickMinDelay: number;
  tickMaxDelay: number;
  tickSinRate: number;
  tickBPMMulti: number;
  bpm: number;
  thumb?: string;
  name?: string;
  artist?: string;
  album?: string;
  trackNum?: number;
  duration?: number;
  comment?: string;
  playedCount: number;
};

export const initialAudio: Audio = {
  id: 0,
  marked: false,
  tags: [],
  volume: 100,
  speed: 10,
  stopAtEnd: false,
  nextSceneAtEnd: false,
  tick: false,
  tickMode: TF.constant,
  tickDelay: 1000,
  tickMinDelay: 500,
  tickMaxDelay: 5000,
  tickSinRate: 100,
  tickBPMMulti: 10,
  bpm: 0,
  playedCount: 0,
};

export function newAudio(init?: Partial<Audio>): Audio {
  const tickModes: Record<string, string> = {};
  tickModes['at.constant'] = 'tf.c';
  tickModes['at.random'] = 'tf.random';
  tickModes['at.sin'] = 'tf.sin';
  tickModes['at.scene'] = 'tf.scene';

  const audio = Object.assign(copy<Audio>(initialAudio), init);
  const tickMode = tickModes[audio.tickMode];
  if (tickMode != null) {
    audio.tickMode = tickMode;
  }

  return audio;
}

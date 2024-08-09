import { copy } from '../utils';

import { type Tag } from './Tag';

export type Clip = {
  id: number;
  start?: number;
  end?: number;
  volume?: number;
  tags: Tag[];
};

export const initialClip: Clip = {
  id: 0,
  tags: [],
};

export function newClip(init?: Partial<Clip>) {
  return Object.assign(copy<Clip>(initialClip), init);
}

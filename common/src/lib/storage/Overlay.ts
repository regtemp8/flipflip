import { copy } from '../utils';

export type Overlay = {
  id: number;
  sceneID: number;
  opacity: number;
};

export const initialOverlay: Overlay = {
  id: 0,
  sceneID: 0,
  opacity: 50,
};

export function newOverlay(init?: Partial<Overlay>) {
  return Object.assign(copy<Overlay>(initialOverlay), init);
}

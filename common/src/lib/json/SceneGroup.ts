import { SG } from '../const';
import { SceneGroupItem } from './SceneGroupItem';

export type SceneGroupType =
  | typeof SG.display
  | typeof SG.generator
  | typeof SG.playlist
  | typeof SG.scene;

export type SceneGroup = {
  id: number;
  type: SceneGroupType;
  name: string;
  items: SceneGroupItem[];
};

import { SceneGroupItem } from './SceneGroupItem';
import { SceneGroupType } from './SceneGroupType';

export type SceneGroup = {
  id: number;
  type: SceneGroupType;
  name: string;
  items: SceneGroupItem[];
};

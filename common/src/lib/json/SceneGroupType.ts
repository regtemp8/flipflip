import { SG } from '../const';

export type SceneGroupType =
  | typeof SG.display
  | typeof SG.generator
  | typeof SG.playlist
  | typeof SG.scene;

import { PLT } from './const';

export type PlaylistType =
  | typeof PLT.audio
  | typeof PLT.display
  | typeof PLT.scene
  | typeof PLT.script;

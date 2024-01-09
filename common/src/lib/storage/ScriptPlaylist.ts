import { type CaptionScript } from './CaptionScript';

export type ScriptPlaylist = {
  scripts: CaptionScript[];
  shuffle: boolean;
  repeat: string;
};

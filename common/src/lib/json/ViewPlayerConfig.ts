import { DisplayView } from './DisplayView';

export type ViewPlayerConfig = {
  uuid: string;
  view: DisplayView;
  maxCanLoad: number;
  maxCanLoadAtOnce: number;
  sceneId: number;
};

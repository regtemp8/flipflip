import { DisplayView } from './DisplayView';

export type ViewPlayerConfig = {
  view: DisplayView;
  maxCanLoad: number;
  maxCanLoadAtOnce: number;
  sceneId: number;
};

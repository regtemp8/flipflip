import { ContentData } from './ContentData';
import { EffectsData } from './EffectsData';
import { TransformData } from './TransformData';
import { ViewData } from './ViewData';

export type ImageViewData = {
  data: ContentData;
  transform: TransformData;
  view: ViewData;
  effects: EffectsData;
  sceneId: number;
  displayIndex?: number;
};

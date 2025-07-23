import { ContentData } from './ContentData';
import { TransformData } from './TransformData';
import { ViewData } from './ViewData';
import { EffectsData } from './EffectsData';

export type ImageViewData = {
  data: ContentData;
  transform: TransformData;
  view: ViewData;
  effects: EffectsData;
  sceneId: number;
  displayIndex?: number;
};

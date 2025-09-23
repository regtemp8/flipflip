import { ContentData } from './ContentData';
import { EffectsData } from './EffectsData';
import { SceneData } from './SceneData';
import { TransformData } from './TransformData';
import { ViewData } from './ViewData';

export type ImageViewData = {
  data: ContentData;
  transform: TransformData;
  view: ViewData;
  effects: EffectsData;
  scene: SceneData;
  displayIndex?: number;
};

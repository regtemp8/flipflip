import {
  ContentData,
  EffectsData,
  TransformData,
  ViewData
} from './ContentPreloadService'

export interface ImageViewState {
  show: boolean
  zIndex: number
  data: ContentData
  transform: TransformData
  view: ViewData
  effects: EffectsData
  sceneID: number
  displayIndex?: number
}
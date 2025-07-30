export type ViewerEvent = {
  event: 'shown' | 'loaded' | 'discarded'
  sceneId: number
  duration: number
}
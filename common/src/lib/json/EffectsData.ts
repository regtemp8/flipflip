export type EasingParams = {
  ea: string
  exp: number
  amp: number
  per: number
  ov: number
}

export type EffectsData = {
  strobe?: StrobeData
  zoomMove?: ZoomMoveData
  slide?: SlideData
  crossFade?: CrossFadeData
  fadeInOut?: FadeInOutData
  panning?: PanningData
}

export type StrobeData = {
  layer: string
  loops: StrobeLoopData[]
  opacity?: number
  easing?: EasingParams
}

export type StrobeLoopData = {
  color: string
  duration: number
  opacity: number
  delay?: number
}

export type ZoomMoveData = {
  scaleFrom: number
  scaleTo: number
  translateX: number
  translateY: number
  duration: number
  easing?: EasingParams
}

export type SlideData = {
  horizStart: number
  vertStart: number
  horizEnd: number
  vertEnd: number
  duration: number
  easing?: EasingParams
}

export type CrossFadeData = {
  duration: number
  easing?: EasingParams
}

export type FadeInOutData = {
  loops: FadeInOutLoopData[]
}

export type FadeInOutLoopData = {
  duration: number
  opacity: number
  easing?: EasingParams
}

export type PanningData = {
  start: PanningLoopData
  loops: PanningLoopData[]
  startEasing?: EasingParams
  endEasing?: EasingParams
}

export type PanningLoopData = {
  duration: number
  translateX?: PanningTranslateData
  translateY?: PanningTranslateData
}

export type PanningTranslateData = {
  amount: number
  unit: string
}
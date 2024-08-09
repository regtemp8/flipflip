export default interface DisplaySettings {
  [key: string]: boolean | number | string[]

  alwaysOnTop: boolean
  showMenu: boolean
  fullScreen: boolean
  clickToProgress: boolean
  clickToProgressWhilePlaying: boolean
  startImmediately: boolean
  easingControls: boolean
  audioAlert: boolean
  cloneGridVideoElements: boolean

  minImageSize: number
  minVideoSize: number
  maxInMemory: number
  maxInHistory: number
  maxLoadingAtOnce: number

  ignoredTags: string[]
}

export const initialDisplaySettings: DisplaySettings = {
  alwaysOnTop: false,
  showMenu: true,
  fullScreen: false,
  clickToProgress: true,
  clickToProgressWhilePlaying: false,
  startImmediately: false,
  easingControls: false,
  audioAlert: true,
  cloneGridVideoElements: false,

  minVideoSize: 200,
  minImageSize: 200,
  maxInMemory: 40,
  maxInHistory: 120,
  maxLoadingAtOnce: 5,

  ignoredTags: []
}

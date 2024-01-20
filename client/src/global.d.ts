import { AppStorage, SystemConstants } from 'flipflip-common'

declare global {
  interface Document {
    mozCancelFullScreen?: () => Promise<void>
    msExitFullscreen?: () => Promise<void>
    webkitExitFullscreen?: () => Promise<void>
    mozFullScreenElement?: Element
    msFullscreenElement?: Element
    webkitFullscreenElement?: Element
  }

  interface Element {
    msRequestFullscreen?: () => Promise<void>
    mozRequestFullscreen?: () => Promise<void>
    webkitRequestFullscreen?: () => Promise<void>
  }

  interface Window {
    flipflipAppStorage?: AppStorage
    flipflipConstants?: SystemConstants
  }
}

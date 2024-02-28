import { AppStorage, SystemConstants } from 'flipflip-common'

declare global {
  interface Window {
    flipflipAppStorage?: AppStorage
    flipflipConstants?: SystemConstants
    opr?: unknown
    chrome?: unknown
  }
}

import wretch from 'wretch'
import gifInfo from 'gif-info'
import { getBrowserName } from '../../data/utils'
import { ContentData } from './ContentPreloadService'

interface GIFImage {
  identifier: string
  top: number
  left: number
  height: number
  width: number
  localPalette: boolean
  localPaletteSize: number
  interlace: boolean
  delay: number
  text: string
  comments: string[]
  disposal: number
}

interface GIFInfo {
  valid: boolean
  animated: boolean
  globalPalette: boolean
  globalPaletteSize: number
  height: number
  width: number
  loopCount: number
  images: GIFImage[]
  isBrowserDuration: boolean
  duration: number
  durationIE: number
  durationSafari: number
  durationFirefox: number
  durationChrome: number
  durationOpera: number
}

export default class GIFDataLoader {
  public async getData(url: string): Promise<ContentData> {
    return wretch(url)
      .get()
      .arrayBuffer((buffer) => gifInfo(buffer))
      .then((info?: GIFInfo) => {
        const data: ContentData = { url }
        if (info != null) {
          data.animated = info.animated
          data.duration = this.getGIFDuration(info)
        }

        return data
      })
      .catch((error) => {
        console.error(error)
        return { url }
      })
  }

  private getGIFDuration(info: GIFInfo): number | undefined {
    let duration: number | undefined
    if (info.isBrowserDuration) {
      duration = this.getGIFBrowserDuration(info)
    }

    return duration ?? info.duration
  }

  private getGIFBrowserDuration(info: GIFInfo): number | undefined {
    switch (getBrowserName()) {
      case 'ie':
      case 'edge':
        return info.durationIE
      case 'safari':
        return info.durationSafari
      case 'firefox':
        return info.durationFirefox
      case 'chrome':
      case 'chromium based edge':
        return info.durationChrome
      case 'opera':
        return info.durationOpera
      default:
        return undefined
    }
  }
}

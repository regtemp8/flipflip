import { IpcMainEvent, ipcMain } from 'electron'
import { SDO } from 'flipflip-common'
import security from './SecurityService'
import windowManager from './WindowManager'
import server from './FlipFlipServer'

const isValidSender = (event: IpcMainEvent) => {
  const url = new URL(event.senderFrame.url)
  return url.href === `${server().getServerURL()}/details`
}

export function initIpcEvents() {
  ipcMain.handle(SDO.getNetworkURLs, (event: IpcMainEvent) => {
    if (!isValidSender(event)) {
      return []
    }

    return server().getNetworkURLs()
  })

  const generateMagicLink = async (url: string): Promise<string> => {
    const token = await security().generateToken()
    return `${url}/login?token=${token}`
  }

  ipcMain.handle(SDO.getMagicLink, (event: IpcMainEvent, url: string) => {
    return isValidSender(event) ? generateMagicLink(url) : Promise.resolve('')
  })

  ipcMain.on(SDO.openExternal, (event: IpcMainEvent, url: string) => {
    if (isValidSender(event)) {
      generateMagicLink(url).then((link) => windowManager().openExternal(link))
    }
  })
}

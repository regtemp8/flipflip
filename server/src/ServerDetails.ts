import { IpcMainEvent, ipcMain } from 'electron'
import { SDO } from 'flipflip-common'
import security from './SecurityService'
import windowManager from './WindowManager'
import server from './FlipFlipServer'
import login from './LoginCode'

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

  ipcMain.handle(SDO.getMagicLink, (event: IpcMainEvent, url: string) => {
    return isValidSender(event)
      ? security().generateMagicLink(url)
      : Promise.resolve('')
  })

  ipcMain.on(SDO.openExternal, (event: IpcMainEvent, url: string) => {
    if (isValidSender(event)) {
      security()
        .generateMagicLink(url)
        .then((link) => windowManager().openExternal(link))
    }
  })

  ipcMain.on(SDO.verifyLoginCode, (event: IpcMainEvent, code: string) => {
    if (isValidSender(event)) {
      const verified = security().verifyCode(code)
      login().done(verified)
    }
  })

  ipcMain.on(SDO.cancelLoginCode, (event: IpcMainEvent) => {
    if (isValidSender(event)) {
      login().done(false)
    }
  })
}

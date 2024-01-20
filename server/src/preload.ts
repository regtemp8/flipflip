import { contextBridge, ipcRenderer } from 'electron'
import { SDO } from 'flipflip-common'

contextBridge.exposeInMainWorld('flipflip', {
  ipc: {
    getNetworkURLs: (): Promise<Array<{ name: string; url: string }>> => {
      return ipcRenderer.invoke(SDO.getNetworkURLs)
    },
    getMagicLink: (url: string): Promise<string> => {
      return ipcRenderer.invoke(SDO.getMagicLink, url)
    },
    openExternal: (url: string): void => {
      ipcRenderer.send(SDO.openExternal, url)
    }
  }
})

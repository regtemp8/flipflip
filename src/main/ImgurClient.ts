import type { IpcMain, IpcMainEvent } from 'electron'
import { IPC } from '../renderer/data/const'
import * as imgur from 'imgur'

export default class ImgurClient {
  initializeIpcEvents (ipcMain: IpcMain): void {
    ipcMain.handle(IPC.imgurAlbumImages, this.onRequestAlbumImages)
  }

  releaseIpcEvents (ipcMain: IpcMain): void {
    ipcMain.removeAllListeners(IPC.imgurAlbumImages)
  }

  async onRequestAlbumImages (
    ev: IpcMainEvent,
    albumName: string
  ): Promise<string[]> {
    const album = await imgur.getAlbumInfo(albumName)
    return album.images.map((i: any) => i.link)
  }
}

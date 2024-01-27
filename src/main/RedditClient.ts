import { type IpcMain, type IpcMainEvent } from 'electron'
import Snoowrap from 'snoowrap'
import { IPC, RF, RT } from '../renderer/data/const'

export default class RedditClient {
  reddit: typeof Snoowrap

  initializeIpcEvents (ipcMain: IpcMain) {
    ipcMain.handle(IPC.redditGetSubreddit, this.onRequestRedditGetSubreddit)
    ipcMain.handle(
      IPC.redditGetSavedContent,
      this.onRequestRedditGetSavedContent
    )
    ipcMain.handle(IPC.redditGetUser, this.onRequestRedditGetUser)
    ipcMain.handle(
      IPC.redditGetSubscriptions,
      this.onRequestRedditGetSubscriptions
    )
  }

  releaseIpcEvents (ipcMain: IpcMain) {
    ipcMain.removeAllListeners(IPC.redditGetSubreddit)
    ipcMain.removeAllListeners(IPC.redditGetSavedContent)
    ipcMain.removeAllListeners(IPC.redditGetUser)
    ipcMain.removeAllListeners(IPC.redditGetSubscriptions)
  }

  getClient (
    redditUserAgent: string,
    redditClientID: string,
    redditRefreshToken: string
  ): typeof Snoowrap {
    if (!this.reddit) {
      this.reddit = new Snoowrap({
        userAgent: redditUserAgent,
        clientId: redditClientID,
        refreshToken: redditRefreshToken
      })
    }

    return this.reddit
  }

  async onRequestRedditGetSubreddit (
    ev: IpcMainEvent,
    redditUserAgent: string,
    redditClientID: string,
    redditRefreshToken: string,
    redditFunc: string,
    url: string,
    after: any,
    redditTime: string | undefined
  ): Promise<any> {
    const client = this.getClient(
      redditUserAgent,
      redditClientID,
      redditRefreshToken
    )

    switch (redditFunc) {
      default:
      case RF.hot:
        return await client.getSubreddit(url).getHot({ after })
      case RF.new:
        return await client.getSubreddit(url).getNew({ after })
      case RF.top:
        const time = redditTime || RT.day
        return await client.getSubreddit(url).getTop({ time, after })
      case RF.controversial:
        return await client.getSubreddit(url).getControversial({ after })
      case RF.rising:
        return await client.getSubreddit(url).getRising({ after })
    }
  }

  async onRequestRedditGetSavedContent (
    ev: IpcMainEvent,
    redditUserAgent: string,
    redditClientID: string,
    redditRefreshToken: string,
    url: string,
    after: any
  ): Promise<any> {
    const client = this.getClient(
      redditUserAgent,
      redditClientID,
      redditRefreshToken
    )
    return await client.getUser(url).getSavedContent({ after })
  }

  async onRequestRedditGetUser (
    ev: IpcMainEvent,
    redditUserAgent: string,
    redditClientID: string,
    redditRefreshToken: string,
    url: string,
    after: any
  ): Promise<any> {
    const client = this.getClient(
      redditUserAgent,
      redditClientID,
      redditRefreshToken
    )
    return await client.getUser(url).getSubmissions({ after })
  }

  async onRequestRedditGetSubscriptions (
    ev: IpcMainEvent,
    redditUserAgent: string,
    redditClientID: string,
    redditRefreshToken: string,
    after: any
  ): Promise<any> {
    const client = this.getClient(
      redditUserAgent,
      redditClientID,
      redditRefreshToken
    )
    return await client.getSubscriptions({ limit: 20, after })
  }
}

import Snoowrap from 'snoowrap'
import { RF } from 'flipflip-common'

export default class RedditClient {
  reddit: Snoowrap | undefined

  initializeIpcEvents(): void {
    // ipcMain.handle(IPC.redditGetSubreddit, this.onRequestRedditGetSubreddit)
    // ipcMain.handle(
    //   IPC.redditGetSavedContent,
    //   this.onRequestRedditGetSavedContent
    // )
    // ipcMain.handle(IPC.redditGetUser, this.onRequestRedditGetUser)
    // ipcMain.handle(
    //   IPC.redditGetSubscriptions,
    //   this.onRequestRedditGetSubscriptions
    // )
  }

  getClient(
    redditUserAgent: string,
    redditClientID: string,
    redditRefreshToken: string
  ): Snoowrap {
    if (this.reddit == null) {
      this.reddit = new Snoowrap({
        userAgent: redditUserAgent,
        clientId: redditClientID,
        refreshToken: redditRefreshToken
      })
    }

    return this.reddit
  }

  async onRequestRedditGetSubreddit(
    redditUserAgent: string,
    redditClientID: string,
    redditRefreshToken: string,
    redditFunc: string,
    url: string,
    after: any,
    redditTime: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' | undefined
  ): Promise<any> {
    const client = this.getClient(
      redditUserAgent,
      redditClientID,
      redditRefreshToken
    )

    switch (redditFunc) {
      case RF.new:
        return await client.getSubreddit(url).getNew({ after })
      case RF.top:
        return await client
          .getSubreddit(url)
          .getTop({ time: redditTime ?? 'day', after })
      case RF.controversial:
        return await client.getSubreddit(url).getControversial({ after })
      case RF.rising:
        return await client.getSubreddit(url).getRising({ after })
      case RF.hot:
      default:
        return await client.getSubreddit(url).getHot({ after })
    }
  }

  async onRequestRedditGetSavedContent(
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

  async onRequestRedditGetUser(
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

  async onRequestRedditGetSubscriptions(
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
    return client.getSubscriptions({ limit: 20, after })
  }
}

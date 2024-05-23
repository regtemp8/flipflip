import Snoowrap from 'snoowrap'
import { RF } from 'flipflip-common'
import { Timespan } from 'snoowrap/dist/objects/Subreddit'

export class RedditClient {
  private static instance: RedditClient

  private reddit: Snoowrap | undefined

  private constructor() {}

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

  async getSubreddit(
    redditUserAgent: string,
    redditClientID: string,
    redditRefreshToken: string,
    redditFunc: string,
    url: string,
    after: string,
    redditTime?: string
  ): Promise<Snoowrap.Listing<Snoowrap.Submission>> {
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
          .getTop({ time: (redditTime ?? 'day') as Timespan, after })
      case RF.controversial:
        return await client.getSubreddit(url).getControversial({ after })
      case RF.rising:
        return await client.getSubreddit(url).getRising({ after })
      case RF.hot:
      default:
        return await client.getSubreddit(url).getHot({ after })
    }
  }

  async getSavedContent(
    redditUserAgent: string,
    redditClientID: string,
    redditRefreshToken: string,
    url: string,
    after: string
  ): Promise<Snoowrap.Submission[]> {
    const client = this.getClient(
      redditUserAgent,
      redditClientID,
      redditRefreshToken
    )
    return await client
      .getUser(url)
      .getSavedContent({ after })
      .then((list) =>
        list
          .filter((content) => content instanceof Snoowrap.Submission)
          .map((content) => content as Snoowrap.Submission)
      )
  }

  async getUser(
    redditUserAgent: string,
    redditClientID: string,
    redditRefreshToken: string,
    url: string,
    after: string
  ): Promise<Snoowrap.Listing<Snoowrap.Submission>> {
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
    after: string
  ): Promise<unknown[]> {
    const client = this.getClient(
      redditUserAgent,
      redditClientID,
      redditRefreshToken
    )
    return client.getSubscriptions({ limit: 20, after })
  }

  public static getInstance(): RedditClient {
    if (!RedditClient.instance) {
      RedditClient.instance = new RedditClient()
    }

    return RedditClient.instance
  }
}

export default function reddit() {
  return RedditClient.getInstance()
}

import {
  type ChallengeStateResponse,
  IgApiClient,
  type SavedFeedResponseMedia,
  type UserFeedResponseItemsItem,
  type AccountFollowingFeedResponseUsersItem
} from 'instagram-private-api'
import { type InstagramItems } from 'flipflip-common'

export class InstagramClient {
  private static instance: InstagramClient

  client: IgApiClient | undefined
  init: boolean | undefined

  private constructor() {}

  initializeIpcEvents(): void {
    // ipcMain.handle(IPC.igLogin, this.onRequestLogin)
    // ipcMain.handle(IPC.igTwoFactorLogin, this.onRequestTwoFactorLogin)
    // ipcMain.handle(IPC.igSendSecurityCode, this.onRequestSendSecurityCode)
    // ipcMain.handle(IPC.igChallenge, this.onRequestChallenge)
    // ipcMain.handle(IPC.igSerializeCookieJar, this.onRequestSerializeCookieJar)
    // ipcMain.handle(IPC.igFollowingFeed, this.onRequestFollowingFeed)
    // ipcMain.handle(
    //   IPC.igGetMoreFollowingFeed,
    //   this.onRequestGetMoreFollowingFeed
    // )
  }

  getClient(): IgApiClient {
    if (this.init === true) {
      this.client = new IgApiClient()
    }

    return this.client as IgApiClient
  }

  async login(username: string, password: string): Promise<number> {
    this.init = true
    const client = this.getClient()
    client.state.generateDevice(username)
    const user = await client.account.login(username, password)
    return user.pk
  }

  async onRequestChallenge(): Promise<ChallengeStateResponse> {
    return await this.getClient().challenge.auto(true)
  }

  async onRequestTwoFactorLogin(
    twoFactorIdentifier: string,
    username: string,
    verificationCode: string
  ): Promise<void> {
    try {
      await this.getClient().account.twoFactorLogin({
        twoFactorIdentifier,
        verificationMethod: '1',
        trustThisDevice: '1',
        username,
        verificationCode
      })
    } finally {
      this.init = true
    }
  }

  async onRequestSendSecurityCode(code: string | number): Promise<void> {
    try {
      await this.getClient().challenge.sendSecurityCode(code)
    } finally {
      this.init = true
    }
  }

  async serializeCookieJar(): Promise<string> {
    const cookies = await this.getClient().state.serializeCookieJar()
    return JSON.stringify(cookies)
  }

  async savedItems(): Promise<InstagramItems<SavedFeedResponseMedia>> {
    const saved = this.getClient().feed.saved()
    const items = await saved.items()
    return {
      items,
      feed: saved.serialize()
    }
  }

  async userFeedItems(
    username: string
  ): Promise<InstagramItems<UserFeedResponseItemsItem>> {
    const client = this.getClient()
    const id = await client.user.getIdByUsername(username)
    const userFeed = client.feed.user(id)
    const items = await userFeed.items()

    return {
      items,
      feed: userFeed.serialize(),
      userId: id
    }
  }

  async getMore(
    session: string,
    id: number | undefined,
    feedSession: string
  ): Promise<
    | InstagramItems<SavedFeedResponseMedia | UserFeedResponseItemsItem>
    | undefined
  > {
    const client = this.getClient()
    await client.state.deserializeCookieJar(JSON.parse(session))
    const igFeed = id !== undefined ? client.feed.user(id) : client.feed.saved()
    igFeed.deserialize(feedSession)
    if (igFeed.isMoreAvailable()) {
      const items = await igFeed.items()
      return {
        items,
        feed: igFeed.serialize(),
        userId: id
      }
    } else {
      return undefined
    }
  }

  async onRequestFollowingFeed(
    userId: number
  ): Promise<InstagramItems<AccountFollowingFeedResponseUsersItem>> {
    const client = this.getClient()
    const followingFeed = client.feed.accountFollowing(userId)
    const items = await followingFeed.items()
    return {
      items,
      feed: followingFeed.serialize()
    }
  }

  async onRequestGetMoreFollowingFeed(
    session: string,
    userId: number,
    feedSession: string
  ): Promise<
    InstagramItems<AccountFollowingFeedResponseUsersItem> | undefined
  > {
    const client = this.getClient()
    await client.state.deserializeCookieJar(JSON.parse(session))
    const followingFeed = client.feed.accountFollowing(userId)
    followingFeed.deserialize(feedSession)
    if (followingFeed.isMoreAvailable()) {
      const items = await followingFeed.items()
      return {
        items,
        feed: followingFeed.serialize()
      }
    } else {
      return undefined
    }
  }

  public static getInstance(): InstagramClient {
    if (!InstagramClient.instance) {
      InstagramClient.instance = new InstagramClient()
    }

    return InstagramClient.instance
  }
}

export default function instagram() {
  return InstagramClient.getInstance()
}

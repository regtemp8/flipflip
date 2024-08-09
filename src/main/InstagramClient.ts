import type { IpcMain, IpcMainEvent } from 'electron'
import { IgApiClient } from 'instagram-private-api'
import type { ChallengeStateResponse } from 'instagram-private-api'
import { IPC } from '../renderer/data/const'

export interface InstagramItems {
  items: any[]
  feed: string
  userId?: number
}

export default class InstagramClient {
  client: IgApiClient
  init: boolean

  initializeIpcEvents (ipcMain: IpcMain): void {
    ipcMain.handle(IPC.igLogin, this.onRequestLogin)
    ipcMain.handle(IPC.igTwoFactorLogin, this.onRequestTwoFactorLogin)
    ipcMain.handle(IPC.igSendSecurityCode, this.onRequestSendSecurityCode)
    ipcMain.handle(IPC.igChallenge, this.onRequestChallenge)
    ipcMain.handle(IPC.igSerializeCookieJar, this.onRequestSerializeCookieJar)
    ipcMain.handle(IPC.igSavedItems, this.onRequestSavedItems)
    ipcMain.handle(IPC.igUserFeedItems, this.onRequestUserFeedItems)
    ipcMain.handle(IPC.igGetMore, this.onRequestGetMore)
    ipcMain.handle(IPC.igFollowingFeed, this.onRequestFollowingFeed)
    ipcMain.handle(
      IPC.igGetMoreFollowingFeed,
      this.onRequestGetMoreFollowingFeed
    )
  }

  releaseIpcEvents (ipcMain: IpcMain): void {
    const events = [
      IPC.igLogin,
      IPC.igTwoFactorLogin,
      IPC.igSendSecurityCode,
      IPC.igChallenge,
      IPC.igSerializeCookieJar,
      IPC.igSavedItems,
      IPC.igUserFeedItems,
      IPC.igGetMore,
      IPC.igFollowingFeed,
      IPC.igGetMoreFollowingFeed
    ]
    for (const event of events) {
      ipcMain.removeAllListeners(event)
    }
  }

  getClient (): IgApiClient {
    if (this.init) {
      this.client = new IgApiClient()
    }

    return this.client
  }

  async onRequestLogin (
    ev: IpcMainEvent,
    username: string,
    password: string
  ): Promise<number> {
    this.init = true
    const client = this.getClient()
    client.state.generateDevice(username)
    const user = await client.account.login(username, password)
    return user.pk
  }

  async onRequestChallenge (ev: IpcMainEvent): Promise<ChallengeStateResponse> {
    return await this.client.challenge.auto(true)
  }

  async onRequestTwoFactorLogin (
    ev: IpcMainEvent,
    twoFactorIdentifier: any,
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

  async onRequestSendSecurityCode (
    ev: IpcMainEvent,
    code: string | number
  ): Promise<void> {
    try {
      await this.getClient().challenge.sendSecurityCode(code)
    } finally {
      this.init = true
    }
  }

  async onRequestSerializeCookieJar (ev: IpcMainEvent): Promise<string> {
    const cookies = await this.getClient().state.serializeCookieJar()
    return JSON.stringify(cookies)
  }

  async onRequestSavedItems (ev: IpcMainEvent): Promise<InstagramItems> {
    const saved = this.getClient().feed.saved()
    const items = await saved.items()
    return {
      items,
      feed: saved.serialize()
    }
  }

  async onRequestUserFeedItems (
    ev: IpcMainEvent,
    username: string
  ): Promise<InstagramItems> {
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

  async onRequestGetMore (
    ev: IpcMainEvent,
    session: string,
    id: number | undefined,
    feedSession: string
  ): Promise<InstagramItems | undefined> {
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

  async onRequestFollowingFeed (
    ev: IpcMainEvent,
    userId: number
  ): Promise<InstagramItems> {
    const client = this.getClient()
    const followingFeed = client.feed.accountFollowing(userId)
    const items = await followingFeed.items()
    return {
      items,
      feed: followingFeed.serialize()
    }
  }

  async onRequestGetMoreFollowingFeed (
    ev: IpcMainEvent,
    session: string,
    userId: number,
    feedSession: string
  ): Promise<InstagramItems | undefined> {
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
}

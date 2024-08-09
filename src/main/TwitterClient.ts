import { type IpcMain, type IpcMainEvent } from 'electron'
import * as Twitter from 'twitter'
import { IPC } from '../renderer/data/const'

export interface TwitterItems {
  images: string[]
  lastID: number
}

export interface TwitterFollowers {
  following: string[]
  cursor: any
}

export default class TwitterClient {
  twitter: any

  initializeIpcEvents (ipcMain: IpcMain) {
    ipcMain.handle(IPC.twitterLoadImages, this.onRequestTwitterLoadImages)
    ipcMain.handle(IPC.twitterFriendsList, this.onRequestTwitterFriendsList)
  }

  releaseIpcEvents (ipcMain: IpcMain) {
    ipcMain.removeAllListeners(IPC.twitterLoadImages)
    ipcMain.removeAllListeners(IPC.twitterFriendsList)
  }

  getClient (
    consumerKey: string,
    consumerSecret: string,
    accessTokenKey: string,
    accessTokenSecret: string
  ) {
    if (!this.twitter) {
      this.twitter = new Twitter({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        access_token_key: accessTokenKey,
        access_token_secret: accessTokenSecret
      })
    }

    return this.twitter
  }

  async onRequestTwitterLoadImages (
    ev: IpcMainEvent,
    consumerKey: string,
    consumerSecret: string,
    accessTokenKey: string,
    accessTokenSecret: string,
    screenName: string,
    excludeReplies: boolean,
    includeRetweets: boolean,
    maxId: number
  ): Promise<TwitterItems> {
    const options = {
      screen_name: screenName,
      count: 200,
      exclude_replies: excludeReplies,
      include_rts: includeRetweets,
      tweet_mode: 'extended',
      max_id: maxId > 0 ? maxId : undefined
    }

    const client = this.getClient(
      consumerKey,
      consumerSecret,
      accessTokenKey,
      accessTokenSecret
    )
    const tweets = await client.get('statuses/user_timeline', options)
    let images = Array<string>()
    let lastID = -1
    for (const t of tweets) {
      // Skip FanCentro/OnlyFans/ClipTeez posts
      if (
        /href="https?:\/\/(fancentro\.com|onlyfans\.com|mykink\.xxx)\/?"/.exec(
          t.source
        ) != null
      ) {
        continue
      }
      if (t.extended_entities?.media) {
        for (const m of t.extended_entities.media) {
          let url
          if (m.video_info) {
            url = m.video_info.variants[0].url
          } else {
            url = m.media_url
          }
          if (url.includes('?')) {
            url = url.substring(0, url.lastIndexOf('?'))
          }
          images.push(url)
        }
      } else if (t.entities.media) {
        for (const m of t.entities.media) {
          images.push(m.media_url)
        }
      }
      lastID = t.id
    }
    if (lastID === maxId) {
      images = []
    }

    return { images, lastID }
  }

  async onRequestTwitterFriendsList (
    ev: IpcMainEvent,
    consumerKey: string,
    consumerSecret: string,
    accessTokenKey: string,
    accessTokenSecret: string,
    cursor: number | undefined
  ): Promise<TwitterFollowers> {
    const client = this.getClient(
      consumerKey,
      consumerSecret,
      accessTokenKey,
      accessTokenSecret
    )
    const options = { count: 200, cursor }
    const data = await client.get('friends/list', options)

    // Get the next 200 users
    const following = []
    for (const user of data.users) {
      const userURL = 'https://twitter.com/' + user.screen_name
      following.push(userURL)
    }

    return {
      following,
      cursor: data.next_cursor
    }
  }
}

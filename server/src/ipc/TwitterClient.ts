import Twitter from 'twitter'
import { type TwitterItems, type TwitterFollowers } from 'flipflip-common'

export default class TwitterClient {
  twitter: Twitter | undefined

  initializeIpcEvents (): void {
    // ipcMain.handle(IPC.twitterLoadImages, this.onRequestTwitterLoadImages)
    // ipcMain.handle(IPC.twitterFriendsList, this.onRequestTwitterFriendsList)
  }

  getClient (
    consumerKey: string,
    consumerSecret: string,
    accessTokenKey: string,
    accessTokenSecret: string
  ): Twitter {
    if (this.twitter == null) {
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
    const data = await client.get('statuses/user_timeline', options)
    let images = Array<string>()
    let lastID = -1
    for (const t of data.tweets) {
      // Skip FanCentro/OnlyFans/ClipTeez posts
      if (
        /href="https?:\/\/(fancentro\.com|onlyfans\.com|mykink\.xxx)\/?"/.exec(
          t.source
        ) != null
      ) {
        continue
      }
      if (t.extended_entities?.media != null) {
        for (const m of t.extended_entities.media) {
          let url: string
          if (m.video_info != null) {
            url = m.video_info.variants[0].url
          } else {
            url = m.media_url
          }
          if (url.includes('?')) {
            url = url.substring(0, url.lastIndexOf('?'))
          }
          images.push(url)
        }
      } else if (t.entities.media != null) {
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

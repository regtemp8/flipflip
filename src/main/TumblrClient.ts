import { type IpcMain, type IpcMainEvent } from 'electron'
import tumblr, { type Client } from 'tumblr.js'
import { IPC } from '../renderer/data/const'

export default class TumblrClient {
  client: Client

  initializeIpcEvents (ipcMain: IpcMain) {
    ipcMain.handle(IPC.tumblrBlogPosts, this.onRequestTumblrBlogPosts)
    ipcMain.handle(IPC.tumblrTotalBlogs, this.onRequestTumblrTotalBlogs)
    ipcMain.handle(IPC.tumblrBlogs, this.onRequestTumblrBlogs)
  }

  releaseIpcEvents (ipcMain: IpcMain) {
    ipcMain.removeAllListeners(IPC.tumblrBlogPosts)
    ipcMain.removeAllListeners(IPC.tumblrTotalBlogs)
    ipcMain.removeAllListeners(IPC.tumblrBlogs)
  }

  getClient (
    consumerKey: string,
    consumerSecret: string,
    token: string,
    tokenSecret: string
  ): Client {
    if (!this.client) {
      this.client = tumblr.createClient({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        token,
        token_secret: tokenSecret
      })
    }

    return this.client
  }

  onRequestTumblrBlogPosts (
    ev: IpcMainEvent,
    consumerKey: string,
    consumerSecret: string,
    token: string,
    tokenSecret: string,
    blogID: string,
    offset: number
  ): Promise<void | any[]> {
    return this.getClient(consumerKey, consumerSecret, token, tokenSecret).blogPosts(blogID, { offset }).then((data: any) => {
      const images = []
      for (const post of data.posts) {
        // Sometimes photos are listed separately
        if (post.photos) {
          for (const photo of post.photos) {
            images.push(photo.original_size.url)
          }
        }
        if (post.player) {
          for (const embed of post.player) {
            const regex =
              /<iframe[^(?:src|\/>)]*src=["']([^"']*)[^(?:\/>)]*\/?>/g
            let imageSource
            while ((imageSource = regex.exec(embed.embed_code)) !== null) {
              images.push(imageSource[1])
            }
          }
        }
        if (post.body) {
          const regex = /<img[^(?:src|\/>)]*src=["']([^"']*)[^>]*>/g
          let imageSource
          while ((imageSource = regex.exec(post.body)) !== null) {
            images.push(imageSource[1])
          }
          const regex2 = /<source[^(?:src|\/>)]*src=["']([^"']*)[^>]*>/g
          while ((imageSource = regex2.exec(post.body)) !== null) {
            images.push(imageSource[1])
          }
        }
        if (post.video_url) {
          images.push(post.video_url)
        }
      }
      
      return images
    })
  }

  onRequestTumblrTotalBlogs (
    ev: IpcMainEvent,
    consumerKey: string,
    consumerSecret: string,
    token: string,
    tokenSecret: string
  ): Promise<any> {
    const client = this.getClient(
      consumerKey,
      consumerSecret,
      token,
      tokenSecret
    )
    return client.userFollowing({ limit: 0 }).then((data: any) => data.total_blogs)
  }

  onRequestTumblrBlogs (
    ev: IpcMainEvent,
    consumerKey: string,
    consumerSecret: string,
    token: string,
    tokenSecret: string,
    offset: number
  ): Promise<any[]> {
    const client = this.getClient(
      consumerKey,
      consumerSecret,
      token,
      tokenSecret
    )
    return client.userFollowing({ offset }).then((data: any) => {
      const following = []
      for (const blog of data.blogs) {
        const blogURL = 'http://' + blog.name + '.tumblr.com/'
        following.push(blogURL)
      }

      return following
    })
  }
}

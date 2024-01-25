import { type Client, createClient } from 'tumblr.js'

export default class TumblrClient {
  client: Client | undefined

  initializeIpcEvents(): void {
    // ipcMain.handle(IPC.tumblrBlogPosts, this.onRequestTumblrBlogPosts)
    // ipcMain.handle(IPC.tumblrTotalBlogs, this.onRequestTumblrTotalBlogs)
    // ipcMain.handle(IPC.tumblrBlogs, this.onRequestTumblrBlogs)
  }

  getClient(
    consumerKey: string,
    consumerSecret: string,
    token: string,
    tokenSecret: string
  ): Client {
    if (this.client == null) {
      this.client = createClient({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        token,
        token_secret: tokenSecret
      })
    }

    return this.client
  }

  async onRequestTumblrBlogPosts(
    consumerKey: string,
    consumerSecret: string,
    token: string,
    tokenSecret: string,
    blogID: string,
    offset: number
  ): Promise<unknown[]> {
    return await this.getClient(consumerKey, consumerSecret, token, tokenSecret)
      .blogPosts(blogID, { offset })
      .then((data) => {
        const images = []
        for (const post of data.posts) {
          // Sometimes photos are listed separately
          if (post.photos != null) {
            for (const photo of post.photos) {
              images.push(photo.original_size.url)
            }
          }
          if (post.player != null) {
            for (const embed of post.player) {
              const regex =
                /<iframe[^(?:src|/>)]*src=["']([^"']*)[^(?:/>)]*\/?>/g
              let imageSource
              while ((imageSource = regex.exec(embed.embed_code)) !== null) {
                images.push(imageSource[1])
              }
            }
          }
          if (post.body != null) {
            const regex = /<img[^(?:src|/>)]*src=["']([^"']*)[^>]*>/g
            let imageSource
            while ((imageSource = regex.exec(post.body)) != null) {
              images.push(imageSource[1])
            }
            const regex2 = /<source[^(?:src|/>)]*src=["']([^"']*)[^>]*>/g
            while ((imageSource = regex2.exec(post.body)) != null) {
              images.push(imageSource[1])
            }
          }
          if (post.video_url != null) {
            images.push(post.video_url)
          }
        }

        return images
      })
  }

  async onRequestTumblrTotalBlogs(
    consumerKey: string,
    consumerSecret: string,
    token: string,
    tokenSecret: string
  ): Promise<unknown[]> {
    const client = this.getClient(
      consumerKey,
      consumerSecret,
      token,
      tokenSecret
    )
    return await client
      .userFollowing({ limit: 0 })
      .then((data) => [data.total_blogs])
  }

  async onRequestTumblrBlogs(
    consumerKey: string,
    consumerSecret: string,
    token: string,
    tokenSecret: string,
    offset: number
  ): Promise<unknown[]> {
    const client = this.getClient(
      consumerKey,
      consumerSecret,
      token,
      tokenSecret
    )
    return await client.userFollowing({ offset }).then((data) => {
      const following = []
      for (const blog of data.blogs) {
        const blogURL = 'http://' + blog.name + '.tumblr.com/'
        following.push(blogURL)
      }

      return following
    })
  }
}

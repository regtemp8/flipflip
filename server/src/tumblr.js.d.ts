declare module 'tumblr.js' {
  export interface EmbeddedPlayer {
    embed_code: string
  }
  export interface Photo {
    original_size: {url: string}
  }
  export interface BlogPost {
    photos: Photo[]
    body: string
    video_url: string
    player: EmbeddedPlayer[]
  }
  export interface BlogPosts {
    posts: BlogPost[]
  }
  export interface Blog {
    name: string
  }
  export interface UserFollowing {
    total_blogs: number
    blogs: Blog[]
  }
  export function createClient(options: Record<string, unknown>): Client
  export class Client {
    blogPosts(blogID: string, options: Record<string, unknown>): Promise<BlogPosts>
    userFollowing(options: Record<string, unknown>): Promise<UserFollowing>
  }
}

declare module 'tumblr.js' {
  export function createClient(options: Record<string, unknown>): Client
  export class Client {
    blogPosts(blogID: string, options: Record<string, unknown>): Promise<any[]>
    userFollowing(options: Record<string, unknown>): Promise<any[]>
  }
}

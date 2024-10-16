export type RemoteSettings = {
  tumblrKey: string
  tumblrSecret: string
  tumblrOAuthToken: string
  tumblrOAuthTokenSecret: string
  silenceTumblrAlert: boolean

  redditUserAgent: string
  redditClientID: string
  redditDeviceID: string
  redditRefreshToken: string

  twitterConsumerKey: string
  twitterConsumerSecret: string
  twitterAccessTokenKey: string
  twitterAccessTokenSecret: string

  instagramUsername: string
  instagramPassword: string

  hydrusProtocol: string
  hydrusDomain: string
  hydrusPort: string
  hydrusAPIKey: string

  piwigoProtocol: string
  piwigoHost: string
  piwigoUsername: string
  piwigoPassword: string
}
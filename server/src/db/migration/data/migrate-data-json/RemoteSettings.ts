export type RemoteSettings = {
  [key: string]: boolean | string | string[]

  tumblrKeys: string[]
  tumblrSecrets: string[]

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

export const initialRemoteSettings: RemoteSettings = {
  tumblrKeys: [],
  tumblrSecrets: [],

  tumblrKey: '',
  tumblrSecret: '',
  tumblrOAuthToken: '',
  tumblrOAuthTokenSecret: '',
  silenceTumblrAlert: false,

  redditUserAgent: '',
  redditClientID: '',
  redditDeviceID: '',
  redditRefreshToken: '',

  twitterConsumerKey: '',
  twitterConsumerSecret: '',
  twitterAccessTokenKey: '',
  twitterAccessTokenSecret: '',

  instagramUsername: '',
  instagramPassword: '',

  hydrusProtocol: 'http',
  hydrusDomain: 'localhost',
  hydrusPort: '45869',
  hydrusAPIKey: '',

  piwigoProtocol: 'http',
  piwigoHost: '',
  piwigoUsername: '',
  piwigoPassword: ''
}

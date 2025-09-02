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

  redditUserAgent: 'desktop:flipflip:v2.0.0 (by /u/ififfy)',
  redditClientID: '2Iqe-1CsO4VQlA',
  redditDeviceID: '',
  redditRefreshToken: '',

  twitterConsumerKey: 'qSRfdIWfpkesYDVJHrRh05wji',
  twitterConsumerSecret: 'ad11IC4CLwVzYyGyYwHKVMP9WwAcKxymw4D9162S5Ex75l5eWw',
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

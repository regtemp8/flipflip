export default interface RemoteSettings {
  [key: string]: string | string[] | boolean

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
  tumblrKeys: [
    'BaQquvlxQeRhKRyViknF98vseIdcBEyDrzJBpHxvAiMPHCKR2l',
    'G4iZd6FBiyDxHVUpNqtOTDu4woWzfp8WuH3tTrT3MC16GTmNzq',
    'y5uUQJYTCp15Nj3P80cLmNFqwSr1mxIhm3C4PCsGAfReydkF9m',
    'IZiOt6PYazf4g0sYWVfpfebMITRFWmtlKq2UKe6l0RsqKHPgui',
    'ATtwOUlruyVl8bEiHTnYcRpByEAzov2LtLEWOfDLqhPRZFmT4X'
  ],
  tumblrSecrets: [
    'XWVCo7t0GMGkOAd9wsxMMkKPhQbl3RqauGzQtnzAnmHCJ7WdSn',
    'RmoWUh844NqVdw7btWI6EYldJ91KhwJyfCKPtAIcuVokFtRYgS',
    'xiEV5sJISJAwegJHTTLWtxnmFUkowxgMk2gOq4mc20VNLM2TpJ',
    'Iw3yKgjfMvrKPNCcqdUyRuxCkYWYyRlrMdFUojRHVkSSADOKCT',
    'cMM7xqJV1roUudEdBiZeOqv3n1H0pzNnGY1iAbp3oo3c29MXGq'
  ],

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

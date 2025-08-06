import {
  CacheSettings,
  ContentSource,
  RemoteSettings,
  ScraperHelpers
} from 'flipflip-common'

export type ScrapeRequest = {
  allURLs: Record<string, string[]>
  allPosts: Record<string, string>
  caching: CacheSettings
  remoteSettings: RemoteSettings
  source: ContentSource
  filter: string
  weight: string
  helpers: ScraperHelpers
}

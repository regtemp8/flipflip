import { copy } from '../../renderer/data/utils'

export default interface LibrarySource {
  [key: string]: number | number[] | string | string[] | boolean | Date

  id: number
  url?: string
  offline: boolean
  marked: boolean
  lastCheck: number
  tags: number[] // Array of Tag IDs
  clips: number[] // Array of Clip IDs
  disabledClips: number[] // Array of Clip IDs
  blacklist: string[]
  count: number
  countComplete: boolean
  weight: number

  // Type specific properties
  // Local
  dirOfSources: boolean
  // Video
  subtitleFile?: string
  duration?: number
  resolution?: number
  // Reddit
  redditFunc?: string
  redditTime?: string
  // Twitter
  includeRetweets: boolean
  includeReplies: boolean
}

const initialLibrarySource: LibrarySource = {
  id: 0,
  offline: false,
  marked: false,
  lastCheck: null,
  tags: [],
  clips: [],
  disabledClips: [],
  blacklist: [],
  count: 0,
  countComplete: false,
  weight: 1,
  dirOfSources: false,
  includeRetweets: false,
  includeReplies: false
}

export function newLibrarySource (init?: Partial<LibrarySource>) {
  return Object.assign(copy<LibrarySource>(initialLibrarySource), init)
}

import type Tag from './Tag'
import type Clip from './Clip'
import { copy } from '../renderer/data/utils'

export default interface LibrarySource {
  id: number
  url?: string
  offline: boolean
  marked: boolean
  lastCheck: string
  tags: Tag[]
  clips: Clip[]
  disabledClips: number[]
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

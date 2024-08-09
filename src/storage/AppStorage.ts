import type Config from './Config'
import { initialConfig } from './Config'
import type SceneGroup from './SceneGroup'
import type Scene from './Scene'
import type SceneGrid from './SceneGrid'
import type LibrarySource from './LibrarySource'
import type Audio from './Audio'
import type CaptionScript from './CaptionScript'
import type Playlist from './Playlist'
import type Tag from './Tag'
import type Route from './Route'
import defaultTheme from '../renderer/data/theme'
import { copy } from '../renderer/data/utils'

export default interface AppStorage {
  version: string
  config: Config
  sceneGroups: SceneGroup[]
  scenes: Scene[]
  grids: SceneGrid[]
  library: LibrarySource[]
  audios: Audio[]
  scripts: CaptionScript[]
  playlists: Playlist[]
  tags: Tag[]
  route: Route[]
  specialMode?: string
  openTab: number
  displayedSources: LibrarySource[]
  libraryYOffset: number
  libraryFilters: string[]
  librarySelected: string[]
  audioOpenTab: number
  audioYOffset: number
  audioFilters: string[]
  audioSelected: string[]
  scriptYOffset: number
  scriptFilters: string[]
  scriptSelected: string[]
  progressMode?: string
  progressTitle?: string
  progressCurrent: number
  progressTotal: number
  progressNext?: string
  systemMessage?: string
  systemSnackOpen: boolean
  systemSnack?: string
  systemSnackSeverity?: string
  tutorial?: string
  theme: any
}

export const initialAppStorage: AppStorage = {
  version: '',
  config: initialConfig,
  sceneGroups: [],
  scenes: [],
  grids: [],
  library: [],
  audios: [],
  scripts: [],
  playlists: [],
  tags: [],
  route: [],
  openTab: 0,
  displayedSources: [],
  libraryYOffset: 0,
  libraryFilters: [],
  librarySelected: [],
  audioOpenTab: 3,
  audioYOffset: 0,
  audioFilters: [],
  audioSelected: [],
  scriptYOffset: 0,
  scriptFilters: [],
  scriptSelected: [],
  progressCurrent: 0,
  progressTotal: 0,
  systemSnackOpen: false,
  theme: defaultTheme
}

export function newAppStorage (init?: Partial<AppStorage>) {
  return Object.assign(copy<AppStorage>(initialAppStorage), init)
}

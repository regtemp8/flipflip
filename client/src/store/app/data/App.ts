import { defaultTheme, copy } from 'flipflip-common'
import type Config from './Config'
import { initialConfig } from './Config'
import type Route from './Route'
import { ThemeOptions } from '@mui/material'

export default interface App {
  version: string
  config: Config
  sceneGroups: number[] // Array of SceneGroup IDs
  scenes: number[] // Array of Scene IDs
  displays: number[] // Array of Display IDs
  library: number[] // Array of LibrarySource IDs
  audios: number[] // Array of Audio IDs
  scripts: number[] // Array of CaptionScript IDs
  playlists: number[] // Array of Playlist IDs
  tags: number[] // Array of Tag IDs
  route: Route[]
  specialMode?: string
  openTab: number
  displayedSources: number[] // Array of LibrarySource IDs
  libraryYOffset: number
  libraryFilters: string[]
  librarySelected: number[]
  audioOpenTab: number
  audioYOffset: number
  audioFilters: string[]
  audioSelected: number[]
  scriptYOffset: number
  scriptFilters: string[]
  scriptSelected: number[]
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
  theme: ThemeOptions
}

export const initialApp: App = {
  version: '',
  config: initialConfig,
  sceneGroups: [],
  scenes: [],
  displays: [],
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
  theme: defaultTheme as ThemeOptions
}

export function newApp(init?: Partial<App>) {
  return Object.assign(copy<App>(initialApp), init)
}

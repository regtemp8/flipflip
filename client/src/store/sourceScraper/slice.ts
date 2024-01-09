import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { LibrarySource } from 'flipflip-common'
import { EntryUpdate } from '../EntryState'

export interface ScrapedSourcePromiseHelpers {
  next: any
  count: number
  retries: number
  uuid: string
}

export interface ScrapedSourcePromise {
  source: LibrarySource
  helpers: ScrapedSourcePromiseHelpers
}

export interface ScraperProgress {
  total: number
  current: number
  message: string[]
}

export interface ScrapedSources {
  sceneSources: LibrarySource[]
  allURLs?: Record<string, string[]>
  allPosts: Record<string, string>
  promiseQueue: Array<ScrapedSourcePromise>
  workerUUID: string
  completed: boolean
  progress?: ScraperProgress
}

export const initialSourceScraperState: Record<number, ScrapedSources> = {}

export const sourceScraperSlice = createSlice({
  name: 'sourceScraper',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialSourceScraperState,
  reducers: {
    setSourceScraperState: (
      state,
      action: PayloadAction<Record<number, ScrapedSources>>
    ) => {
      Object.assign(state, action.payload)
    },
    setSourceScraperSources: (
      state,
      action: PayloadAction<EntryUpdate<ScrapedSources>>
    ) => {
      console.log(action.payload.value)
      state[action.payload.id] = action.payload.value
    },
    setSourceScraperSourcesWorker: (
      state,
      action: PayloadAction<EntryUpdate<string>>
    ) => {
      state[action.payload.id].workerUUID = action.payload.value
    },
    setSourceScraperShiftPromiseQueue: (
      state,
      action: PayloadAction<number>
    ) => {
      state[action.payload].promiseQueue.shift()
    },
    setSourceScraperSceneSources: (
      state,
      action: PayloadAction<EntryUpdate<LibrarySource[]>>
    ) => {
      const scraper = state[action.payload.id]
      scraper.sceneSources = action.payload.value
      scraper.progress = {
        total: scraper.sceneSources.length,
        current: 0,
        message: []
      }
    },
    setSourceScraperShiftSceneSources: (
      state,
      action: PayloadAction<number>
    ) => {
      state[action.payload].sceneSources.splice(0, 1)
    },
    setSourceScraperProgress: (
      state,
      action: PayloadAction<EntryUpdate<ScraperProgress>>
    ) => {
      state[action.payload.id].progress = action.payload.value
    }
  }
})

export const {
  setSourceScraperState,
  setSourceScraperSources,
  setSourceScraperSourcesWorker,
  setSourceScraperShiftPromiseQueue,
  setSourceScraperProgress,
  setSourceScraperSceneSources,
  setSourceScraperShiftSceneSources
} = sourceScraperSlice.actions

export default sourceScraperSlice.reducer

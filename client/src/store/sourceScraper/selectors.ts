import { RootState } from '../store'
import { ScrapedSources } from './slice'

export const selectSourceScraperAllURLs = (sceneID?: number) => {
  return (state: RootState) =>
    sceneID != null ? state.sourceScraper[sceneID]?.allURLs : undefined
}

export const selectSourceScraperAllPosts = (sceneID?: number) => {
  return (state: RootState) =>
    sceneID != null ? state.sourceScraper[sceneID]?.allPosts : undefined
}

export const isCompleted = (scraper: ScrapedSources) => {
  const progress = scraper?.progress
  return progress != null && progress.total === progress.current
}

export const selectSourceScraperSingleImage = (sceneID: number) => {
  return (state: RootState) => {
    const scraper = state.sourceScraper[sceneID]
    if (!isCompleted(scraper)) {
      return false
    }

    const allURLs = scraper.allURLs ?? {}
    const urlKeys = Object.keys(allURLs)
    return urlKeys.length === 1 && allURLs[urlKeys[0]].length === 1
  }
}

export const selectSourceScraperProgress = (sceneID: number) => {
  return (state: RootState) => {
    return state.sourceScraper[sceneID].progress
  }
}

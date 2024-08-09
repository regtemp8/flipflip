import { RootState } from '../store'
import { ScrapedSources } from './slice'

export const selectSourceScraperAllURLs = (sceneID: number) => {
  return (state: RootState) => state.sourceScraper[sceneID]?.allURLs
}

export const selectSourceScraperAllPosts = (sceneID: number) => {
  return (state: RootState) => state.sourceScraper[sceneID]?.allPosts
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
    const urlKeys = Object.keys(scraper.allURLs)
    return urlKeys.length === 1 && scraper.allURLs[urlKeys[0]].length === 1
  }
}

export const selectSourceScraperProgress = (sceneID: number) => {
  return (state: RootState) => {
    return state.sourceScraper[sceneID].progress
  }
}

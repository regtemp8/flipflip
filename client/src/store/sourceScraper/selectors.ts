import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { ScrapedSources, ScraperProgress } from './slice'
import { selectDisplayViews } from '../display/selectors'
import { getDisplayViewEntries } from '../displayView/selectors'
import { getPlayerEntries } from '../player/selectors'
import { getSceneEntries } from '../scene/selectors'

export const getSourceScraperEntries = (
  state: RootState
): Record<number, ScrapedSources> => state.sourceScraper

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

export const selectSourceScraperProgress = (displayID: number) => {
  return createSelector(
    [
      selectDisplayViews(displayID),
      getDisplayViewEntries,
      getPlayerEntries,
      getSourceScraperEntries,
      getSceneEntries
    ],
    (views, viewEntries, playerEntries, sourceScraperEntries, sceneEntries) => {
      const totalProgress: ScraperProgress = {
        current: 0,
        total: 0,
        message: []
      }

      views
        .filter((viewID) => {
          const view = viewEntries[viewID]
          return view.visible && !view.sync
        })
        .map((viewID) => viewEntries[viewID].playerUUID)
        .filter((playerUUID) => playerUUID != null)
        .map((playerUUID) => {
          const { playlist } = playerEntries[playerUUID as string]
          return playlist.items[0].sceneID
        })
        .filter((sceneID, index, array) => array.indexOf(sceneID) === index) // unique scene ids
        .forEach((sceneID) => {
          let total = sceneEntries[sceneID].sources.length
          const { progress } = sourceScraperEntries[sceneID]
          if (progress != null) {
            total = progress.total
            totalProgress.current += progress.current
            totalProgress.message.push(...progress.message)
          }

          totalProgress.total += total
        })

      return totalProgress
    }
  )
}

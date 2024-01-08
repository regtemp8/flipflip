import { getScene } from '../scene/selectors'
import { type RootState } from '../store'
import { getSourceType } from '../../renderer/components/player/Scrapers'
import { ST } from '../../renderer/data/const'
import en from '../../renderer/data/en'
import { getTimestampValue } from '../../renderer/data/utils'
import { createSelector } from '@reduxjs/toolkit'
import { selectSceneLibrarySources } from '../librarySource/selectors'
import { getTagEntries } from '../tag/selectors'

export const selectSceneDetailFilters = () => {
  return (state: RootState) => state.sceneDetail.filters
}

export const selectSceneDetailDisplaySources = (sceneID: number) => {
  return createSelector(
    [
      selectSceneLibrarySources(sceneID), 
      selectSceneDetailFilters(), 
      getTagEntries
    ], 
    (sources, filters, tagEntries) => {
      if (!filters || filters.length === 0) {
        return sources.map((s) => s.id) ?? []
      }
  
      const displaySources: number[] = []
      for (const source of sources) {
        let matchesFilter = true
        let countRegex
        for (let filter of filters) {
          if (filter === '<Offline>') {
            // This is offline filter
            matchesFilter = source.offline
          } else if (filter === '<Marked>') {
            // This is a marked filter
            matchesFilter = source.marked
          } else if (filter === '<Untagged>') {
            // This is untagged filter
            matchesFilter = source.tags.length === 0
          } else if (filter === '<Unclipped>') {
            matchesFilter =
              getSourceType(source.url) === ST.video && source.clips.length === 0
          } else if (
            (filter.startsWith('[') || filter.startsWith('-[')) &&
            filter.endsWith(']')
          ) {
            // This is a tag filter
            if (filter.startsWith('-')) {
              const tag = filter.substring(2, filter.length - 1)
              matchesFilter =
                source.tags
                  .map((id) => tagEntries[id])
                  .find((t) => t.name === tag) == null
            } else {
              const tag = filter.substring(1, filter.length - 1)
              matchesFilter =
                source.tags
                  .map((id) => tagEntries[id])
                  .find((t) => t.name === tag) != null
            }
          } else if (
            (filter.startsWith('{') || filter.startsWith('-{')) &&
            filter.endsWith('}')
          ) {
            // This is a type filter
            if (filter.startsWith('-')) {
              const type = filter.substring(2, filter.length - 1)
              matchesFilter = en.get(getSourceType(source.url)) !== type
            } else {
              const type = filter.substring(1, filter.length - 1)
              matchesFilter = en.get(getSourceType(source.url)) === type
            }
          } else if (
            (countRegex = /^count(\+?)([>=<])(\d*)$/.exec(filter)) != null
          ) {
            const all = countRegex[1] === '+'
            const symbol = countRegex[2]
            const value = parseInt(countRegex[3])
            const type = getSourceType(source.url)
            const count = type === ST.video ? source.clips.length : source.count
            const countComplete = type === ST.video ? true : source.countComplete
            switch (symbol) {
              case '=':
                matchesFilter = (all || countComplete) && count === value
                break
              case '>':
                matchesFilter = (all || countComplete) && count > value
                break
              case '<':
                matchesFilter = (all || countComplete) && count < value
                break
            }
          } else if (
            (countRegex = /^duration([>=<])([\d:]*)$/.exec(filter)) != null
          ) {
            const symbol = countRegex[1]
            let value
            if (countRegex[2].includes(':')) {
              value = getTimestampValue(countRegex[2])
            } else {
              value = parseInt(countRegex[2])
            }
            const type = getSourceType(source.url)
            if (type === ST.video) {
              if (source.duration == null) {
                matchesFilter = false
              } else {
                switch (symbol) {
                  case '=':
                    matchesFilter = Math.floor(source.duration) === value
                    break
                  case '>':
                    matchesFilter = Math.floor(source.duration) > value
                    break
                  case '<':
                    matchesFilter = Math.floor(source.duration) < value
                    break
                }
              }
            } else {
              matchesFilter = false
            }
          } else if (
            (countRegex = /^resolution([>=<])(\d*)p?$/.exec(filter)) != null
          ) {
            const symbol = countRegex[1]
            const value = parseInt(countRegex[2])
  
            const type = getSourceType(source.url)
            if (type === ST.video) {
              if (source.resolution == null) {
                matchesFilter = false
              } else {
                switch (symbol) {
                  case '=':
                    matchesFilter = source.resolution === value
                    break
                  case '>':
                    matchesFilter = source.resolution > value
                    break
                  case '<':
                    matchesFilter = source.resolution < value
                    break
                }
              }
            } else {
              matchesFilter = false
            }
          } else if (
            ((filter.startsWith('"') || filter.startsWith('-"')) &&
              filter.endsWith('"')) ||
            ((filter.startsWith("'") || filter.startsWith("-'")) &&
              filter.endsWith("'"))
          ) {
            if (filter.startsWith('-')) {
              filter = filter.substring(2, filter.length - 1)
              const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
              matchesFilter = !regex.test(source.url)
            } else {
              filter = filter.substring(1, filter.length - 1)
              const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
              matchesFilter = regex.test(source.url)
            }
          } else {
            // This is a search filter
            filter = filter.replace('\\', '\\\\')
            if (filter.startsWith('-')) {
              filter = filter.substring(1, filter.length)
              const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
              matchesFilter = !regex.test(source.url)
            } else {
              const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
              matchesFilter = regex.test(source.url)
            }
          }
          if (!matchesFilter) break
        }
        if (matchesFilter) {
          displaySources.push(source.id)
        }
      }
  
      return displaySources
    }
  )
}

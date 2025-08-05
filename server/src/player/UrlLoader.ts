import { ContentSource, OF, Scene, SOF, WF } from 'flipflip-common'
import sourceScrapers from '../scraper/SourceScraperService'
import { flatten, getRandomIndex, getRandomListItem } from '../utils'

interface URLState {
  nextIndex: number
  nextSourceIndex: Record<string, number>
  sourceComplete: boolean
  loadedSources: string[]
  loadedURLs: string[]
}

export default class UrlLoader {
  private readonly scene: Scene
  private readonly sources: ContentSource[]
  private urlState: URLState

  constructor(scene: Scene, sources: ContentSource[]) {
    this.scene = scene
    this.sources = sources
    this.urlState = {
      nextIndex: 0,
      nextSourceIndex: {},
      sourceComplete: false,
      loadedSources: [],
      loadedURLs: []
    }
  }

  public getURL(): string | undefined {
    const allURLs = sourceScrapers().getUrls(this.scene.id as number)
    if (allURLs == null) {
      return undefined
    }

    const { weightFunction, orderFunction, fullSource, forceAll } = this.scene

    const url =
      weightFunction === WF.sources
        ? this.getSourceWeightedUrl(allURLs)
        : this.getImageWeightedUrl(allURLs)

    if (
      url != null &&
      orderFunction === OF.random &&
      (forceAll || (weightFunction === WF.sources && fullSource))
    ) {
      this.urlState.loadedURLs.push(url)
    }

    return url
  }

  private getSourceWeightedUrl(allURLs: Record<string, string[]>) {
    let source: string
    let keys: string[]
    let collection: string[]
    let url: string
    const {
      useWeights,
      orderFunction,
      sourceOrderFunction,
      fullSource,
      forceAll,
      forceAllSource
    } = this.scene

    if (useWeights) {
      const validKeys = Object.keys(allURLs)
      keys = []
      for (const source of this.sources) {
        if (validKeys.includes(source.url as string)) {
          for (let w = source.weight; w > 0; w--) {
            keys.push(source.url as string)
          }
        }
      }
    } else {
      keys = Object.keys(allURLs)
    }

    // If sorting randomly, get a random source
    if (sourceOrderFunction === SOF.random) {
      // If we're playing full sources
      if (fullSource) {
        // If this is the first loop or source is done get next source
        if (this.urlState.nextIndex === -1 || this.urlState.sourceComplete) {
          if (forceAllSource) {
            // Filter the available urls to those not played yet
            keys = keys.filter((s) => !this.urlState.loadedSources.includes(s))
            // If there are no remaining urls for this source
            if (keys.length === 0) {
              this.urlState.loadedSources = []
              keys = Object.keys(allURLs)
            }
          }

          this.urlState.nextIndex = getRandomIndex(keys)
          this.urlState.loadedSources.push(keys[this.urlState.nextIndex])
          this.urlState.sourceComplete = false
        }

        source = keys[this.urlState.nextIndex]
      } else {
        source = getRandomListItem(keys)
        this.urlState.loadedSources.push(source)
      }
    } else {
      // Else get the next source
      // If we're playing full sources
      if (fullSource) {
        // If this is the first loop or source is done get next source
        if (this.urlState.nextIndex === -1 || this.urlState.sourceComplete) {
          this.urlState.nextIndex = (this.urlState.nextIndex + 1) % keys.length
          this.urlState.sourceComplete = false
        }

        source = keys[this.urlState.nextIndex]
      } else {
        source = keys[++this.urlState.nextIndex % keys.length]
      }
    }

    // Get the urls from the source
    collection = allURLs[source] ?? []
    if (collection.length === 0) {
      return undefined
    }

    // If sorting randomly and forcing all
    if (orderFunction === OF.random && (forceAll || fullSource)) {
      // Filter the available urls to those not played yet
      collection = collection.filter(
        (u) => !this.urlState.loadedURLs.includes(u)
      )
      // If there are no remaining urls for this source
      if (collection.length === 0) {
        if (fullSource) {
          this.urlState.loadedURLs = []
          this.urlState.sourceComplete = true
          return undefined
        } else {
          // Make sure all the other sources are also extinguished
          const remainingLibrary = flatten(Object.values(allURLs)).filter(
            (u: string) => !this.urlState.loadedURLs.includes(u)
          )
          // If they are, clear loadedURLs
          if (remainingLibrary.length === 0) {
            this.urlState.loadedURLs = []
            collection = allURLs[source] || []
          } else {
            return undefined
          }
        }
      }
    }

    // If sorting randomly, get a random URL
    if (orderFunction === OF.random) {
      url = getRandomListItem(collection)
    } else {
      // Else get the next index for this source
      const index = this.urlState.nextSourceIndex[source] ?? 0
      if (fullSource && index % collection.length === collection.length - 1) {
        this.urlState.sourceComplete = true
      }
      url = collection[index % collection.length]
      this.urlState.nextSourceIndex[source] = index + 1
    }

    return url
  }

  private getImageWeightedUrl(allURLs: Record<string, string[]>) {
    let collection: string[]
    let url: string
    const { orderFunction, forceAll } = this.scene

    // Concat all images together
    const urlKeys = Object.keys(allURLs).filter(
      (key) => allURLs[key].length > 0
    )
    collection = urlKeys
    if (collection.length === 0) {
      return undefined
    }

    // If sorting randomly and forcing all
    if (orderFunction === OF.random && forceAll) {
      // Filter the available ulls to those not played yet
      collection = collection.filter(
        (u: string) => !this.urlState.loadedURLs.includes(u)
      )
      // If there are no remaining urls, clear loadedURLs
      if (collection.length === 0) {
        this.urlState.loadedURLs = []
        collection = urlKeys
      }
    }

    // If sorting randomly, get a random url
    if (orderFunction === OF.random) {
      return getRandomListItem(collection)
    } else {
      // Else get the next index
      return collection[++this.urlState.nextIndex % collection.length]
    }
  }
}

import { ContentSource, OF, Scene, SOF, WF } from 'flipflip-common'
import sourceScrapers from '../scraper/SourceScraperService'
import { flatten, getRandomIndex, getRandomListItem } from '../utils'

interface URLState {
  sourceIndex: number
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
      sourceIndex: -1,
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

  private getSourceKeys(allURLs: Record<string, string[]>) {
    const { useWeights, sourceOrderFunction, forceAllSource } = this.scene
    if (!useWeights) {
      this.sources.forEach((source) => source.weight = 1)
    }

    const validKeys = Object.keys(allURLs)
    let keys: string[] = []
    for (const source of this.sources) {
      if (validKeys.includes(source.url as string)) {
        for (let w = source.weight; w > 0; w--) {
          keys.push(source.url as string)
        }
      }
    }

    if (sourceOrderFunction === SOF.random && forceAllSource) {
      const fullKeys = keys
      // Filter the available urls to those not played yet
      const toRemove = new Map<string, number>()
      this.urlState.loadedSources.forEach((s) => {
        const count = toRemove.get(s) ?? 0
        toRemove.set(s, count + 1)
      })

      keys = []
      for(const key of fullKeys) {
        const count = toRemove.get(key) ?? 0
        if(count > 0) {
          toRemove.set(key, count - 1)
        } else {
          keys.push(key)
        }
      }

      // If there are no remaining urls for this source
      if (keys.length === 0) {
        this.urlState.loadedSources = []
        keys = fullKeys
      }
    }

    return keys
  }

  private getSourceWeightedUrl(allURLs: Record<string, string[]>) {
    const {
      orderFunction,
      sourceOrderFunction,
      fullSource,
      forceAll
    } = this.scene

    const keys = this.getSourceKeys(allURLs)

    let source: string
    // If sorting randomly, get a random source
    if (sourceOrderFunction === SOF.random) {
      // If we're playing full sources
      if (fullSource) {
        // If this is the first loop or source is done get next source
        if (this.urlState.sourceIndex === -1 || this.urlState.sourceComplete) {
          this.urlState.loadedSources.push(keys[this.urlState.sourceIndex])
          this.urlState.sourceIndex = getRandomIndex(keys)
          this.urlState.sourceComplete = false
        }

        source = keys[this.urlState.sourceIndex]
      } else {
        source = getRandomListItem(keys)
        this.urlState.loadedSources.push(source)
      }
    } else {
      // Else get the next source
      // If we're playing full sources
      if (fullSource) {
        // If this is the first loop or source is done get next source
        if (this.urlState.sourceIndex === -1 || this.urlState.sourceComplete) {
          this.urlState.sourceIndex = (this.urlState.sourceIndex + 1) % keys.length
          this.urlState.sourceComplete = false
        }

        source = keys[this.urlState.sourceIndex]
      } else {
        source = keys[++this.urlState.sourceIndex % keys.length]
      }
    }

    // Get the urls from the source
    let collection = allURLs[source] ?? []
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
    let url: string
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
    const { orderFunction, forceAll } = this.scene

    // Concat all images together
    let collection = Object.keys(allURLs).filter(
      (key) => allURLs[key].length > 0
    )
    if (collection.length === 0) {
      return undefined
    }

    // If sorting randomly and forcing all
    if (orderFunction === OF.random && forceAll) {
      const fullCollection = collection
      // Filter the available ulls to those not played yet
      collection = collection.filter(
        (u: string) => !this.urlState.loadedURLs.includes(u)
      )
      // If there are no remaining urls, clear loadedURLs
      if (collection.length === 0) {
        this.urlState.loadedURLs = []
        collection = fullCollection
      }
    }

    // If sorting randomly, get a random url
    if (orderFunction === OF.random) {
      return getRandomListItem(collection)
    } else {
      // Else get the next index
      return collection[++this.urlState.sourceIndex % collection.length]
    }
  }
}

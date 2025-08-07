import { ContentSource, OF, Scene, SOF, WF } from 'flipflip-common'
import sourceScrapers from '../scraper/SourceScraperService'
import { getRandomIndex, getRandomListItem } from '../utils'
import {
  findContentSources,
  findContentSourceTagIds
} from '../db/ContentSourceRepository'
import { User } from '../db/types/generated'
import { toContentSource } from '../db/mappers'

interface SourceState {
  sourceIndex: number
  sourceComplete: boolean
  loadedSources: string[]
  urlState: Record<string, UrlState>
}

interface UrlState {
  urlIndex: number
  loadedUrls: string[]
}

export default abstract class UrlLoader {
  public static async create(scene: Scene, user: User) {
    const sources: ContentSource[] = []
    const sourceRows = await findContentSources(scene.id)
    for (const row of sourceRows) {
      const tags = await findContentSourceTagIds(
        row.id as number,
        user.id as number
      )
      sources.push(toContentSource(row, tags))
    }

    await sourceScrapers().register(scene.id, user)
    return scene.weightFunction === WF.sources
      ? new SourceWeightedUrlLoader(scene, sources)
      : new ImageWeightedUrlLoader(scene, sources)
  }

  protected readonly scene: Scene
  protected readonly sources: ContentSource[]

  protected constructor(scene: Scene, sources: ContentSource[]) {
    this.scene = scene
    this.sources = sources
  }

  public abstract getUrl(canScrape: boolean): Promise<string | undefined>
}

class SourceWeightedUrlLoader extends UrlLoader {
  private state: SourceState

  constructor(scene: Scene, sources: ContentSource[]) {
    super(scene, sources)
    this.state = {
      sourceIndex: -1,
      sourceComplete: false,
      loadedSources: [],
      urlState: {}
    }
  }

  public async getUrl(canScrape: boolean) {
    const {
      orderFunction,
      sourceOrderFunction,
      fullSource,
      forceAll,
      weightFunction
    } = this.scene

    const keys = this.getSourceKeys()

    let source: string
    // If sorting randomly, get a random source
    if (sourceOrderFunction === SOF.random) {
      // If we're playing full sources
      if (fullSource) {
        // If this is the first loop or source is done get next source
        if (this.state.sourceIndex === -1 || this.state.sourceComplete) {
          this.state.loadedSources.push(keys[this.state.sourceIndex])
          this.state.sourceIndex = getRandomIndex(keys)
          this.state.sourceComplete = false
        }

        source = keys[this.state.sourceIndex]
      } else {
        source = getRandomListItem(keys)
        this.state.loadedSources.push(source)
      }
    } else {
      // Else get the next source
      // If we're playing full sources
      if (fullSource) {
        // If this is the first loop or source is done get next source
        if (this.state.sourceIndex === -1 || this.state.sourceComplete) {
          this.state.sourceIndex = (this.state.sourceIndex + 1) % keys.length
          this.state.sourceComplete = false
        }

        source = keys[this.state.sourceIndex]
      } else {
        source = keys[++this.state.sourceIndex % keys.length]
      }
    }

    // Get the urls from the source
    let collection = await sourceScrapers().getSourceUrls(
      this.scene.id,
      canScrape,
      source
    )
    if (collection.length === 0) {
      return undefined
    }

    const urlState = this.state.urlState[source] ?? {
      urlIndex: 0,
      loadedUrls: []
    }
    // If sorting randomly and forcing all
    if (orderFunction === OF.random && (forceAll || fullSource)) {
      const fullCollection = collection
      // Filter the available urls to those not played yet
      collection = collection.filter((u) => !urlState.loadedUrls.includes(u))
      // If there are no remaining urls for this source
      if (collection.length === 0) {
        urlState.loadedUrls = []
        if (fullSource) {
          this.state.sourceComplete = true
          return undefined
        } else {
          collection = fullCollection
        }
      }
    }

    // If sorting randomly, get a random URL
    let url: string
    if (orderFunction === OF.random) {
      url = getRandomListItem(collection)
    } else {
      // Else get the next index for this source
      const index = urlState.urlIndex % collection.length
      if (fullSource && index === collection.length - 1) {
        this.state.sourceComplete = true
      }
      url = collection[index]
      urlState.urlIndex++
    }

    if (
      url != null &&
      orderFunction === OF.random &&
      (forceAll || (weightFunction === WF.sources && fullSource))
    ) {
      urlState.loadedUrls.push(url)
    }

    this.state.urlState[source] = urlState
    return url
  }

  private getSourceKeys() {
    const { useWeights, sourceOrderFunction, forceAllSource } = this.scene
    if (!useWeights) {
      this.sources.forEach((source) => (source.weight = 1))
    }

    let keys: string[] = []
    for (const source of this.sources) {
      for (let w = source.weight; w > 0; w--) {
        keys.push(source.url as string)
      }
    }

    if (sourceOrderFunction === SOF.random && forceAllSource) {
      const fullKeys = keys
      // Filter the available urls to those not played yet
      const toRemove = new Map<string, number>()
      this.state.loadedSources.forEach((s) => {
        const count = toRemove.get(s) ?? 0
        toRemove.set(s, count + 1)
      })

      keys = []
      for (const key of fullKeys) {
        const count = toRemove.get(key) ?? 0
        if (count > 0) {
          toRemove.set(key, count - 1)
        } else {
          keys.push(key)
        }
      }

      // If there are no remaining urls for this source
      if (keys.length === 0) {
        this.state.loadedSources = []
        keys = fullKeys
      }
    }

    return keys
  }
}

class ImageWeightedUrlLoader extends UrlLoader {
  private state: UrlState

  constructor(scene: Scene, sources: ContentSource[]) {
    super(scene, sources)
    this.state = {
      urlIndex: -1,
      loadedUrls: []
    }
  }

  public async getUrl(canScrape: boolean) {
    const { weightFunction, orderFunction, fullSource, forceAll } = this.scene

    // Concat all images together
    let collection = await sourceScrapers().getSourceUrls(
      this.scene.id,
      canScrape
    )
    if (collection.length === 0) {
      return undefined
    }

    // If sorting randomly and forcing all
    if (orderFunction === OF.random && forceAll) {
      const fullCollection = collection
      // Filter the available ulls to those not played yet
      collection = collection.filter(
        (u: string) => !this.state.loadedUrls.includes(u)
      )
      // If there are no remaining urls, clear loadedURLs
      if (collection.length === 0) {
        this.state.loadedUrls = []
        collection = fullCollection
      }
    }

    let url: string
    // If sorting randomly, get a random url
    if (orderFunction === OF.random) {
      url = getRandomListItem(collection)
    } else {
      // Else get the next index
      url = collection[++this.state.urlIndex % collection.length]
    }

    if (
      url != null &&
      orderFunction === OF.random &&
      (forceAll || (weightFunction === WF.sources && fullSource))
    ) {
      this.state.loadedUrls.push(url)
    }

    return url
  }
}

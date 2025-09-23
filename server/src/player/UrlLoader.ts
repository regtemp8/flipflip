import {
  ContentSource,
  OF,
  randomizeList,
  Scene,
  SOF,
  WF
} from 'flipflip-common'
import sourceScrapers from '../scraper/SourceScraperService'
import { getRandomListItem, pushInChunks } from '../utils'
import {
  findContentSources,
  findContentSourceTagIds
} from '../db/ContentSourceRepository'
import { User } from '../db/types/entities'
import { toContentSource } from '../db/mappers'

interface SourceState {
  changeSource: boolean
  sourceIndex: number
  sourceList: number[]
  sources: string[]
  sourceComplete: boolean
  urlState: Record<string, UrlState>
  loadedAllSourceUrls: boolean
}

interface UrlState {
  urlIndex: number
  urlList: number[]
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
  protected readonly sourceWeights: Map<string, number>

  protected constructor(scene: Scene, sources: ContentSource[]) {
    this.scene = scene
    this.sourceWeights = new Map<string, number>()
    if (this.scene.useWeights) {
      sources.forEach((source) => this.sourceWeights.set(source.url, 1))
    } else {
      sources.forEach((source) =>
        this.sourceWeights.set(source.url, source.weight)
      )
    }
  }

  public abstract getUrl(canScrape: boolean): Promise<string | undefined>

  protected addToUrlList(urlList: number[], end: number, randomize: boolean) {
    const start = urlList.length
    const toAdd = Array.from(
      { length: end - start },
      (_, index) => start + index
    )
    if (randomize) {
      randomizeList(toAdd)
    }

    pushInChunks(urlList, toAdd)
  }
}

class SourceWeightedUrlLoader extends UrlLoader {
  private state: SourceState

  constructor(scene: Scene, sources: ContentSource[]) {
    super(scene, sources)
    this.state = {
      changeSource: true,
      sourceIndex: 0,
      sourceList: [],
      sources: [],
      sourceComplete: false,
      urlState: {},
      loadedAllSourceUrls: false
    }
  }

  public async getUrl(canScrape: boolean) {
    const {
      orderFunction,
      sourceOrderFunction,
      fullSource,
      forceAll,
      forceAllSource
    } = this.scene

    this.updateSourceState(canScrape)
    const sourceIndex = this.state.sourceList[this.state.sourceIndex]
    const source = this.state.sources[sourceIndex]
    this.state.changeSource = !fullSource || this.state.sourceComplete
    if (this.state.changeSource) {
      if (this.state.sourceComplete) {
        this.state.sourceComplete = false
      }

      if (sourceOrderFunction === OF.random && forceAllSource) {
        // If sorting randomly and forcing all
        this.state.sourceIndex =
          (this.state.sourceIndex + 1) % this.state.sourceList.length
        if (this.state.sourceIndex === 0) {
          // If back at beginning of list, randomize it
          this.state.sourceList = randomizeList(this.state.sourceList)
        }
      } else if (sourceOrderFunction === OF.random) {
        // If sorting randomly, get a random url
        this.state.sourceIndex = getRandomListItem(this.state.sourceList)
      } else {
        // Else get the next index
        this.state.sourceIndex =
          (this.state.sourceIndex + 1) % this.state.sourceList.length
      }
    }

    const urlState = this.state.urlState[source] ?? {
      urlIndex: 0,
      urlList: []
    }

    // Get the urls from the source
    const collection = await sourceScrapers().getScrapedUrls(
      this.scene.id,
      canScrape,
      source
    )
    if (collection.length === 0) {
      return undefined
    } else if (collection.length > urlState.urlList.length) {
      const randomize = orderFunction === OF.random && (forceAll || fullSource)
      this.addToUrlList(urlState.urlList, collection.length, randomize)
    }

    let urlIndex: number
    if (orderFunction === OF.random && (forceAll || fullSource)) {
      // If sorting randomly and forcing all
      urlIndex = urlState.urlList[urlState.urlIndex]
      urlState.urlIndex = (urlState.urlIndex + 1) % urlState.urlList.length
      if (urlState.urlIndex === 0) {
        // If back at beginning of list, randomize it
        urlState.urlList = randomizeList(urlState.urlList)
        if (fullSource) {
          this.state.sourceComplete = true
        }
      }
    } else if (orderFunction === OF.random) {
      // If sorting randomly, get a random url
      urlIndex = getRandomListItem(urlState.urlList)
    } else {
      // Else get the next index for this source
      urlIndex = urlState.urlList[urlState.urlIndex]
      urlState.urlIndex = (urlState.urlIndex + 1) % urlState.urlList.length
      if (urlState.urlIndex === 0 && fullSource) {
        this.state.sourceComplete = true
      }
    }

    this.state.urlState[source] = urlState
    return collection[urlIndex]
  }

  private updateSourceState(canScrape: boolean) {
    if (this.state.loadedAllSourceUrls) {
      return
    }

    const { sourceOrderFunction, forceAllSource } = this.scene
    const willScrape =
      canScrape &&
      this.state.changeSource &&
      (this.state.sourceIndex === 0 ||
        (sourceOrderFunction === SOF.random && !forceAllSource))
    const sourceUrls = sourceScrapers().getSourceUrls(this.scene.id, willScrape)
    if (sourceUrls.length === this.state.sources.length) {
      this.state.loadedAllSourceUrls = true
      return
    }

    const toAdd: number[] = []
    for (let i = this.state.sources.length; i < sourceUrls.length; i++) {
      const weight = this.sourceWeights.get(sourceUrls[i]) as number
      for (let w = weight; w > 0; w--) {
        toAdd.push(i)
      }
    }

    if (sourceOrderFunction === SOF.random && forceAllSource) {
      randomizeList(toAdd)
    }

    this.state.sourceIndex = this.state.sourceList.length
    pushInChunks(this.state.sourceList, toAdd)
    this.state.sources = sourceUrls
  }
}

class ImageWeightedUrlLoader extends UrlLoader {
  private state: UrlState

  constructor(scene: Scene, sources: ContentSource[]) {
    super(scene, sources)
    this.state = {
      urlIndex: 0,
      urlList: []
    }
  }

  public async getUrl(canScrape: boolean) {
    const { orderFunction, forceAll } = this.scene

    // Get all urls
    const collection = await sourceScrapers().getScrapedUrls(
      this.scene.id,
      canScrape
    )
    if (collection.length === 0) {
      return undefined
    } else if (collection.length > this.state.urlList.length) {
      const randomize = orderFunction === OF.random && forceAll
      this.addToUrlList(this.state.urlList, collection.length, randomize)
    }

    let index: number
    if (orderFunction === OF.random && forceAll) {
      // If sorting randomly and forcing all
      index = this.state.urlList[this.state.urlIndex]
      this.state.urlIndex =
        (this.state.urlIndex + 1) % this.state.urlList.length
      if (this.state.urlIndex === 0) {
        // If back at beginning of list, randomize it
        this.state.urlList = randomizeList(this.state.urlList)
      }
    } else if (orderFunction === OF.random) {
      // If sorting randomly, get a random url
      index = getRandomListItem(this.state.urlList)
    } else {
      // Else get the next index
      index = this.state.urlList[this.state.urlIndex]
      this.state.urlIndex =
        (this.state.urlIndex + 1) % this.state.urlList.length
    }

    return collection[index]
  }
}

import SourceScraper from './SourceScraper'
import { User } from '../db/types/entities'

class SourceScraperService {
  private static instance: SourceScraperService

  private readonly subscriptions = new Map<number, SourceScraper>()

  public static getInstance(): SourceScraperService {
    if (SourceScraperService.instance == null) {
      SourceScraperService.instance = new SourceScraperService()
    }

    return SourceScraperService.instance
  }

  public async register(sceneId: number, user: User) {
    if (!this.subscriptions.has(sceneId)) {
      const scraper = await SourceScraper.create(sceneId, user)
      this.subscriptions.set(sceneId, scraper)
    }
  }

  public getSourceUrls(sceneId: number, willScrape: boolean) {
    return this.subscriptions.get(sceneId)?.getSourceUrls(willScrape) ?? []
  }

  public getSource(sceneId: number, url: string) {
    return this.subscriptions.get(sceneId)?.getSource(url)
  }

  public getPost(sceneId: number, url: string) {
    return this.subscriptions.get(sceneId)?.getPost(url)
  }

  public async getScrapedUrls(
    sceneId: number,
    canScrape: boolean,
    source?: string
  ) {
    return (
      (await this.subscriptions
        .get(sceneId)
        ?.getScrapedUrls(canScrape, source)) ?? []
    )
  }

  public clear() {
    this.subscriptions.clear()
  }
}

export default function sourceScrapers() {
  return SourceScraperService.getInstance()
}

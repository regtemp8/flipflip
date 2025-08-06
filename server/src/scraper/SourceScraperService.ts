import SourceScraper from './SourceScraper'
import { User } from '../db/types/generated'

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

  public async getSourceUrls(sceneId: number, canScrape: boolean, source?: string) {
    return (await this.subscriptions.get(sceneId)?.getSourceUrls(canScrape, source)) ?? []
  }

  public clear() {
    this.subscriptions.clear()
  }
}

export default function sourceScrapers() {
  return SourceScraperService.getInstance()
}

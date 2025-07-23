import { randomUUID } from "crypto"
import ViewPlayer from "../player/ViewPlayer"
import SourceScraper from "./SourceScraper"
import { User } from "../db/types/generated"

interface SourceScraperSubscription {
    subscribers: number
    scraper: SourceScraper
}

class SourceScraperService {
  private static instance: SourceScraperService

  private readonly subscriptions: Map<number, SourceScraperSubscription>

  private constructor() {
    this.subscriptions = new Map()
  }

  public static getInstance(): SourceScraperService {
    if (SourceScraperService.instance == null) {
      SourceScraperService.instance = new SourceScraperService()
    }

    return SourceScraperService.instance
  }

  public async subscribe(sceneId: number, user: User) {
    let subscription = this.subscriptions.get(sceneId)
    if(subscription != null) {
        if(subscription.subscribers === 0) {
            subscription.scraper.start()
        }
        subscription.subscribers++
    } else {
        const scraper = await SourceScraper.create(sceneId, user)
        scraper.start()
        subscription = {subscribers: 1, scraper}
    }

    this.subscriptions.set(sceneId, subscription)
  }

  public unsubscribe(sceneId: number) {
    const subscription = this.subscriptions.get(sceneId)
    if(subscription == null) {
        return
    }

    subscription.subscribers--
    if(subscription.subscribers == 0) {
        subscription.scraper.stop()
    }

    this.subscriptions.set(sceneId, subscription)
  }

  public getUrls(sceneId: number) {
    return this.subscriptions.get(sceneId)?.scraper.getUrls()
  }

  public getProgress(sceneId: number) {
    return this.subscriptions.get(sceneId)?.scraper.getProgress()
  }

  public clear() {
    this.subscriptions.values()
        .filter(subscription => subscription.subscribers > 0)
        .forEach(subscription => subscription.scraper.stop())

    this.subscriptions.clear()
  }
}

export default function sourceScrapers() {
  return SourceScraperService.getInstance()
}
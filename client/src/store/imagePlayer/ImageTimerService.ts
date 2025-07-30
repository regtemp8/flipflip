import ImageTimer from './ImageTimer'

class ImageTimerService {
  private static instance: ImageTimerService

  private readonly timers: Record<string, ImageTimer>

  private constructor() {
    this.timers = {}
  }

  public static getInstance(): ImageTimerService {
    if (ImageTimerService.instance == null) {
      ImageTimerService.instance = new ImageTimerService()
    }

    return ImageTimerService.instance
  }

  public start(uuid: string) {
    this.timers[uuid] = new ImageTimer()
  }

  public stop(uuid: string) {
    delete this.timers[uuid]
  }

  public tick(uuid: string, timestamp: DOMHighResTimeStamp) {
    return this.timers[uuid].tick(timestamp)
  }

  public pause(uuid: string) {
    this.timers[uuid].pause()
  }

  public next(uuid: string, timeToDisplay: number) {
    this.timers[uuid].next(timeToDisplay)
  }

  public retry(uuid: string) {
    return this.timers[uuid].retry()
  }
}

export default function imageTimers() {
  return ImageTimerService.getInstance()
}

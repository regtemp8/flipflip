export default class ImageTimer {
  lastTick: DOMHighResTimeStamp
  timeToNextFrame: DOMHighResTimeStamp
  displayDuration: number
  paused: boolean
  retries: number

  constructor() {
    this.lastTick = 0
    this.timeToNextFrame = 0
    this.displayDuration = 0
    this.paused = false
    this.retries = 0
  }

  public tick(timestamp: DOMHighResTimeStamp) {
    this.lastTick = timestamp
    if (this.paused) {
      this.paused = false
      this.timeToNextFrame = this.lastTick + this.displayDuration
    }

    const skipFrame = timestamp < this.timeToNextFrame
    return skipFrame
  }

  public pause() {
    this.paused = true
    this.displayDuration = this.timeToNextFrame - this.lastTick
  }

  public next(timeToDisplay: number) {
    this.displayDuration = timeToDisplay
    this.timeToNextFrame = this.lastTick + this.displayDuration
    this.retries = 0
  }

  public retry() {
    this.retries++
    this.timeToNextFrame = this.lastTick + this.retries * 16
    return this.retries
  }
}

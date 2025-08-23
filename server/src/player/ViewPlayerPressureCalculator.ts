import Logger from '../logging/Logger'

const logger = Logger.create('ViewPlayerPressureCalculator')
export default class ViewPlayerPressureCalculator {
  private minimumThreshold: number
  private maximumThreshold: number
  private count: number
  private low: boolean
  private adjust: boolean

  constructor(maxInMemory: number) {
    const margin = maxInMemory * 0.05
    this.minimumThreshold = maxInMemory - margin
    this.maximumThreshold = maxInMemory + margin
    this.count = 0
    this.low = true
    this.adjust = false
  }

  public increase() {
    this.adjust = true
    this.adjustPressure(-1)
  }

  public decrease() {
    this.adjustPressure(1)
  }

  public isLow() {
    return this.low
  }

  private adjustPressure(change: number) {
    this.count += change
    if (!this.adjust) {
      return
    }

    if (this.low && this.count < this.minimumThreshold) {
      this.low = false
    } else if (!this.low && this.count > this.maximumThreshold) {
      this.low = true
    }

    logger.info('PRESSURE: ' + this.count + ' | CAN SCRAPE: ' + this.low)
  }
}

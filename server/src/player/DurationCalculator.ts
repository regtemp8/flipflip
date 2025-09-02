import { TF } from 'flipflip-common'
import type TimingSettings from './TimingSettings'

export default class DurationCalculator {
  private timing: TimingSettings
  private sinStep: number

  constructor(timing: TimingSettings) {
    this.timing = timing
    this.sinStep = 0
  }

  public calc(timeToNextFrame: number, bpm?: number, min?: number): number {
    switch (this.timing.timingFunction) {
      case TF.constant:
        return this.calcConstant(min)
      case TF.random:
        return this.calcRandom(min)
      case TF.sin:
        return this.calcSinWave()
      case TF.bpm:
        return this.calcBPM(bpm)
      case TF.scene:
        return timeToNextFrame
      default:
        return NaN
    }
  }

  public reset() {
    this.sinStep = 0
  }

  private calcConstant(min?: number): number {
    const time = this.time(min)
    return time(this.timing.time)
  }

  private calcRandom(min?: number): number {
    const time = this.time(min)
    return (
      Math.floor(
        Math.random() *
          (time(this.timing.timeMax) - time(this.timing.timeMin) + 1)
      ) + time(this.timing.timeMin)
    )
  }

  private calcSinWave(): number {
    const amplitude = (this.timing.timeMax - this.timing.timeMin) / 2
    const offset = this.timing.timeMin + amplitude
    const cycle = Math.PI * 2
    const x = this.sinStep * cycle
    this.sinStep = this.getNextSinStep(this.sinStep, this.timing.sinRate)
    return Math.floor(amplitude * Math.sin(x) + offset)
  }

  private calcBPM(bpm?: number): number {
    const bpmMulti = this.timing.bpmMulti / 10
    let duration = 60000 / ((bpm || 60) * bpmMulti)
    // If we cannot parse this, default to 1s
    if (!duration) {
      duration = 1000
    }

    return duration
  }

  private getNextSinStep(sinStep: number, sinRate: number) {
    return (sinStep + 1 / sinRate) % 1
  }

  private time(min?: number) {
    return min != null
      ? (value: number) => Math.max(value, min)
      : (value: number) => value
  }
}

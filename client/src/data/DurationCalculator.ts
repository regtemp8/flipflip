import { TF } from 'flipflip-common'
import type TimingSettings from '../store/scene/TimingSettings'

export default class DurationCalculator {
  private sinStep: number

  constructor() {
    this.sinStep = 0
  }

  public calc(
    timing: TimingSettings,
    timeToNextFrame: number,
    bpm?: number,
    min?: number
  ): number {
    switch (timing.timingFunction) {
      case TF.constant:
        return this.calcConstant(timing, min)
      case TF.random:
        return this.calcRandom(timing, min)
      case TF.sin:
        return this.calcSinWave(timing)
      case TF.bpm:
        return this.calcBPM(timing, bpm)
      case TF.scene:
        return timeToNextFrame
      default:
        return NaN
    }
  }

  public reset() {
    this.sinStep = 0
  }

  private calcConstant(timing: TimingSettings, min?: number): number {
    const time = this.time(min)
    return time(timing.time)
  }

  private calcRandom(timing: TimingSettings, min?: number): number {
    const time = this.time(min)
    return (
      Math.floor(
        Math.random() * (time(timing.timeMax) - time(timing.timeMin) + 1)
      ) + time(timing.timeMin)
    )
  }

  private calcSinWave(timing: TimingSettings): number {
    const amplitude = (timing.timeMax - timing.timeMin) / 2
    const offset = timing.timeMin + amplitude
    const cycle = Math.PI * 2
    const x = this.sinStep * cycle
    this.sinStep = this.getNextSinStep(this.sinStep, timing.sinRate)
    return Math.floor(amplitude * Math.sin(x) + offset)
  }

  private calcBPM(timing: TimingSettings, bpm?: number): number {
    const bpmMulti = timing.bpmMulti / 10
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

import * as easings from 'd3-ease'
import { KeyboardEvent as ReactKeyboardEvent, useRef } from 'react'
import { filesize } from 'filesize'
import { MouseEvent } from 'react'
import { Backup, ContentSource, ScraperHelpers, EA, TF } from 'flipflip-common'

export const captionProgramDefaults = {
  program: Array<Function>(),
  programCounter: 0,
  timestamps: Array<number>(),
  timestampFn: new Map<number, Function[]>(),
  timestampCounter: 0,
  audios: new Array<{
    alias: string
    file: string
    playing: boolean
    volume: number
  }>(),
  phrases: new Map<number, string[]>(),

  blinkDuration: [200, 500],
  blinkWaveRate: 100,
  blinkBPMMulti: 1,
  blinkTF: TF.constant,

  blinkDelay: [80, 200],
  blinkDelayWaveRate: 100,
  blinkDelayBPMMulti: 1,
  blinkDelayTF: TF.constant,

  blinkGroupDelay: [1200, 2000],
  blinkGroupDelayWaveRate: 100,
  blinkGroupDelayBPMMulti: 1,
  blinkGroupDelayTF: TF.constant,

  captionDuration: [2000, 4000],
  captionWaveRate: 100,
  captionBPMMulti: 1,
  captionTF: TF.constant,

  captionDelay: [1200, 2000],
  captionDelayWaveRate: 100,
  captionDelayBPMMulti: 1,
  captionDelayTF: TF.constant,

  countDuration: [600, 1000],
  countWaveRate: 100,
  countBPMMulti: 1,
  countTF: TF.constant,

  countDelay: [400, 1000],
  countDelayWaveRate: 100,
  countDelayBPMMulti: 1,
  countDelayTF: TF.constant,

  showCountProgress: false,
  countProgressOffset: false,
  countColorMatch: false,
  countProgressScale: 500,

  countGroupDelay: [1200, 2000],
  countGroupDelayWaveRate: 100,
  countGroupDelayBPMMulti: 1,
  countGroupDelayTF: TF.constant,

  blinkY: 0,
  captionY: 0,
  bigCaptionY: 0,
  countY: 0,

  blinkX: 0,
  captionX: 0,
  bigCaptionX: 0,
  countX: 0,

  blinkOpacity: 100,
  captionOpacity: 100,
  countOpacity: 100
}

export function getTimingFromString(tf: string): string | undefined {
  switch (tf) {
    case 'constant':
    case 'const':
      return TF.constant
    case 'random':
    case 'rand':
      return TF.random
    case 'wave':
    case 'sin':
      return TF.sin
    case 'bpm':
    case 'audio':
      return TF.bpm
    case 'scene':
      return TF.scene
    default:
      return undefined
  }
}

export function formatBackup(backup: Backup) {
  return `${convertFromEpoch(backup.createdAt)} (${filesize(backup.size, { standard: 'jedec', round: 0 })})`
}

export function convertFromEpoch(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString()
}

export function getTimestamp(secs: number): string {
  const hours = Math.floor(secs / 3600)
  const minutes = Math.floor((secs % 3600) / 60)
  const seconds = Math.floor((secs % 3600) % 60)
  if (hours > 0) {
    return (
      hours +
      ':' +
      (minutes >= 10 ? minutes : '0' + minutes) +
      ':' +
      (seconds >= 10 ? seconds : '0' + seconds)
    )
  } else {
    return minutes + ':' + (seconds >= 10 ? seconds : '0' + seconds)
  }
}

export function getMsRemainder(sec: number): string | undefined {
  if (isNaN(sec) || sec < 0) {
    return undefined
  }

  const text = sec.toFixed(3)
  return text.substring(text.length - 4)
}

export function getMsTimestampValue(value: string): number | undefined {
  const split = value.split(':')
  const splitInt = []
  let milli = null
  if (split.length > 3 || split.length === 0) return undefined
  if (split[split.length - 1].includes('.')) {
    const splitMili = split[split.length - 1].split('.')
    if (splitMili.length > 2) return undefined
    split[split.length - 1] = splitMili[0]
    milli = splitMili[1]
    if (milli.length > 3) return undefined
    while (milli.length < 3) {
      milli += '0'
    }
    milli = parseInt(milli)
    if (isNaN(milli)) return undefined
  }
  for (let n = 0; n < split.length; n++) {
    if (n !== 0) {
      if (split[n].length !== 2) return undefined
    }
    const int = parseInt(split[n])
    if (isNaN(int)) return undefined
    splitInt.push(int)
  }

  let ms = 0
  if (split.length === 3) {
    ms = splitInt[0] * 60 * 60 + splitInt[1] * 60 + splitInt[2]
  } else if (split.length === 2) {
    ms = splitInt[0] * 60 + splitInt[1]
  } else if (split.length === 1) {
    ms = splitInt[0]
  }
  ms *= 1000
  if (milli != null) {
    ms += milli
  }
  return ms
}

export function getRandomIndex(list: any[]) {
  return Math.floor(Math.random() * list.length)
}

export function getRandomListItem(list: any[], count: number = 1) {
  if (count <= 0) {
  } else if (count === 1) {
    return list[getRandomIndex(list)]
  } else {
    const newList = []
    for (let c = 0; c < count && list.length > 0; c++) {
      newList.push(list.splice(getRandomIndex(list), 1)[0])
    }
    return newList
  }
}

export function randomizeList(list: any[]) {
  let currentIndex = list.length
  let temporaryValue
  let randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = list[currentIndex]
    list[currentIndex] = list[randomIndex]
    list[randomIndex] = temporaryValue
  }

  return list
}

export function htmlEntities(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\\n/g, '<br/>')
}

// TODO does this still work OR need something else to cancel IPC.scrapeFiles?
// Inspired by https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
/**
 * This object is a custom Promise wrapper which enables the ability to cancel the promise.
 *
 * In order to assist with processing the next promise, this promise returns a list of strings as well as a
 * helper object used to build the next promise. This helper object can have the follow values:
 *   * next - null or a value to use in the follow-up promise
 *   * count - current count
 */

interface CancelablePromiseData {
  data: string[]
  helpers?: ScraperHelpers
}

export class CancelablePromise extends Promise<CancelablePromiseData> {
  hasCanceled: boolean
  source?: ContentSource
  timeout: number

  constructor(
    executor: (
      resolve: (value: CancelablePromiseData) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    super(executor)
    this.hasCanceled = false
    this.source = undefined
    this.timeout = 0
  }

  async getPromise(): Promise<CancelablePromiseData> {
    return await new Promise((resolve, reject) => {
      this.then(
        (val) => (this.hasCanceled ? null : resolve(val)),
        (error) => (this.hasCanceled ? null : reject(error))
      )
    })
  }

  cancel() {
    this.hasCanceled = true
  }
}

export function getEaseFunction(
  ea: string,
  exp: number,
  amp: number,
  per: number,
  ov: number
) {
  switch (ea) {
    case EA.linear:
      return easings.easeLinear
    case EA.sinIn:
      return easings.easeSinIn
    case EA.sinOut:
      return easings.easeSinOut
    case EA.sinInOut:
      return easings.easeSinInOut
    case EA.expIn:
      return easings.easeExpIn
    case EA.expOut:
      return easings.easeExpOut
    case EA.expInOut:
      return easings.easeExpInOut
    case EA.circleIn:
      return easings.easeCircleIn
    case EA.circleOut:
      return easings.easeCircleOut
    case EA.circleInOut:
      return easings.easeCircleInOut
    case EA.bounceIn:
      return easings.easeBounceIn
    case EA.bounceOut:
      return easings.easeBounceOut
    case EA.bounceInOut:
      return easings.easeBounceInOut
    case EA.polyIn:
      return easings.easePolyIn.exponent(exp)
    case EA.polyOut:
      return easings.easePolyOut.exponent(exp)
    case EA.polyInOut:
      return easings.easePolyInOut.exponent(exp)
    case EA.elasticIn:
      return easings.easeElasticIn.amplitude(amp).period(per)
    case EA.elasticOut:
      return easings.easeElasticOut.amplitude(amp).period(per)
    case EA.elasticInOut:
      return easings.easeElasticInOut.amplitude(amp).period(per)
    case EA.backIn:
      return easings.easeBackIn.overshoot(ov)
    case EA.backOut:
      return easings.easeBackOut.overshoot(ov)
    case EA.backInOut:
      return easings.easeBackInOut.overshoot(ov)
  }
}

// debug util to help optimize component re-renders
export default function useTrackVariableChanges<T>(
  variables: Record<string, T>
) {
  const _prevVariables = useRef<Record<string, T>>()

  const component = new Error().stack?.split('\n')[1].split('@')[0]
  Object.keys(variables).forEach((name) => {
    if (
      _prevVariables.current != null &&
      _prevVariables.current[name] !== variables[name]
    ) {
      console.log(`${component}: ${name} CHANGED`)
    }
  })

  _prevVariables.current = variables
}

export function isPrimaryModifierKey(
  event: MouseEvent | KeyboardEvent | ReactKeyboardEvent
) {
  return event.ctrlKey || event.metaKey
}

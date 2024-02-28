import * as easings from 'd3-ease'

import {
  getSourceType,
  en,
  BT,
  EA,
  GO,
  HTF,
  IF,
  IT,
  OF,
  OT,
  SC,
  SL,
  SOF,
  ST,
  STF,
  TF,
  TT,
  VO,
  VTF,
  WF
} from 'flipflip-common'
import type LibrarySource from '../store/librarySource/LibrarySource'
import type WeightGroup from '../store/scene/WeightGroup'
import type Scene from '../store/scene/Scene'
import type Clip from '../store/clip/Clip'
import type Audio from '../store/audio/Audio'
import Tag from '../store/tag/Tag'
import flipflip from '../FlipFlipService'

export function getBrowserName() {
  const agent = window.navigator.userAgent.toLowerCase()
  if (agent.indexOf('chrome') > -1 && window.chrome != null) {
    return 'chrome'
  } else if (agent.indexOf('safari') > -1) {
    return 'safari'
  } else if (agent.indexOf('edge') > -1) {
    return 'edge'
  } else if (agent.indexOf('edg') > -1) {
    return 'chromium based edge'
  } else if (agent.indexOf('firefox') > -1) {
    return 'firefox'
  } else if (agent.indexOf('opr') > -1 && window.opr != null) {
    return 'opera'
  } else if (agent.indexOf('trident') > -1) {
    return 'ie'
  } else {
    return 'other'
  }
}

const gridIDPrefix = '999'
export function convertGridIDToSceneID(gridID: number): number {
  return Number(gridIDPrefix + gridID)
}

export function isSceneIDAGridID(sceneID: number): boolean {
  return isSceneIDTextAGridID(sceneID.toString())
}

function isSceneIDTextAGridID(sceneIDText: string): boolean {
  return sceneIDText.startsWith(gridIDPrefix)
}

export function convertSceneIDToGridID(sceneID: number): number | undefined {
  const sceneIDText = sceneID.toString()
  return isSceneIDTextAGridID(sceneIDText)
    ? Number(sceneIDText.substring(gridIDPrefix.length))
    : undefined
}

export function flatten(array: any[]) {
  let values
  try {
    values = values = [].concat.apply([], array)
  } catch (e) {
    values = (array as any).flat(1)
  }
  return values
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

export function convertFromEpoch(backupFile: string) {
  const epochString = backupFile.substring(backupFile.lastIndexOf('.') + 1)
  const date = new Date(Number.parseInt(epochString))
  return date.toLocaleString()
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

  const ms = Math.round(sec * 1000)
  let remainder = (Math.floor((ms % 1000) * 1000) / 1000).toString()
  while (remainder.length < 3) {
    remainder = '0' + remainder
  }
  return '.' + remainder
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

export function getTimestampValue(value: string): number {
  const split = value.split(':')
  const splitInt = []
  if (split.length > 3 || split.length === 0) return 0
  for (let n = 0; n < split.length; n++) {
    if (n !== 0) {
      if (split[n].length !== 2) return 0
    }
    const int = parseInt(split[n])
    if (isNaN(int)) return 0
    splitInt.push(int)
  }

  if (split.length === 3) {
    return splitInt[0] * 60 * 60 + splitInt[1] * 60 + splitInt[2]
  } else if (split.length === 2) {
    return splitInt[0] * 60 + splitInt[1]
  } else if (split.length === 1) {
    return splitInt[0]
  }

  return 0
}

export async function extractMusicMetadata(
  audio: Audio,
  metadata: Audio
): Promise<Audio> {
  const newAudio: Audio = {
    ...metadata,
    ...audio
  }

  if (!newAudio.duration) {
    const arrayBuffer = await flipflip().api.readBinaryFile(audio.url as string)
    const context = new AudioContext()
    const audioBuffer = await context.decodeAudioData(arrayBuffer)
    newAudio.duration = audioBuffer.duration
  }

  return newAudio
}

export async function getLocalPath(cachingDirectory: string, source: string) {
  return await flipflip().api.cachePath(cachingDirectory, source, 'local')
}

export async function getCachePath(directory: string, source?: string) {
  return await flipflip().api.cachePath(directory, source)
}

export function htmlEntities(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\\n/g, '<br/>')
}

export function arrayMove(arr: any[], old_index: number, new_index: number) {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1
    while (k--) {
      arr.push(undefined)
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
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

export function getRandomIndex(list: any[]) {
  return Math.floor(Math.random() * list.length)
}

export function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomFloat(min: number, max: number, decimals: number) {
  const float = Math.random() * (max - min) + min
  return parseFloat(float.toFixed(decimals))
}

export function getRandomBoolean() {
  return Math.random() < 0.5
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

function areRulesValid(wg: WeightGroup) {
  const rules = wg.rules as WeightGroup[]
  const orRules = rules.filter((r) => r.type === TT.or)
  const weightRules = rules.filter((r) => r.type === TT.weight)
  let rulesRemaining = 100
  for (const rule of weightRules) {
    rulesRemaining = rulesRemaining - (rule.percent as number)
  }
  return (
    rules.length > 0 &&
    (orRules.length === 0 ||
      (orRules.length + weightRules.length === rules.length &&
        rulesRemaining === 0) ||
      orRules.length === rules.length) &&
    (rulesRemaining === 0 ||
      (rulesRemaining === 100 && weightRules.length === 0))
  )
}

export function areWeightsValid(scene: Scene): boolean {
  if (!scene.generatorWeights) return false
  let remaining = 100
  const orRules = scene.generatorWeights.filter((r) => r.type === TT.or)
  const weightRules = scene.generatorWeights.filter((r) => r.type === TT.weight)
  for (const wg of scene.generatorWeights) {
    if (wg.rules) {
      const rulesValid = areRulesValid(wg)
      if (!rulesValid) return false
    }
    if (wg.type === TT.weight) {
      remaining = remaining - (wg.percent as number)
    }
  }
  return (
    scene.generatorWeights.length > 0 &&
    (orRules.length === 0 ||
      (orRules.length + weightRules.length === scene.generatorWeights.length &&
        remaining === 0) ||
      orRules.length === scene.generatorWeights.length) &&
    (remaining === 0 || (remaining === 100 && weightRules.length === 0))
  )
}

export function filterSource(
  filter: string,
  source: LibrarySource,
  clip: Clip | undefined,
  tagEntries: Record<number, Tag>,
  mergeSources?: LibrarySource[]
): boolean {
  let matchesFilter = true
  let countRegex
  if (filter === '<Mergeable>') {
    matchesFilter = !!mergeSources && mergeSources.includes(source)
  } else if (filter === '<Offline>') {
    // This is offline filter
    matchesFilter = source.offline
  } else if (filter === '<Marked>') {
    // This is a marked filter
    matchesFilter = source.marked
  } else if (filter === '<Untagged>') {
    // This is untagged filter
    matchesFilter =
      clip && clip.tags && clip.tags.length > 0
        ? clip.tags.length === 0
        : source.tags.length === 0
  } else if (filter === '<Unclipped>') {
    matchesFilter =
      getSourceType(source.url) === ST.video && source.clips.length === 0
  } else if (
    (filter.startsWith('[') || filter.startsWith('-[')) &&
    filter.endsWith(']')
  ) {
    // This is a tag filter
    const tags =
      clip && clip.tags && clip.tags.length > 0 ? clip.tags : source.tags
    if (filter.startsWith('-')) {
      const tag = filter.substring(2, filter.length - 1)
      matchesFilter = tags.find((id) => tagEntries[id].name === tag) == null
    } else {
      const tag = filter.substring(1, filter.length - 1)
      matchesFilter = tags.find((id) => tagEntries[id].name === tag) != null
    }
  } else if (
    (filter.startsWith('{') || filter.startsWith('-{')) &&
    filter.endsWith('}')
  ) {
    // This is a type filter
    if (filter.startsWith('-')) {
      const type = filter.substring(2, filter.length - 1)
      matchesFilter = en.get(getSourceType(source.url)) !== type
    } else {
      const type = filter.substring(1, filter.length - 1)
      matchesFilter = en.get(getSourceType(source.url)) === type
    }
  } else if ((countRegex = /^count(\+?)([>=<])(\d*)$/.exec(filter)) != null) {
    const all = countRegex[1] === '+'
    const symbol = countRegex[2]
    const value = parseInt(countRegex[3])
    const type = getSourceType(source.url)
    const count = type === ST.video ? source.clips.length : source.count
    const countComplete = type === ST.video ? true : source.countComplete
    switch (symbol) {
      case '=':
        matchesFilter = (all || countComplete) && count === value
        break
      case '>':
        matchesFilter = (all || countComplete) && count > value
        break
      case '<':
        matchesFilter = (all || countComplete) && count < value
        break
    }
  } else if ((countRegex = /^duration([>=<])([\d:]*)$/.exec(filter)) != null) {
    const symbol = countRegex[1]
    let value
    if (countRegex[2].includes(':')) {
      value = getTimestampValue(countRegex[2])
    } else {
      value = parseInt(countRegex[2])
    }
    const type = getSourceType(source.url)
    if (type === ST.video) {
      const duration = clip
        ? (clip.end as number) - (clip.start as number)
        : source.duration
      if (duration == null) {
        matchesFilter = false
      } else {
        switch (symbol) {
          case '=':
            matchesFilter = Math.floor(duration) === value
            break
          case '>':
            matchesFilter = Math.floor(duration) > value
            break
          case '<':
            matchesFilter = Math.floor(duration) < value
            break
        }
      }
    } else {
      matchesFilter = false
    }
  } else if ((countRegex = /^resolution([>=<])(\d*)p?$/.exec(filter)) != null) {
    const symbol = countRegex[1]
    const value = parseInt(countRegex[2])

    const type = getSourceType(source.url)
    if (type === ST.video) {
      if (source.resolution == null) {
        matchesFilter = false
      } else {
        switch (symbol) {
          case '=':
            matchesFilter = source.resolution === value
            break
          case '>':
            matchesFilter = source.resolution > value
            break
          case '<':
            matchesFilter = source.resolution < value
            break
        }
      }
    } else {
      matchesFilter = false
    }
  } else if (
    ((filter.startsWith('"') || filter.startsWith('-"')) &&
      filter.endsWith('"')) ||
    ((filter.startsWith("'") || filter.startsWith("-'")) &&
      filter.endsWith("'"))
  ) {
    if (filter.startsWith('-')) {
      filter = filter.substring(2, filter.length - 1)
      const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
      matchesFilter = !regex.test(source.url)
    } else {
      filter = filter.substring(1, filter.length - 1)
      const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
      matchesFilter = regex.test(source.url)
    }
  } else {
    // This is a search filter
    filter = filter.replace('\\', '\\\\')
    if (filter.startsWith('-')) {
      filter = filter.substring(1, filter.length)
      const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
      matchesFilter = !regex.test(source.url)
    } else {
      const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
      matchesFilter = regex.test(source.url)
    }
  }
  return matchesFilter
}

export function getEffects(scene: Scene) {
  const effects = []
  effects.push(Object.values(TF).indexOf(scene.timingFunction))
  effects.push(scene.timingConstant)
  effects.push(scene.timingMin)
  effects.push(scene.timingMax)
  effects.push(scene.timingSinRate)
  effects.push(scene.timingBPMMulti)
  effects.push(scene.backForth ? 1 : 0)
  effects.push(Object.values(TF).indexOf(scene.backForthTF))
  effects.push(scene.backForthConstant)
  effects.push(scene.backForthMin)
  effects.push(scene.backForthMax)
  effects.push(scene.backForthSinRate)
  effects.push(scene.backForthBPMMulti)
  effects.push(Object.values(IT).indexOf(scene.imageType))
  effects.push(Object.values(BT).indexOf(scene.backgroundType))
  effects.push(scene.backgroundColor)
  effects.push(scene.backgroundColorSet.join('|'))
  effects.push(scene.backgroundBlur)

  effects.push(Object.values(IF).indexOf(scene.imageTypeFilter))
  effects.push(scene.fullSource ? 1 : 0)
  effects.push(Object.values(OT).indexOf(scene.imageOrientation))
  effects.push(Object.values(GO).indexOf(scene.gifOption))
  effects.push(scene.gifTimingConstant)
  effects.push(scene.gifTimingMin)
  effects.push(scene.gifTimingMax)
  effects.push(Object.values(OT).indexOf(scene.videoOrientation))
  effects.push(Object.values(VO).indexOf(scene.videoOption))
  effects.push(scene.videoTimingConstant)
  effects.push(scene.videoTimingMin)
  effects.push(scene.videoTimingMax)
  effects.push(scene.videoSpeed)
  effects.push(scene.videoRandomSpeed ? 1 : 0)
  effects.push(scene.videoSpeedMin)
  effects.push(scene.videoSpeedMax)
  effects.push(scene.randomVideoStart ? 1 : 0)
  effects.push(scene.continueVideo ? 1 : 0)
  effects.push(scene.playVideoClips ? 1 : 0)
  effects.push(scene.skipVideoStart)
  effects.push(scene.skipVideoEnd)
  effects.push(scene.videoVolume)
  effects.push(Object.values(WF).indexOf(scene.weightFunction))
  effects.push(Object.values(SOF).indexOf(scene.sourceOrderFunction))
  effects.push(scene.forceAllSource ? 1 : 0)
  effects.push(Object.values(OF).indexOf(scene.orderFunction))
  effects.push(scene.forceAll ? 1 : 0)

  effects.push(scene.zoom ? 1 : 0)
  effects.push(scene.zoomRandom ? 1 : 0)
  effects.push(scene.zoomStart)
  effects.push(scene.zoomStartMin)
  effects.push(scene.zoomStartMax)
  effects.push(scene.zoomEnd)
  effects.push(scene.zoomEndMin)
  effects.push(scene.zoomEndMax)
  effects.push(Object.values(HTF).indexOf(scene.horizTransType))
  effects.push(scene.horizTransLevel)
  effects.push(scene.horizTransLevelMin)
  effects.push(scene.horizTransLevelMax)
  effects.push(scene.horizTransRandom ? 1 : 0)
  effects.push(Object.values(VTF).indexOf(scene.vertTransType))
  effects.push(scene.vertTransLevel)
  effects.push(scene.vertTransLevelMin)
  effects.push(scene.vertTransLevelMax)
  effects.push(scene.vertTransRandom ? 1 : 0)
  effects.push(Object.values(TF).indexOf(scene.transTF))
  effects.push(scene.transDuration)
  effects.push(scene.transDurationMin)
  effects.push(scene.transDurationMax)
  effects.push(scene.transSinRate)
  effects.push(scene.transBPMMulti)
  effects.push(Object.values(EA).indexOf(scene.transEase))
  effects.push(scene.transExp)
  effects.push(scene.transAmp)
  effects.push(scene.transPer)
  effects.push(scene.transOv)

  effects.push(scene.crossFade ? 1 : 0)
  effects.push(scene.crossFadeAudio ? 1 : 0)
  effects.push(Object.values(TF).indexOf(scene.fadeTF))
  effects.push(scene.fadeDuration)
  effects.push(scene.fadeDurationMin)
  effects.push(scene.fadeDurationMax)
  effects.push(scene.fadeSinRate)
  effects.push(scene.fadeBPMMulti)
  effects.push(Object.values(EA).indexOf(scene.fadeEase))
  effects.push(scene.fadeExp)
  effects.push(scene.fadeAmp)
  effects.push(scene.fadePer)
  effects.push(scene.fadeOv)

  effects.push(scene.slide ? 1 : 0)
  effects.push(Object.values(TF).indexOf(scene.slideTF))
  effects.push(Object.values(STF).indexOf(scene.slideType))
  effects.push(scene.slideDistance)
  effects.push(scene.slideDuration)
  effects.push(scene.slideDurationMin)
  effects.push(scene.slideDurationMax)
  effects.push(scene.slideSinRate)
  effects.push(scene.slideBPMMulti)
  effects.push(Object.values(EA).indexOf(scene.slideEase))
  effects.push(scene.slideExp)
  effects.push(scene.slideAmp)
  effects.push(scene.slidePer)
  effects.push(scene.slideOv)

  effects.push(scene.strobe ? 1 : 0)
  effects.push(scene.strobePulse ? 1 : 0)
  effects.push(Object.values(SL).indexOf(scene.strobeLayer))
  effects.push(scene.strobeOpacity)
  effects.push(Object.values(TF).indexOf(scene.strobeTF))
  effects.push(scene.strobeTime)
  effects.push(scene.strobeTimeMin)
  effects.push(scene.strobeTimeMax)
  effects.push(scene.strobeSinRate)
  effects.push(scene.strobeBPMMulti)
  effects.push(Object.values(TF).indexOf(scene.strobeDelayTF))
  effects.push(scene.strobeDelay)
  effects.push(scene.strobeDelayMin)
  effects.push(scene.strobeDelayMax)
  effects.push(scene.strobeDelaySinRate)
  effects.push(scene.strobeDelayBPMMulti)
  effects.push(Object.values(SC).indexOf(scene.strobeColorType))
  effects.push(scene.strobeColor)
  effects.push(scene.strobeColorSet.join('|'))
  effects.push(Object.values(EA).indexOf(scene.strobeEase))
  effects.push(scene.strobeExp)
  effects.push(scene.strobeAmp)
  effects.push(scene.strobePer)
  effects.push(scene.strobeOv)

  effects.push(scene.fadeInOut ? 1 : 0)
  effects.push(scene.fadeIOPulse ? 1 : 0)
  effects.push(Object.values(TF).indexOf(scene.fadeIOTF))
  effects.push(scene.fadeIODuration)
  effects.push(scene.fadeIODurationMin)
  effects.push(scene.fadeIODurationMax)
  effects.push(scene.fadeIOSinRate)
  effects.push(scene.fadeIOBPMMulti)
  effects.push(Object.values(TF).indexOf(scene.fadeIODelayTF))
  effects.push(scene.fadeIODelay)
  effects.push(scene.fadeIODelayMin)
  effects.push(scene.fadeIODelayMax)
  effects.push(scene.fadeIODelaySinRate)
  effects.push(scene.fadeIODelayBPMMulti)
  effects.push(Object.values(EA).indexOf(scene.fadeIOStartEase))
  effects.push(scene.fadeIOStartExp)
  effects.push(scene.fadeIOStartAmp)
  effects.push(scene.fadeIOStartPer)
  effects.push(scene.fadeIOStartOv)
  effects.push(Object.values(EA).indexOf(scene.fadeIOEndEase))
  effects.push(scene.fadeIOEndExp)
  effects.push(scene.fadeIOEndAmp)
  effects.push(scene.fadeIOEndPer)
  effects.push(scene.fadeIOEndOv)

  effects.push(scene.panning ? 1 : 0)
  effects.push(Object.values(TF).indexOf(scene.panTF))
  effects.push(scene.panDuration)
  effects.push(scene.panDurationMin)
  effects.push(scene.panDurationMax)
  effects.push(scene.panSinRate)
  effects.push(scene.panBPMMulti)
  effects.push(Object.values(HTF).indexOf(scene.panHorizTransType))
  effects.push(scene.panHorizTransImg ? 1 : 0)
  effects.push(scene.panHorizTransLevel)
  effects.push(scene.panHorizTransLevelMax)
  effects.push(scene.panHorizTransLevelMin)
  effects.push(scene.panHorizTransRandom ? 1 : 0)
  effects.push(Object.values(VTF).indexOf(scene.panVertTransType))
  effects.push(scene.panVertTransImg ? 1 : 0)
  effects.push(scene.panVertTransLevel)
  effects.push(scene.panVertTransLevelMax)
  effects.push(scene.panVertTransLevelMin)
  effects.push(scene.panVertTransRandom ? 1 : 0)
  effects.push(Object.values(EA).indexOf(scene.panStartEase))
  effects.push(scene.panStartExp)
  effects.push(scene.panStartAmp)
  effects.push(scene.panStartPer)
  effects.push(scene.panStartOv)
  effects.push(Object.values(EA).indexOf(scene.panEndEase))
  effects.push(scene.panEndExp)
  effects.push(scene.panEndAmp)
  effects.push(scene.panEndPer)
  effects.push(scene.panEndOv)

  // Add future items here

  return btoa(effects.join(',')).slice(0, -1)
}

export function applyEffects(scene: Scene, base64String: string) {
  base64String += '='
  const effectsString = atob(base64String)
  const effects = effectsString.split(',')
  const next = () => effects.shift() as string
  const nextInt = () => parseInt(next())
  const nextFloat = () => parseFloat(next())

  scene.timingFunction = Object.values(TF)[nextInt()]
  scene.timingConstant = nextInt()
  scene.timingMin = nextInt()
  scene.timingMax = nextInt()
  scene.timingSinRate = nextInt()
  scene.timingBPMMulti = nextInt()
  scene.backForth = nextInt() === 1
  scene.backForthTF = Object.values(TF)[nextInt()]
  scene.backForthConstant = nextInt()
  scene.backForthMin = nextInt()
  scene.backForthMax = nextInt()
  scene.backForthSinRate = nextInt()
  scene.backForthBPMMulti = nextInt()
  scene.imageType = Object.values(IT)[nextInt()]
  scene.backgroundType = Object.values(BT)[nextInt()]
  scene.backgroundColor = next()
  scene.backgroundColorSet = next().split('|')
  scene.backgroundBlur = nextInt()

  scene.imageTypeFilter = Object.values(IF)[nextInt()]
  scene.fullSource = nextInt() === 1
  scene.imageOrientation = Object.values(OT)[nextInt()]
  scene.gifOption = Object.values(GO)[nextInt()]
  scene.gifTimingConstant = nextInt()
  scene.gifTimingMin = nextInt()
  scene.gifTimingMax = nextInt()
  scene.videoOrientation = Object.values(OT)[nextInt()]
  scene.videoOption = Object.values(VO)[nextInt()]
  scene.videoTimingConstant = nextInt()
  scene.videoTimingMin = nextInt()
  scene.videoTimingMax = nextInt()
  scene.videoSpeed = nextInt()
  scene.videoRandomSpeed = nextInt() === 1
  scene.videoSpeedMin = nextInt()
  scene.videoSpeedMax = nextInt()
  scene.randomVideoStart = nextInt() === 1
  scene.continueVideo = nextInt() === 1
  scene.playVideoClips = nextInt() === 1
  scene.skipVideoStart = nextInt()
  scene.skipVideoEnd = nextInt()
  scene.videoVolume = nextInt()
  scene.weightFunction = Object.values(WF)[nextInt()]
  scene.sourceOrderFunction = Object.values(SOF)[nextInt()]
  scene.forceAllSource = nextInt() === 1
  scene.orderFunction = Object.values(OF)[nextInt()]
  scene.forceAll = nextInt() === 1

  scene.zoom = nextInt() === 1
  scene.zoomRandom = nextInt() === 1
  scene.zoomStart = nextFloat()
  scene.zoomStartMin = nextFloat()
  scene.zoomStartMax = nextFloat()
  scene.zoomEnd = nextFloat()
  scene.zoomEndMin = nextFloat()
  scene.zoomEndMax = nextFloat()
  scene.horizTransType = Object.values(HTF)[nextInt()]
  scene.horizTransLevel = nextInt()
  scene.horizTransLevelMin = nextInt()
  scene.horizTransLevelMax = nextInt()
  scene.horizTransRandom = nextInt() === 1
  scene.vertTransType = Object.values(VTF)[nextInt()]
  scene.vertTransLevel = nextInt()
  scene.vertTransLevelMin = nextInt()
  scene.vertTransLevelMax = nextInt()
  scene.vertTransRandom = nextInt() === 1
  scene.transTF = Object.values(TF)[nextInt()]
  scene.transDuration = nextInt()
  scene.transDurationMin = nextInt()
  scene.transDurationMax = nextInt()
  scene.transSinRate = nextInt()
  scene.transBPMMulti = nextInt()
  scene.transEase = Object.values(EA)[nextInt()]
  scene.transExp = nextInt()
  scene.transAmp = nextInt()
  scene.transPer = nextInt()
  scene.transOv = nextInt()

  scene.crossFade = nextInt() === 1
  scene.crossFadeAudio = nextInt() === 1
  scene.fadeTF = Object.values(TF)[nextInt()]
  scene.fadeDuration = nextInt()
  scene.fadeDurationMin = nextInt()
  scene.fadeDurationMax = nextInt()
  scene.fadeSinRate = nextInt()
  scene.fadeBPMMulti = nextInt()
  scene.fadeEase = Object.values(EA)[nextInt()]
  scene.fadeExp = nextInt()
  scene.fadeAmp = nextInt()
  scene.fadePer = nextInt()
  scene.fadeOv = nextInt()

  scene.slide = nextInt() === 1
  scene.slideTF = Object.values(TF)[nextInt()]
  scene.slideType = Object.values(STF)[nextInt()]
  scene.slideDistance = nextInt()
  scene.slideDuration = nextInt()
  scene.slideDurationMin = nextInt()
  scene.slideDurationMax = nextInt()
  scene.slideSinRate = nextInt()
  scene.slideBPMMulti = nextInt()
  scene.slideEase = Object.values(EA)[nextInt()]
  scene.slideExp = nextInt()
  scene.slideAmp = nextInt()
  scene.slidePer = nextInt()
  scene.slideOv = nextInt()

  scene.strobe = nextInt() === 1
  scene.strobePulse = nextInt() === 1
  scene.strobeLayer = Object.values(SL)[nextInt()]
  scene.strobeOpacity = nextFloat()
  scene.strobeTF = Object.values(TF)[nextInt()]
  scene.strobeTime = nextInt()
  scene.strobeTimeMin = nextInt()
  scene.strobeTimeMax = nextInt()
  scene.strobeSinRate = nextInt()
  scene.strobeBPMMulti = nextInt()
  scene.strobeDelayTF = Object.values(TF)[nextInt()]
  scene.strobeDelay = nextInt()
  scene.strobeDelayMin = nextInt()
  scene.strobeDelayMax = nextInt()
  scene.strobeDelaySinRate = nextInt()
  scene.strobeDelayBPMMulti = nextInt()
  scene.strobeColorType = Object.values(SC)[nextInt()]
  scene.strobeColor = next()
  scene.strobeColorSet = next().split('|')
  scene.strobeEase = Object.values(EA)[nextInt()]
  scene.strobeExp = nextInt()
  scene.strobeAmp = nextInt()
  scene.strobePer = nextInt()
  scene.strobeOv = nextInt()

  scene.fadeInOut = nextInt() === 1
  scene.fadeIOPulse = nextInt() === 1
  scene.fadeIOTF = Object.values(TF)[nextInt()]
  scene.fadeIODuration = nextInt()
  scene.fadeIODurationMin = nextInt()
  scene.fadeIODurationMax = nextInt()
  scene.fadeIOSinRate = nextInt()
  scene.fadeIOBPMMulti = nextInt()
  scene.fadeIODelayTF = Object.values(TF)[nextInt()]
  scene.fadeIODelay = nextInt()
  scene.fadeIODelayMin = nextInt()
  scene.fadeIODelayMax = nextInt()
  scene.fadeIODelaySinRate = nextInt()
  scene.fadeIODelayBPMMulti = nextInt()
  scene.fadeIOStartEase = Object.values(EA)[nextInt()]
  scene.fadeIOStartExp = nextInt()
  scene.fadeIOStartAmp = nextInt()
  scene.fadeIOStartPer = nextInt()
  scene.fadeIOStartOv = nextInt()
  scene.fadeIOEndEase = Object.values(EA)[nextInt()]
  scene.fadeIOEndExp = nextInt()
  scene.fadeIOEndAmp = nextInt()
  scene.fadeIOEndPer = nextInt()
  scene.fadeIOEndOv = nextInt()

  scene.panning = nextInt() === 1
  scene.panTF = Object.values(TF)[nextInt()]
  scene.panDuration = nextInt()
  scene.panDurationMin = nextInt()
  scene.panDurationMax = nextInt()
  scene.panSinRate = nextInt()
  scene.panBPMMulti = nextInt()
  scene.panHorizTransType = Object.values(HTF)[nextInt()]
  scene.panHorizTransImg = nextInt() === 1
  scene.panHorizTransLevel = nextInt()
  scene.panHorizTransLevelMax = nextInt()
  scene.panHorizTransLevelMin = nextInt()
  scene.panHorizTransRandom = nextInt() === 1
  scene.panVertTransType = Object.values(VTF)[nextInt()]
  scene.panVertTransImg = nextInt() === 1
  scene.panVertTransLevel = nextInt()
  scene.panVertTransLevelMax = nextInt()
  scene.panVertTransLevelMin = nextInt()
  scene.panVertTransRandom = nextInt() === 1
  scene.panStartEase = Object.values(EA)[nextInt()]
  scene.panStartExp = nextInt()
  scene.panStartAmp = nextInt()
  scene.panStartPer = nextInt()
  scene.panStartOv = nextInt()
  scene.panEndEase = Object.values(EA)[nextInt()]
  scene.panEndExp = nextInt()
  scene.panEndAmp = nextInt()
  scene.panEndPer = nextInt()
  scene.panEndOv = nextInt()

  if (effects.length !== 0) {
    // Add future items here
  }

  return scene
}

const captionProgramDefaults = {
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
export default captionProgramDefaults

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
  helpers?: { next: any; count: number; retries: number; uuid: string }
}

export class CancelablePromise extends Promise<CancelablePromiseData> {
  hasCanceled: boolean
  source?: LibrarySource
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

export function reduceList(
  sources: LibrarySource[],
  limit: number
): LibrarySource[] {
  while (sources.length > limit) {
    sources.splice(getRandomIndex(sources), 1)
  }
  return sources
}

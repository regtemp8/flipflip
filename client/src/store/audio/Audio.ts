import { copy, TF } from 'flipflip-common'

export default interface Audio {
  [key: string]: number | number[] | string | boolean | undefined

  id: number
  url?: string
  marked: boolean
  tags: number[] // Array of Tag IDs
  volume: number
  speed: number
  stopAtEnd: boolean
  nextSceneAtEnd: boolean
  tick: boolean
  tickMode: string
  tickDelay: number
  tickMinDelay: number
  tickMaxDelay: number
  tickSinRate: number
  tickBPMMulti: number
  bpm: number
  thumb?: string
  name?: string
  artist?: string
  album?: string
  trackNum?: number
  duration?: number
  comment?: string
  playedCount: number
}

export const initialAudio: Audio = {
  id: 0,
  marked: false,
  tags: [],
  volume: 100,
  speed: 10,
  stopAtEnd: false,
  nextSceneAtEnd: false,
  tick: false,
  tickMode: TF.constant,
  tickDelay: 1000,
  tickMinDelay: 500,
  tickMaxDelay: 5000,
  tickSinRate: 100,
  tickBPMMulti: 10,
  bpm: 0,
  playedCount: 0
}

export function newAudio(init?: Partial<Audio>) {
  const audio = Object.assign(copy<Audio>(initialAudio), init)
  if (audio.tickMode === 'at.constant') {
    audio.tickMode = 'tf.c'
  } else if (audio.tickMode === 'at.random') {
    audio.tickMode = 'tf.random'
  } else if (audio.tickMode === 'at.sin') {
    audio.tickMode = 'tf.sin'
  } else if (audio.tickMode === 'at.scene') {
    audio.tickMode = 'tf.scene'
  }

  return audio
}

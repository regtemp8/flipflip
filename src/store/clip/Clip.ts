import { copy } from '../../renderer/data/utils'

export default interface Clip {
  id: number
  start?: number
  end?: number
  volume?: number
  tags: number[] // Array of Tag IDs
}

export const initialClip: Clip = {
  id: 0,
  volume: null,
  tags: []
}

export function newClip (init?: Partial<Clip>) {
  return Object.assign(copy<Clip>(initialClip), init)
}

import { copy } from 'flipflip-common'

export default interface Display {
  id: number
  name: string
  views: number[]
  selectedView?: number
  displayViewsListYOffset: number
}

export const initialDisplay: Display = {
  id: 0,
  name: '',
  views: [],
  displayViewsListYOffset: 0
}

export function newDisplay(init?: Partial<Display>) {
  return Object.assign(copy<Display>(initialDisplay), init)
}

import { MVF, copy } from 'flipflip-common'

export default interface View {
  id: number
  name: string
  x: number
  y: number
  z: number
  width: number
  height: number
  color: string
  opacity: number
  visible: boolean
  playlistID: number
  sync: boolean
  syncWithView: number
  mirrorSyncedView: string
}

export const initialView: View = {
  id: 0,
  name: 'New View',
  x: 0,
  y: 0,
  z: 0,
  width: 10,
  height: 10,
  color: '',
  opacity: 100,
  visible: true,
  playlistID: 0,
  sync: false,
  syncWithView: 0,
  mirrorSyncedView: MVF.none
}

export function newView(init?: Partial<View>) {
  return Object.assign(copy<View>(initialView), init)
}

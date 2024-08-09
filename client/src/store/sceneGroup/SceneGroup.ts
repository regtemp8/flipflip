import { copy } from 'flipflip-common'

export default interface SceneGroup {
  id: number
  type: string
  name: string
  scenes: number[] // Array of Scene IDs
}

export const initialSceneGroup: SceneGroup = {
  id: 0,
  type: '',
  name: 'New Group',
  scenes: []
}

export function newSceneGroup(init?: Partial<SceneGroup>): SceneGroup {
  return Object.assign(copy<SceneGroup>(initialSceneGroup), init)
}

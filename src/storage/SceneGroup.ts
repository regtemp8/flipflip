import { copy } from '../renderer/data/utils'

export default interface SceneGroup {
  id: number
  type?: string
  name: string
  scenes: number[]
}

export const initialSceneGroup: SceneGroup = {
  id: 0,
  name: 'New Group',
  scenes: []
}

export function newSceneGroup (init?: Partial<SceneGroup>): SceneGroup {
  return Object.assign(copy<SceneGroup>(initialSceneGroup), init)
}

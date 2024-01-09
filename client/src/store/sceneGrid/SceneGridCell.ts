import { copy } from 'flipflip-common'

export default interface SceneGridCell {
  sceneID: number
  sceneCopy: number[]
  mirror: boolean
}

export const initialSceneGridCell: SceneGridCell = {
  sceneID: -1,
  sceneCopy: [],
  mirror: false
}

export function newSceneGridCell(init?: Partial<SceneGridCell>) {
  return Object.assign(copy<SceneGridCell>(initialSceneGridCell), init)
}

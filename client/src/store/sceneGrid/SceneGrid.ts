import type SceneGridCell from './SceneGridCell'
import { newSceneGridCell } from './SceneGridCell'
import { copy } from 'flipflip-common'

export default interface SceneGrid {
  id: number
  name?: string
  grid: SceneGridCell[][]
}

export const initialSceneGrid: SceneGrid = {
  id: 0,
  grid: [[newSceneGridCell()]]
}

export function newSceneGrid(init?: Partial<SceneGrid>) {
  const sceneGrid = Object.assign(copy<SceneGrid>(initialSceneGrid), init)
  sceneGrid.grid = sceneGrid.grid.map((r) =>
    r.map((c) =>
      !c.sceneID ? newSceneGridCell({ sceneID: parseInt(c as any) }) : c
    )
  )
  return sceneGrid
}

import * as slice from './slice'

export const setSceneGridName = (id: number) => (value: string) =>
  slice.setSceneGridName({ id, value })
export const setSceneGridCellMirror =
  (id: number, row: number, col: number) => (value: boolean) =>
    slice.setSceneGridCellMirror({ id, row, col, value })

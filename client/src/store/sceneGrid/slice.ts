import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type SceneGrid from './SceneGrid'
import type SceneGridCell from './SceneGridCell'
import { newSceneGridCell } from './SceneGridCell'
import {
  deleteEntry,
  type EntryState,
  type EntryUpdate,
  getEntry,
  setEntry,
  type Identifiable
} from '../EntryState'

interface SceneGridCoordinates {
  row: number
  col: number
}

export interface SceneGridAction extends Identifiable, SceneGridCoordinates {}
export interface SceneGridUpdate<T>
  extends EntryUpdate<T>,
    SceneGridCoordinates {}

export const initialSceneGridState: EntryState<SceneGrid> = {
  name: 'sceneGridSlice',
  nextID: 1,
  entries: {}
}

export default function createSceneGridReducer(
  sceneGridState?: EntryState<SceneGrid>
) {
  return createSceneGridSlice(sceneGridState).reducer
}

function createSceneGridSlice(sceneGridState?: EntryState<SceneGrid>) {
  const initialState = sceneGridState ?? initialSceneGridState
  return createSlice({
    name: 'sceneGrids',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setSceneGridSlice: (
        state,
        action: PayloadAction<EntryState<SceneGrid>>
      ) => {
        return action.payload
      },
      setSceneGrid: (state, action: PayloadAction<SceneGrid>) => {
        setEntry(state, action.payload)
      },
      deleteSceneGrid: (state, action: PayloadAction<number>) => {
        deleteEntry(state, action.payload)
      },
      setSceneGridGrid: (
        state,
        action: PayloadAction<EntryUpdate<SceneGridCell[][]>>
      ) => {
        getEntry(state, action.payload.id).grid = action.payload.value
      },
      setSceneGridName: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).name = action.payload.value
      },
      setSceneGridCells: (state, action: PayloadAction<SceneGridAction>) => {
        const grid = getEntry(state, action.payload.id).grid
        const rows = action.payload.row
        const cols = action.payload.col

        // Adjust height
        if (grid.length > rows) {
          grid.splice(rows, grid.length - rows)
        } else if (grid.length < rows) {
          const newRow = Array<SceneGridCell>(rows)
          for (let c = 0; c < newRow.length; c++) {
            newRow[c] = newSceneGridCell()
          }
          grid.push(newRow)
        }
        // Adjust width
        for (const row of grid) {
          if (row.length > cols) {
            row.splice(cols, row.length - cols)
          } else if (row.length < cols) {
            while (row.length < cols) {
              row.push(newSceneGridCell())
            }
          }
        }

        for (const row of grid) {
          for (const cell of row) {
            if (
              cell.sceneCopy.length > 0 &&
              (cell.sceneCopy[0] > rows - 1 || cell.sceneCopy[1] > cols - 1)
            ) {
              cell.sceneCopy = []
              cell.mirror = false
            }
          }
        }
      },
      setSceneGridCellMirror: (
        state,
        action: PayloadAction<SceneGridUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).grid[action.payload.row][
          action.payload.col
        ].mirror = action.payload.value
      },
      setSceneGridCellToggleMirror: (
        state,
        action: PayloadAction<SceneGridAction>
      ) => {
        const cell = getEntry(state, action.payload.id).grid[
          action.payload.row
        ][action.payload.col]
        cell.mirror = !cell.mirror
      },
      setSceneGridCellSceneID: (
        state,
        action: PayloadAction<SceneGridUpdate<number>>
      ) => {
        const { id, row, col, value } = action.payload
        const grid = getEntry(state, id).grid
        const gridCell = grid[row][col]
        gridCell.sceneID = value
        gridCell.sceneCopy = []
        gridCell.mirror = false
        if (action.payload.value === -1) {
          grid.forEach((r) => {
            r.forEach((c) => {
              if (
                c.sceneCopy &&
                c.sceneCopy.length > 0 &&
                c.sceneCopy[0] === row &&
                c.sceneCopy[1] === col
              ) {
                c.sceneCopy = []
                c.mirror = false
              }
            })
          })
        }
      },
      setSceneGridCellSceneCopy: (
        state,
        action: PayloadAction<SceneGridUpdate<number[]>>
      ) => {
        const { id, row, col, value } = action.payload
        const cell = getEntry(state, id).grid[row][col]
        cell.sceneID = -1
        cell.sceneCopy = value
      }
    }
  })
}

export const {
  setSceneGridSlice,
  setSceneGrid,
  setSceneGridGrid,
  setSceneGridName,
  setSceneGridCells,
  setSceneGridCellMirror,
  setSceneGridCellToggleMirror,
  setSceneGridCellSceneID,
  setSceneGridCellSceneCopy,
  deleteSceneGrid
} = createSceneGridSlice().actions

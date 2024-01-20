import { createSelector } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import { getEntry } from '../EntryState'
import type SceneGrid from './SceneGrid'
import { getAppGrids } from '../app/selectors'

export const selectSceneGridName = (id: number) => {
  return (state: RootState) => getEntry(state.sceneGrid, id).name || ''
}

export const selectSceneGridCellSceneID = (
  id: number,
  row: number,
  col: number
) => {
  return (state: RootState) => {
    const grid = getEntry(state.sceneGrid, id).grid
    let cell = grid[row][col]
    const isSceneCopy = cell.sceneCopy && cell.sceneCopy.length > 0
    if (isSceneCopy) {
      cell = grid[cell.sceneCopy[0]][cell.sceneCopy[1]]
    }

    return cell.sceneID
  }
}

export const selectSceneGridCellMirror = (
  id: number,
  row: number,
  col: number
) => {
  return (state: RootState) =>
    getEntry(state.sceneGrid, id).grid[row][col].mirror
}

export const selectSceneGridCellSceneCopy = (
  id: number,
  row: number,
  col: number
) => {
  return (state: RootState) => {
    return getEntry(state.sceneGrid, id).grid[row][col].sceneCopy
  }
}

export const selectSceneGridCellIsSceneCopy = (
  id: number,
  row: number,
  col: number
) => {
  return (state: RootState) => {
    const sceneCopy = getEntry(state.sceneGrid, id).grid[row][col].sceneCopy
    return sceneCopy && sceneCopy.length > 0
  }
}

export const selectSceneGridCellMatchesSceneCopy = (
  id: number,
  sceneCopy: number[]
) => {
  return (state: RootState) => {
    return getEntry(state.sceneGrid, id).grid.find((r) =>
      r.find(
        (c) =>
          c.sceneCopy[0] === sceneCopy[0] && c.sceneCopy[1] === sceneCopy[1]
      )
    )
  }
}

export const selectSceneGridCellSceneName = (
  id: number,
  row: number,
  col: number
) => {
  return (state: RootState) => {
    const grid = getEntry(state.sceneGrid, id).grid
    let cell = grid[row][col]
    const isSceneCopy = cell.sceneCopy && cell.sceneCopy.length > 0
    if (isSceneCopy) {
      cell = grid[cell.sceneCopy[0]][cell.sceneCopy[1]]
    }

    const name = cell.sceneID ? state.scene.entries[cell.sceneID].name : ''
    return isSceneCopy ? '*' + name + '*' : name
  }
}

export const selectSceneGridCellColor = (
  id: number,
  row: number,
  col: number
) => {
  return (state: RootState) => {
    const calculateColorsIndex = (
      row: number,
      col: number,
      rowLength: number,
      colorsLength: number
    ) => {
      return (row * rowLength + col) % colorsLength
    }

    const colors = [
      '#FF0000',
      '#FFA500',
      '#FFFF00',
      '#008000',
      '#0000FF',
      '#EE82EE',
      '#4B0082',
      '#800000',
      '#FF4500',
      '#7FFF00',
      '#7FFFD4',
      '#8B4513'
    ]

    const grid = state.sceneGrid.entries[id].grid
    const sceneCopy = grid[row][col].sceneCopy
    if (sceneCopy && sceneCopy.length > 0) {
      return colors[
        calculateColorsIndex(
          sceneCopy[0],
          sceneCopy[1],
          grid[row].length,
          colors.length
        )
      ]
    } else {
      const isCopied = grid
        .flatMap((row) => row)
        .find(
          (cell) =>
            cell.sceneCopy &&
            cell.sceneCopy.length > 0 &&
            cell.sceneCopy[0] === row &&
            cell.sceneCopy[1] === col
        )

      return isCopied
        ? colors[
            calculateColorsIndex(row, col, grid[row].length, colors.length)
          ]
        : null
    }
  }
}

export const selectSceneGridHeight = (id: number) => {
  return (state: RootState) => {
    const grid = getEntry(state.sceneGrid, id).grid
    return grid && grid.length > 0 && grid[0].length > 0 ? grid.length : 1
  }
}

export const selectSceneGridWidth = (id: number) => {
  return (state: RootState) => {
    const grid = getEntry(state.sceneGrid, id).grid
    return grid && grid.length > 0 && grid[0].length > 0 ? grid[0].length : 1
  }
}

export const getSceneGridEntries = (
  state: RootState
): Record<number, SceneGrid> => state.sceneGrid.entries

export const selectSceneGrids = () => {
  return createSelector([getAppGrids, getSceneGridEntries], (ids, entries) =>
    ids.map((id) => entries[id] as SceneGrid)
  )
}

import { type AppDispatch, type RootState } from '../store'
import { SG } from '../../renderer/data/const'
import { getRandomListItem } from '../../renderer/data/utils'
import { moveScenes, moveGrids, moveSceneGroups } from '../app/slice'
import { routeToScene } from '../app/thunks'
import {
  setSceneGroupAddScene,
  setSceneGroupRemoveScene
} from '../sceneGroup/slice'
import type SceneGroup from '../sceneGroup/SceneGroup'

export function routeToRandomScene () {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const sceneID = getRandomListItem(getState().app.scenes)
    dispatch(routeToScene(sceneID))
  }
}

export function onScenePickerChangeSceneGroupItemsSort (
  sceneGroupID: number,
  filteredItems: number[],
  evtType: string,
  evtOldIndex: number,
  evtNewIndex: number,
  evtItemID: number,
  orderLength: number
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const groupType = (state.sceneGroup.entries[sceneGroupID])
      .type
    const items = groupType === SG.grid ? state.app.grids : state.app.scenes

    let oldIndex = null
    let newIndex = null
    if (evtType === 'update') {
      oldIndex = items.indexOf(filteredItems[evtOldIndex])
      newIndex = items.indexOf(filteredItems[evtNewIndex])
    } else if (orderLength > filteredItems.length) {
      oldIndex = items.indexOf(evtItemID)
      if (evtNewIndex === 0) {
        newIndex = 0
      } else if (evtNewIndex === filteredItems.length) {
        newIndex = items.indexOf(filteredItems[evtNewIndex - 1]) + 1
      } else {
        newIndex = items.indexOf(filteredItems[evtNewIndex])
        if (oldIndex < newIndex) newIndex--
      }
      if (evtItemID) {
        dispatch(setSceneGroupAddScene({ id: sceneGroupID, value: evtItemID }))
      }
    } else if (orderLength < filteredItems.length) {
      dispatch(setSceneGroupRemoveScene({ id: sceneGroupID, value: evtItemID }))
    }
    if (oldIndex != null && newIndex != null) {
      const moveItems = groupType === SG.grid ? moveGrids : moveScenes
      dispatch(moveItems({ oldIndex, newIndex }))
    }
  }
}

export function onScenePickerChangeSceneGroupSort (
  type: string,
  oldIndex: number,
  newIndex: number
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const sceneGroups = state.app.sceneGroups
    const filteredGroups = sceneGroups.filter(
      (id) => (state.sceneGroup.entries[id]).type === type
    )
    oldIndex = sceneGroups.indexOf(filteredGroups.indexOf(oldIndex))
    newIndex = sceneGroups.indexOf(filteredGroups.indexOf(newIndex))
    dispatch(moveSceneGroups({ oldIndex, newIndex }))
  }
}

export function onScenePickerChangeUngroupedSort (
  filteredItems: number[],
  type: string,
  evtType: string,
  evtOldIndex: number,
  evtNewIndex: number,
  evtItemID: number,
  orderLength: number
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const items = type === SG.grid ? state.app.grids : state.app.scenes
    let oldIndex = null
    let newIndex = null
    if (evtType === 'update') {
      oldIndex = items.indexOf(filteredItems[evtOldIndex])
      newIndex = items.indexOf(filteredItems[evtNewIndex])
    } else if (filteredItems.length === orderLength) {
      oldIndex = items.indexOf(evtItemID)
      newIndex = items.indexOf(filteredItems[evtNewIndex])
    }
    if (oldIndex != null && newIndex != null) {
      const moveItems = type === SG.grid ? moveGrids : moveScenes
      dispatch(moveItems({ oldIndex, newIndex }))
    }
  }
}

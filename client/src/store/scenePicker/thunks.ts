import { type AppDispatch, type RootState } from '../store'
import { SG } from 'flipflip-common'
import { getRandomListItem } from '../../data/utils'
import {
  moveScenes,
  moveDisplays,
  movePlaylists,
  moveSceneGroups
} from '../app/slice'
import { routeToScene } from '../app/thunks'
import {
  setSceneGroupAddScene,
  setSceneGroupMoveScenes,
  setSceneGroupRemoveScene
} from '../sceneGroup/slice'

export function routeToRandomScene() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const sceneID = getRandomListItem(getState().app.scenes)
    dispatch(routeToScene(sceneID))
  }
}

export function onScenePickerChangeSceneGroupItemsSort(
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
    const items = state.sceneGroup.entries[sceneGroupID].scenes

    let oldIndex = null
    let newIndex = null
    if (evtType === 'update') {
      oldIndex = items.indexOf(filteredItems[evtOldIndex])
      newIndex = items.indexOf(filteredItems[evtNewIndex])
    } else if (orderLength > filteredItems.length) {
      if (evtItemID) {
        dispatch(setSceneGroupAddScene({ id: sceneGroupID, value: evtItemID }))
      }

      oldIndex = items.length
      newIndex = items.indexOf(filteredItems[evtNewIndex])
      if (newIndex === -1) {
        newIndex = null
      }
    } else if (orderLength < filteredItems.length) {
      dispatch(setSceneGroupRemoveScene({ id: sceneGroupID, value: evtItemID }))
    }
    if (oldIndex != null && newIndex != null) {
      dispatch(
        setSceneGroupMoveScenes({
          id: sceneGroupID,
          value: { oldIndex, newIndex }
        })
      )
    }
  }
}

export function onScenePickerChangeSceneGroupSort(
  type: string,
  oldIndex: number,
  newIndex: number
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const sceneGroups = state.app.sceneGroups
    const filteredGroups = sceneGroups.filter(
      (id) => state.sceneGroup.entries[id].type === type
    )
    oldIndex = sceneGroups.indexOf(filteredGroups.indexOf(oldIndex))
    newIndex = sceneGroups.indexOf(filteredGroups.indexOf(newIndex))
    dispatch(moveSceneGroups({ oldIndex, newIndex }))
  }
}

export function onScenePickerChangeUngroupedSort(
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
    const items = getItems(type, state)
    let oldIndex = null
    let newIndex = null
    if (evtType === 'update') {
      oldIndex = items.indexOf(filteredItems[evtOldIndex])
      newIndex = items.indexOf(filteredItems[evtNewIndex])
    } else if (orderLength > filteredItems.length) {
      oldIndex = items.indexOf(evtItemID)
      newIndex = items.indexOf(filteredItems[evtNewIndex])
      if (newIndex === -1) {
        newIndex = items.length - 1
      }
    }
    if (oldIndex != null && newIndex != null) {
      const moveItems = getMoveItemsAction(type)
      dispatch(moveItems({ oldIndex, newIndex }))
    }
  }
}

const getItems = (type: string, state: RootState) => {
  switch (type) {
    case SG.display:
      return state.app.displays
    case SG.playlist:
      return state.app.playlists
    default:
      return state.app.scenes
  }
}

const getMoveItemsAction = (type: string) => {
  switch (type) {
    case SG.display:
      return moveDisplays
    case SG.playlist:
      return movePlaylists
    default:
      return moveScenes
  }
}

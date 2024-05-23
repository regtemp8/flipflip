import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type SceneGroup from './SceneGroup'
import {
  deleteEntry,
  type EntryState,
  type EntryUpdate,
  setEntry
} from '../EntryState'
import { arrayMove } from '../../data/utils'

export const initialSceneGroupState: EntryState<SceneGroup> = {
  name: 'sceneGroupSlice',
  nextID: 1,
  entries: {}
}

export default function createSceneGroupReducer(
  sceneGroupState?: EntryState<SceneGroup>
) {
  return createSceneGroupSlice(sceneGroupState).reducer
}

function createSceneGroupSlice(sceneGroupState?: EntryState<SceneGroup>) {
  const initialState = sceneGroupState ?? initialSceneGroupState
  return createSlice({
    name: 'sceneGroups',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setSceneGroupSlice: (
        state,
        action: PayloadAction<EntryState<SceneGroup>>
      ) => {
        return action.payload
      },
      setSceneGroup: (state, action: PayloadAction<SceneGroup>) => {
        setEntry(state, action.payload)
      },
      deleteSceneGroup: (state, action: PayloadAction<number>) => {
        deleteEntry(state, action.payload)
      },
      setSceneGroupName: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        state.entries[action.payload.id].name = action.payload.value
      },
      setSceneGroupAddScene: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        state.entries[action.payload.id].scenes.push(action.payload.value)
      },
      setSceneGroupRemoveScene: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const scenes = state.entries[action.payload.id].scenes
        const index = scenes.indexOf(action.payload.value)
        scenes.splice(index, 1)
      },
      setSceneGroupMoveScenes: (
        state,
        action: PayloadAction<
          EntryUpdate<{ oldIndex: number; newIndex: number }>
        >
      ) => {
        const { id, value } = action.payload
        const scenes = state.entries[id].scenes
        arrayMove(scenes, value.oldIndex, value.newIndex)
      }
    }
  })
}

export const {
  setSceneGroupSlice,
  setSceneGroup,
  deleteSceneGroup,
  setSceneGroupName,
  setSceneGroupAddScene,
  setSceneGroupRemoveScene,
  setSceneGroupMoveScenes
} = createSceneGroupSlice().actions

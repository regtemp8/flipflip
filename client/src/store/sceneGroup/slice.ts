import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type SceneGroup from './SceneGroup'
import {
  deleteEntry,
  type EntryState,
  type EntryUpdate,
  setEntry,
  setEntrySlice
} from '../EntryState'

export const initialSceneGroupState: EntryState<SceneGroup> = {
  name: 'sceneGroupSlice',
  nextID: 1,
  entries: {}
}

export default function createSceneGroupReducer(sceneGroupState?: EntryState<SceneGroup>) {
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
        setEntrySlice(state, action.payload)
      },
      setSceneGroup: (state, action: PayloadAction<SceneGroup>) => {
        setEntry(state, action.payload)
      },
      deleteSceneGroup: (state, action: PayloadAction<number>) => {
        deleteEntry(state, action.payload)
      },
      setSceneGroupName: (state, action: PayloadAction<EntryUpdate<string>>) => {
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
  setSceneGroupRemoveScene
} = createSceneGroupSlice().actions
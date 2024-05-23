import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { EntryState, setEntry } from '../EntryState'
import { ScenePlaylistItem } from './ScenePlaylistItem'

export const initialScenePlaylistItemState: EntryState<ScenePlaylistItem> = {
  name: 'scenePlaylistItemSlice',
  nextID: 1,
  entries: {}
}

export default function createScenePlaylistItemReducer(
  scenePlaylistItemState?: EntryState<ScenePlaylistItem>
) {
  return createScenePlaylistItemSlice(scenePlaylistItemState).reducer
}

function createScenePlaylistItemSlice(
  scenePlaylistItemState?: EntryState<ScenePlaylistItem>
) {
  const initialState = scenePlaylistItemState ?? initialScenePlaylistItemState
  return createSlice({
    name: 'scenePlaylistItems',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setScenePlaylistItemSlice: (
        state,
        action: PayloadAction<EntryState<ScenePlaylistItem>>
      ) => {
        return action.payload
      },
      setScenePlaylistItem: (
        state,
        action: PayloadAction<ScenePlaylistItem>
      ) => {
        setEntry(state, action.payload)
      }
    }
  })
}

export const { setScenePlaylistItemSlice, setScenePlaylistItem } =
  createScenePlaylistItemSlice().actions

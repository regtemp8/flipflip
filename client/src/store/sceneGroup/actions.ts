import { type PayloadAction } from '@reduxjs/toolkit'
import * as slice from './slice'
import { type EntryUpdate } from '../EntryState'

export const setSceneGroupName =
  (id: number) =>
  (value: string): PayloadAction<EntryUpdate<string>> =>
    slice.setSceneGroupName({ id, value })

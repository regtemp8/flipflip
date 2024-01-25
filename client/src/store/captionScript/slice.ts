import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type CaptionScript from './CaptionScript'
import {
  type EntryState,
  type EntryUpdate,
  setEntrySlice,
  getEntry,
  setEntry,
  updateEntry
} from '../EntryState'
import { type FontSettingsType } from './FontSettings'
import { getCaptionScriptFontSettings } from './selectors'

export interface FontSettingsUpdate<T> extends EntryUpdate<T> {
  type: FontSettingsType
}

export const initialCaptionScriptState: EntryState<CaptionScript> = {
  name: 'captionScriptSlice',
  nextID: 1,
  entries: {}
}

export default function createCaptionScriptReducer(
  captionScriptState?: EntryState<CaptionScript>
) {
  return createCaptionScriptSlice(captionScriptState).reducer
}

function createCaptionScriptSlice(
  captionScriptState?: EntryState<CaptionScript>
) {
  const initialState = captionScriptState ?? initialCaptionScriptState
  return createSlice({
    name: 'captionScripts',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setCaptionScriptSlice: (
        state,
        action: PayloadAction<EntryState<CaptionScript>>
      ) => {
        setEntrySlice(state, action.payload)
      },
      setCaptionScript: (state, action: PayloadAction<CaptionScript>) => {
        setEntry(state, action.payload)
      },
      updateCaptionScript: (state, action: PayloadAction<CaptionScript>) => {
        updateEntry(state, action.payload)
      },
      setCaptionScriptScript: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).script = action.payload.value
      },
      setCaptionScriptURL: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).url = action.payload.value
      },
      setCaptionScriptStopAtEnd: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).stopAtEnd = action.payload.value
      },
      setCaptionScriptNextSceneAtEnd: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).nextSceneAtEnd = action.payload.value
      },
      setCaptionScriptSyncWithAudio: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).syncWithAudio = action.payload.value
      },
      setCaptionScriptOpacity: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).opacity = action.payload.value
      },
      setCaptionScriptFontSettingsBorder: (
        state,
        action: PayloadAction<FontSettingsUpdate<boolean>>
      ) => {
        getCaptionScriptFontSettings(
          state,
          action.payload.id,
          action.payload.type
        ).border = action.payload.value
      },
      setCaptionScriptFontSettingsColor: (
        state,
        action: PayloadAction<FontSettingsUpdate<string>>
      ) => {
        getCaptionScriptFontSettings(
          state,
          action.payload.id,
          action.payload.type
        ).color = action.payload.value
      },
      setCaptionScriptFontSettingsBorderColor: (
        state,
        action: PayloadAction<FontSettingsUpdate<string>>
      ) => {
        getCaptionScriptFontSettings(
          state,
          action.payload.id,
          action.payload.type
        ).borderColor = action.payload.value
      },
      setCaptionScriptFontSettingsFontFamily: (
        state,
        action: PayloadAction<FontSettingsUpdate<string>>
      ) => {
        getCaptionScriptFontSettings(
          state,
          action.payload.id,
          action.payload.type
        ).fontFamily = action.payload.value
      },
      setCaptionScriptFontSettingsFontSize: (
        state,
        action: PayloadAction<FontSettingsUpdate<number>>
      ) => {
        getCaptionScriptFontSettings(
          state,
          action.payload.id,
          action.payload.type
        ).fontSize = action.payload.value
      },
      setCaptionScriptFontSettingsBorderPx: (
        state,
        action: PayloadAction<FontSettingsUpdate<number>>
      ) => {
        getCaptionScriptFontSettings(
          state,
          action.payload.id,
          action.payload.type
        ).borderpx = action.payload.value
      },
      setCaptionScriptTags: (
        state,
        action: PayloadAction<EntryUpdate<number[]>>
      ) => {
        state.entries[action.payload.id].tags = action.payload.value
      },
      setCaptionScriptToggleTag: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const script = state.entries[action.payload.id]
        const index = script.tags.indexOf(action.payload.value)
        if (index === -1) {
          script.tags.push(action.payload.value)
        } else {
          script.tags.splice(index, 1)
        }
      },
      setCaptionScriptMarked: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).marked = action.payload.value
      }
    }
  })
}

export const {
  setCaptionScriptSlice,
  setCaptionScript,
  updateCaptionScript,
  setCaptionScriptScript,
  setCaptionScriptURL,
  setCaptionScriptStopAtEnd,
  setCaptionScriptNextSceneAtEnd,
  setCaptionScriptSyncWithAudio,
  setCaptionScriptOpacity,
  setCaptionScriptFontSettingsBorder,
  setCaptionScriptFontSettingsColor,
  setCaptionScriptFontSettingsBorderColor,
  setCaptionScriptFontSettingsFontFamily,
  setCaptionScriptFontSettingsFontSize,
  setCaptionScriptFontSettingsBorderPx,
  setCaptionScriptTags,
  setCaptionScriptToggleTag,
  setCaptionScriptMarked
} = createCaptionScriptSlice().actions

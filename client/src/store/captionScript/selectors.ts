import { type RootState } from '../store'
import { type EntryState, getEntry } from '../EntryState'
import type CaptionScript from './CaptionScript'
import { type FontSettingsType } from './FontSettings'
import { createSelector } from '@reduxjs/toolkit'

export const selectCaptionScripts = (ids: number[]) => {
  return createSelector(
    [
      (state: RootState) => ids,
      (state: RootState) => state.captionScript.entries
    ],
    (ids, entries) => ids.map((id) => entries[id])
  )
}

export const selectCaptionScript = (id: number) => {
  return (state: RootState) => getEntry(state.captionScript, id)
}

export const selectCaptionScriptUrl = (id: number) => {
  return (state: RootState) => getEntry(state.captionScript, id)?.url
}

export const selectCaptionScriptScript = (id: number) => {
  return (state: RootState) => getEntry(state.captionScript, id).script
}

export const selectCaptionScriptStopAtEnd = (id: number) => {
  return (state: RootState) => getEntry(state.captionScript, id).stopAtEnd
}

export const selectCaptionScriptNextSceneAtEnd = (id: number) => {
  return (state: RootState) => getEntry(state.captionScript, id).nextSceneAtEnd
}

export const selectCaptionScriptSyncWithAudio = (id: number) => {
  return (state: RootState) => getEntry(state.captionScript, id).syncWithAudio
}

export const selectCaptionScriptOpacity = (id: number) => {
  return (state: RootState) => getEntry(state.captionScript, id).opacity
}

export const selectCaptionScriptMarked = (id: number) => {
  return (state: RootState) => getEntry(state.captionScript, id).marked
}

export const selectCaptionScriptTags = (id: number) => {
  return (state: RootState) => getEntry(state.captionScript, id).tags
}

export const getCaptionScriptFontSettings = (
  state: EntryState<CaptionScript>,
  id: number,
  type: FontSettingsType
) => {
  return getEntry(state, id)[type]
}

export const selectCaptionScriptFontSettingsBlink = (id: number) => {
  return (state: RootState) =>
    getCaptionScriptFontSettings(state.captionScript, id, 'blink')
}

export const selectCaptionScriptFontSettingsCaption = (id: number) => {
  return (state: RootState) =>
    getCaptionScriptFontSettings(state.captionScript, id, 'caption')
}

export const selectCaptionScriptFontSettingsCaptionBig = (id: number) => {
  return (state: RootState) =>
    getCaptionScriptFontSettings(state.captionScript, id, 'captionBig')
}

export const selectCaptionScriptFontSettingsCount = (id: number) => {
  return (state: RootState) =>
    getCaptionScriptFontSettings(state.captionScript, id, 'count')
}

export const selectCaptionScriptFontSettingsBorder = (
  id: number,
  type: FontSettingsType
) => {
  return (state: RootState) =>
    getCaptionScriptFontSettings(state.captionScript, id, type).border
}

export const selectCaptionScriptFontSettingsColor = (
  id: number,
  type: FontSettingsType
) => {
  return (state: RootState) =>
    getCaptionScriptFontSettings(state.captionScript, id, type).color
}

export const selectCaptionScriptFontSettingsBorderColor = (
  id: number,
  type: FontSettingsType
) => {
  return (state: RootState) =>
    getCaptionScriptFontSettings(state.captionScript, id, type).borderColor
}

export const selectCaptionScriptFontSettingsFontFamily = (
  id: number,
  type: FontSettingsType
) => {
  return (state: RootState) =>
    getCaptionScriptFontSettings(state.captionScript, id, type).fontFamily
}

export const selectCaptionScriptFontSettingsFontSize = (
  id: number,
  type: FontSettingsType
) => {
  return (state: RootState) =>
    getCaptionScriptFontSettings(state.captionScript, id, type).fontSize
}

export const selectCaptionScriptFontSettingsBorderPx = (
  id: number,
  type: FontSettingsType
) => {
  return (state: RootState) =>
    getCaptionScriptFontSettings(state.captionScript, id, type).borderpx
}

export const getCaptionScriptEntries = (state: RootState) =>
  state.captionScript.entries

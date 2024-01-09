import { type FontSettingsType } from './FontSettings'
import * as slice from './slice'

export const setCaptionScriptStopAtEnd = (id: number) => (value: boolean) =>
  slice.setCaptionScriptStopAtEnd({ id, value })
export const setCaptionScriptNextSceneAtEnd =
  (id: number) => (value: boolean) =>
    slice.setCaptionScriptNextSceneAtEnd({ id, value })
export const setCaptionScriptSyncWithAudio = (id: number) => (value: boolean) =>
  slice.setCaptionScriptSyncWithAudio({ id, value })
export const setCaptionScriptOpacity = (id: number) => (value: number) =>
  slice.setCaptionScriptOpacity({ id, value })
export const setCaptionScriptFontSettingsBorder =
  (id: number, type: FontSettingsType) => (value: boolean) =>
    slice.setCaptionScriptFontSettingsBorder({ id, type, value })
export const setCaptionScriptFontSettingsColor =
  (id: number, type: FontSettingsType) => (value: string) =>
    slice.setCaptionScriptFontSettingsColor({ id, type, value })
export const setCaptionScriptFontSettingsBorderColor =
  (id: number, type: FontSettingsType) => (value: string) =>
    slice.setCaptionScriptFontSettingsBorderColor({ id, type, value })
export const setCaptionScriptFontSettingsFontFamily =
  (id: number, type: FontSettingsType) => (value: string) =>
    slice.setCaptionScriptFontSettingsFontFamily({ id, type, value })
export const setCaptionScriptFontSettingsFontSize =
  (id: number, type: FontSettingsType) => (value: number) =>
    slice.setCaptionScriptFontSettingsFontSize({ id, type, value })
export const setCaptionScriptFontSettingsBorderPx =
  (id: number, type: FontSettingsType) => (value: number) =>
    slice.setCaptionScriptFontSettingsBorderPx({ id, type, value })

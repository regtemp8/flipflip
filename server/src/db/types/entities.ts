import { Insertable, Selectable, Updateable } from 'kysely'
import {
  Audio as AudioTable,
  AudioPlaylistItem as AudioPlaylistItemTable,
  AudioTag as AudioTagTable,
  Backup as BackupTable,
  CacheSettings as CacheSettingsTable,
  CaptionScript as CaptionScriptTable,
  CaptionScriptPlaylistItem as CaptionScriptPlaylistItemTable,
  CaptionScriptTag as CaptionScriptTagTable,
  Clip as ClipTable,
  ClipTag as ClipTagTable,
  ContentSource as ContentSourceTable,
  ContentSourceBlacklistItem as ContentSourceBlacklistItemTable,
  ContentSourceTag as ContentSourceTagTable,
  Display as DisplayTable,
  DisplaySettings as DisplaySettingsTable,
  DisplayView as DisplayViewTable,
  FontSettings as FontSettingsTable,
  GeneralSettings as GeneralSettingsTable,
  IgnoredTag as IgnoredTagTable,
  Playlist as PlaylistTable,
  RemoteSettings as RemoteSettingsTable,
  Scene as SceneTable,
  SceneGroup as SceneGroupTable,
  ScenePlaylist as ScenePlaylistTable,
  ScenePlaylistItem as ScenePlaylistItemTable,
  ScenePlaylistItemScene as ScenePlaylistItemSceneTable,
  Tag as TagTable,
  Theme as ThemeTable,
  Tutorials as TutorialsTable,
  User as UserTable,
  WeightGroup as WeightGroupTable
} from './generated'

// SELECTS
export type Audio = Selectable<AudioTable>
export type AudioPlaylistItem = Selectable<AudioPlaylistItemTable>
export type AudioTag = Selectable<AudioTagTable>
export type Backup = Selectable<BackupTable>
export type CacheSettings = Selectable<CacheSettingsTable>
export type CaptionScript = Selectable<CaptionScriptTable>
export type CaptionScriptPlaylistItem =
  Selectable<CaptionScriptPlaylistItemTable>
export type CaptionScriptTag = Selectable<CaptionScriptTagTable>
export type Clip = Selectable<ClipTable>
export type ClipTag = Selectable<ClipTagTable>
export type ContentSource = Selectable<ContentSourceTable>
export type ContentSourceBlacklistItem =
  Selectable<ContentSourceBlacklistItemTable>
export type ContentSourceTag = Selectable<ContentSourceTagTable>
export type Display = Selectable<DisplayTable>
export type DisplaySettings = Selectable<DisplaySettingsTable>
export type DisplayView = Selectable<DisplayViewTable>
export type FontSettings = Selectable<FontSettingsTable>
export type GeneralSettings = Selectable<GeneralSettingsTable>
export type IgnoredTag = Selectable<IgnoredTagTable>
export type Playlist = Selectable<PlaylistTable>
export type RemoteSettings = Selectable<RemoteSettingsTable>
export type Scene = Selectable<SceneTable>
export type SceneGroup = Selectable<SceneGroupTable>
export type ScenePlaylist = Selectable<ScenePlaylistTable>
export type ScenePlaylistItem = Selectable<ScenePlaylistItemTable>
export type ScenePlaylistItemScene = Selectable<ScenePlaylistItemSceneTable>
export type Tag = Selectable<TagTable>
export type Theme = Selectable<ThemeTable>
export type Tutorials = Selectable<TutorialsTable>
export type User = Selectable<UserTable>
export type WeightGroup = Selectable<WeightGroupTable>

// INSERTS
export type AudioInsert = Insertable<AudioTable>
export type AudioPlaylistItemInsert = Insertable<AudioPlaylistItemTable>
export type AudioTagInsert = Insertable<AudioTagTable>
export type BackupInsert = Insertable<BackupTable>
export type CacheSettingsInsert = Insertable<CacheSettingsTable>
export type CaptionScriptInsert = Insertable<CaptionScriptTable>
export type CaptionScriptPlaylistItemInsert =
  Insertable<CaptionScriptPlaylistItemTable>
export type CaptionScriptTagInsert = Insertable<CaptionScriptTagTable>
export type ClipInsert = Insertable<ClipTable>
export type ClipTagInsert = Insertable<ClipTagTable>
export type ContentSourceInsert = Insertable<ContentSourceTable>
export type ContentSourceBlacklistItemInsert =
  Insertable<ContentSourceBlacklistItemTable>
export type ContentSourceTagInsert = Insertable<ContentSourceTagTable>
export type DisplayInsert = Insertable<DisplayTable>
export type DisplaySettingsInsert = Insertable<DisplaySettingsTable>
export type DisplayViewInsert = Insertable<DisplayViewTable>
export type FontSettingsInsert = Insertable<FontSettingsTable>
export type GeneralSettingsInsert = Insertable<GeneralSettingsTable>
export type IgnoredTagInsert = Insertable<IgnoredTagTable>
export type PlaylistInsert = Insertable<PlaylistTable>
export type RemoteSettingsInsert = Insertable<RemoteSettingsTable>
export type SceneInsert = Insertable<SceneTable>
export type SceneGroupInsert = Insertable<SceneGroupTable>
export type ScenePlaylistInsert = Insertable<ScenePlaylistTable>
export type ScenePlaylistItemInsert = Insertable<ScenePlaylistItemTable>
export type ScenePlaylistItemSceneInsert =
  Insertable<ScenePlaylistItemSceneTable>
export type TagInsert = Insertable<TagTable>
export type ThemeInsert = Insertable<ThemeTable>
export type TutorialsInsert = Insertable<TutorialsTable>
export type UserInsert = Insertable<UserTable>
export type WeightGroupInsert = Insertable<WeightGroupTable>

// UPDATES
export type AudioUpdate = Updateable<AudioTable>
export type AudioPlaylistItemUpdate = Updateable<AudioPlaylistItemTable>
export type AudioTagUpdate = Updateable<AudioTagTable>
export type BackupUpdate = Updateable<BackupTable>
export type CacheSettingsUpdate = Updateable<CacheSettingsTable>
export type CaptionScriptUpdate = Updateable<CaptionScriptTable>
export type CaptionScriptPlaylistItemUpdate =
  Updateable<CaptionScriptPlaylistItemTable>
export type CaptionScriptTagUpdate = Updateable<CaptionScriptTagTable>
export type ClipUpdate = Updateable<ClipTable>
export type ClipTagUpdate = Updateable<ClipTagTable>
export type ContentSourceUpdate = Updateable<ContentSourceTable>
export type ContentSourceBlacklistItemUpdate =
  Updateable<ContentSourceBlacklistItemTable>
export type ContentSourceTagUpdate = Updateable<ContentSourceTagTable>
export type DisplayUpdate = Updateable<DisplayTable>
export type DisplaySettingsUpdate = Updateable<DisplaySettingsTable>
export type DisplayViewUpdate = Updateable<DisplayViewTable>
export type FontSettingsUpdate = Updateable<FontSettingsTable>
export type GeneralSettingsUpdate = Updateable<GeneralSettingsTable>
export type IgnoredTagUpdate = Updateable<IgnoredTagTable>
export type PlaylistUpdate = Updateable<PlaylistTable>
export type RemoteSettingsUpdate = Updateable<RemoteSettingsTable>
export type SceneUpdate = Updateable<SceneTable>
export type SceneGroupUpdate = Updateable<SceneGroupTable>
export type ScenePlaylistUpdate = Updateable<ScenePlaylistTable>
export type ScenePlaylistItemUpdate = Updateable<ScenePlaylistItemTable>
export type ScenePlaylistItemSceneUpdate =
  Updateable<ScenePlaylistItemSceneTable>
export type TagUpdate = Updateable<TagTable>
export type ThemeUpdate = Updateable<ThemeTable>
export type TutorialsUpdate = Updateable<TutorialsTable>
export type UserUpdate = Updateable<UserTable>
export type WeightGroupUpdate = Updateable<WeightGroupTable>

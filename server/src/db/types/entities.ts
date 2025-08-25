import { Selectable } from "kysely"
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
} from "./generated"

export type Audio = Selectable<AudioTable>
export type AudioPlaylistItem = Selectable<AudioPlaylistItemTable>
export type AudioTag = Selectable<AudioTagTable>
export type Backup = Selectable<BackupTable>
export type CacheSettings = Selectable<CacheSettingsTable>
export type CaptionScript = Selectable<CaptionScriptTable>
export type CaptionScriptPlaylistItem = Selectable<CaptionScriptPlaylistItemTable>
export type CaptionScriptTag = Selectable<CaptionScriptTagTable>
export type Clip = Selectable<ClipTable>
export type ClipTag = Selectable<ClipTagTable> 
export type ContentSource = Selectable<ContentSourceTable>
export type ContentSourceBlacklistItem = Selectable<ContentSourceBlacklistItemTable>
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


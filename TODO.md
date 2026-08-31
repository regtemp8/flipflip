# MUI v5 Migration TODO

> The `@mui/icons-material`, `@mui/lab`, `@mui/material`, `@mui/styles`, and `@mui/system` packages have been upgraded to version 5 in `package.json`, but the codebase still uses MUI v4 patterns. This TODO lists every React component that uses MUI and the migration tasks required.

---

## Migration Overview

| Pattern | Files Affected | v5 Status |
|---|---|---|
| `withStyles` + `createStyles` (JSS) | **65 files** | **Removed** — must migrate to `styled` API or `sx` prop |
| `@mui/icons-material` | **42 files** | Still available, verify import paths |
| `@mui/material` core components | **30 files** | Major API changes |
| `@mui/lab/Masonry` | **2 files** | **Removed from `@mui/lab`** — moved to `@mui/material` |
| `@mui/material/colors` | **14 files** | Import path may change |
| `StyledEngineProvider` + `ThemeProvider` | **1 file** | New injection pattern required |
| `ThemeOptions` | **1 file** | Renamed in v5 |

---

## Critical Migration Tasks

### 1. Replace `withStyles` + `createStyles` with `styled` API or `sx` prop (65 files)

`withStyles` and `createStyles` from `@mui/styles` are **removed** in MUI v5. Each file must be migrated.

**Recommended approach:**
- For simple styling: use the `sx` prop directly
- For reusable styles: use the `styled` component API from `@mui/material/styles`

**Affected files (65 total):**

#### config/ (7 files)
- `src/renderer/components/config/ColorPicker.tsx`
- `src/renderer/components/config/ColorSetPicker.tsx`
- `src/renderer/components/config/ConfigForm.tsx`
- `src/renderer/components/config/GridSetup.tsx`
- `src/renderer/components/config/ThemeColorPicker.tsx`
- `src/renderer/components/config/VideoClipper.tsx`

#### configGroups/ (20 files)
- `src/renderer/components/configGroups/APICard.tsx`
- `src/renderer/components/configGroups/AudioCard.tsx`
- `src/renderer/components/configGroups/BackupCard.tsx`
- `src/renderer/components/configGroups/CacheCard.tsx`
- `src/renderer/components/configGroups/CrossFadeCard.tsx`
- `src/renderer/components/configGroups/FadeIOCard.tsx`
- `src/renderer/components/configGroups/ImageVideoCard.tsx`
- `src/renderer/components/configGroups/MultiSceneSelect.tsx`
- `src/renderer/components/configGroups/PanningCard.tsx`
- `src/renderer/components/configGroups/PlayerNumCard.tsx`
- `src/renderer/components/configGroups/PlaylistSelect.tsx`
- `src/renderer/components/configGroups/SceneOptionCard.tsx`
- `src/renderer/components/configGroups/SceneSelect.tsx`
- `src/renderer/components/configGroups/ScriptPlaylist.tsx`
- `src/renderer/components/configGroups/SlideCard.tsx`
- `src/renderer/components/configGroups/StrobeCard.tsx`
- `src/renderer/components/configGroups/TextCard.tsx`
- `src/renderer/components/configGroups/ThemeCard.tsx`
- `src/renderer/components/configGroups/WatermarkCard.tsx`
- `src/renderer/components/configGroups/ZoomMoveCard.tsx`

#### library/ (18 files)
- `src/renderer/components/library/AudioAlbumList.tsx`
- `src/renderer/components/library/AudioArtistList.tsx`
- `src/renderer/components/library/AudioEdit.tsx`
- `src/renderer/components/library/AudioLibrary.tsx`
- `src/renderer/components/library/AudioOptions.tsx`
- `src/renderer/components/library/AudioSourceListItem.tsx`
- `src/renderer/components/library/AudioSourceList.tsx`
- `src/renderer/components/library/BatchClipDialog.tsx`
- `src/renderer/components/library/FontOptions.tsx`
- `src/renderer/components/library/LibrarySearch.tsx`
- `src/renderer/components/library/Library.tsx`
- `src/renderer/components/library/PlaylistList.tsx`
- `src/renderer/components/library/ScriptLibrary.tsx`
- `src/renderer/components/library/ScriptOptions.tsx`
- `src/renderer/components/library/ScriptSourceListItem.tsx`
- `src/renderer/components/library/ScriptSourceList.tsx`
- `src/renderer/components/library/SourceListItem.tsx`
- `src/renderer/components/library/SourceList.tsx`
- `src/renderer/components/library/TagManager.tsx`

#### player/ (8 files)
- `src/renderer/components/player/AudioAlert.tsx`
- `src/renderer/components/player/AudioControl.tsx`
- `src/renderer/components/player/AudioPlaylist.tsx`
- `src/renderer/components/player/GridPlayer.tsx`
- `src/renderer/components/player/PictureGrid.tsx`
- `src/renderer/components/player/PlayerBars.tsx`
- `src/renderer/components/player/VideoControl.tsx`

#### sceneDetail/ (12 files)
- `src/renderer/components/sceneDetail/CaptionScriptor.tsx`
- `src/renderer/components/sceneDetail/GooninatorDialog.tsx`
- `src/renderer/components/sceneDetail/HydrusDialog.tsx`
- `src/renderer/components/sceneDetail/PiwigoDialog.tsx`
- `src/renderer/components/sceneDetail/SceneDetail.tsx`
- `src/renderer/components/sceneDetail/SceneEffects.tsx`
- `src/renderer/components/sceneDetail/SceneGenerator.tsx`
- `src/renderer/components/sceneDetail/SceneOptions.tsx`
- `src/renderer/components/sceneDetail/URLDialog.tsx`

#### Other (4 files)
- `src/renderer/components/ScenePicker.tsx`
- `src/renderer/components/Tutorial.tsx`
- `src/renderer/SceneSearch.tsx`
- `src/renderer/Template.tsx`

---

### 2. Migrate `@mui/lab/Masonry` to `@mui/material` (2 files)

`@mui/lab` is no longer included in the main MUI package in v5. The `Masonry` component has moved.

**Affected files:**
- `src/renderer/components/config/GeneralConfig.tsx` — imports `Masonry` from `@mui/lab/Masonry/Masonry`
- `src/renderer/components/player/PictureGrid.tsx` — imports `Masonry` from `@mui/lab/Masonry`

**Migration:** Change import to `@mui/material/Masonry` (or use a third-party Masonry component if not available).

---

### 3. Update `StyledEngineProvider` injection pattern (1 file)

MUI v5 requires `StyledEngineProvider` to be the root provider to handle CSS injection.

**Affected file:**
- `src/renderer/components/Meta.tsx` — already imports `StyledEngineProvider` and `ThemeProvider` from `@mui/material/styles`

**Check:** Ensure `StyledEngineProvider` wraps `ThemeProvider` at the root of the app.

---

### 4. Update `ThemeOptions` type (1 file)

`ThemeOptions` has been renamed/moved in MUI v5.

**Affected file:**
- `src/renderer/components/Meta.tsx` — imports `ThemeOptions` from `@mui/material/styles`

---

### 5. Update `@mui/material/colors` imports (14 files)

The color palette is now a separate package. Import paths may need updating.

**Affected files:**
- `src/renderer/components/config/ThemeColorPicker.tsx`
- `src/renderer/components/config/VideoClipper.tsx`
- `src/renderer/components/configGroups/MultiSceneSelect.tsx`
- `src/renderer/components/configGroups/PlaylistSelect.tsx`
- `src/renderer/components/configGroups/SceneSelect.tsx`
- `src/renderer/components/library/AudioLibrary.tsx`
- `src/renderer/components/library/AudioOptions.tsx`
- `src/renderer/components/library/AudioSourceListItem.tsx`
- `src/renderer/components/library/LibrarySearch.tsx`
- `src/renderer/components/library/ScriptOptions.tsx`
- `src/renderer/components/library/ScriptSourceListItem.tsx`
- `src/renderer/components/library/SourceListItem.tsx`
- `src/renderer/components/player/AudioAlert.tsx`
- `src/renderer/SceneSearch.tsx`

---

### 6. Update `@mui/icons-material` imports (42 files)

Verify all icon imports still work correctly with v5.

**Affected files (42 total):**
- `src/renderer/components/ErrorBoundary.tsx`
- `src/renderer/components/ScenePicker.tsx`
- `src/renderer/components/Tutorial.tsx`
- `src/renderer/components/config/ColorSetPicker.tsx`
- `src/renderer/components/config/ConfigForm.tsx`
- `src/renderer/components/config/GridSetup.tsx`
- `src/renderer/components/config/VideoClipper.tsx`
- `src/renderer/components/configGroups/AudioCard.tsx`
- `src/renderer/components/configGroups/BackupCard.tsx`
- `src/renderer/components/configGroups/CacheCard.tsx`
- `src/renderer/components/configGroups/CrossFadeCard.tsx`
- `src/renderer/components/configGroups/FadeIOCard.tsx`
- `src/renderer/components/configGroups/ImageVideoCard.tsx`
- `src/renderer/components/configGroups/PanningCard.tsx`
- `src/renderer/components/configGroups/SceneOptionCard.tsx`
- `src/renderer/components/configGroups/ScriptPlaylist.tsx`
- `src/renderer/components/configGroups/SlideCard.tsx`
- `src/renderer/components/configGroups/StrobeCard.tsx`
- `src/renderer/components/configGroups/TextCard.tsx`
- `src/renderer/components/configGroups/ZoomMoveCard.tsx`
- `src/renderer/components/library/AudioAlbumList.tsx`
- `src/renderer/components/library/AudioArtistList.tsx`
- `src/renderer/components/library/AudioEdit.tsx`
- `src/renderer/components/library/AudioLibrary.tsx`
- `src/renderer/components/library/AudioOptions.tsx`
- `src/renderer/components/library/AudioSourceListItem.tsx`
- `src/renderer/components/library/Library.tsx`
- `src/renderer/components/library/PlaylistList.tsx`
- `src/renderer/components/library/ScriptLibrary.tsx`
- `src/renderer/components/library/ScriptSourceListItem.tsx`
- `src/renderer/components/library/SourceIcon.tsx`
- `src/renderer/components/library/SourceListItem.tsx`
- `src/renderer/components/library/SourceList.tsx`
- `src/renderer/components/library/TagManager.tsx`
- `src/renderer/components/player/AudioControl.tsx`
- `src/renderer/components/player/AudioPlaylist.tsx`
- `src/renderer/components/player/PlayerBars.tsx`
- `src/renderer/components/player/VideoControl.tsx`
- `src/renderer/components/sceneDetail/CaptionScriptor.tsx`
- `src/renderer/components/sceneDetail/PiwigoDialog.tsx`
- `src/renderer/components/sceneDetail/SceneDetail.tsx`
- `src/renderer/components/sceneDetail/SceneGenerator.tsx`

---

### 7. Update common `Theme` interface (`src/common/theme.ts`)

The theme interface uses v4 naming conventions (e.g., `A100`, `A200`, `A400`, `A700` color scales are removed in v5; `type` is deprecated).

**Tasks:**
- Remove `A100`, `A200`, `A400`, `A700` from primary palette (no longer used in v5)
- Remove `type` field (deprecated in v5, use `mode` instead)
- Update `text.hint` → `text.disabled` (v5 uses `disabled` instead of `hint`)
- Ensure `mode: "light" | "dark"` is properly typed

---

## Recommended Migration Order

1. **`src/common/theme.ts`** — Update the shared theme interface first
2. **`src/renderer/components/Meta.tsx`** — Update root provider setup (`StyledEngineProvider` + theme)
3. **`src/renderer/components/config/GeneralConfig.tsx`** and **`src/renderer/components/player/PictureGrid.tsx`** — Fix `@mui/lab/Masonry` imports (critical build blockers)
4. **`src/renderer/components/config/ThemeColorPicker.tsx`** — Fix `@mui/material/colors` import (used as reference for other files)
5. **Batch migrate `withStyles` → `styled`/`sx`** — Process files by directory (config → configGroups → library → player → sceneDetail → other)
6. **Verify all `@mui/icons-material` imports** — Run type-check after all other changes
7. **Run tests and verify visually** — Check every screen/page for styling regressions

---

## Summary Statistics

| Category | Count |
|---|---|
| Total React components using MUI | **65+** |
| Files using `withStyles` + `createStyles` (must migrate) | **65** |
| Files using `@mui/icons-material` | **42** |
| Files using `@mui/material` core | **30** |
| Files using `@mui/lab/Masonry` (critical) | **2** |
| Files using `@mui/material/colors` | **14** |
| Files using `StyledEngineProvider`/`ThemeProvider` | **1** |
| Files using `ThemeOptions` | **1** |
| Shared theme interface files | **1** |

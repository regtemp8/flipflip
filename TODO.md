# MUI v5 Migration TODO

> `@mui/*` packages upgraded to v5 in `package.json`, but codebase still uses MUI v4 patterns (`withStyles`, `createStyles`, `@mui/lab/Masonry`, deprecated tokens).

## Quick Reference: Key v5 Changes

| v4 Pattern | v5 Replacement |
|---|---|
| `withStyles(styles)(Component)` | `styled(Component)(styles)` or `sx={}` prop |
| `createStyles({})` | Remove — not needed in v5 |
| `@mui/styles/withStyles` | `@mui/material/styles/styled` |
| `MuiThemeProvider` | `ThemeProvider` from `@mui/material` |
| `@mui/lab/Masonry` | `@mui/material/Masonry` |
| `@mui/material/colors/blue` | `@mui/material/colors/blue` (unchanged) |
| `alpha`/`darken` from `@mui/material/styles` | `@mui/material/styles` (unchanged) |
| `primary: { A100, A200, A400, A700 }` | Remove — deprecated in v5 |
| `theme.type` | `theme.mode` |
| `theme.palette.text.hint` | `theme.palette.text.disabled` |
| Root provider | Wrap with `StyledEngineProvider` |

---

## Phase 0 — Infrastructure (1 file)

### 0.1 Add `StyledEngineProvider` to root

**File:** `src/renderer/components/Meta.tsx`

- Add `StyledEngineProvider` import from `@mui/material`
- Wrap the root component tree with it
- Replace `MuiThemeProvider` → `ThemeProvider` (from `@mui/material`, not `@mui/styles`)
- Remove `@mui/styles/MuiThemeProvider` import

```tsx
// Before
import { MuiThemeProvider } from '@mui/styles';
<MuiThemeProvider theme={theme}>
  <App />
</MuiThemeProvider>

// After
import { ThemeProvider, StyledEngineProvider } from '@mui/material';
<StyledEngineProvider injectFirst>
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
</StyledEngineProvider>
```

**Verification:** `yarn package` completes without build errors.

---

## Phase 1 — Critical Build Blockers (2 files)

### 1.1 Fix `@mui/lab/Masonry` import

**Files:** `src/renderer/components/config/GeneralConfig.tsx`, `src/renderer/components/player/PictureGrid.tsx`

- Replace `import { Masonry } from '@mui/lab/Masonry'` → `import { Masonry } from '@mui/material'`
- Check for any API changes in usage (props may differ slightly)

**Verification:** `yarn package` completes without build errors; no Masonry-related errors.

---

## Phase 2 — Theme Interface (1 file)

### 2.1 Update `src/common/theme.ts`

- Remove `A100`, `A200`, `A400`, `A700` from primary/secondary palettes
- Replace `type: 'light' | 'dark'` → `mode: 'light' | 'dark'`
- Replace `text.hint` → `text.disabled`
- Ensure `ThemeOptions` import is from `@mui/material` (not `@mui/styles`)

**Verification:** `yarn package` completes without build errors.

---

## Phase 3 — `withStyles` → `styled`/`sx` (Batch: config/ — 6 files)

**Strategy:** For each file, replace `withStyles` HOC with `styled` API.

| # | File |
|---|---|
| 3.1 | `src/renderer/components/config/ColorPicker.tsx` |
| 3.2 | `src/renderer/components/config/ColorSetPicker.tsx` |
| 3.3 | `src/renderer/components/config/ConfigForm.tsx` |
| 3.4 | `src/renderer/components/config/ThemeColorPicker.tsx` |
| 3.5 | `src/renderer/components/config/VideoClipper.tsx` |
| 3.6 | `src/renderer/components/config/GridSetup.tsx` |

**Pattern for each file:**
```tsx
// Before
import { withStyles, createStyles } from '@mui/styles';
const styles = createStyles({ root: { padding: 16 } });
class MyComponent extends React.Component<{ classes: string }> {}
export default withStyles(styles)(MyComponent);

// After
import { styled } from '@mui/material/styles';
const StyledComponent = styled('div')(({ theme }) => ({
  root: { padding: 16 },
}));
// or use sx prop directly on the element
```

**Verification:** `yarn package` completes without build errors after each file.

---

## Phase 4 — `withStyles` → `styled`/`sx` (Batch: configGroups/ — 20 files)

| # | File |
|---|---|
| 4.1 | `src/renderer/components/configGroups/APICard.tsx` |
| 4.2 | `src/renderer/components/configGroups/AudioCard.tsx` |
| 4.3 | `src/renderer/components/configGroups/BackupCard.tsx` |
| 4.4 | `src/renderer/components/configGroups/CacheCard.tsx` |
| 4.5 | `src/renderer/components/configGroups/CrossFadeCard.tsx` |
| 4.6 | `src/renderer/components/configGroups/FadeIOCard.tsx` |
| 4.7 | `src/renderer/components/configGroups/ImageVideoCard.tsx` |
| 4.8 | `src/renderer/components/configGroups/MultiSceneSelect.tsx` |
| 4.9 | `src/renderer/components/configGroups/PanningCard.tsx` |
| 4.10 | `src/renderer/components/configGroups/PlayerNumCard.tsx` |
| 4.11 | `src/renderer/components/configGroups/PlaylistSelect.tsx` |
| 4.12 | `src/renderer/components/configGroups/SceneOptionCard.tsx` |
| 4.13 | `src/renderer/components/configGroups/SceneSelect.tsx` |
| 4.14 | `src/renderer/components/configGroups/ScriptPlaylist.tsx` |
| 4.15 | `src/renderer/components/configGroups/SlideCard.tsx` |
| 4.16 | `src/renderer/components/configGroups/StrobeCard.tsx` |
| 4.17 | `src/renderer/components/configGroups/TextCard.tsx` |
| 4.18 | `src/renderer/components/configGroups/ThemeCard.tsx` |
| 4.19 | `src/renderer/components/configGroups/WatermarkCard.tsx` |
| 4.20 | `src/renderer/components/configGroups/ZoomMoveCard.tsx` |

**Verification:** `yarn package` completes without build errors after each file.

---

## Phase 5 — `withStyles` → `styled`/`sx` (Batch: library/ — 18 files)

| # | File |
|---|---|
| 5.1 | `src/renderer/components/library/AudioAlbumList.tsx` |
| 5.2 | `src/renderer/components/library/AudioArtistList.tsx` |
| 5.3 | `src/renderer/components/library/AudioEdit.tsx` |
| 5.4 | `src/renderer/components/library/AudioLibrary.tsx` |
| 5.5 | `src/renderer/components/library/AudioOptions.tsx` |
| 5.6 | `src/renderer/components/library/AudioSourceListItem.tsx` |
| 5.7 | `src/renderer/components/library/AudioSourceList.tsx` |
| 5.8 | `src/renderer/components/library/BatchClipDialog.tsx` |
| 5.9 | `src/renderer/components/library/FontOptions.tsx` |
| 5.10 | `src/renderer/components/library/LibrarySearch.tsx` |
| 5.11 | `src/renderer/components/library/Library.tsx` |
| 5.12 | `src/renderer/components/library/PlaylistList.tsx` |
| 5.13 | `src/renderer/components/library/ScriptLibrary.tsx` |
| 5.14 | `src/renderer/components/library/ScriptSourceListItem.tsx` |
| 5.15 | `src/renderer/components/library/SourceIcon.tsx` |
| 5.16 | `src/renderer/components/library/SourceListItem.tsx` |
| 5.17 | `src/renderer/components/library/SourceList.tsx` |
| 5.18 | `src/renderer/components/library/TagManager.tsx` |

**Verification:** `yarn package` completes without build errors after each file.

---

## Phase 6 — `withStyles` → `styled`/`sx` (Batch: player/ + sceneDetail/ — 8 files)

| # | File |
|---|---|
| 6.1 | `src/renderer/components/player/AudioControl.tsx` |
| 6.2 | `src/renderer/components/player/AudioPlaylist.tsx` |
| 6.3 | `src/renderer/components/player/PlayerBars.tsx` |
| 6.4 | `src/renderer/components/player/VideoControl.tsx` |
| 6.5 | `src/renderer/components/sceneDetail/CaptionScriptor.tsx` |
| 6.6 | `src/renderer/components/sceneDetail/PiwigoDialog.tsx` |
| 6.7 | `src/renderer/components/sceneDetail/SceneDetail.tsx` |
| 6.8 | `src/renderer/components/sceneDetail/SceneGenerator.tsx` |

**Verification:** `yarn package` completes without build errors after each file.

---

## Phase 7 — Final Verification

### 7.1 Check all `@mui/icons-material` imports

- Verify 42 files still import from `@mui/icons-material` (should be unchanged)
- Check for any icon deprecations

### 7.2 Run full type-check

```
yarn make
```

### 7.3 Visual regression check

- Launch app (`yarn start`)
- Navigate through every screen: config, library, player, scene detail
- Verify themes (light/dark), spacing, and layout look correct

---

## Summary

| Category | Count |
|---|---|
| Total files using MUI | **65+** |
| `withStyles`/`createStyles` to migrate | **65** |
| `@mui/icons-material` files | **42** |
| `@mui/material` core files | **30** |
| `@mui/lab/Masonry` (critical) | **2** |
| `@mui/material/colors` files | **14** |
| Theme provider updates | **1** |

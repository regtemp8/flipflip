import { createSelector } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import { getEntry } from '../EntryState'
import type App from './data/App'
import type Route from './data/Route'
import { getActiveScene } from './thunks'
import { selectSceneSources } from '../scene/selectors'
import type LibrarySource from '../librarySource/LibrarySource'
import type CaptionScript from '../captionScript/CaptionScript'
import {
  getCaptionScriptEntries,
  selectCaptionScripts
} from '../captionScript/selectors'
import type Audio from '../audio/Audio'
import type Tag from '../tag/Tag'
import { getSourceType, en, SP, ST } from 'flipflip-common'
import { filterSource } from '../../data/utils'
import type Tutorials from './data/Tutorials'
import type Config from './data/Config'
import type Clip from '../clip/Clip'
import { getTagEntries } from '../tag/selectors'
import { getClipEntries } from '../clip/selectors'
import {
  selectLibrarySources,
  getLibrarySourceEntries
} from '../librarySource/selectors'
import { getAudioEntries, selectAudios } from '../audio/selectors'
import { ThemeOptions } from '@mui/material'

export const selectUndefined = (state: RootState): undefined => undefined

export const selectAppIsInitialized = () => {
  return (state: RootState): boolean => {
    return state.app.version !== '' && state.constants.saveDir !== ''
  }
}

export const selectAppPlaylists = () => {
  return (state: RootState): number[] => state.app.playlists
}

export const selectAppTags = () => {
  return (state: RootState): number[] => state.app.tags
}

export const selectAppTagsCount =
  () =>
  (state: RootState): number =>
    state.app.tags.length

export const selectAppIsLibrary = () => {
  return (state: RootState): boolean => getActiveScene(state) === undefined
}

export const selectAppLibrary = () => {
  return (state: RootState) => state.app.library
}

export const selectAppLibraryCount = () => {
  return (state: RootState): number => state.app.library.length
}

export const selectAppLibraryFilters = () => {
  return (state: RootState): string[] => state.app.libraryFilters
}

export const selectAppLibrarySelected = () => {
  return (state: RootState): number[] => state.app.librarySelected
}

export const selectAppLibraryYOffset = () => {
  return (state: RootState): number => state.app.libraryYOffset
}

export const selectAppLibrarySearchOptions = (
  displaySources: number[],
  filters: string[],
  searchInput: string,
  isLibrary?: boolean,
  isAudio?: boolean,
  isScript?: boolean,
  onlyUsed?: boolean,
  onlyTags?: boolean,
  onlyTagsAndTypes?: boolean,
  isCreatable?: boolean,
  withBrackets?: boolean,
  noTypes?: boolean
) => {
  let selectDisplaySources: (
    state: RootState
  ) => LibrarySource[] | Audio[] | CaptionScript[]
  if (isLibrary === true) {
    selectDisplaySources = selectLibrarySources(displaySources)
  } else if (isAudio === true) {
    selectDisplaySources = selectAudios(displaySources)
  } else if (isScript === true) {
    selectDisplaySources = selectCaptionScripts(displaySources)
  } else {
    throw new Error('No library search type specified')
  }

  return createSelector(
    [
      (state) => filters,
      (state) => searchInput,
      (state) => onlyUsed,
      (state) => onlyTags,
      (state) => onlyTagsAndTypes,
      (state) => isCreatable,
      (state) => withBrackets,
      (state) => noTypes,
      selectAppTags(),
      getTagEntries,
      selectDisplaySources,
      getClipEntries
    ],
    (
      filters,
      searchInput,
      onlyUsed,
      onlyTags,
      onlyTagsAndTypes,
      isCreatable,
      withBrackets,
      noTypes,
      appTags,
      tagEntries,
      displaySources,
      clipEntries
    ) => {
      const tags = new Map<string, number>()
      if (onlyUsed !== true) {
        appTags
          .map((id) => tagEntries[id])
          .filter((t) => t.name != null)
          .map((t) => t.name as string)
          .forEach((name) => tags.set(name, 0))
      }
      const types = new Map<string, number>()
      let untaggedCount = 0
      let offlineCount = 0
      let markedCount = 0
      for (const source of displaySources) {
        if (source.offline) {
          offlineCount++
        }
        if (source.marked) {
          markedCount++
        }

        let untagged = true
        if (source.tags.length > 0) {
          untagged = false
          for (const tagID of source.tags) {
            const tag = tagEntries[tagID] as Tag
            if (tag.name === undefined) continue
            const tagCount = tags.get(tag.name) ?? 0
            tags.set(tag.name, tagCount + 1)
          }
        }

        if (isLibrary === true) {
          const librarySource = source as LibrarySource
          for (const clipID of librarySource.clips) {
            const clip = clipEntries[clipID] as Clip
            for (const tagID of clip.tags) {
              untagged = false
              if (!librarySource.tags.includes(tagID)) {
                const tag = tagEntries[tagID] as Tag
                if (tag.name === undefined) continue
                const tagCount = tags.get(tag.name) ?? 0
                tags.set(tag.name, tagCount + 1)
              }
            }
          }
        }

        if (untagged) {
          untaggedCount += 1
        }

        const type =
          source?.url !== undefined
            ? en.get(getSourceType(source.url))
            : undefined
        if (type !== undefined) {
          const typeCount = types.get(type) ?? 0
          types.set(type, typeCount + 1)
        }
      }

      const tagKeys = Array.from(tags.keys()).sort((a, b) => {
        const aCount = tags.get(a) as number
        const bCount = tags.get(b) as number
        if (aCount > bCount) {
          return -1
        } else if (aCount < bCount) {
          return 1
        } else {
          return 0
        }
      })
      const typeKeys = Array.from(types.keys()).sort((a, b) => {
        const aCount = types.get(a) as number
        const bCount = types.get(b) as number
        if (aCount > bCount) {
          return -1
        } else if (aCount < bCount) {
          return 1
        } else {
          return 0
        }
      })

      const options = filters.map((filter) => {
        return { label: filter, value: filter }
      })
      if (onlyTags !== true && onlyTagsAndTypes !== true) {
        if (untaggedCount > 0 && !filters.includes('<Untagged>')) {
          options.push({
            label: '<Untagged> (' + untaggedCount + ')',
            value: '<Untagged>'
          })
        }
        if (offlineCount > 0 && !filters.includes('<Offline>')) {
          options.push({
            label: '<Offline> (' + offlineCount + ')',
            value: '<Offline>'
          })
        }
        if (markedCount > 0 && !filters.includes('<Marked>')) {
          options.push({
            label: '<Marked> (' + markedCount + ')',
            value: '<Marked>'
          })
        }
      }
      for (const tag of tagKeys) {
        const opt =
          isCreatable === true || withBrackets === true ? '[' + tag + ']' : tag
        if (!filters.includes(opt)) {
          options.push({ label: tag + ' (' + tags.get(tag) + ')', value: opt })
        }
      }
      if (onlyTags !== true && noTypes !== true) {
        for (const type of typeKeys) {
          const opt =
            isCreatable === true || withBrackets === true
              ? '{' + type + '}'
              : type
          if (!filters.includes(opt)) {
            options.push({
              label: type + ' (' + types.get(type) + ')',
              value: opt
            })
          }
        }
      }
      if (searchInput.startsWith('-')) {
        for (const tag of tagKeys) {
          const opt =
            isCreatable === true || withBrackets === true
              ? '[' + tag + ']'
              : tag
          if (!filters.includes(opt)) {
            options.push({
              label: '-' + tag + ' (' + tags.get(tag) + ')',
              value: '-' + opt
            })
          }
        }
        for (const type of typeKeys) {
          const opt =
            isCreatable === true || withBrackets === true
              ? '{' + type + '}'
              : type
          if (!filters.includes(opt)) {
            options.push({
              label: '-' + type + ' (' + types.get(type) + ')',
              value: '-' + opt
            })
          }
        }
      }

      return options
    }
  )
}

export const selectAppTheme = () => {
  return (state: RootState): ThemeOptions => state.app.theme
}

export const selectAppThemeMode = () => {
  return (state: RootState): boolean => state.app.theme.palette?.mode === 'dark'
}

export const selectAppThemePalettePrimary = () => {
  return (state: RootState): Record<string, string> => {
    return state.app.theme.palette?.primary as Record<string, string>
  }
}

export const selectAppThemePaletteSecondary = () => {
  return (state: RootState): Record<string, string> => {
    return state.app.theme.palette?.secondary as Record<string, string>
  }
}

export const selectAppSystemMessage = () => {
  return (state: RootState): string | undefined => state.app.systemMessage
}

export interface SystemSnack {
  open: boolean
  message?: string
  severity?: string
}

const getAppSystemSnackMessage = (state: RootState) => state.app.systemSnack
const getAppSystemSnackOpen = (state: RootState) => state.app.systemSnackOpen
const getAppSystemSnackSeverity = (state: RootState) =>
  state.app.systemSnackSeverity

export const selectAppSystemSnack = () => {
  return createSelector(
    [
      getAppSystemSnackMessage,
      getAppSystemSnackOpen,
      getAppSystemSnackSeverity
    ],
    (message, open, severity) => {
      return { message, open, severity }
    }
  )
}

export const selectAppTutorial = () => {
  return (state: RootState): string | undefined => state.app.tutorial
}

export const selectAppSpecialMode = () => {
  return (state: RootState): string | undefined => state.app.specialMode
}

export const selectAppVersion = () => {
  return (state: RootState): string => state.app.version
}

export const selectAppConfig = () => {
  return (state: RootState): Config => state.app.config
}

export const selectAppConfigCachingEnabled = () => {
  return (state: RootState): boolean => state.app.config.caching.enabled
}

export const selectAppConfigCachingDirectory = () => {
  return (state: RootState): string => state.app.config.caching.directory
}

export const selectAppConfigCachingMaxSize = () => {
  return (state: RootState): number => state.app.config.caching.maxSize
}

export const selectAppConfigGeneralSettingsPrioritizePerformance = () => {
  return (state: RootState): boolean =>
    state.app.config.generalSettings.prioritizePerformance
}

export const selectAppConfigGeneralSettingsConfirmSceneDeletion = () => {
  return (state: RootState): boolean =>
    state.app.config.generalSettings.confirmSceneDeletion
}

export const selectAppConfigGeneralSettingsConfirmBlacklist = () => {
  return (state: RootState): boolean =>
    state.app.config.generalSettings.confirmBlacklist
}

export const selectAppConfigGeneralSettingsConfirmFileDeletion = () => {
  return (state: RootState): boolean =>
    state.app.config.generalSettings.confirmFileDeletion
}

export const selectAppConfigGeneralSettingsPortableMode = () => {
  return (state: RootState): boolean =>
    state.app.config.generalSettings.portableMode
}

export const selectAppConfigGeneralSettingsDisableLocalSave = () => {
  return (state: RootState): boolean =>
    state.app.config.generalSettings.disableLocalSave
}

export const selectAppConfigGeneralSettingsAutoBackup = () => {
  return (state: RootState): boolean =>
    state.app.config.generalSettings.autoBackup
}

export const selectAppConfigGeneralSettingsAutoCleanBackup = () => {
  return (state: RootState): boolean =>
    state.app.config.generalSettings.autoCleanBackup
}

export const selectAppConfigGeneralSettingsAutoBackupDays = () => {
  return (state: RootState): number =>
    state.app.config.generalSettings.autoBackupDays
}

export const selectAppConfigGeneralSettingsAutoCleanBackupDays = () => {
  return (state: RootState): number =>
    state.app.config.generalSettings.autoCleanBackupDays
}

export const selectAppConfigGeneralSettingsAutoCleanBackupWeeks = () => {
  return (state: RootState): number =>
    state.app.config.generalSettings.autoCleanBackupWeeks
}

export const selectAppConfigGeneralSettingsAutoCleanBackupMonths = () => {
  return (state: RootState): number =>
    state.app.config.generalSettings.autoCleanBackupMonths
}

export const selectAppConfigGeneralSettingsCleanRetain = () => {
  return (state: RootState): number =>
    state.app.config.generalSettings.cleanRetain
}

export const selectAppConfigDisplaySettingsEasingControls = () => {
  return (state: RootState): boolean =>
    state.app.config.displaySettings.easingControls
}

export const selectAppConfigDisplaySettingsFullScreen = () => {
  return (state: RootState): boolean =>
    state.app.config.displaySettings.fullScreen
}

export const selectAppConfigDisplaySettingsStartImmediately = () => {
  return (state: RootState): boolean =>
    state.app.config.displaySettings.startImmediately
}

export const selectAppConfigDisplaySettingsClickToProgress = () => {
  return (state: RootState): boolean =>
    state.app.config.displaySettings.clickToProgress
}

export const selectAppConfigDisplaySettingsClickToProgressWhilePlaying = () => {
  return (state: RootState): boolean =>
    state.app.config.displaySettings.clickToProgressWhilePlaying
}

export const selectAppConfigDisplaySettingsAudioAlert = () => {
  return (state: RootState): boolean =>
    state.app.config.displaySettings.audioAlert
}

export const selectAppConfigDisplaySettingsCloneGridVideoElements = () => {
  return (state: RootState): boolean =>
    state.app.config.displaySettings.cloneGridVideoElements
}

export const selectAppConfigDisplaySettingsIgnoredTags = () => {
  return (state: RootState): string[] =>
    state.app.config.displaySettings.ignoredTags
}

export const selectAppConfigDisplaySettingsMinImageSize = () => {
  return (state: RootState): number =>
    state.app.config.displaySettings.minImageSize
}

export const selectAppConfigDisplaySettingsMinVideoSize = () => {
  return (state: RootState): number =>
    state.app.config.displaySettings.minVideoSize
}

export const selectAppConfigDisplaySettingsMaxInHistory = () => {
  return (state: RootState): number =>
    state.app.config.displaySettings.maxInHistory
}

export const selectAppConfigDisplaySettingsMaxInMemory = () => {
  return (state: RootState): number =>
    state.app.config.displaySettings.maxInMemory
}

export const selectAppConfigDisplaySettingsMaxLoadingAtOnce = () => {
  return (state: RootState): number =>
    state.app.config.displaySettings.maxLoadingAtOnce
}

export const selectAppConfigGeneralSettingsWatermark = () => {
  return (state: RootState): boolean =>
    state.app.config.generalSettings.watermark
}

export const selectAppConfigGeneralSettingsWatermarkGrid = () => {
  return (state: RootState): boolean =>
    state.app.config.generalSettings.watermarkGrid
}

export const selectAppConfigGeneralSettingsWatermarkCorner = () => {
  return (state: RootState): string =>
    state.app.config.generalSettings.watermarkCorner
}

export const selectAppConfigGeneralSettingsWatermarkFontFamily = () => {
  return (state: RootState): string =>
    state.app.config.generalSettings.watermarkFontFamily
}

export const selectAppConfigGeneralSettingsWatermarkColor = () => {
  return (state: RootState): string =>
    state.app.config.generalSettings.watermarkColor
}

export const selectAppConfigGeneralSettingsWatermarkText = () => {
  return (state: RootState): string =>
    state.app.config.generalSettings.watermarkText
}

export const selectAppConfigGeneralSettingsWatermarkFontSize = () => {
  return (state: RootState): number =>
    state.app.config.generalSettings.watermarkFontSize
}

export interface WatermarkSettings {
  fontFamily: string
  fontSize: number
  color: string
  text: string
  corner: string
}

export const selectAppConfigGeneralSettingsWatermarkSettings = (
  gridView: boolean
) => {
  return createSelector(
    [
      (state) => gridView,
      selectAppConfigGeneralSettingsWatermark(),
      selectAppConfigGeneralSettingsWatermarkGrid(),
      selectAppConfigGeneralSettingsWatermarkFontFamily(),
      selectAppConfigGeneralSettingsWatermarkFontSize(),
      selectAppConfigGeneralSettingsWatermarkColor(),
      selectAppConfigGeneralSettingsWatermarkText(),
      selectAppConfigGeneralSettingsWatermarkCorner()
    ],
    (gridView, enabled, isGrid, fontFamily, fontSize, color, text, corner) => {
      const settings: WatermarkSettings | undefined =
        enabled && (!gridView || isGrid)
          ? { fontFamily, fontSize, color, text, corner }
          : undefined

      return settings
    }
  )
}

export const selectAppConfigRemoteSettingsSilenceTumblrAlert = () => {
  return (state: RootState): boolean =>
    state.app.config.remoteSettings.silenceTumblrAlert
}

export const selectAppConfigRemoteSettingsTumblrAuthorized = () => {
  return (state: RootState): boolean => {
    const settings = state.app.config.remoteSettings
    return (
      settings.tumblrOAuthToken !== '' && settings.tumblrOAuthTokenSecret !== ''
    )
  }
}

export const selectAppConfigRemoteSettingsTumblrKeys = () => {
  return (state: RootState): string[] =>
    state.app.config.remoteSettings.tumblrKeys
}

export const selectAppConfigRemoteSettingsTumblrKey = () => {
  return (state: RootState): string => state.app.config.remoteSettings.tumblrKey
}

export const selectAppConfigRemoteSettingsTumblrSecrets = () => {
  return (state: RootState): string[] =>
    state.app.config.remoteSettings.tumblrSecrets
}

export const selectAppConfigRemoteSettingsTumblrSecret = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.tumblrSecret
}

export const selectAppConfigRemoteSettingsRedditAuthorized = () => {
  return (state: RootState): boolean =>
    state.app.config.remoteSettings.redditRefreshToken !== ''
}

export const selectAppConfigRemoteSettingsRedditClientID = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.redditClientID
}

export const selectAppConfigRemoteSettingsRedditUserAgent = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.redditUserAgent
}

export const selectAppConfigRemoteSettingsRedditDeviceID = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.redditDeviceID
}

export const selectAppConfigRemoteSettingsTwitterAuthorized = () => {
  return (state: RootState): boolean => {
    const settings = state.app.config.remoteSettings
    return (
      settings.twitterAccessTokenKey !== '' &&
      settings.twitterAccessTokenSecret !== ''
    )
  }
}

export const selectAppConfigRemoteSettingsTwitterConsumerKey = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.twitterConsumerKey
}

export const selectAppConfigRemoteSettingsTwitterConsumerSecret = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.twitterConsumerSecret
}

export const selectAppConfigRemoteSettingsInstagramConfigured = () => {
  return (state: RootState): boolean => {
    const settings = state.app.config.remoteSettings
    return (
      settings.instagramUsername !== '' && settings.instagramPassword !== ''
    )
  }
}

export const selectAppConfigRemoteSettingsInstagramUsername = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.instagramUsername
}

export const selectAppConfigRemoteSettingsInstagramPassword = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.instagramPassword
}

export const selectAppConfigRemoteSettingsHydrusConfigured = () => {
  return (state: RootState): boolean =>
    state.app.config.remoteSettings.hydrusAPIKey !== ''
}

export const selectAppConfigRemoteSettingsHydrusProtocol = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.hydrusProtocol
}

export const selectAppConfigRemoteSettingsHydrusDomain = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.hydrusDomain
}

export const selectAppConfigRemoteSettingsHydrusPort = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.hydrusPort
}

export const selectAppConfigRemoteSettingsHydrusAPIKey = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.hydrusAPIKey
}

export const selectAppConfigRemoteSettingsPiwigoConfigured = () => {
  return (state: RootState): boolean => {
    const settings = state.app.config.remoteSettings
    return (
      settings.piwigoProtocol !== '' &&
      settings.piwigoHost !== '' &&
      settings.piwigoUsername !== '' &&
      settings.piwigoPassword !== ''
    )
  }
}

export const selectAppConfigRemoteSettingsPiwigoProtocol = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.piwigoProtocol
}

export const selectAppConfigRemoteSettingsPiwigoHost = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.piwigoHost
}

export const selectAppConfigRemoteSettingsPiwigoUsername = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.piwigoUsername
}

export const selectAppConfigRemoteSettingsPiwigoPassword = () => {
  return (state: RootState): string =>
    state.app.config.remoteSettings.piwigoPassword
}

export const selectAppConfigServerSettingsHost = () => {
  return (state: RootState): string => state.app.config.serverSettings.host
}

export const selectAppConfigServerSettingsPort = () => {
  return (state: RootState): number => state.app.config.serverSettings.port
}

export const selectAppConfigNewWindowAlerted = () => {
  return (state: RootState): boolean => state.app.config.newWindowAlerted
}

export const selectAppConfigTutorials = () => {
  return (state: RootState): Tutorials => state.app.config.tutorials
}

export const selectAppConfigDefaultSceneVideoVolume = () => {
  return (state: RootState): number => state.app.config.defaultScene.videoVolume
}

export const selectAppConfigDefaultSceneOrderFunction = () => {
  return (state: RootState): string =>
    state.app.config.defaultScene.orderFunction
}

export const getAppIsRoute = (route: Route, kind: string): boolean => {
  return route.kind === kind
}

export const getAppLastRoute = (app: App): Route | undefined => {
  return app.route.length > 0 ? app.route[app.route.length - 1] : undefined
}

export const selectAppLastRoute = () => {
  return (state: RootState): Route | undefined => getAppLastRoute(state.app)
}

export const selectAppLastRouteIsConfig = () => {
  return (state: RootState): boolean =>
    getAppLastRoute(state.app)?.kind === 'config'
}

export const selectAppLastRouteIsPlayer = () => {
  return (state: RootState): boolean => {
    const kind = getAppLastRoute(state.app)?.kind ?? ''
    return ['play', 'libraryplay', 'gridplay', 'scriptor'].includes(kind)
  }
}

export const selectAppCanGenerate = () => {
  return (state: RootState): boolean => state.app.library.length > 0
}

export const selectAppCanGrid = () => {
  return (state: RootState): boolean => state.app.scenes.length > 0
}

export const selectAppAudioOpenTab = () => {
  return (state: RootState): number => state.app.audioOpenTab
}

export const selectAppAudioFilters = () => {
  return (state: RootState): string[] => state.app.audioFilters
}

export const selectAppAudioSelected = () => {
  return (state: RootState): number[] => state.app.audioSelected
}

export const selectAppAudios = () => {
  return (state: RootState): number[] => state.app.audios
}

export const selectAppAudioLibraryCount = () => {
  return (state: RootState): number => state.app.audios.length
}

export const selectAppScriptLibraryCount = () => {
  return (state: RootState): number => state.app.scripts.length
}

export const selectAppOpenTab = () => {
  return (state: RootState): number => state.app.openTab
}

export const selectAppScenes = () => {
  return (state: RootState): number[] => state.app.scenes
}

export const getLibrarySource = (
  state: RootState
): LibrarySource | undefined => {
  const activeScene = getActiveScene(state)
  return activeScene !== undefined
    ? state.librarySource.entries[activeScene.libraryID]
    : undefined
}

export const getAudioSource = (state: RootState): Audio | undefined => {
  const activeScene = getActiveScene(state)
  return activeScene !== undefined
    ? state.audio.entries[activeScene.libraryID]
    : undefined
}

export const getScriptSource = (
  state: RootState
): CaptionScript | undefined => {
  const activeScene = getActiveScene(state)
  return activeScene !== undefined
    ? state.captionScript.entries[activeScene.libraryID]
    : undefined
}

export const selectAppPlayerTags =
  (sceneID: number) =>
  (state: RootState): number[] | undefined => {
    const route = getAppLastRoute(state.app)
    const isLibraryPlay =
      route !== undefined && getAppIsRoute(route, 'libraryplay')
    if (!isLibraryPlay) {
      return undefined
    }

    const scene = getEntry(state.scene, sceneID)
    if (scene?.audioScene === true) {
      return getAudioSource(state)?.tags
    } else if (scene?.scriptScene === true) {
      return getScriptSource(state)?.tags
    } else {
      const source = getLibrarySource(state)
      return source?.id !== -1 ? source?.tags : undefined
    }
  }

export const selectAppPlayerTagsIncludes =
  (sceneID: number, tagID: number) =>
  (state: RootState): boolean => {
    const tags = selectAppPlayerTags(sceneID)(state)
    return tags !== undefined && tags.includes(tagID)
  }

export const selectPlayerAllTags =
  () =>
  (state: RootState): number[] | undefined => {
    const route = getAppLastRoute(state.app)
    const isLibraryPlay =
      route !== undefined && getAppIsRoute(route, 'libraryplay')
    return isLibraryPlay ? state.app.tags : undefined
  }

export const selectAppPlayerCanInheritClipTags = (sceneID: number) => {
  return (state: RootState): boolean => {
    const tags = selectAppPlayerTags(sceneID)(state)
    const sources = selectSceneSources(sceneID)(state)
    const source =
      sources !== undefined && sources.length > 0
        ? state.librarySource.entries[sources[0]]
        : undefined
    const clips = source?.clips ?? []
    return (
      (tags === undefined || tags.length === 0) &&
      clips.find((clipID) => {
        const clip = state.clip.entries[clipID]
        return clip !== undefined && clip.tags.length > 0
      }) != null
    )
  }
}

export const selectAppProgressMode = () => {
  return (state: RootState): string | undefined => state.app.progressMode
}

export const selectAppProgressCurrent = () => {
  return (state: RootState): number => state.app.progressCurrent
}

export const selectAppProgressTotal = () => {
  return (state: RootState): number => state.app.progressTotal
}

function selectCommonTagNames<T extends Audio | CaptionScript | LibrarySource>(
  getSelected: (rs: RootState) => number[],
  getStateEntries: (rs: RootState) => Record<number, T>,
  getTagEntries: (rs: RootState) => Record<number, Tag>
) {
  return createSelector(
    [getSelected, getStateEntries, getTagEntries],
    (selected, stateEntries, tagEntries) => {
      let commonTagNames: string[] = []
      for (const id of selected) {
        const tagIDs = stateEntries[id]?.tags ?? []
        const tagNames = tagIDs
          .map((id) => tagEntries[id]?.name ?? '')
          .filter((name) => name !== '')
        if (commonTagNames.length === 0) {
          commonTagNames = tagNames
        } else {
          commonTagNames = commonTagNames.filter((name) =>
            tagNames.includes(name)
          )
        }

        if (commonTagNames.length === 0) break
      }

      return commonTagNames
    }
  )
}

export const selectAppAudioSelectedTagNames = () => {
  return selectCommonTagNames(
    selectAppAudioSelected(),
    getAudioEntries,
    getTagEntries
  )
}

export const selectAppScriptSelectedTagNames = () => {
  return selectCommonTagNames(
    selectAppScriptSelected(),
    getCaptionScriptEntries,
    getTagEntries
  )
}

export const selectAppLibrarySelectedTagNames = () => {
  return selectCommonTagNames(
    selectAppLibrarySelected(),
    getLibrarySourceEntries,
    getTagEntries
  )
}

export const selectAppScriptSelected = () => {
  return (state: RootState): number[] => state.app.scriptSelected
}

export const selectAppScripts = () => {
  return (state: RootState): number[] => state.app.scripts
}

export const selectAppScriptFilters = () => {
  return (state: RootState): string[] => state.app.scriptFilters
}

export const selectAppFilteredScripts = () => {
  return createSelector(
    [
      selectAppScriptFilters(),
      selectAppScripts(),
      getCaptionScriptEntries,
      getTagEntries
    ],
    (scriptFilters, scripts, scriptEntries, tagEntries) => {
      let displaySources: number[] = []
      const filtering = scriptFilters.length > 0
      if (filtering) {
        for (const id of scripts) {
          let matchesFilter = true
          const source = scriptEntries[id]
          for (let filter of scriptFilters) {
            if (filter === '<Marked>') {
              // This is a marked filter
              matchesFilter = source.marked
            } else if (filter === '<Untagged>') {
              // This is untagged filter
              matchesFilter = source.tags.length === 0
            } else if (
              (filter.startsWith('[') || filter.startsWith('-[')) &&
              filter.endsWith(']')
            ) {
              // This is a tag filter
              if (filter.startsWith('-')) {
                const tag = filter.substring(2, filter.length - 1)
                matchesFilter =
                  source.tags
                    .map((id) => tagEntries[id])
                    .find((t) => t.name === tag) == null
              } else {
                const tag = filter.substring(1, filter.length - 1)
                matchesFilter =
                  source.tags
                    .map((id) => tagEntries[id])
                    .find((t) => t.name === tag) != null
              }
            } else if (
              ((filter.startsWith('"') || filter.startsWith('-"')) &&
                filter.endsWith('"')) ||
              ((filter.startsWith("'") || filter.startsWith("-'")) &&
                filter.endsWith("'"))
            ) {
              if (filter.startsWith('-')) {
                filter = filter.substring(2, filter.length - 1)
                const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
                matchesFilter = !regex.test(source.url as string)
              } else {
                filter = filter.substring(1, filter.length - 1)
                const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
                matchesFilter = regex.test(source.url as string)
              }
            } else {
              // This is a search filter
              filter = filter.replace('\\', '\\\\')
              if (filter.startsWith('-')) {
                filter = filter.substring(1, filter.length)
                const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
                matchesFilter = !regex.test(source.url as string)
              } else {
                const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
                matchesFilter = regex.test(source.url as string)
              }
            }
            if (!matchesFilter) break
          }
          if (matchesFilter) {
            displaySources.push(id)
          }
        }
      } else {
        displaySources = scripts
      }
      return displaySources
    }
  )
}

const getMerges = (
  sources: LibrarySource[],
  tagEntries: Record<number, Tag>
): LibrarySource[] => {
  let merges: LibrarySource[] = []
  const remainingLibrary = sources.filter((ls) => {
    return (
      ls.url !== undefined &&
      getSourceType(ls.url) === ST.local &&
      ls.tags.length > 0
    )
  })

  // While we still have sources left to check
  while (remainingLibrary.length > 0) {
    // Grab the first source in the list
    const source = remainingLibrary.splice(0, 1)[0]
    const matches = [source]

    // For the rest of the sources
    for (const rs of remainingLibrary) {
      // Compare tags
      if (rs.tags.length === source.tags.length) {
        let hasAllTags = true
        const tagNames = source.tags.map((id) => tagEntries[id].name)
        for (const tagID of rs.tags) {
          if (!tagNames.includes(tagEntries[tagID].name)) {
            hasAllTags = false
          }
        }
        // If the tags are the same, add to matches
        if (hasAllTags) {
          matches.push(rs)
        }
      }
    }
    // If we've found matches
    if (matches.length > 1) {
      for (const m of matches) {
        if (m !== source) {
          // Remove them from the remaining library
          remainingLibrary.splice(remainingLibrary.indexOf(m), 1)
        }
      }
      // Add to the master lit of mergeables
      merges = merges.concat(matches)
    }
  }
  return merges
}

export const selectAppFilteredSources = () => {
  return createSelector(
    [
      selectAppLibraryFilters(),
      selectLibrarySources(),
      selectAppSpecialMode(),
      getTagEntries
    ],
    (filters, librarySources, specialMode, tagEntries) => {
      let displaySources: LibrarySource[] = []
      const filtering = filters.length > 0
      if (filtering) {
        const sources = filters.includes('<Mergeable>')
          ? getMerges(librarySources, tagEntries)
          : librarySources
        for (const source of sources) {
          let matchesFilter = true
          for (const filter of filters) {
            matchesFilter = filterSource(
              filter,
              source,
              undefined,
              tagEntries,
              sources
            )
            if (!matchesFilter) break
          }
          if (matchesFilter) {
            displaySources.push(source)
          }
        }
      } else {
        displaySources = librarySources
      }
      if (specialMode === SP.batchClip) {
        displaySources = displaySources.filter((s) => {
          return s.url !== undefined && getSourceType(s.url) === ST.video
        })
      }
      return displaySources.map((s) => s.id)
    }
  )
}

export const selectAppAudioYOffset = () => {
  return (state: RootState): number => state.app.audioYOffset
}

export const selectAppScriptYOffset = () => {
  return (state: RootState): number => state.app.scriptYOffset
}

export const getAppGrids = (state: RootState) => state.app.grids
export const getAppScenes = (state: RootState) => state.app.scenes
export const getAppSceneGroups = (state: RootState) => state.app.sceneGroups
export const getAppDisplays = (state: RootState) => state.app.displays

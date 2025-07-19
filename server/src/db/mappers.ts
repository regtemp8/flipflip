import fs from 'fs'
import path from 'path'
import {
  CacheSettings,
  DisplaySettings,
  GeneralSettings,
  Scene,
  SceneGroup,
  ThemeSettings,
  RemoteSettings,
  Tutorials,
  ContentSource,
  Clip,
  Tag,
  Display,
  Playlist,
  SceneGroupItem,
  Audio,
  CaptionScript,
  FontSettings,
  Backup,
  CleanBackupsRequest,
  DefaultCleanBackupsRequest,
  AutoCleanBackupsRequest,
  CacheSize,
  SelectOption,
  DisplayView,
  ImagePlayerData,
  RP
} from 'flipflip-common'
import {
  Scene as SceneRow,
  Tutorials as TutorialsRow,
  Theme as ThemeRow,
  GeneralSettings as GeneralSettingsRow,
  DisplaySettings as DisplaySettingsRow,
  RemoteSettings as RemoteSettingsRow,
  CacheSettings as CacheSettingsRow,
  ContentSource as ContentSourceRow,
  Audio as AudioRow,
  Clip as ClipRow,
  Tag as TagRow,
  Display as DisplayRow,
  DisplayView as DisplayViewRow,
  Playlist as PlaylistRow,
  CaptionScript as CaptionScriptRow,
  FontSettings as FontSettingsRow,
  Backup as BackupRow
} from './types/generated'
import { SceneGroupItemRow } from './types/SceneGroupItemRow'
import { SceneGroupRow } from './types/SceneGroupRow'
import { toBoolean, toNumberOpt, toStringArray, toTextOpt } from './utils'
import { SceneUpdate } from './SceneRepository'
import { ThemeUpdate } from './ThemeRepository'
import { GeneralSettingsUpdate } from './GeneralSettingsRepository'
import { RemoteSettingsUpdate } from './RemoteSettingsRepository'
import { DisplaySettingsUpdate } from './DisplaySettingsRepository'
import { CacheSettingsUpdate } from './CacheSettingsRepository'
import { ContentSourceUpdate } from './ContentSourceRepository'
import { ClipUpdate } from './ClipRepository'
import { TagUpdate } from './TagRepository'
import { DisplayUpdate } from './DisplayRepository'
import { PlaylistUpdate } from './PlaylistRepository'
import { PlaylistGroupRow } from './types/PlaylistGroupRow'
import { PlaylistGroupItemRow } from './types/PlaylistGroupItemRow'
import { AudioUpdate } from './AudioRepository'
import {
  CaptionScriptUpdate,
  FontSettingsUpdate
} from './CaptionScriptRepository'
import { getBackupsDir, getCacheDir, getThumbsDir } from '../utils'
import { BackupSettings } from './types/BackupSettings'
import { SearchOption } from './types/SearchOption'

export function toSceneGroups(
  rows: Array<SceneGroupRow | PlaylistGroupRow>,
  type: string
): Record<number, SceneGroup> {
  const groups: Record<number, SceneGroup> = {}
  for (const row of rows) {
    let group = groups[row.id as number]
    if (group == null) {
      group = {
        id: row.id as number,
        name: row.name,
        type,
        items: []
      }

      groups[row.id as number] = group
    }

    group.items.push(toSceneGroupItem(row))
  }

  return groups
}

export function toSceneGroupItems(
  rows: Array<SceneGroupItemRow | PlaylistGroupItemRow>
): SceneGroupItem[] {
  return rows.map((row) => toSceneGroupItem(row))
}

export function toSceneGroupItem(
  row: SceneGroupItemRow | PlaylistGroupItemRow
): SceneGroupItem {
  const type = 'itemType' in row ? row.itemType : undefined
  return { id: row.itemId as number, name: row.itemName, type }
}

export function toScene(row: SceneRow): Scene {
  return {
    id: row.id as number,
    name: row.name,
    sources: [],
    useWeights: toBoolean(row.useWeights),

    timingFunction: row.timingFunction,
    timingConstant: row.timingConstant,
    timingMin: row.timingMin,
    timingMax: row.timingMax,
    timingSinRate: row.timingSinRate,
    timingBPMMulti: row.timingBpmMulti,
    backForth: toBoolean(row.backForth),
    backForthTF: row.backForthTf,
    backForthConstant: row.backForthConstant,
    backForthMin: row.backForthMin,
    backForthMax: row.backForthMax,
    backForthSinRate: row.backForthSinRate,
    backForthBPMMulti: row.backForthBpmMulti,
    imageType: row.imageType,
    backgroundType: row.backgroundType,
    backgroundColor: row.backgroundColor,
    backgroundColorSet: toStringArray(row.backgroundColorSet),
    backgroundBlur: row.backgroundBlur,

    imageTypeFilter: row.imageTypeFilter,
    fullSource: toBoolean(row.fullSource),
    imageOrientation: row.imageOrientation,
    gifOption: row.gifOption,
    gifTimingConstant: row.gifTimingConstant,
    gifTimingMin: row.gifTimingMin,
    gifTimingMax: row.gifTimingMax,
    videoOrientation: row.videoOrientation,
    videoOption: row.videoOption,
    videoTimingConstant: row.videoTimingConstant,
    videoTimingMin: row.videoTimingMin,
    videoTimingMax: row.videoTimingMax,
    videoSpeed: row.videoSpeed,
    videoRandomSpeed: toBoolean(row.videoRandomSpeed),
    videoSpeedMin: row.videoSpeedMin,
    videoSpeedMax: row.videoSpeedMax,
    videoSkip: row.videoSkip,
    randomVideoStart: toBoolean(row.randomVideoStart),
    continueVideo: toBoolean(row.continueVideo),
    playVideoClips: toBoolean(row.playVideoClips),
    skipVideoStart: row.skipVideoStart,
    skipVideoEnd: row.skipVideoEnd,
    videoVolume: row.videoVolume,
    weightFunction: row.weightFunction,
    sourceOrderFunction: row.sourceOrderFunction,
    forceAllSource: toBoolean(row.forceAllSource),
    orderFunction: row.orderFunction,
    forceAll: toBoolean(row.forceAll),

    zoom: toBoolean(row.zoom),
    zoomRandom: toBoolean(row.zoomRandom),
    zoomStart: row.zoomStart,
    zoomStartMin: row.zoomStartMin,
    zoomStartMax: row.zoomStartMax,
    zoomEnd: row.zoomEnd,
    zoomEndMin: row.zoomEndMin,
    zoomEndMax: row.zoomEndMax,
    horizTransType: row.horizTransType,
    horizTransLevel: row.horizTransLevel,
    horizTransLevelMin: row.horizTransLevelMin,
    horizTransLevelMax: row.horizTransLevelMax,
    horizTransRandom: toBoolean(row.horizTransRandom),
    vertTransType: row.vertTransType,
    vertTransLevel: row.vertTransLevel,
    vertTransLevelMin: row.vertTransLevelMin,
    vertTransLevelMax: row.vertTransLevelMax,
    vertTransRandom: toBoolean(row.vertTransRandom),
    transTF: row.transTf,
    transDuration: row.transDuration,
    transDurationMin: row.transDurationMin,
    transDurationMax: row.transDurationMax,
    transSinRate: row.transSinRate,
    transBPMMulti: row.transBpmMulti,
    transEase: row.transEase,
    transExp: row.transExp,
    transAmp: row.transAmp,
    transPer: row.transPer,
    transOv: row.transOv,

    crossFade: toBoolean(row.crossFade),
    crossFadeAudio: toBoolean(row.crossFadeAudio),
    fadeTF: row.fadeTf,
    fadeDuration: row.fadeDuration,
    fadeDurationMin: row.fadeDurationMin,
    fadeDurationMax: row.fadeDurationMax,
    fadeSinRate: row.fadeSinRate,
    fadeBPMMulti: row.fadeBpmMulti,
    fadeEase: row.fadeEase,
    fadeExp: row.fadeExp,
    fadeAmp: row.fadeAmp,
    fadePer: row.fadePer,
    fadeOv: row.fadeOv,

    slide: toBoolean(row.slide),
    slideTF: row.slideTf,
    slideType: row.slideType,
    slideDistance: row.slideDistance,
    slideDuration: row.slideDuration,
    slideDurationMin: row.slideDurationMin,
    slideDurationMax: row.slideDurationMax,
    slideSinRate: row.slideSinRate,
    slideBPMMulti: row.slideBpmMulti,
    slideEase: row.slideEase,
    slideExp: row.slideExp,
    slideAmp: row.slideAmp,
    slidePer: row.slidePer,
    slideOv: row.slideOv,

    strobe: toBoolean(row.strobe),
    strobePulse: toBoolean(row.strobePulse),
    strobeLayer: row.strobeLayer,
    strobeOpacity: row.strobeOpacity,
    strobeTF: row.strobeTf,
    strobeTime: row.strobeTime,
    strobeTimeMin: row.strobeTimeMin,
    strobeTimeMax: row.strobeTimeMax,
    strobeSinRate: row.strobeSinRate,
    strobeBPMMulti: row.strobeBpmMulti,
    strobeDelayTF: row.strobeDelayTf,
    strobeDelay: row.strobeDelay,
    strobeDelayMin: row.strobeDelayMin,
    strobeDelayMax: row.strobeDelayMax,
    strobeDelaySinRate: row.strobeDelaySinRate,
    strobeDelayBPMMulti: row.strobeDelayBpmMulti,
    strobeColorType: row.strobeColorType,
    strobeColor: row.strobeColor,
    strobeColorSet: toStringArray(row.strobeColorSet),
    strobeEase: row.strobeEase,
    strobeExp: row.strobeExp,
    strobeAmp: row.strobeAmp,
    strobePer: row.strobePer,
    strobeOv: row.strobeOv,

    fadeInOut: toBoolean(row.fadeInOut),
    fadeIOPulse: toBoolean(row.fadeIoPulse),
    fadeIOTF: row.fadeIoTf,
    fadeIODuration: row.fadeIoDuration,
    fadeIODurationMin: row.fadeIoDurationMin,
    fadeIODurationMax: row.fadeIoDurationMax,
    fadeIOSinRate: row.fadeIoSinRate,
    fadeIOBPMMulti: row.fadeIoBpmMulti,
    fadeIODelayTF: row.fadeIoDelayTf,
    fadeIODelay: row.fadeIoDelay,
    fadeIODelayMin: row.fadeIoDelayMin,
    fadeIODelayMax: row.fadeIoDelayMax,
    fadeIODelaySinRate: row.fadeIoDelaySinRate,
    fadeIODelayBPMMulti: row.fadeIoDelayBpmMulti,
    fadeIOStartEase: row.fadeIoStartEase,
    fadeIOStartExp: row.fadeIoStartExp,
    fadeIOStartAmp: row.fadeIoStartAmp,
    fadeIOStartPer: row.fadeIoStartPer,
    fadeIOStartOv: row.fadeIoStartOv,
    fadeIOEndEase: row.fadeIoEndEase,
    fadeIOEndExp: row.fadeIoEndExp,
    fadeIOEndAmp: row.fadeIoEndAmp,
    fadeIOEndPer: row.fadeIoEndPer,
    fadeIOEndOv: row.fadeIoEndOv,

    panning: toBoolean(row.panning),
    panTF: row.panTf,
    panDuration: row.panDuration,
    panDurationMin: row.panDurationMin,
    panDurationMax: row.panDurationMax,
    panSinRate: row.panSinRate,
    panBPMMulti: row.panBpmMulti,
    panHorizTransType: row.panHorizTransType,
    panHorizTransImg: toBoolean(row.panHorizTransImg),
    panHorizTransLevel: row.panHorizTransLevel,
    panHorizTransLevelMax: row.panHorizTransLevelMax,
    panHorizTransLevelMin: row.panHorizTransLevelMin,
    panHorizTransRandom: toBoolean(row.panHorizTransRandom),
    panVertTransType: row.panVertTransType,
    panVertTransImg: toBoolean(row.panVertTransImg),
    panVertTransLevel: row.panVertTransLevel,
    panVertTransLevelMax: row.panVertTransLevelMax,
    panVertTransLevelMin: row.panVertTransLevelMin,
    panVertTransRandom: toBoolean(row.panVertTransRandom),
    panStartEase: row.panStartEase,
    panStartExp: row.panStartExp,
    panStartAmp: row.panStartAmp,
    panStartPer: row.panStartPer,
    panStartOv: row.panStartOv,
    panEndEase: row.panEndEase,
    panEndExp: row.panEndExp,
    panEndAmp: row.panEndAmp,
    panEndPer: row.panEndPer,
    panEndOv: row.panEndOv,

    overrideIgnore: toBoolean(row.overrideIgnore),
    scriptScene: toBoolean(row.scriptScene),
    downloadScene: toBoolean(row.downloadScene),
    generatorMax: row.generatorMax,
    persistAudio: toBoolean(row.persistAudio),
    persistText: toBoolean(row.persistText),
    libraryID: row.libraryId,
    audioScene: toBoolean(row.audioScene),
    audioEnabled: toBoolean(row.audioEnabled),
    audioPlaylists: [],
    audioStartIndex: row.audioStartIndex,
    textEnabled: toBoolean(row.textEnabled),
    scriptPlaylists: [],
    scriptStartIndex: row.scriptStartIndex,
    regenerate: toBoolean(row.regenerate),
    generatorWeights: []
  }
}

export function toTutorials(row: TutorialsRow): Tutorials {
  return {
    current: row.current ?? undefined,
    scenePicker: row.scenePicker ?? undefined,
    sceneDetail: row.sceneDetail ?? undefined,
    sceneGenerator: row.sceneGenerator ?? undefined,
    library: row.library ?? undefined,
    audios: row.audios ?? undefined,
    scripts: row.scripts ?? undefined,
    player: row.player ?? undefined,
    scriptor: row.scriptor ?? undefined,
    videoClipper: row.videoClipper ?? undefined
  }
}

export function toThemeSettings(row: ThemeRow): ThemeSettings {
  const { mode, primaryColor, secondaryColor } = row
  return { mode, primaryColor, secondaryColor }
}

export function toGeneralSettings(row: GeneralSettingsRow): GeneralSettings {
  const {
    prioritizePerformance,
    confirmSceneDeletion,
    confirmBlacklist,
    confirmFileDeletion,
    autoBackup,
    autoBackupDays,
    autoCleanBackup,
    autoCleanBackupDays,
    autoCleanBackupWeeks,
    autoCleanBackupMonths,
    cleanRetain,
    watermark,
    watermarkDisplay,
    watermarkCorner,
    watermarkText,
    watermarkFontFamily,
    watermarkFontSize,
    watermarkColor
  } = row
  return {
    prioritizePerformance: toBoolean(prioritizePerformance),
    confirmSceneDeletion: toBoolean(confirmSceneDeletion),
    confirmBlacklist: toBoolean(confirmBlacklist),
    confirmFileDeletion: toBoolean(confirmFileDeletion),
    autoBackup: toBoolean(autoBackup),
    autoBackupDays,
    autoCleanBackup: toBoolean(autoCleanBackup),
    autoCleanBackupDays,
    autoCleanBackupWeeks,
    autoCleanBackupMonths,
    cleanRetain,
    watermark: toBoolean(watermark),
    watermarkDisplay: toBoolean(watermarkDisplay),
    watermarkCorner,
    watermarkText,
    watermarkFontFamily,
    watermarkFontSize,
    watermarkColor
  }
}

export function toRemoteSettings(row: RemoteSettingsRow): RemoteSettings {
  const {
    tumblrKey,
    tumblrSecret,
    tumblrOauthToken,
    tumblrOauthTokenSecret,
    silenceTumblrAlert,
    redditUserAgent,
    redditClientId,
    redditDeviceId,
    redditRefreshToken,
    twitterConsumerKey,
    twitterConsumerSecret,
    twitterAccessTokenKey,
    twitterAccessTokenSecret,
    instagramUsername,
    instagramPassword,
    hydrusProtocol,
    hydrusDomain,
    hydrusPort,
    hydrusApiKey,
    piwigoProtocol,
    piwigoHost,
    piwigoUsername,
    piwigoPassword
  } = row
  return {
    tumblrKey,
    tumblrSecret,
    tumblrOAuthToken: tumblrOauthToken,
    tumblrOAuthTokenSecret: tumblrOauthTokenSecret,
    silenceTumblrAlert: toBoolean(silenceTumblrAlert),
    redditUserAgent,
    redditClientID: redditClientId,
    redditDeviceID: redditDeviceId,
    redditRefreshToken,
    twitterConsumerKey,
    twitterConsumerSecret,
    twitterAccessTokenKey,
    twitterAccessTokenSecret,
    instagramUsername,
    instagramPassword,
    hydrusProtocol,
    hydrusDomain,
    hydrusPort: hydrusPort.toString(),
    hydrusAPIKey: hydrusApiKey,
    piwigoProtocol,
    piwigoHost,
    piwigoUsername,
    piwigoPassword
  }
}

export function toDisplaySettings(row: DisplaySettingsRow): DisplaySettings {
  const {
    fullScreen,
    clickToProgress,
    clickToProgressWhilePlaying,
    startImmediately,
    easingControls,
    audioAlert,
    minImageSize,
    minVideoSize,
    maxInMemory,
    maxInHistory,
    maxLoadingAtOnce
  } = row
  return {
    fullScreen: toBoolean(fullScreen),
    clickToProgress: toBoolean(clickToProgress),
    clickToProgressWhilePlaying: toBoolean(clickToProgressWhilePlaying),
    startImmediately: toBoolean(startImmediately),
    easingControls: toBoolean(easingControls),
    audioAlert: toBoolean(audioAlert),
    minImageSize,
    minVideoSize,
    maxInMemory,
    maxInHistory,
    maxLoadingAtOnce,
    ignoredTags: []
  }
}

export function toCacheSettings(row: CacheSettingsRow): CacheSettings {
  const { enabled, directory, maxSize } = row
  return {
    enabled: toBoolean(enabled),
    directory,
    defaultDirectory: getCacheDir(),
    maxSize
  }
}

export function toCacheSize(size: number): CacheSize {
  return { size }
}

export function toSceneUpdate(scene: Partial<Scene>): SceneUpdate {
  const {
    name,
    useWeights,
    timingFunction,
    timingConstant,
    timingMin,
    timingMax,
    timingSinRate,
    timingBPMMulti,
    backForth,
    backForthTF,
    backForthConstant,
    backForthMin,
    backForthMax,
    backForthSinRate,
    backForthBPMMulti,
    imageType,
    backgroundType,
    backgroundBlur,
    backgroundColor,
    backgroundColorSet,
    imageTypeFilter,
    fullSource,
    imageOrientation,
    gifOption,
    gifTimingConstant,
    gifTimingMin,
    gifTimingMax,
    videoOrientation,
    videoOption,
    videoTimingConstant,
    videoTimingMin,
    videoTimingMax,
    videoSpeed,
    videoRandomSpeed,
    videoSpeedMin,
    videoSpeedMax,
    videoSkip,
    randomVideoStart,
    continueVideo,
    playVideoClips,
    skipVideoStart,
    skipVideoEnd,
    videoVolume,
    weightFunction,
    sourceOrderFunction,
    forceAllSource,
    orderFunction,
    forceAll,
    zoom,
    zoomRandom,
    zoomStart,
    zoomStartMin,
    zoomStartMax,
    zoomEnd,
    zoomEndMin,
    zoomEndMax,
    horizTransType,
    horizTransLevel,
    horizTransLevelMin,
    horizTransLevelMax,
    horizTransRandom,
    vertTransType,
    vertTransLevel,
    vertTransLevelMin,
    vertTransLevelMax,
    vertTransRandom,
    transTF,
    transDuration,
    transDurationMin,
    transDurationMax,
    transSinRate,
    transBPMMulti,
    transEase,
    transExp,
    transAmp,
    transPer,
    transOv,
    crossFade,
    crossFadeAudio,
    fadeTF,
    fadeDuration,
    fadeDurationMin,
    fadeDurationMax,
    fadeSinRate,
    fadeBPMMulti,
    fadeEase,
    fadeExp,
    fadeAmp,
    fadePer,
    fadeOv,
    slide,
    slideTF,
    slideType,
    slideDistance,
    slideDuration,
    slideDurationMin,
    slideDurationMax,
    slideSinRate,
    slideBPMMulti,
    slideEase,
    slideExp,
    slideAmp,
    slidePer,
    slideOv,
    strobe,
    strobePulse,
    strobeLayer,
    strobeOpacity,
    strobeTF,
    strobeTime,
    strobeTimeMin,
    strobeTimeMax,
    strobeSinRate,
    strobeBPMMulti,
    strobeDelayTF,
    strobeDelay,
    strobeDelayMin,
    strobeDelayMax,
    strobeDelaySinRate,
    strobeDelayBPMMulti,
    strobeColorType,
    strobeColor,
    strobeColorSet,
    strobeEase,
    strobeExp,
    strobeAmp,
    strobePer,
    strobeOv,
    fadeInOut,
    fadeIOPulse,
    fadeIOTF,
    fadeIODuration,
    fadeIODurationMin,
    fadeIODurationMax,
    fadeIOSinRate,
    fadeIOBPMMulti,
    fadeIODelayTF,
    fadeIODelay,
    fadeIODelayMin,
    fadeIODelayMax,
    fadeIODelaySinRate,
    fadeIODelayBPMMulti,
    fadeIOStartEase,
    fadeIOStartExp,
    fadeIOStartAmp,
    fadeIOStartPer,
    fadeIOStartOv,
    fadeIOEndEase,
    fadeIOEndExp,
    fadeIOEndAmp,
    fadeIOEndPer,
    fadeIOEndOv,
    panning,
    panTF,
    panDuration,
    panDurationMin,
    panDurationMax,
    panSinRate,
    panBPMMulti,
    panHorizTransType,
    panHorizTransImg,
    panHorizTransLevel,
    panHorizTransLevelMax,
    panHorizTransLevelMin,
    panHorizTransRandom,
    panVertTransType,
    panVertTransImg,
    panVertTransLevel,
    panVertTransLevelMax,
    panVertTransLevelMin,
    panVertTransRandom,
    panStartEase,
    panStartExp,
    panStartAmp,
    panStartPer,
    panStartOv,
    panEndEase,
    panEndExp,
    panEndAmp,
    panEndPer,
    panEndOv,
    overrideIgnore,
    scriptScene,
    downloadScene,
    generatorMax,
    persistAudio,
    persistText,
    libraryID,
    audioScene,
    audioEnabled,
    audioStartIndex,
    textEnabled,
    scriptStartIndex,
    regenerate
  } = scene
  return {
    name,
    useWeights: toNumberOpt(useWeights),
    timingFunction,
    timingConstant,
    timingMin,
    timingMax,
    timingSinRate,
    timingBpmMulti: timingBPMMulti,
    backForth: toNumberOpt(backForth),
    backForthTf: backForthTF,
    backForthConstant,
    backForthMin,
    backForthMax,
    backForthSinRate,
    backForthBpmMulti: backForthBPMMulti,
    imageType,
    backgroundType,
    backgroundBlur,
    backgroundColor,
    backgroundColorSet: toTextOpt(backgroundColorSet),
    imageTypeFilter,
    fullSource: toNumberOpt(fullSource),
    imageOrientation,
    gifOption,
    gifTimingConstant,
    gifTimingMin,
    gifTimingMax,
    videoOrientation,
    videoOption,
    videoTimingConstant,
    videoTimingMin,
    videoTimingMax,
    videoSpeed,
    videoRandomSpeed: toNumberOpt(videoRandomSpeed),
    videoSpeedMin,
    videoSpeedMax,
    videoSkip,
    randomVideoStart: toNumberOpt(randomVideoStart),
    continueVideo: toNumberOpt(continueVideo),
    playVideoClips: toNumberOpt(playVideoClips),
    skipVideoStart,
    skipVideoEnd,
    videoVolume,
    weightFunction,
    sourceOrderFunction,
    forceAllSource: toNumberOpt(forceAllSource),
    orderFunction,
    forceAll: toNumberOpt(forceAll),
    zoom: toNumberOpt(zoom),
    zoomRandom: toNumberOpt(zoomRandom),
    zoomStart,
    zoomStartMin,
    zoomStartMax,
    zoomEnd,
    zoomEndMin,
    zoomEndMax,
    horizTransType,
    horizTransLevel,
    horizTransLevelMin,
    horizTransLevelMax,
    horizTransRandom: toNumberOpt(horizTransRandom),
    vertTransType,
    vertTransLevel,
    vertTransLevelMin,
    vertTransLevelMax,
    vertTransRandom: toNumberOpt(vertTransRandom),
    transTf: transTF,
    transDuration,
    transDurationMin,
    transDurationMax,
    transSinRate,
    transBpmMulti: transBPMMulti,
    transEase,
    transExp,
    transAmp,
    transPer,
    transOv,
    crossFade: toNumberOpt(crossFade),
    crossFadeAudio: toNumberOpt(crossFadeAudio),
    fadeTf: fadeTF,
    fadeDuration,
    fadeDurationMin,
    fadeDurationMax,
    fadeSinRate,
    fadeBpmMulti: fadeBPMMulti,
    fadeEase,
    fadeExp,
    fadeAmp,
    fadePer,
    fadeOv,
    slide: toNumberOpt(slide),
    slideTf: slideTF,
    slideType,
    slideDistance,
    slideDuration,
    slideDurationMin,
    slideDurationMax,
    slideSinRate,
    slideBpmMulti: slideBPMMulti,
    slideEase,
    slideExp,
    slideAmp,
    slidePer,
    slideOv,
    strobe: toNumberOpt(strobe),
    strobePulse: toNumberOpt(strobePulse),
    strobeLayer,
    strobeOpacity,
    strobeTf: strobeTF,
    strobeTime,
    strobeTimeMin,
    strobeTimeMax,
    strobeSinRate,
    strobeBpmMulti: strobeBPMMulti,
    strobeDelayTf: strobeDelayTF,
    strobeDelay,
    strobeDelayMin,
    strobeDelayMax,
    strobeDelaySinRate,
    strobeDelayBpmMulti: strobeDelayBPMMulti,
    strobeColorType,
    strobeColor,
    strobeColorSet: toTextOpt(strobeColorSet),
    strobeEase,
    strobeExp,
    strobeAmp,
    strobePer,
    strobeOv,
    fadeInOut: toNumberOpt(fadeInOut),
    fadeIoPulse: toNumberOpt(fadeIOPulse),
    fadeIoTf: fadeIOTF,
    fadeIoDuration: fadeIODuration,
    fadeIoDurationMin: fadeIODurationMin,
    fadeIoDurationMax: fadeIODurationMax,
    fadeIoSinRate: fadeIOSinRate,
    fadeIoBpmMulti: fadeIOBPMMulti,
    fadeIoDelayTf: fadeIODelayTF,
    fadeIoDelay: fadeIODelay,
    fadeIoDelayMin: fadeIODelayMin,
    fadeIoDelayMax: fadeIODelayMax,
    fadeIoDelaySinRate: fadeIODelaySinRate,
    fadeIoDelayBpmMulti: fadeIODelayBPMMulti,
    fadeIoStartEase: fadeIOStartEase,
    fadeIoStartExp: fadeIOStartExp,
    fadeIoStartAmp: fadeIOStartAmp,
    fadeIoStartPer: fadeIOStartPer,
    fadeIoStartOv: fadeIOStartOv,
    fadeIoEndEase: fadeIOEndEase,
    fadeIoEndExp: fadeIOEndExp,
    fadeIoEndAmp: fadeIOEndAmp,
    fadeIoEndPer: fadeIOEndPer,
    fadeIoEndOv: fadeIOEndOv,
    panning: toNumberOpt(panning),
    panTf: panTF,
    panDuration,
    panDurationMin,
    panDurationMax,
    panSinRate,
    panBpmMulti: panBPMMulti,
    panHorizTransType,
    panHorizTransImg: toNumberOpt(panHorizTransImg),
    panHorizTransLevel,
    panHorizTransLevelMax,
    panHorizTransLevelMin,
    panHorizTransRandom: toNumberOpt(panHorizTransRandom),
    panVertTransType,
    panVertTransImg: toNumberOpt(panVertTransImg),
    panVertTransLevel,
    panVertTransLevelMax,
    panVertTransLevelMin,
    panVertTransRandom: toNumberOpt(panVertTransRandom),
    panStartEase,
    panStartExp,
    panStartAmp,
    panStartPer,
    panStartOv,
    panEndEase,
    panEndExp,
    panEndAmp,
    panEndPer,
    panEndOv,
    overrideIgnore: toNumberOpt(overrideIgnore),
    scriptScene: toNumberOpt(scriptScene),
    downloadScene: toNumberOpt(downloadScene),
    generatorMax,
    persistAudio: toNumberOpt(persistAudio),
    persistText: toNumberOpt(persistText),
    libraryId: libraryID,
    audioScene: toNumberOpt(audioScene),
    audioEnabled: toNumberOpt(audioEnabled),
    audioStartIndex,
    textEnabled: toNumberOpt(textEnabled),
    scriptStartIndex,
    regenerate: toNumberOpt(regenerate)
  }
}

export function toThemeUpdate(theme: Partial<ThemeSettings>): ThemeUpdate {
  return theme
}

export function toGeneralSettingsUpdate(
  generalSettings: Partial<GeneralSettings>
): GeneralSettingsUpdate {
  const {
    prioritizePerformance,
    confirmSceneDeletion,
    confirmBlacklist,
    confirmFileDeletion,
    autoBackup,
    autoBackupDays,
    autoCleanBackup,
    autoCleanBackupDays,
    autoCleanBackupWeeks,
    autoCleanBackupMonths,
    cleanRetain,
    watermark,
    watermarkDisplay,
    watermarkCorner,
    watermarkText,
    watermarkFontFamily,
    watermarkFontSize,
    watermarkColor
  } = generalSettings

  return {
    prioritizePerformance: toNumberOpt(prioritizePerformance),
    confirmSceneDeletion: toNumberOpt(confirmSceneDeletion),
    confirmBlacklist: toNumberOpt(confirmBlacklist),
    confirmFileDeletion: toNumberOpt(confirmFileDeletion),
    autoBackup: toNumberOpt(autoBackup),
    autoBackupDays,
    autoCleanBackup: toNumberOpt(autoCleanBackup),
    autoCleanBackupDays,
    autoCleanBackupWeeks,
    autoCleanBackupMonths,
    cleanRetain,
    watermark: toNumberOpt(watermark),
    watermarkDisplay: toNumberOpt(watermarkDisplay),
    watermarkCorner,
    watermarkText,
    watermarkFontFamily,
    watermarkFontSize,
    watermarkColor
  }
}

export function toRemoteSettingsUpdate(
  remoteSettings: Partial<RemoteSettings>
): RemoteSettingsUpdate {
  const {
    tumblrKey,
    tumblrSecret,
    tumblrOAuthToken,
    tumblrOAuthTokenSecret,
    silenceTumblrAlert,
    redditUserAgent,
    redditClientID,
    redditDeviceID,
    redditRefreshToken,
    twitterConsumerKey,
    twitterConsumerSecret,
    twitterAccessTokenKey,
    twitterAccessTokenSecret,
    instagramUsername,
    instagramPassword,
    hydrusProtocol,
    hydrusDomain,
    hydrusPort,
    hydrusAPIKey,
    piwigoProtocol,
    piwigoHost,
    piwigoUsername,
    piwigoPassword
  } = remoteSettings

  return {
    tumblrKey,
    tumblrSecret,
    tumblrOauthToken: tumblrOAuthToken,
    tumblrOauthTokenSecret: tumblrOAuthTokenSecret,
    silenceTumblrAlert: toNumberOpt(silenceTumblrAlert),
    redditUserAgent,
    redditClientId: redditClientID,
    redditDeviceId: redditDeviceID,
    redditRefreshToken,
    twitterConsumerKey,
    twitterConsumerSecret,
    twitterAccessTokenKey,
    twitterAccessTokenSecret,
    instagramUsername,
    instagramPassword,
    hydrusProtocol,
    hydrusDomain,
    hydrusPort: toNumberOpt(hydrusPort),
    hydrusApiKey: hydrusAPIKey,
    piwigoProtocol,
    piwigoHost,
    piwigoUsername,
    piwigoPassword
  }
}

export function toDisplaySettingsUpdate(
  displaySettings: Partial<DisplaySettings>
): DisplaySettingsUpdate {
  const {
    fullScreen,
    clickToProgress,
    clickToProgressWhilePlaying,
    startImmediately,
    easingControls,
    audioAlert,
    minImageSize,
    minVideoSize,
    maxInMemory,
    maxInHistory,
    maxLoadingAtOnce
  } = displaySettings

  return {
    fullScreen: toNumberOpt(fullScreen),
    clickToProgress: toNumberOpt(clickToProgress),
    clickToProgressWhilePlaying: toNumberOpt(clickToProgressWhilePlaying),
    startImmediately: toNumberOpt(startImmediately),
    easingControls: toNumberOpt(easingControls),
    audioAlert: toNumberOpt(audioAlert),
    minImageSize,
    minVideoSize,
    maxInMemory,
    maxInHistory,
    maxLoadingAtOnce
  }
}

export function toCacheSettingsUpdate(
  cacheSettings: Partial<CacheSettings>
): CacheSettingsUpdate {
  const { enabled, directory, maxSize } = cacheSettings

  return {
    enabled: toNumberOpt(enabled),
    directory,
    maxSize
  }
}

export function toContentSource(
  row: ContentSourceRow,
  tags: number[]
): ContentSource {
  const {
    count,
    countComplete,
    id,
    lastCheck,
    localDirOfSources,
    marked,
    offline,
    redditFunc,
    redditTime,
    twitterIncludeReplies,
    twitterIncludeRetweets,
    type,
    url,
    videoDuration,
    videoResolution,
    videoSubtitleFile,
    weight
  } = row

  return {
    id: id as number,
    url,
    type,
    offline: toBoolean(offline),
    marked: toBoolean(marked),
    lastCheck: opt<number>(lastCheck),
    tags,
    clips: [],
    disabledClips: [],
    blacklist: [],
    count,
    countComplete: toBoolean(countComplete),
    weight,
    dirOfSources: toBoolean(localDirOfSources),
    subtitleFile: opt<string>(videoSubtitleFile),
    duration: opt<number>(videoDuration),
    resolution: opt<number>(videoResolution),
    redditFunc: opt<string>(redditFunc),
    redditTime: opt<string>(redditTime),
    includeRetweets: toBoolean(twitterIncludeRetweets),
    includeReplies: toBoolean(twitterIncludeReplies),
    fileUrl: `http://localhost:5050/fs/file/content-source/${id}`
  }
}

function opt<T>(value: T | null): T | undefined {
  return value ?? undefined
}

export function toContentSourceUpdate(
  source: Partial<ContentSource>
): ContentSourceUpdate {
  const {
    count,
    countComplete,
    lastCheck,
    dirOfSources,
    marked,
    offline,
    redditFunc,
    redditTime,
    includeReplies,
    includeRetweets,
    url,
    duration,
    resolution,
    subtitleFile,
    weight
  } = source

  return {
    count,
    countComplete: toNumberOpt(countComplete),
    lastCheck,
    localDirOfSources: toNumberOpt(dirOfSources),
    marked: toNumberOpt(marked),
    offline: toNumberOpt(offline),
    redditFunc,
    redditTime,
    twitterIncludeReplies: toNumberOpt(includeReplies),
    twitterIncludeRetweets: toNumberOpt(includeRetweets),
    url,
    videoDuration: duration,
    videoResolution: resolution,
    videoSubtitleFile: subtitleFile,
    weight
  }
}

export function toClip(row: ClipRow): Clip {
  const { disabled, end, id, start, volume } = row

  return {
    id: id as number,
    disabled: toBoolean(disabled),
    start: opt<number>(start),
    end: opt<number>(end),
    volume: opt<number>(volume),
    tags: []
  }
}

export function toClipUpdate(clip: Partial<Clip>): ClipUpdate {
  const { disabled, start, end, volume } = clip

  return {
    disabled: toNumberOpt(disabled),
    end,
    start,
    volume
  }
}

export function toTag(row: TagRow): Tag {
  const { id, name, phraseString } = row

  return {
    id: id as number,
    name,
    phraseString: opt<string>(phraseString)
  }
}

export function toTagUpdate(tag: Partial<Tag>): TagUpdate {
  const { name, phraseString } = tag

  return {
    name,
    phraseString
  }
}

export function toDisplay(row: DisplayRow): Display {
  const { id, name } = row

  return {
    id: id as number,
    name,
    views: []
  }
}

export function toDisplayUpdate(display: Partial<Display>): DisplayUpdate {
  const { name } = display

  return { name }
}

export function toDisplayView(row: DisplayViewRow): DisplayView {
  const {
    color,
    height,
    id,
    mirrorSyncedView,
    name,
    opacity,
    playlistId,
    sync,
    syncWithView,
    visible,
    width,
    x,
    y,
    z
  } = row

  return {
    id: id as number,
    name,
    x,
    y,
    z,
    width,
    height,
    color,
    opacity,
    visible: toBoolean(visible),
    playlistID: playlistId ?? undefined,
    sync: toBoolean(sync),
    syncWithView: syncWithView ?? undefined,
    mirrorSyncedView
  }
}

export function toPlaylist(row: PlaylistRow): Playlist {
  const { id, name, repeat, shuffle, type } = row

  return {
    id: id as number,
    name,
    type,
    items: [],
    shuffle: toBoolean(shuffle),
    repeat
  }
}

export function toPlaylistUpdate(playlist: Partial<Playlist>): PlaylistUpdate {
  const { name, type, shuffle, repeat } = playlist

  return {
    name,
    repeat,
    shuffle: toNumberOpt(shuffle),
    type
  }
}

export function toAudioThumb(thumb: string) {
  return `http://localhost:5050/fs/file/audio-thumb/${thumb.split(path.sep).pop()}`
}

export function fromAudioThumb(thumb: string) {
  return path.join(getThumbsDir(), thumb.split('/').pop() as string)
}

export function toAudio(row: AudioRow, tags: number[]): Audio {
  const {
    album,
    artist,
    bpm,
    comment,
    duration,
    id,
    marked,
    name,
    nextSceneAtEnd,
    playedCount,
    speed,
    stopAtEnd,
    tick,
    tickBpmMulti,
    tickDelay,
    tickMaxDelay,
    tickMinDelay,
    tickMode,
    tickSinRate,
    trackNum,
    type,
    url,
    volume
  } = row

  let thumb: string | undefined = undefined
  if (row.thumb != null) {
    thumb = toAudioThumb(row.thumb)
  }

  return {
    id: id as number,
    url,
    type,
    marked: toBoolean(marked),
    tags,
    volume,
    speed,
    stopAtEnd: toBoolean(stopAtEnd),
    nextSceneAtEnd: toBoolean(nextSceneAtEnd),
    tick: toBoolean(tick),
    tickMode,
    tickDelay,
    tickMinDelay,
    tickMaxDelay,
    tickSinRate,
    tickBPMMulti: tickBpmMulti,
    bpm,
    thumb,
    name: opt<string>(name),
    artist: opt<string>(artist),
    album: opt<string>(album),
    trackNum: opt<number>(trackNum),
    duration: opt<number>(duration),
    comment: opt<string>(comment),
    playedCount,
    fileUrl: `http://localhost:5050/fs/file/audio/${id}`
  }
}

export function toAudioUpdate(audio: Partial<Audio>): AudioUpdate {
  const {
    url,
    marked,
    volume,
    speed,
    stopAtEnd,
    nextSceneAtEnd,
    tick,
    tickMode,
    tickDelay,
    tickMinDelay,
    tickMaxDelay,
    tickSinRate,
    tickBPMMulti,
    bpm,
    name,
    artist,
    album,
    trackNum,
    duration,
    thumb,
    comment,
    playedCount
  } = audio

  return {
    album,
    artist,
    bpm,
    comment,
    duration,
    marked: toNumberOpt(marked),
    name,
    nextSceneAtEnd: toNumberOpt(nextSceneAtEnd),
    playedCount,
    speed,
    stopAtEnd: toNumberOpt(stopAtEnd),
    thumb,
    tick: toNumberOpt(tick),
    tickBpmMulti: tickBPMMulti,
    tickDelay,
    tickMaxDelay,
    tickMinDelay,
    tickMode,
    tickSinRate,
    trackNum,
    url,
    volume
  }
}

export function toCaptionScript(
  row: CaptionScriptRow,
  tags: number[]
): CaptionScript {
  const {
    id,
    marked,
    nextSceneAtEnd,
    opacity,
    script,
    stopAtEnd,
    syncWithAudio,
    type,
    url
  } = row

  return {
    id: id as number,
    url,
    type,
    script: opt<string>(script),
    marked: toBoolean(marked),
    tags,
    opacity,
    stopAtEnd: toBoolean(stopAtEnd),
    nextSceneAtEnd: toBoolean(nextSceneAtEnd),
    syncWithAudio: toBoolean(syncWithAudio),
    fileUrl: `http://localhost:5050/fs/file/caption-script/${id}`
  }
}

export function toCaptionScriptUpdate(
  captionScript: Partial<CaptionScript>
): CaptionScriptUpdate {
  const {
    url,
    script,
    marked,
    opacity,
    stopAtEnd,
    nextSceneAtEnd,
    syncWithAudio
  } = captionScript

  return {
    marked: toNumberOpt(marked),
    nextSceneAtEnd: toNumberOpt(nextSceneAtEnd),
    opacity,
    script,
    stopAtEnd: toNumberOpt(stopAtEnd),
    syncWithAudio: toNumberOpt(syncWithAudio),
    url
  }
}

export function toFontSettings(row: FontSettingsRow): FontSettings {
  const { border, borderColor, borderpx, color, fontFamily, fontSize } = row

  return {
    color,
    fontSize,
    fontFamily,
    border: toBoolean(border),
    borderpx,
    borderColor
  }
}

export function toFontSettingsUpdate(
  fontSettings: Partial<FontSettings>
): FontSettingsUpdate {
  const { color, fontSize, fontFamily, border, borderpx, borderColor } =
    fontSettings

  return {
    border: toNumberOpt(border),
    borderColor,
    borderpx,
    color,
    fontFamily,
    fontSize
  }
}

export function toBackup(row: BackupRow): Backup {
  const { id, createdAt, fileName } = row
  const filePath = path.join(getBackupsDir(), fileName)
  const size = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0
  return { id: id as number, createdAt, size }
}

export function toBackupSettings(request: CleanBackupsRequest): BackupSettings {
  let autoCleanBackup = false
  let autoCleanBackupDays = 0
  let autoCleanBackupMonths = 0
  let autoCleanBackupWeeks = 0
  let cleanRetain = 0

  if (request.hasOwnProperty('cleanRetain')) {
    const defaultRequest = request as DefaultCleanBackupsRequest
    cleanRetain = defaultRequest.cleanRetain
  } else {
    const autoRequest = request as AutoCleanBackupsRequest
    autoCleanBackup = true
    autoCleanBackupDays = autoRequest.autoCleanBackupDays
    autoCleanBackupMonths = autoRequest.autoCleanBackupMonths
    autoCleanBackupWeeks = autoRequest.autoCleanBackupWeeks
  }

  return {
    autoBackup: false,
    autoBackupDays: 0,
    autoCleanBackup,
    autoCleanBackupDays,
    autoCleanBackupMonths,
    autoCleanBackupWeeks,
    cleanRetain
  }
}

export function toSearchSelectOptions(
  tagOptions: SearchOption[],
  totalCount: number,
  untaggedCount: number,
  markedCount: number,
  offlineCount?: number,
  typeOptions?: SearchOption[]
): SelectOption[] {
  const options: SelectOption[] = []
  if (untaggedCount > 0) {
    options.push({
      label: '<Untagged> (' + untaggedCount + ')',
      value: '<Untagged>'
    })
  }
  if (offlineCount != null && offlineCount > 0) {
    options.push({
      label: '<Offline> (' + offlineCount + ')',
      value: '<Offline>'
    })
  }
  if (markedCount > 0) {
    options.push({ label: '<Marked> (' + markedCount + ')', value: '<Marked>' })
  }

  tagOptions.forEach(({ name, count }) =>
    options.push({ label: `${name} (${count})`, value: `[${name}]` })
  )
  if (typeOptions != null) {
    typeOptions.forEach(({ name, count }) =>
      options.push({ label: `${name} (${count})`, value: `{${name}}` })
    )
  }

  tagOptions.forEach(({ name, count }) =>
    options.push({
      label: `-${name} (${totalCount - count})`,
      value: `-[${name}]`
    })
  )
  if (typeOptions != null) {
    typeOptions.forEach(({ name, count }) =>
      options.push({
        label: `-${name} (${totalCount - count})`,
        value: `-{${name}}`
      })
    )
  }

  return options
}

export function toTagSelectOptions(options: SearchOption[]): SelectOption[] {
  return options.map(({ name, count }) => ({
    label: `${name} (${count})`,
    value: name
  }))
}

export function toIgnoredTagSelectOptions(
  tagOptions: SearchOption[],
  typeOptions: SearchOption[]
): SelectOption[] {
  const options: SelectOption[] = []
  tagOptions.forEach(({ name, count }) =>
    options.push({ label: `${name} (${count})`, value: `[${name}]` })
  )
  typeOptions.forEach(({ name, count }) =>
    options.push({ label: `${name} (${count})`, value: `{${name}}` })
  )
  tagOptions.forEach(({ name, count }) =>
    options.push({ label: `-${name} (${count})`, value: `-[${name}]` })
  )
  typeOptions.forEach(({ name, count }) =>
    options.push({ label: `-${name} (${count})`, value: `-{${name}}` })
  )
  return options
}

export function toIdsArray(rows: {id: number | null}[]): number[] {
  return rows.map((row) => row.id).filter((id) => id != null)
}

export function toImagePlayerData(displayViewId: number, row: Partial<PlaylistRow>, itemRows: Array<{id: number | null, duration: number | null, sceneId: number | null}>, maxCanLoad: number, allScenes: number[]): ImagePlayerData {
  const itemsById: Record<number, Array<{id: number | null, duration: number | null, sceneId: number | null}>> = {}
  itemRows.forEach((itemRow) => {
    const id = itemRow.id as number
    if(itemsById[id] == null) {
      itemsById[id] = []
    }

    itemsById[id].push(itemRow)
  })

  const items = Object.entries(itemsById)
    .map(([key, value]) => {
      const duration = value[0].duration as number
      let scenes = value.filter((sceneId) => sceneId != null).map(({sceneId}) => sceneId as number)
      if(scenes.length === 0) {
        scenes = allScenes
      }

      return {duration, scenes}
    })

  const playlist = {
    id: row.id as number,
    shuffle: toBoolean(row.shuffle),
    repeat: row.repeat ?? RP.none,
    items
  }
  
  return {displayViewId, maxCanLoad, playlist}
}
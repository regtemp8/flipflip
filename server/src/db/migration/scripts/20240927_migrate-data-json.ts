import crypto from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { Kysely } from 'kysely'
import { generateUsername } from 'unique-username-generator'
import generator from 'generate-password'
import {
  DB,
  Tag as DBTag,
  DisplayView as DBDisplayView
} from '../../types/generated'
import {
  AppStorage,
  initialAppStorage
} from '../data/migrate-data-json/AppStorage'
import { newConfig } from '../data/migrate-data-json/Config'
import { Scene, newScene } from '../data/migrate-data-json/Scene'
import { SceneGroup, newSceneGroup } from '../data/migrate-data-json/SceneGroup'
import { SceneGrid, newSceneGrid } from '../data/migrate-data-json/SceneGrid'
import { Audio, newAudio } from '../data/migrate-data-json/Audio'
import {
  CaptionScript,
  newCaptionScript
} from '../data/migrate-data-json/CaptionScript'
import { Playlist, newPlaylist } from '../data/migrate-data-json/Playlist'
import {
  LibrarySource,
  newLibrarySource
} from '../data/migrate-data-json/LibrarySource'
import { Tag, newTag } from '../data/migrate-data-json/Tag'
import { Route, newRoute } from '../data/migrate-data-json/Route'
import { getElectronSaveDir } from '../../../utils'
import { toNumber } from '../../utils'
import { Clip } from '../data/migrate-data-json/Clip'
import { FontSettings } from '../data/migrate-data-json/FontSettings'
import { WeightGroup } from '../data/migrate-data-json/WeightGroup'
import {
  MVF,
  PLT,
  RP,
  SG,
  convertGridIDToSceneID,
  convertPlaylistIDToSceneID,
  getRandomColor
} from 'flipflip-common'
import logger from '../../../logger'

const getDataJsonPath = () => {
  const saveDir = getElectronSaveDir()
  return saveDir != null ? path.join(saveDir, 'data.json') : undefined
}

const getDataJsonPortablePath = () => {
  return path.join(process.cwd(), 'data.json')
}

const readDataJsonFile = (): AppStorage | undefined => {
  if (process.env.NODE_ENV === 'test') {
    logger.info(": Generating test database, don't read data.json file")
    return undefined
  }

  logger.info('Read data.json file')
  const savePath = getDataJsonPath()
  if (savePath == null) {
    logger.info('! No Electron save directory found')
  } else {
    logger.info(`Save path: {path}`, { path: savePath })
  }

  const portablePath = getDataJsonPortablePath()
  logger.info(`Portable path: {path}`, { path: portablePath })

  let data
  let dataPath
  let portableMode = false
  const savePathExists = savePath != null && existsSync(savePath)
  const portablePathExists = existsSync(portablePath)
  if (portablePathExists) {
    dataPath = portablePath
    data = JSON.parse(readFileSync(portablePath, 'utf-8'))
    portableMode = data.config.generalSettings.portableMode
  }
  if ((!portablePathExists || !portableMode) && savePathExists) {
    dataPath = savePath
    data = JSON.parse(readFileSync(savePath, 'utf-8'))
    portableMode = data.config.generalSettings.portableMode
    if (portableMode && portablePathExists) {
      dataPath = portablePath
      data = JSON.parse(readFileSync(portablePath, 'utf-8'))
    } else {
      portableMode = false
    }
  }

  if (data == null) {
    logger.info('! No data.json file found')
    return undefined
  } else {
    logger.info(`+ Read data from: {path}`, { path: dataPath })
  }

  if (!data.version) {
    throw new Error(
      `Version is not defined in ${portableMode ? portablePath : savePath}`
    )
  }

  const supportedVersions = [
    '3.2.2',
    '3.2.3',
    '4.0.0-beta1',
    '4.0.0-beta2',
    '4.0.0-beta3',
    '4.0.0-beta4'
  ]
  if (!supportedVersions.includes(data.version)) {
    throw new Error(
      `Version ${data.version} is not supported. Please update FlipFlip data to v3.2.2 or above.`
    )
  }

  return {
    version: data.version,
    specialMode: data.specialMode,
    openTab: data.openTab,
    displayedSources: [],
    config: newConfig(data.config),
    scenes: data.scenes.map((s: Partial<Scene>) => newScene(s)),
    sceneGroups: data.sceneGroups
      ? data.sceneGroups.map((g: Partial<SceneGroup>) => newSceneGroup(g))
      : [],
    grids: data.grids.map((g: Partial<SceneGrid>) => newSceneGrid(g)),
    audios: data.audios
      ? data.audios.map((a: Partial<Audio>) => newAudio(a))
      : [],
    scripts: data.scripts
      ? data.scripts.map((s: Partial<CaptionScript>) => newCaptionScript(s))
      : [],
    playlists: data.playlists
      ? data.playlists.map((p: Partial<Playlist>) => newPlaylist(p))
      : [],
    library: data.library.map((s: Partial<LibrarySource>) =>
      newLibrarySource(s)
    ),
    tags: data.tags.map((t: Partial<Tag>) => newTag(t)),
    route: data.route.map((s: Partial<Route>) => newRoute(s)),
    libraryYOffset: 0,
    libraryFilters: [],
    librarySelected: [],
    audioOpenTab: data.audioOpenTab ? data.audioOpenTab : 3,
    audioYOffset: 0,
    audioFilters: [],
    audioSelected: [],
    scriptYOffset: 0,
    scriptFilters: [],
    scriptSelected: [],
    progressCurrent: 0,
    progressTotal: 0,
    systemSnackOpen: false,
    tutorial: data.tutorial,
    theme: data.theme
  }
}

const userInsert = async (
  trx: Kysely<DB>,
  username: string,
  password: string
): Promise<number> => {
  logger.info('+ Insert user')
  const salt = crypto.randomBytes(16)
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256')
  const user = await trx
    .insertInto('user')
    .values({
      username,
      hashedPassword,
      salt
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return user.id as number
}

const remoteSettingsInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number
) => {
  logger.info('+ Insert remote settings')
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
  } = json.config.remoteSettings

  return await trx
    .insertInto('remoteSettings')
    .values({
      userId,
      tumblrKey,
      tumblrSecret,
      tumblrOauthToken: tumblrOAuthToken,
      tumblrOauthTokenSecret: tumblrOAuthTokenSecret,
      silenceTumblrAlert: toNumber(silenceTumblrAlert),
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
      hydrusPort: Number(hydrusPort),
      hydrusApiKey: hydrusAPIKey,
      piwigoProtocol,
      piwigoHost,
      piwigoUsername,
      piwigoPassword
    })
    .execute()
}

const cacheSettingsInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number
) => {
  logger.info('+ Insert cache settings')
  const { enabled, directory, maxSize } = json.config.caching
  return await trx
    .insertInto('cacheSettings')
    .values({
      userId,
      enabled: toNumber(enabled),
      directory,
      maxSize
    })
    .execute()
}

const tagsInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number
) => {
  if (json.tags.length > 0) {
    logger.info('+ Insert tags')
  } else {
    logger.info(': No tags')
  }
  const insertedTags: DBTag[] = []
  for (const tag of json.tags) {
    const insertedTag = await tagInsert(trx, tag, userId)
    if (insertedTag != null) {
      insertedTags.push(insertedTag)
    }
  }

  return insertedTags
}

const tagInsert = async (trx: Kysely<DB>, tag: Tag, userId: number) => {
  const { id, name, phraseString } = tag
  if (name == null) {
    logger.info(`! Skipping tag, no name defined (id: ${id})`)
    return undefined
  }

  logger.info(`+ Insert tag '{name}' (id: ${id})`, { name })
  return await trx
    .insertInto('tag')
    .values({
      id,
      userId,
      name,
      phraseString
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

const displaySettingsInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number,
  tags: DBTag[]
) => {
  logger.info('+ Insert display settings')
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
  } = json.config.displaySettings

  const displaySettings = await trx
    .insertInto('displaySettings')
    .values({
      userId,
      fullScreen: toNumber(fullScreen),
      clickToProgress: toNumber(clickToProgress),
      clickToProgressWhilePlaying: toNumber(clickToProgressWhilePlaying),
      startImmediately: toNumber(startImmediately),
      easingControls: toNumber(easingControls),
      audioAlert: toNumber(audioAlert),
      minImageSize,
      minVideoSize,
      maxInMemory,
      maxInHistory,
      maxLoadingAtOnce
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  const displaySettingsId = displaySettings.id
  if (displaySettingsId == null) {
    throw new Error('Display settings id is null')
  }

  if (json.config.displaySettings.ignoredTags.length > 0) {
    logger.info('+ Insert ignored tags')
  }
  const ignoredTags = new Set(json.config.displaySettings.ignoredTags)
  for (const ignoredTag of ignoredTags) {
    const tagId = tags.find((tag) => tag.name === ignoredTag)?.id
    if (tagId == null) {
      logger.info(`! Skipping ignored tag, '{name}' not found in tags`, {
        name: ignoredTag
      })
      continue
    }

    logger.info(`+ Insert ignored tag '{name}'`, { name: ignoredTag })
    await trx
      .insertInto('ignoredTag')
      .values({
        displaySettingsId,
        tagId
      })
      .execute()
  }
}

const tutorialsInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number
) => {
  logger.info('+ Insert tutorials')
  const {
    scenePicker,
    sceneDetail,
    sceneGenerator,
    library,
    audios,
    scripts,
    player,
    scriptor,
    videoClipper
  } = json.config.tutorials
  return await trx
    .insertInto('tutorials')
    .values({
      userId,
      current: json.tutorial,
      scenePicker,
      sceneDetail,
      sceneGenerator,
      library,
      audios,
      scripts,
      player,
      scriptor,
      videoClipper
    })
    .execute()
}

const themeInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number
) => {
  const colors = new Map([
    ['#f44336', 'red'],
    ['#e91e63', 'pink'],
    ['#9c27b0', 'purple'],
    ['#673ab7', 'deepPurple'],
    ['#3f51b5', 'indigo'],
    ['#2196f3', 'blue'],
    ['#03a9f4', 'lightBlue'],
    ['#00bcd4', 'cyan'],
    ['#009688', 'teal'],
    ['#4caf50', 'green'],
    ['#8bc34a', 'lightGreen'],
    ['#cddc39', 'lime'],
    ['#ffeb3b', 'yellow'],
    ['#ffc107', 'amber'],
    ['#ff9800', 'orange'],
    ['#ff5722', 'deepOrange'],
    ['#795548', 'brown'],
    ['#9e9e9e', 'grey'],
    ['#607d8b', 'blueGrey'],
    ['#fff', 'white'],
    ['#000', 'black']
  ])

  logger.info('+ Insert theme')
  const { mode, primary, secondary } = json.theme.palette
  const defaultColor = 'pink'
  const primaryColor =
    colors.get((primary as Record<string, string>).main) ?? defaultColor
  const secondaryColor =
    colors.get((secondary as Record<string, string>).main) ?? defaultColor
  return await trx
    .insertInto('theme')
    .values({
      userId,
      mode: mode as string,
      primaryColor,
      secondaryColor
    })
    .execute()
}

const generalSettingsInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number
) => {
  logger.info('+ Insert general settings')
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
    watermarkGrid,
    watermarkCorner,
    watermarkText,
    watermarkFontFamily,
    watermarkFontSize,
    watermarkColor
  } = json.config.generalSettings
  return await trx
    .insertInto('generalSettings')
    .values({
      userId,
      prioritizePerformance: toNumber(prioritizePerformance),
      confirmSceneDeletion: toNumber(confirmSceneDeletion),
      confirmBlacklist: toNumber(confirmBlacklist),
      confirmFileDeletion: toNumber(confirmFileDeletion),
      autoBackup: toNumber(autoBackup),
      autoBackupDays,
      autoCleanBackup: toNumber(autoCleanBackup),
      autoCleanBackupDays,
      autoCleanBackupWeeks,
      autoCleanBackupMonths,
      cleanRetain,
      watermark: toNumber(watermark),
      watermarkDisplay: toNumber(watermarkGrid),
      watermarkCorner,
      watermarkText,
      watermarkFontFamily,
      watermarkFontSize,
      watermarkColor
    })
    .execute()
}

const sceneSettingsInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number
) => {
  const sceneSettings = newScene(json.config.defaultScene)
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
    imageTypeFilter,
    weightFunction,
    sourceOrderFunction,
    orderFunction,
    forceAll,
    forceAllSource,
    fullSource,
    regenerate,
    zoom,
    zoomStart,
    zoomStartMax,
    zoomStartMin,
    zoomEnd,
    zoomEndMax,
    zoomEndMin,
    zoomRandom,
    horizTransType,
    horizTransLevel,
    horizTransLevelMax,
    horizTransLevelMin,
    horizTransRandom,
    vertTransType,
    vertTransLevel,
    vertTransLevelMax,
    vertTransLevelMin,
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
    imageType,
    imageOrientation,
    videoOrientation,
    backgroundType,
    backgroundBlur,
    gifOption,
    gifTimingConstant,
    gifTimingMin,
    gifTimingMax,
    videoOption,
    videoTimingConstant,
    videoTimingMin,
    videoTimingMax,
    randomVideoStart,
    continueVideo,
    playVideoClips,
    skipVideoStart,
    skipVideoEnd,
    videoVolume,
    videoSpeed,
    videoRandomSpeed,
    videoSpeedMin,
    videoSpeedMax,
    videoSkip,
    generatorMax,
    persistAudio,
    persistText,
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
    strobeEase,
    strobeExp,
    strobeAmp,
    strobePer,
    strobeOv,
    overrideIgnore,
    scriptScene,
    downloadScene,
    libraryID,
    audioStartIndex,
    scriptStartIndex,
    audioScene,
    audioEnabled,
    textEnabled
  } = sceneSettings

  logger.info(`+ Insert scene settings`)
  await trx
    .insertInto('scene')
    .values({
      userId,
      defaultScene: toNumber(true),
      name,
      useWeights: toNumber(useWeights),
      timingFunction,
      timingConstant,
      timingMin,
      timingMax,
      timingSinRate,
      timingBpmMulti: timingBPMMulti,
      backForth: toNumber(backForth),
      backForthTf: backForthTF,
      backForthConstant,
      backForthMin,
      backForthMax,
      backForthSinRate,
      backForthBpmMulti: backForthBPMMulti,
      imageType,
      backgroundType,
      backgroundBlur,
      imageTypeFilter,
      fullSource: toNumber(fullSource),
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
      videoRandomSpeed: toNumber(videoRandomSpeed),
      videoSpeedMin,
      videoSpeedMax,
      videoSkip,
      randomVideoStart: toNumber(randomVideoStart),
      continueVideo: toNumber(continueVideo),
      playVideoClips: toNumber(playVideoClips),
      skipVideoStart,
      skipVideoEnd,
      videoVolume,
      weightFunction,
      sourceOrderFunction,
      forceAllSource: toNumber(forceAllSource),
      orderFunction,
      forceAll: toNumber(forceAll),
      zoom: toNumber(zoom),
      zoomRandom: toNumber(zoomRandom),
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
      horizTransRandom: toNumber(horizTransRandom),
      vertTransType,
      vertTransLevel,
      vertTransLevelMin,
      vertTransLevelMax,
      vertTransRandom: toNumber(vertTransRandom),
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
      crossFade: toNumber(crossFade),
      crossFadeAudio: toNumber(crossFadeAudio),
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
      slide: toNumber(slide),
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
      strobe: toNumber(strobe),
      strobePulse: toNumber(strobePulse),
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
      strobeEase,
      strobeExp,
      strobeAmp,
      strobePer,
      strobeOv,
      fadeInOut: toNumber(fadeInOut),
      fadeIoPulse: toNumber(fadeIOPulse),
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
      panning: toNumber(panning),
      panTf: panTF,
      panDuration,
      panDurationMin,
      panDurationMax,
      panSinRate,
      panBpmMulti: panBPMMulti,
      panHorizTransType,
      panHorizTransImg: toNumber(panHorizTransImg),
      panHorizTransLevel,
      panHorizTransLevelMax,
      panHorizTransLevelMin,
      panHorizTransRandom: toNumber(panHorizTransRandom),
      panVertTransType,
      panVertTransImg: toNumber(panVertTransImg),
      panVertTransLevel,
      panVertTransLevelMax,
      panVertTransLevelMin,
      panVertTransRandom: toNumber(panVertTransRandom),
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
      overrideIgnore: toNumber(overrideIgnore),
      scriptScene: toNumber(scriptScene),
      downloadScene: toNumber(downloadScene),
      generatorMax,
      persistAudio: toNumber(persistAudio),
      persistText: toNumber(persistText),
      libraryId: libraryID,
      audioScene: toNumber(audioScene),
      audioEnabled: toNumber(audioEnabled),
      audioStartIndex,
      textEnabled: toNumber(textEnabled),
      scriptStartIndex,
      regenerate: toNumber(regenerate)
    })
    .execute()
}

const clipInsert = async (
  trx: Kysely<DB>,
  clip: Clip,
  userId: number,
  contentSourceId: number,
  disabled: boolean,
  tags: DBTag[]
) => {
  const { id, start, end, volume } = clip
  logger.info(`+ Insert clip (id: ${id})`)
  const insertedClip = await trx
    .insertInto('clip')
    .values({
      userId,
      contentSourceId,
      disabled: toNumber(disabled),
      start,
      end,
      volume
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  if (clip.tags.length > 0) {
    logger.info(`+ Insert clip tags`)
  }
  for (const tag of clip.tags) {
    const tagId = tags.find((t) => t.name === tag.name)?.id
    if (tagId == null) {
      logger.info(`! Skipping clip tag '{name}', not found`, { name: tag.name })
      continue
    }

    logger.info(`+ Insert clip tag '{name}' (id: ${tagId})`, { name: tag.name })
    await trx
      .insertInto('clipTag')
      .values({
        clipId: insertedClip.id as number,
        tagId
      })
      .execute()
  }
}

const sceneColorInsert = async (
  trx: Kysely<DB>,
  sceneId: number,
  color: string,
  type: string
) => {
  logger.info(`+ Insert scene ${type} color ${color}`)
  return await trx
    .insertInto('sceneColor')
    .values({ sceneId, color, type })
    .execute()
}

const libraryContentSourceInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number,
  tags: DBTag[]
) => {
  if (json.library.length > 0) {
    logger.info('+ Insert library content sources')
  } else {
    logger.info(': No library content sources')
  }
  for (const source of json.library) {
    await contentSourceInsert(trx, source, userId, tags)
    await trx
      .insertInto('libraryContentSource')
      .values({
        userId,
        contentSourceId: source.id
      })
      .execute()
  }
}

const contentSourceInsert = async (
  trx: Kysely<DB>,
  source: LibrarySource,
  userId: number,
  tags: DBTag[]
) => {
  const {
    id,
    url,
    offline,
    marked,
    lastCheck,
    clips,
    disabledClips,
    blacklist,
    count,
    countComplete,
    weight,
    dirOfSources,
    subtitleFile,
    duration,
    resolution,
    redditFunc,
    redditTime,
    includeRetweets,
    includeReplies
  } = source

  logger.info(`+ Insert content source {url} (id: ${id})`, { url })
  const insertedSource = await trx
    .insertInto('contentSource')
    .values({
      id,
      userId,
      url,
      offline: toNumber(offline),
      marked: toNumber(marked),
      lastCheck: new Date(lastCheck).getTime(),
      count,
      countComplete: toNumber(countComplete),
      weight,
      localDirOfSources: toNumber(dirOfSources),
      videoSubtitleFile: subtitleFile,
      videoDuration: duration,
      videoResolution: resolution,
      redditFunc,
      redditTime,
      twitterIncludeRetweets: toNumber(includeRetweets),
      twitterIncludeReplies: toNumber(includeReplies)
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  if (source.tags.length > 0) {
    logger.info('+ Insert content source tags')
  }
  for (const tag of source.tags) {
    const tagId = tags.find((t) => t.name === tag.name)?.id
    if (tagId == null) {
      logger.info(`! Skipping content source tag '{name}', not found`, {
        name: tag.name
      })
      continue
    }

    logger.info(`+ Insert content source tag '{name}' (id: ${tagId})`, {
      name: tag.name
    })
    await trx
      .insertInto('contentSourceTag')
      .values({
        contentSourceId: insertedSource.id as number,
        tagId
      })
      .execute()
  }

  if (clips.length > 0) {
    logger.info('+ Insert content source clips')
  }
  for (const clip of clips) {
    const disabled = disabledClips.includes(clip.id)
    await clipInsert(trx, clip, userId, id, disabled, tags)
  }

  if (blacklist.length > 0) {
    logger.info('+ Insert content source blacklist')
  }
  for (const url of blacklist) {
    logger.info(`+ Insert content source blacklist item {url}`, { url })
    await trx
      .insertInto('contentSourceBlacklistItem')
      .values({
        contentSourceId: id,
        url
      })
      .execute()
  }
}

const sceneGroupInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number
) => {
  if (json.sceneGroups.length > 0) {
    logger.info('+ Insert scene groups')
  } else {
    logger.info(': No scene groups')
  }
  for (const group of json.sceneGroups) {
    const { id, name, type } = group
    if (type == null) {
      logger.info(`! Skipping scene group, '{name}' has no type (id: ${id})`, {
        name
      })
      continue
    }

    logger.info(`+ Insert scene group '{name}' (id: ${id})`, { name })
    await trx
      .insertInto('sceneGroup')
      .values({ id, userId, name, type })
      .returningAll()
      .executeTakeFirstOrThrow()
  }
}

const audioInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number,
  tags: DBTag[]
) => {
  if (json.audios.length > 0) {
    logger.info('+ Insert audios')
  } else {
    logger.info(': No audios')
  }
  for (const audio of json.audios) {
    const {
      id,
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
      thumb,
      name,
      artist,
      album,
      trackNum,
      duration,
      comment,
      playedCount
    } = audio

    if (url == null) {
      logger.info(`! Skipping audio, no url defined (id: ${id})`)
      continue
    }

    logger.info(`+ Insert audio {url} (id: ${id})`, { url })
    await trx
      .insertInto('audio')
      .values({
        id,
        userId,
        url,
        marked: toNumber(marked),
        volume,
        speed,
        stopAtEnd: toNumber(stopAtEnd),
        nextSceneAtEnd: toNumber(nextSceneAtEnd),
        tick: toNumber(tick),
        tickMode,
        tickDelay,
        tickMinDelay,
        tickMaxDelay,
        tickSinRate,
        tickBpmMulti: tickBPMMulti,
        bpm,
        thumb,
        name,
        artist,
        album,
        trackNum,
        duration,
        comment,
        playedCount
      })
      .execute()

    if (audio.tags.length > 0) {
      logger.info('+ Insert audio tags')
    }
    for (const tag of audio.tags) {
      const tagId = tags.find((t) => t.name === tag.name)?.id
      if (tagId == null) {
        logger.info(`! Skipping audio tag '{name}', not found`, {
          name: tag.name
        })
        continue
      }

      logger.info(`+ Insert audio tag '{name}' (id: ${tagId})`, {
        name: tag.name
      })
      return await trx
        .insertInto('audioTag')
        .values({
          audioId: id,
          tagId
        })
        .execute()
    }
  }
}

const audioPlaylistInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number
) => {
  if (json.playlists.length > 0) {
    logger.info('+ Insert audio playlists')
  } else {
    logger.info(': No audio playlists')
  }
  for (const playlist of json.playlists) {
    const { id, name, audios } = playlist
    const sceneGroupId = json.sceneGroups.find(
      (group) =>
        group.type === SG.playlist &&
        group.scenes.includes(convertPlaylistIDToSceneID(id))
    )?.id

    logger.info(`+ Insert audio playlist`)
    await trx
      .insertInto('playlist')
      .values({
        id,
        userId,
        sceneGroupId,
        name: name ?? '',
        type: PLT.audio,
        repeat: RP.none,
        shuffle: toNumber(false)
      })
      .execute()

    if (audios.length > 0) {
      logger.info('+ Insert audio playlist items')
    }
    for (let i = 0; i < audios.length; i++) {
      logger.info(`+ Insert audio playlist item (${i + 1}/${audios.length})`)
      await trx
        .insertInto('audioPlaylistItem')
        .values({
          playlistId: id,
          index: i,
          audioId: audios[i]
        })
        .execute()
    }
  }
}

const fontSettingsInsert = async (
  trx: Kysely<DB>,
  fontSettings: FontSettings,
  userId: number
) => {
  logger.info('+ Insert font settings')
  const { color, fontSize, fontFamily, border, borderpx, borderColor } =
    fontSettings

  return await trx
    .insertInto('fontSettings')
    .values({
      userId,
      color,
      fontSize,
      fontFamily,
      border: toNumber(border),
      borderpx,
      borderColor
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

const captionScriptInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number,
  tags: DBTag[]
) => {
  if (json.scripts.length > 0) {
    logger.info('+ Insert caption scripts')
  } else {
    logger.info(': No caption scripts')
  }
  for (const captionScript of json.scripts) {
    const {
      id,
      url,
      script,
      marked,
      opacity,
      stopAtEnd,
      nextSceneAtEnd,
      syncWithAudio,
      blink,
      caption,
      captionBig,
      count
    } = captionScript

    if (url == null && script == null) {
      logger.info(
        `! Skipping caption script, no url or script defined (id: ${id})`
      )
      continue
    }

    logger.info('+ Insert blink font settings')
    const blinkFontId = (await fontSettingsInsert(trx, blink, userId)).id

    logger.info('+ Insert caption font settings')
    const captionFontId = (await fontSettingsInsert(trx, caption, userId)).id

    logger.info('+ Insert big caption font settings')
    const captionBigFontId = (await fontSettingsInsert(trx, captionBig, userId))
      .id

    logger.info('+ Insert count font settings')
    const countFontId = (await fontSettingsInsert(trx, count, userId)).id

    logger.info(`+ Insert caption script (id: ${id})`)
    await trx
      .insertInto('captionScript')
      .values({
        id,
        url,
        userId,
        script,
        marked: toNumber(marked),
        opacity,
        stopAtEnd: toNumber(stopAtEnd),
        nextSceneAtEnd: toNumber(nextSceneAtEnd),
        syncWithAudio: toNumber(syncWithAudio),
        blinkFontId,
        captionFontId,
        captionBigFontId,
        countFontId
      })
      .execute()

    if (captionScript.tags.length > 0) {
      logger.info('+ Insert caption script tags')
    }
    for (const tag of captionScript.tags) {
      const tagId = tags.find((t) => t.name === tag.name)?.id
      if (tagId == null) {
        logger.info(`Skipping caption script tag '{name}', not found`, {
          name: tag.name
        })
        continue
      }

      logger.info('+ Insert caption script tag')
      return await trx
        .insertInto('captionScriptTag')
        .values({
          captionScriptId: id,
          tagId
        })
        .execute()
    }
  }
}

type PlaylistType =
  | typeof PLT.audio
  | typeof PLT.display
  | typeof PLT.scene
  | typeof PLT.script

interface PlaylistBase {
  name?: string
  shuffle: boolean
  repeat: string
}

const playlistInsert = async (
  trx: Kysely<DB>,
  playlist: PlaylistBase,
  userId: number,
  type: PlaylistType,
  sceneGroupId?: number
) => {
  const { name, shuffle, repeat } = playlist

  logger.info(`+ Insert ${type} playlist '{name}'`, { name })
  return await trx
    .insertInto('playlist')
    .values({
      userId,
      sceneGroupId,
      type,
      name: name ?? '',
      shuffle: toNumber(shuffle),
      repeat
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

const audioPlaylistItemInsert = async (
  trx: Kysely<DB>,
  playlistId: number,
  index: number,
  audioId: number
) => {
  logger.info(
    `+ Insert audio playlist item (playlist: ${playlistId}, audio: ${audioId})`
  )
  return await trx
    .insertInto('audioPlaylistItem')
    .values({
      playlistId,
      index,
      audioId
    })
    .execute()
}

const captionScriptPlaylistItemInsert = async (
  trx: Kysely<DB>,
  playlistId: number,
  index: number,
  captionScriptId: number
) => {
  logger.info(
    `+ Insert caption script playlist item (playlist: ${playlistId}, script: ${captionScriptId})`
  )
  return await trx
    .insertInto('captionScriptPlaylistItem')
    .values({
      playlistId,
      index,
      captionScriptId
    })
    .execute()
}

const weightGroupInsert = async (
  trx: Kysely<DB>,
  weightGroup: WeightGroup,
  sceneId: number,
  ruleId: number | null
) => {
  const { percent, type, search, max, chosen } = weightGroup

  logger.info(`+ Insert weight group`)
  return await trx
    .insertInto('weightGroup')
    .values({
      sceneId,
      ruleId,
      percent,
      type,
      search,
      max,
      chosen
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

const sceneInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number,
  tags: DBTag[]
) => {
  if (json.scenes.length > 0) {
    logger.info('+ Insert scenes')
  } else {
    logger.info(': No scenes')
  }
  for (const scene of json.scenes) {
    const {
      id,
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

    const sceneGroupId = json.sceneGroups.find(
      (group) => group.type === SG.scene && group.scenes.includes(id)
    )?.id
    logger.info(`+ Insert scene '{name}' (id: ${id})`, { name })
    await trx
      .insertInto('scene')
      .values({
        id,
        userId,
        sceneGroupId,
        name,
        useWeights: toNumber(useWeights),
        timingFunction,
        timingConstant,
        timingMin,
        timingMax,
        timingSinRate,
        timingBpmMulti: timingBPMMulti,
        backForth: toNumber(backForth),
        backForthTf: backForthTF,
        backForthConstant,
        backForthMin,
        backForthMax,
        backForthSinRate,
        backForthBpmMulti: backForthBPMMulti,
        imageType,
        backgroundType,
        backgroundBlur,
        imageTypeFilter,
        fullSource: toNumber(fullSource),
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
        videoRandomSpeed: toNumber(videoRandomSpeed),
        videoSpeedMin,
        videoSpeedMax,
        videoSkip,
        randomVideoStart: toNumber(randomVideoStart),
        continueVideo: toNumber(continueVideo),
        playVideoClips: toNumber(playVideoClips),
        skipVideoStart,
        skipVideoEnd,
        videoVolume,
        weightFunction,
        sourceOrderFunction,
        forceAllSource: toNumber(forceAllSource),
        orderFunction,
        forceAll: toNumber(forceAll),
        zoom: toNumber(zoom),
        zoomRandom: toNumber(zoomRandom),
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
        horizTransRandom: toNumber(horizTransRandom),
        vertTransType,
        vertTransLevel,
        vertTransLevelMin,
        vertTransLevelMax,
        vertTransRandom: toNumber(vertTransRandom),
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
        crossFade: toNumber(crossFade),
        crossFadeAudio: toNumber(crossFadeAudio),
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
        slide: toNumber(slide),
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
        strobe: toNumber(strobe),
        strobePulse: toNumber(strobePulse),
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
        strobeEase,
        strobeExp,
        strobeAmp,
        strobePer,
        strobeOv,
        fadeInOut: toNumber(fadeInOut),
        fadeIoPulse: toNumber(fadeIOPulse),
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
        panning: toNumber(panning),
        panTf: panTF,
        panDuration,
        panDurationMin,
        panDurationMax,
        panSinRate,
        panBpmMulti: panBPMMulti,
        panHorizTransType,
        panHorizTransImg: toNumber(panHorizTransImg),
        panHorizTransLevel,
        panHorizTransLevelMax,
        panHorizTransLevelMin,
        panHorizTransRandom: toNumber(panHorizTransRandom),
        panVertTransType,
        panVertTransImg: toNumber(panVertTransImg),
        panVertTransLevel,
        panVertTransLevelMax,
        panVertTransLevelMin,
        panVertTransRandom: toNumber(panVertTransRandom),
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
        overrideIgnore: toNumber(overrideIgnore),
        scriptScene: toNumber(scriptScene),
        downloadScene: toNumber(downloadScene),
        generatorMax,
        persistAudio: toNumber(persistAudio),
        persistText: toNumber(persistText),
        libraryId: libraryID,
        audioScene: toNumber(audioScene),
        audioEnabled: toNumber(audioEnabled),
        audioStartIndex,
        textEnabled: toNumber(textEnabled),
        scriptStartIndex,
        regenerate: toNumber(regenerate),
        defaultScene: toNumber(false)
      })
      .execute()

    if (scene.sources.length > 0) {
      logger.info('+ Insert scene content sources')
    }
    for (const source of scene.sources) {
      await contentSourceInsert(trx, source, userId, tags)
      await trx
        .insertInto('sceneContentSource')
        .values({
          sceneId: id,
          contentSourceId: source.id
        })
        .execute()
    }

    await sceneColorInsert(trx, id, scene.backgroundColor, 'background')
    for (const color of scene.backgroundColorSet) {
      await sceneColorInsert(trx, id, color, 'background')
    }

    await sceneColorInsert(trx, id, scene.strobeColor, 'strobe')
    for (const color of scene.strobeColorSet) {
      await sceneColorInsert(trx, id, color, 'strobe')
    }

    for (let i = 0; i < scene.audioPlaylists.length; i++) {
      const playlist = scene.audioPlaylists[i]
      const sceneGroupId = json.sceneGroups.find(
        (group) =>
          group.type === SG.playlist &&
          group.scenes.includes(convertPlaylistIDToSceneID(id))
      )?.id

      const insertedPlaylist = await playlistInsert(
        trx,
        playlist,
        userId,
        PLT.audio,
        sceneGroupId
      )
      for (const audio of playlist.audios) {
        await audioPlaylistItemInsert(
          trx,
          insertedPlaylist.id as number,
          i,
          audio.id
        )
      }
    }

    for (let i = 0; i < scene.scriptPlaylists.length; i++) {
      const playlist = scene.scriptPlaylists[i]
      const sceneGroupId = json.sceneGroups.find(
        (group) =>
          group.type === SG.playlist &&
          group.scenes.includes(convertPlaylistIDToSceneID(id))
      )?.id

      const insertedPlaylist = await playlistInsert(
        trx,
        playlist,
        userId,
        PLT.script,
        sceneGroupId
      )
      for (const script of playlist.scripts) {
        await captionScriptPlaylistItemInsert(
          trx,
          insertedPlaylist.id as number,
          i,
          script.id
        )
      }
    }

    if (scene.generatorWeights != null) {
      for (const weightGroup of scene.generatorWeights) {
        const insertedWeightGroup = await weightGroupInsert(
          trx,
          weightGroup,
          id,
          null
        )
        if (weightGroup.rules != null) {
          for (const rule of weightGroup.rules) {
            await weightGroupInsert(trx, rule, id, insertedWeightGroup.id)
          }
        }
      }
    }
  }
}

const displayInsert = async (
  trx: Kysely<DB>,
  json: AppStorage,
  userId: number
) => {
  if (json.grids.length > 0) {
    logger.info(`+ Insert displays`)
  } else {
    logger.info(`: No displays`)
  }
  for (const grid of json.grids) {
    const { id, name } = grid
    const sceneGroupId = json.sceneGroups.find((group) =>
      group.scenes.includes(convertGridIDToSceneID(id))
    )?.id

    logger.info(`+ Insert display '{name}' (id: ${id})`, { name })
    await trx
      .insertInto('display')
      .values({ id, name: name ?? '', userId, sceneGroupId })
      .execute()

    const rows = grid.grid.length
    const cols = grid.grid[0].length
    const width = 100 / cols
    const height = 100 / rows
    const insertedViews: DBDisplayView[][] = []
    for (let r = 0; r < rows; r++) {
      insertedViews[r] = []
      for (let c = 0; c < cols; c++) {
        const cell = grid.grid[r][c]
        const sync = cell.sceneCopy.length === 2
        const cellName =
          json.scenes.find((s) => s.id === cell.sceneID)?.name ?? 'View'
        logger.info(`+ Insert display view '{name}' [${r}, ${c}]`, { name })
        const view = await trx
          .insertInto('displayView')
          .values({
            displayId: id,
            name: `${cellName} [${r}, ${c}]`,
            x: c * width,
            y: r * height,
            z: 0,
            width,
            height,
            color: getRandomColor(),
            opacity: 100,
            visible: toNumber(true),
            sync: toNumber(sync),
            mirrorSyncedView: MVF.none
          })
          .returningAll()
          .executeTakeFirstOrThrow()

        insertedViews[r][c] = view
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const view = insertedViews[r][c]
        if (!view.sync) {
          continue
        }

        const cell = grid.grid[r][c]
        const copyView = insertedViews[cell.sceneCopy[0]][cell.sceneCopy[1]]
        logger.info(`+ Update synced display view '{name}'`, {
          name: view.name
        })
        await trx
          .updateTable('displayView')
          .set({
            syncWithView: copyView.id as number,
            color: copyView.color,
            mirrorSyncedView: cell.mirror ? MVF.vertical : MVF.none
          })
          .where('id', '=', view.id)
          .execute()
      }
    }
  }
}

export async function up(db: Kysely<DB>): Promise<void> {
  return await db.transaction().execute(async (trx) => {
    const json = readDataJsonFile() ?? initialAppStorage
    const username = process.env.FF_USERNAME ?? generateUsername()
    const password =
      process.env.FF_PASSWORD ??
      generator.generate({
        numbers: true,
        length: 12,
        excludeSimilarCharacters: true,
        strict: true
      })

    const userId = await userInsert(trx, username, password)
    await generalSettingsInsert(trx, json, userId)
    await remoteSettingsInsert(trx, json, userId)
    await cacheSettingsInsert(trx, json, userId)
    const tags = await tagsInsert(trx, json, userId)
    await displaySettingsInsert(trx, json, userId, tags)
    await tutorialsInsert(trx, json, userId)
    await themeInsert(trx, json, userId)
    await audioInsert(trx, json, userId, tags)
    await audioPlaylistInsert(trx, json, userId)
    await captionScriptInsert(trx, json, userId, tags)
    await libraryContentSourceInsert(trx, json, userId, tags)
    await sceneGroupInsert(trx, json, userId)
    await sceneInsert(trx, json, userId, tags)
    await sceneSettingsInsert(trx, json, userId)
    await displayInsert(trx, json, userId)

    logger.info(
      `
      +-----------------------------------------------------------------------------------------+
       username: {username}                   
       password: {password}                 
      +-----------------------------------------------------------------------------------------+
      IMPORTANT: The username and password are only shown once. Please store them somewhere safe. 
      You can change the username and password in the account settings after logging in. 
    `,
      { username, password }
    )
  })
}

export async function down(db: Kysely<DB>): Promise<void> {
  return await db.transaction().execute(async (trx) => {
    logger.info('- Delete fontSettings rows')
    await trx.deleteFrom('fontSettings').execute()

    logger.info('- Delete audioTag rows')
    await trx.deleteFrom('audioTag').execute()

    logger.info('- Delete audio rows')
    await trx.deleteFrom('audio').execute()

    logger.info('- Delete displayView rows')
    await trx.deleteFrom('displayView').execute()

    logger.info('- Delete display rows')
    await trx.deleteFrom('display').execute()

    logger.info('- Delete captionScriptPlaylistItem rows')
    await trx.deleteFrom('captionScriptPlaylistItem').execute()

    logger.info('- Delete audioPlaylistItem rows')
    await trx.deleteFrom('audioPlaylistItem').execute()

    logger.info('- Delete playlist rows')
    await trx.deleteFrom('playlist').execute()

    logger.info('- Delete captionScriptTag rows')
    await trx.deleteFrom('captionScriptTag').execute()

    logger.info('- Delete captionScript rows')
    await trx.deleteFrom('captionScript').execute()

    logger.info('- Delete libraryContentSource rows')
    await trx.deleteFrom('libraryContentSource').execute()

    logger.info('- Delete sceneContentSource rows')
    await trx.deleteFrom('sceneContentSource').execute()

    logger.info('- Delete sceneColor rows')
    await trx.deleteFrom('sceneColor').execute()

    logger.info('- Delete weightGroup rows')
    await trx.deleteFrom('weightGroup').execute()

    logger.info('- Delete scenePlaylist rows')
    await trx.deleteFrom('scenePlaylist').execute()

    logger.info('- Delete scene rows')
    await trx.deleteFrom('scene').execute()

    logger.info('- Delete sceneGroup rows')
    await trx.deleteFrom('sceneGroup').execute()

    logger.info('- Delete contentSourceBlacklistItem rows')
    await trx.deleteFrom('contentSourceBlacklistItem').execute()

    logger.info('- Delete clipTag rows')
    await trx.deleteFrom('clipTag').execute()

    logger.info('- Delete clip rows')
    await trx.deleteFrom('clip').execute()

    logger.info('- Delete contentSourceTag rows')
    await trx.deleteFrom('contentSourceTag').execute()

    logger.info('- Delete contentSource rows')
    await trx.deleteFrom('contentSource').execute()

    logger.info('- Delete theme rows')
    await trx.deleteFrom('theme').execute()

    logger.info('- Delete tutorials rows')
    await trx.deleteFrom('tutorials').execute()

    logger.info('- Delete generalSettings rows')
    await trx.deleteFrom('generalSettings').execute()

    logger.info('- Delete ignoredTag rows')
    await trx.deleteFrom('ignoredTag').execute()

    logger.info('- Delete tag rows')
    await trx.deleteFrom('tag').execute()

    logger.info('- Delete displaySettings rows')
    await trx.deleteFrom('displaySettings').execute()

    logger.info('- Delete cacheSettings rows')
    await trx.deleteFrom('cacheSettings').execute()

    logger.info('- Delete remoteSettings rows')
    await trx.deleteFrom('remoteSettings').execute()

    logger.info('- Delete user rows')
    await trx.deleteFrom('user').execute()
  })
}

import fs from 'fs'
import path from 'path'
import express from 'express'
import { findTheme, updateTheme } from '../db/ThemeRepository'
import {
  findCacheSettings,
  updateCacheSettings
} from '../db/CacheSettingsRepository'
import {
  deleteIgnoredTags,
  findDisplaySettings,
  updateDisplaySettings
} from '../db/DisplaySettingsRepository'
import {
  findGeneralSettings,
  updateGeneralSettings
} from '../db/GeneralSettingsRepository'
import {
  findRemoteSettings,
  updateRemoteSettings
} from '../db/RemoteSettingsRepository'
import { User } from '../db/types/generated'
import {
  toThemeSettings,
  toGeneralSettings,
  toRemoteSettings,
  toDisplaySettings,
  toCacheSettings,
  toThemeUpdate,
  toGeneralSettingsUpdate,
  toRemoteSettingsUpdate,
  toDisplaySettingsUpdate,
  toCacheSettingsUpdate,
  toCacheSize
} from '../db/mappers'
import { toNumber } from '../db/utils'
import { WC } from 'flipflip-common'
import Logger from '../logging/Logger'

const logger = Logger.create('settings')
const router = express.Router()
router.get('/theme', async (req, res) => {
  const settings = toThemeSettings(await findTheme(req.user as User))
  res.status(200).send(settings)
})
router.patch('/theme', async (req, res) => {
  const result = await updateTheme(req.user as User, toThemeUpdate(req.body))
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})
router.get('/general', async (req, res) => {
  const settings = toGeneralSettings(
    await findGeneralSettings(req.user as User)
  )
  res.status(200).send(settings)
})
router.patch('/general', async (req, res) => {
  const result = await updateGeneralSettings(
    req.user as User,
    toGeneralSettingsUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})
router.get('/remote', async (req, res) => {
  const settings = toRemoteSettings(await findRemoteSettings(req.user as User))
  res.status(200).send(settings)
})
router.patch('/remote', async (req, res) => {
  const result = await updateRemoteSettings(
    req.user as User,
    toRemoteSettingsUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})
router.get('/display', async (req, res) => {
  const settings = toDisplaySettings(
    await findDisplaySettings(req.user as User)
  )
  res.status(200).send(settings)
})
router.patch('/display', async (req, res) => {
  const result = await updateDisplaySettings(
    req.user as User,
    toDisplaySettingsUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})
router.get('/cache', async (req, res) => {
  const settings = toCacheSettings(await findCacheSettings(req.user as User))
  res.status(200).send(settings)
})
router.get('/cache/size', async (req, res) => {
  const settings = await findCacheSettings(req.user as User)
  if (
    !fs.existsSync(settings.directory) ||
    !fs.statSync(settings.directory).isDirectory()
  ) {
    res.status(200).send(toCacheSize(0))
    return
  }

  const { default: getFolderSize } = await import('get-folder-size')
  const result = await getFolderSize(settings.directory)
  if (result.errors != null) {
    for (const error of result.errors) {
      logger.error('Failed to get folder size', { error })
    }

    res.status(500).end()
  } else {
    res.status(200).send(toCacheSize(result.size / (1024 * 1024)))
  }
})
router.patch('/cache', async (req, res) => {
  const result = await updateCacheSettings(
    req.user as User,
    toCacheSettingsUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})
router.post('/cache/clear', async (req, res) => {
  const settings = await findCacheSettings(req.user as User)
  if (
    fs.existsSync(settings.directory) &&
    fs.statSync(settings.directory).isDirectory()
  ) {
    const entries = await fs.promises.readdir(settings.directory)
    for (const entry of entries) {
      const dirPath = path.join(settings.directory, entry)
      const recursive = (await fs.promises.stat(dirPath)).isDirectory()
      await fs.promises.rm(dirPath, { recursive, force: true })
    }
  }

  res.status(204).end()
})
router.post('/reset', async (req, res) => {
  const user = req.user as User
  await updateTheme(user, {
    mode: 'light',
    primaryColor: 'indigo',
    secondaryColor: 'pink'
  })
  await updateCacheSettings(user, {
    directory: '',
    enabled: toNumber(true),
    maxSize: 500
  })
  await updateDisplaySettings(user, {
    fullScreen: toNumber(false),
    clickToProgress: toNumber(true),
    clickToProgressWhilePlaying: toNumber(false),
    startImmediately: toNumber(false),
    easingControls: toNumber(false),
    audioAlert: toNumber(true),
    minVideoSize: 200,
    minImageSize: 200,
    maxInMemory: 40,
    maxInHistory: 120,
    maxLoadingAtOnce: 5
  })
  await deleteIgnoredTags(user)
  await updateGeneralSettings(user, {
    prioritizePerformance: toNumber(true),
    confirmSceneDeletion: toNumber(true),
    confirmBlacklist: toNumber(true),
    confirmFileDeletion: toNumber(true),
    autoBackup: toNumber(false),
    autoBackupDays: 1,
    autoCleanBackup: toNumber(false),
    autoCleanBackupDays: 14,
    autoCleanBackupWeeks: 8,
    autoCleanBackupMonths: 6,
    cleanRetain: 1,
    watermark: toNumber(false),
    watermarkDisplay: toNumber(false),
    watermarkCorner: WC.bottomRight,
    watermarkText: '',
    watermarkFontFamily: 'Arial Black,Arial Bold,Gadget,sans-serif',
    watermarkFontSize: 14,
    watermarkColor: '#FFFFFF'
  })
  await updateRemoteSettings(user, {
    tumblrKey: '',
    tumblrSecret: '',
    tumblrOauthToken: '',
    tumblrOauthTokenSecret: '',
    silenceTumblrAlert: toNumber(false),
    redditUserAgent: '',
    redditClientId: '',
    redditDeviceId: '',
    redditRefreshToken: '',
    twitterConsumerKey: '',
    twitterConsumerSecret: '',
    twitterAccessTokenKey: '',
    twitterAccessTokenSecret: '',
    instagramUsername: '',
    instagramPassword: '',
    hydrusProtocol: 'http',
    hydrusDomain: 'localhost',
    hydrusPort: 45869,
    hydrusApiKey: '',
    piwigoProtocol: 'http',
    piwigoHost: '',
    piwigoUsername: '',
    piwigoPassword: ''
  })

  res.status(204).end()
})
export default router

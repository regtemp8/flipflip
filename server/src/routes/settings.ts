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
  toCacheSettingsUpdate
} from '../db/mappers'
import { toNumber } from '../db/utils'
import { WC } from 'flipflip-common'

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
router.patch('/cache', async (req, res) => {
  const result = await updateCacheSettings(
    req.user as User,
    toCacheSettingsUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
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

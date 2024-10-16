import express from 'express'
import { findTheme, updateTheme } from '../db/ThemeRepository'
import {
  findCacheSettings,
  updateCacheSettings
} from '../db/CacheSettingsRepository'
import {
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
export default router

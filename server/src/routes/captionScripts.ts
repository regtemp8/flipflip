import express from 'express'
import {
  toCaptionScript,
  toCaptionScriptUpdate,
  toFontSettings,
  toFontSettingsUpdate
} from '../db/mappers'
import {
  findCaptionScriptIds,
  findCaptionScriptById,
  updateCaptionScript,
  findFontSettingsByType,
  updateFontSettings
} from '../db/CaptionScriptRepository'
import { FontSettingsType } from 'flipflip-common'

const router = express.Router()
router.get('/', async (req, res) => {
  const ids = await findCaptionScriptIds()
  if (ids != null) {
    res.status(200).send(ids)
  } else {
    res.status(500).end()
  }
})
router.get('/:id', async (req, res) => {
  const source = await findCaptionScriptById(Number(req.params.id))
  if (source != null) {
    res.status(200).send(toCaptionScript(source))
  } else {
    res.status(404).end()
  }
})
router.patch('/:id', async (req, res) => {
  const result = await updateCaptionScript(
    Number(req.params.id),
    toCaptionScriptUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})
router.get(
  '/:id/font-settings/:type(blink|count|caption|captionBig)',
  async (req, res) => {
    const source = await findFontSettingsByType(
      Number(req.params.id),
      req.params.type as FontSettingsType
    )
    if (source != null) {
      res.status(200).send(toFontSettings(source))
    } else {
      res.status(404).end()
    }
  }
)
router.patch(
  '/:id/font-settings/:type(blink|count|caption|captionBig)',
  async (req, res) => {
    const result = await updateFontSettings(
      Number(req.params.id),
      req.params.type as FontSettingsType,
      toFontSettingsUpdate(req.body)
    )
    const status =
      result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
    res.status(status).end()
  }
)

export default router

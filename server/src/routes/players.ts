import express from 'express'
import players from '../player/PlayerService'
import { findGeneralSettings } from '../db/GeneralSettingsRepository'
import { User } from '../db/types/entities'
import { findDisplayById } from '../db/DisplayRepository'
import { toBoolean } from '../db/utils'
import { WatermarkSettings } from 'flipflip-common'

const router = express.Router()
router.post('/:id/stop', async (req, res) => {
  players().stop(req.params.id)
  res.status(204).end()
})

router.get('/:id/view-players', async (req, res) => {
  const player = players().get(req.params.id)
  if (player == null) {
    res.status(404).end()
  } else {
    res.status(200).send(player.getViewPlayerRefs())
  }
})

router.get('/:id/watermark', async (req, res) => {
  const player = players().get(req.params.id)
  if (player == null) {
    res.status(404).end()
  } else {
    const user = req.user as User
    const displayId = player.getDisplayId()
    const display = await findDisplayById(displayId)
    const generalSettings = await findGeneralSettings(user)
    const showWatermark =
      generalSettings.watermarkDisplay ||
      (toBoolean(display?.temporary) === true && generalSettings.watermark)
    if (showWatermark) {
      const {
        watermarkCorner,
        watermarkFontFamily,
        watermarkColor,
        watermarkFontSize,
        watermarkText
      } = generalSettings
      const watermarkSettings: WatermarkSettings = {
        watermarkCorner,
        watermarkFontFamily,
        watermarkColor,
        watermarkFontSize,
        watermarkText
      }
      res.status(200).send(watermarkSettings)
    } else {
      res.status(204).end()
    }
  }
})

export default router

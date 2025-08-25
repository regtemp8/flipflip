import express from 'express'
import viewPlayers from '../player/ViewPlayerService'
import { findDisplaySettings } from '../db/DisplaySettingsRepository'
import { User } from '../db/types/entities'
import { SCENE_NONE, ViewerEvent, ViewPlayerConfig } from 'flipflip-common'
import { findDisplayViewById } from '../db/DisplayViewRepository'
import { toDisplayView } from '../db/mappers'

const router = express.Router()
router.get('/:id/config', async (req, res) => {
  const viewId = viewPlayers().getViewId(req.params.id)
  if (viewId == null) {
    res.status(404).end()
    return
  }

  const displayView = await findDisplayViewById(viewId)
  const view = displayView != null ? toDisplayView(displayView) : undefined
  if (view == null) {
    res.status(404).end()
    return
  }

  let sceneId = SCENE_NONE
  let maxCanLoad = 0
  let maxCanLoadAtOnce = 0
  let uuid = req.params.id
  if (!view.sync) {
    const viewPlayer = viewPlayers().get(req.params.id)
    if (viewPlayer == null) {
      res.status(404).end()
      return
    }

    const displaySettings = await findDisplaySettings(req.user as User)
    maxCanLoad = displaySettings.maxInMemory
    maxCanLoadAtOnce = displaySettings.maxLoadingAtOnce
    sceneId = viewPlayer.getCurrentSceneId()
  } else {
    uuid = viewPlayers().getViewPlayerId(view.syncWithView as number)
  }

  const body: ViewPlayerConfig = {
    uuid,
    view,
    sceneId,
    maxCanLoad,
    maxCanLoadAtOnce
  }

  res.status(200).send(body)
})

router.get('/:id/items', async (req, res) => {
  let size = NaN
  if (req.query.size != null) {
    size = Number(req.query.size as string)
  }
  if (isNaN(size)) {
    res.status(400).end()
    return
  }

  const viewPlayer = viewPlayers().get(req.params.id)
  if (viewPlayer == null) {
    res.status(404).end()
    return
  }

  const items = viewPlayer.take(size)
  res.status(200).send(items)
})

router.post('/:id/event', async (req, res) => {
  const viewPlayer = viewPlayers().get(req.params.id)
  if (viewPlayer == null) {
    res.status(404).end()
    return
  }

  const response = await viewPlayer.onEvent(req.body as ViewerEvent)
  if (response != null) {
    res.status(200).send(response)
  } else {
    res.status(204).end()
  }
})

export default router

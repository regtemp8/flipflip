import express from 'express'
import { SG } from 'flipflip-common'
import {
  findDefaultScene,
  findSceneById,
  findSceneDisableWeightOptions,
  findSceneHasBpm,
  findScenesWithSceneGroup,
  findScenesWithoutSceneGroup,
  updateScene
} from '../db/SceneRepository'
import {
  toSceneGroups,
  toSceneGroupItems,
  toScene,
  toSceneUpdate
} from '../db/mappers'

const router = express.Router()
router.get('/grouped', async (req, res) => {
  const groups = toSceneGroups(await findScenesWithSceneGroup(), SG.scene)
  res.status(200).send(groups)
})

router.get('/ungrouped', async (req, res) => {
  const items = toSceneGroupItems(await findScenesWithoutSceneGroup())
  res.status(200).send(items)
})

router.get('/default', async (req, res) => {
  const scene = toScene(await findDefaultScene())
  res.status(200).send(scene)
})

router.get('/:id', async (req, res) => {
  const scene = await findSceneById(Number(req.params.id))
  if (scene != null) {
    res.status(200).send(toScene(scene))
  } else {
    res.status(404).end()
  }
})

router.get('/:id/disable-weight-options', async (req, res) => {
  const disableWeightOptions = await findSceneDisableWeightOptions(
    Number(req.params.id)
  )
  res.status(200).send(disableWeightOptions)
})

router.get('/:id/has-bpm', async (req, res) => {
  const hasBpm = await findSceneHasBpm(Number(req.params.id))
  res.status(200).send(hasBpm)
})

router.patch('/:id', async (req, res) => {
  const result = await updateScene(
    Number(req.params.id),
    toSceneUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})

export default router

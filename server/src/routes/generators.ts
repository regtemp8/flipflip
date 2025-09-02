import express from 'express'
import { SG } from 'flipflip-common'
import {
  findGeneratorsWithSceneGroup,
  findGeneratorsWithoutSceneGroup
} from '../db/SceneRepository'
import { toSceneGroups, toSceneGroupItems } from '../db/mappers'

const router = express.Router()
router.get('/grouped', async (req, res) => {
  const groups = toSceneGroups(
    await findGeneratorsWithSceneGroup(),
    SG.generator
  )
  res.status(200).send(groups)
})

router.get('/ungrouped', async (req, res) => {
  const items = toSceneGroupItems(await findGeneratorsWithoutSceneGroup())
  res.status(200).send(items)
})

export default router

import express from 'express'
import { SG } from 'flipflip-common'
import {
  findScenesWithSceneGroup,
  findScenesWithoutSceneGroup
} from '../db/SceneRepository'
import { toSceneGroups, toSceneGroupItems } from '../db/mappers'

const router = express.Router()
router.get('/grouped', async (req, res) => {
  const groups = toSceneGroups(await findScenesWithSceneGroup(), SG.scene)
  res.status(200).send(groups)
})

router.get('/ungrouped', async (req, res) => {
  const items = toSceneGroupItems(await findScenesWithoutSceneGroup())
  res.status(200).send(items)
})

export default router

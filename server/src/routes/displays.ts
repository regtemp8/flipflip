import express from 'express'
import { SG } from 'flipflip-common'
import {
  findDisplaysWithSceneGroup,
  findDisplaysWithoutSceneGroup
} from '../db/DisplayRepository'
import { toSceneGroups, toSceneGroupItems } from '../db/mappers'

const router = express.Router()
router.get('/grouped', async (req, res) => {
  const groups = toSceneGroups(await findDisplaysWithSceneGroup(), SG.display)
  res.status(200).send(groups)
})

router.get('/ungrouped', async (req, res) => {
  const items = toSceneGroupItems(await findDisplaysWithoutSceneGroup())
  res.status(200).send(items)
})

export default router

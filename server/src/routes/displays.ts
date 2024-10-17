import express from 'express'
import { SG } from 'flipflip-common'
import {
  findDisplayById,
  findDisplaysWithSceneGroup,
  findDisplaysWithoutSceneGroup,
  updateDisplay
} from '../db/DisplayRepository'
import {
  toSceneGroups,
  toSceneGroupItems,
  toDisplay,
  toDisplayUpdate
} from '../db/mappers'

const router = express.Router()
router.get('/grouped', async (req, res) => {
  const groups = toSceneGroups(await findDisplaysWithSceneGroup(), SG.display)
  res.status(200).send(groups)
})

router.get('/ungrouped', async (req, res) => {
  const items = toSceneGroupItems(await findDisplaysWithoutSceneGroup())
  res.status(200).send(items)
})

router.get('/:id', async (req, res) => {
  const source = await findDisplayById(Number(req.params.id))
  if (source != null) {
    res.status(200).send(toDisplay(source))
  } else {
    res.status(404).end()
  }
})

router.patch('/:id', async (req, res) => {
  const result = await updateDisplay(
    Number(req.params.id),
    toDisplayUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})

export default router

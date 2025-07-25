import express from 'express'
import { SG, ValueResponse } from 'flipflip-common'
import {
  findDisplayById,
  findDisplaysWithSceneGroup,
  findDisplaysWithoutSceneGroup,
  updateDisplay,
  createDisplay
} from '../db/DisplayRepository'
import {
  toSceneGroups,
  toSceneGroupItems,
  toDisplay,
  toDisplayUpdate,
  toIdsArray
} from '../db/mappers'
import { findDisplayViewIds, findVisibleDisplayViewIds } from '../db/DisplayViewRepository'
import { User } from '../db/types/generated'

const router = express.Router()

router.post('/', async (req, res, next) => {
  const user = req.user as User
  try {
    const id = await createDisplay(user.id as number)
    const response: ValueResponse = { value: id as number }
    res.status(200).send(response)
  } catch (error) {
    next(error)
  }
})

router.get('/grouped', async (req, res) => {
  const groups = toSceneGroups(await findDisplaysWithSceneGroup(), SG.display)
  res.status(200).send(groups)
})

router.get('/ungrouped', async (req, res) => {
  const items = toSceneGroupItems(await findDisplaysWithoutSceneGroup())
  res.status(200).send(items)
})

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const display = await findDisplayById(id)
  const views = await findDisplayViewIds(id)
  if (display != null) {
    res.status(200).send(toDisplay(display, views))
  } else {
    res.status(404).end()
  }
})

router.get('/:id/visible-views', async (req, res) => {
  const views = await findVisibleDisplayViewIds(Number(req.params.id))
  res.status(200).send(toIdsArray(views))
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

router.get('/select-options', (req, res) => {
  // TODO do db query
  // const {includeExtra, includeRandom, onlyExtra} = req.params
  res.status(200).send({})
})

export default router

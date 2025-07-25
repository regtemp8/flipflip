import express from 'express'
import { SG, ValueResponse } from 'flipflip-common'
import {
  findDisplayById,
  findDisplaysWithSceneGroup,
  findDisplaysWithoutSceneGroup,
  updateDisplay,
  createDisplay,
  deleteDisplay
} from '../db/DisplayRepository'
import {
  toSceneGroups,
  toSceneGroupItems,
  toDisplay,
  toDisplayUpdate,
  toIdsArray
} from '../db/mappers'
import {
  findDisplayViewIds,
  findVisibleDisplayViewIds,
  addDisplayView,
  deleteDisplayView,
  cloneDisplayView
} from '../db/DisplayViewRepository'
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
  if (display != null) {
    const views = await findDisplayViewIds(id)
    res.status(200).send(toDisplay(display, views))
  } else {
    res.status(404).end()
  }
})

router.delete('/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  const user = req.user as User
  const userId = user.id as number
  try {
    await deleteDisplay(id, userId)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.post('/:id/display-views', async (req, res, next) => {
  const id = Number(req.params.id)
  const user = req.user as User
  const userId = user.id as number
  try {
    await addDisplayView(id, userId)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.delete('/:id/display-views/:viewId', async (req, res, next) => {
  const id = Number(req.params.id)
  const viewId = Number(req.params.viewId)
  const user = req.user as User
  const userId = user.id as number
  try {
    await deleteDisplayView(id, viewId, userId)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.post('/:id/display-views/:viewId/clone', async (req, res, next) => {
  const id = Number(req.params.id)
  const viewId = Number(req.params.viewId)
  const user = req.user as User
  const userId = user.id as number
  try {
    await cloneDisplayView(id, viewId, userId)
    res.status(204).end()
  } catch (error) {
    next(error)
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

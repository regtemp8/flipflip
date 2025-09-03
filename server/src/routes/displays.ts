import express from 'express'
import { SG, ValueResponse } from 'flipflip-common'
import {
  findDisplayById,
  findDisplaysWithSceneGroup,
  findDisplaysWithoutSceneGroup,
  updateDisplay,
  createDisplay,
  deleteDisplay,
  cloneDisplay
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
  cloneDisplayView,
  findDisplayViewSyncOptions,
  findValidDisplayViewIds
} from '../db/DisplayViewRepository'
import { User } from '../db/types/entities'
import players from '../player/PlayerService'

const router = express.Router()

router.post('/', async (req, res) => {
  const user = req.user as User
  const id = await createDisplay(user.id as number)
  const response: ValueResponse = { value: id as number }
  res.status(200).send(response)
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

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const user = req.user as User
  const userId = user.id as number
  await deleteDisplay(id, userId)
  res.status(204).end()
})

router.post('/:id/clone', async (req, res) => {
  const userId = (req.user as User).id as number
  const newDisplayId = await cloneDisplay(Number(req.params.id), userId)
  res.status(200).send({ value: newDisplayId })
})

router.post('/:id/display-views', async (req, res) => {
  const id = Number(req.params.id)
  const user = req.user as User
  const userId = user.id as number
  await addDisplayView(id, userId)
  res.status(204).end()
})

router.get('/:id/visible-display-views', async (req, res) => {
  const id = Number(req.params.id)
  const rows = await findVisibleDisplayViewIds(id)
  const ids = rows.map((row) => row.id as number)
  res.status(200).send(ids)
})

router.delete('/:id/display-views/:viewId', async (req, res) => {
  const id = Number(req.params.id)
  const viewId = Number(req.params.viewId)
  const user = req.user as User
  const userId = user.id as number
  await deleteDisplayView(id, viewId, userId)
  res.status(204).end()
})

router.post('/:id/display-views/:viewId/clone', async (req, res) => {
  const id = Number(req.params.id)
  const viewId = Number(req.params.viewId)
  const user = req.user as User
  const userId = user.id as number
  await cloneDisplayView(id, viewId, userId)
  res.status(204).end()
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

router.get('/select-options', async (req, res) => {
  // TODO do db query
  // const {includeExtra, includeRandom, onlyExtra} = req.params
  res.status(200).send({})
})

router.get('/:id/display-view-sync-options', async (req, res) => {
  const id = Number(req.params.id)
  const options = await findDisplayViewSyncOptions(id)
  res.status(200).send(options)
})

router.post('/:id/play', async (req, res) => {
  const id = Number(req.params.id)
  const viewIds = await findValidDisplayViewIds(id)
  if (viewIds.length === 0) {
    res
      .status(400)
      .send({ error: 'No valid display views. Nothing to display' })
    return
  }

  const playerId = players().start(id, viewIds, req.user as User)
  const body: ValueResponse = { value: playerId }
  res.status(200).send(body)
})

export default router

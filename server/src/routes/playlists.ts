import express from 'express'
import {
  PLT,
  SG,
  SceneSelectOptionsRequest,
  ValueResponse
} from 'flipflip-common'
import {
  findPlaylistOptionsByType,
  findPlaylistsWithSceneGroup,
  findPlaylistsWithoutSceneGroup,
  findPlaylistIds,
  findPlaylistById,
  updatePlaylist,
  deletePlaylist,
  clonePlaylist,
  createPlaylist
} from '../db/PlaylistRepository'
import {
  toSceneGroups,
  toSceneGroupItems,
  toPlaylistUpdate,
  toPlaylist
} from '../db/mappers'
import { User } from '../db/types/generated'

const router = express.Router()
router.get('/grouped', async (req, res) => {
  const groups = toSceneGroups(await findPlaylistsWithSceneGroup(), SG.playlist)
  res.status(200).send(groups)
})

router.get('/ungrouped', async (req, res) => {
  const items = toSceneGroupItems(await findPlaylistsWithoutSceneGroup())
  res.status(200).send(items)
})

router.get('/options/:type', async (req, res) => {
  const items = toSceneGroupItems(
    await findPlaylistOptionsByType(req.params.type)
  )
  items.unshift({ id: 0, name: 'None' })
  res.status(200).send(items)
})

router.get('/:id', async (req, res) => {
  const playlist = await findPlaylistById(Number(req.params.id))
  if (playlist != null) {
    res.status(200).send(toPlaylist(playlist))
  } else {
    res.status(404).end()
  }
})

router.patch('/:id', async (req, res) => {
  const result = await updatePlaylist(
    Number(req.params.id),
    toPlaylistUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})

router.delete('/:id', async (req, res) => {
  const result = await deletePlaylist(Number(req.params.id))
  const status =
    result.length === 1 && result[0].numDeletedRows === 1n ? 204 : 500
  res.status(status).end()
})

router.post('/:id/clone', async (req, res) => {
  const playlist = await clonePlaylist(Number(req.params.id))
  if (playlist != null) {
    res.status(200).send(toPlaylist(playlist))
  } else {
    res.status(500).end()
  }
})

router.get('/', async (req, res) => {
  const ids = await findPlaylistIds()
  if (ids != null) {
    res.status(200).send(ids)
  } else {
    res.status(500).end()
  }
})

router.post('/', async (req, res, next) => {
  const { type } = req.body
  if (![PLT.audio, PLT.display, PLT.scene, PLT.script].includes(type)) {
    res.status(400).end()
  }

  const user = req.user as User
  try {
    const { id } = await createPlaylist(type, user.id as number)
    const response: ValueResponse = { value: id as number }
    res.status(200).send(response)
  } catch (error) {
    next(error)
  }
})

router.get('/select-options', (req, res) => {
  const body = req.body as SceneSelectOptionsRequest
  // TODO do db query
  res.status(200).send({})
})

export default router

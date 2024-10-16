import express from 'express'
import { SG } from 'flipflip-common'
import {
  findPlaylistOptionsByType,
  findPlaylistsWithSceneGroup,
  findPlaylistsWithoutSceneGroup
} from '../db/PlaylistRepository'
import { toSceneGroups, toSceneGroupItems } from '../db/mappers'

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
export default router

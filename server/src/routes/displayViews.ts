import express from 'express'
import { findDisplayViewById, isSyncedDisplayView } from '../db/DisplayViewRepository'
import { toDisplayView, toIdsArray, toImagePlayerData } from '../db/mappers'
import { findDisplaySettings } from '../db/DisplaySettingsRepository'
import { User } from '../db/types/generated'
import { findPlaylistByDisplayView } from '../db/PlaylistRepository'
import { findScenePlaylistItemsByPlaylist } from '../db/PlaylistItemRepository'
import { findSceneIds } from '../db/SceneRepository'

const router = express.Router()
router.get('/:id', async (req, res) => {
  const displayView = await findDisplayViewById(Number(req.params.id))
  if(displayView != null) {
    res.status(200).send(toDisplayView(displayView))
  } else {
    res.status(404).end()
  }
})
router.get('/:id/image-player-data', async (req, res) => {
  const displayViewId = Number(req.params.id)
  if(await isSyncedDisplayView(displayViewId)) {
    res.status(204).end()
    return
  }

  const playlist = await findPlaylistByDisplayView(displayViewId)
  if(playlist == null) {
    res.status(404).end()
    return
  }

  const items = await findScenePlaylistItemsByPlaylist(playlist.id as number)
  const {maxInMemory} = await findDisplaySettings(req.user as User)
  const allScenes = await findSceneIds()
  res.status(200).send(toImagePlayerData(displayViewId, playlist, items, maxInMemory, allScenes))
})
export default router
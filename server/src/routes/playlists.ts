import express from 'express'
import {
  AudioPlaylistItem,
  CaptionScriptPlaylistItem,
  PLT,
  PlaylistItem,
  SG,
  ScenePlaylistItem,
  SelectOption,
  SelectedPlaylist,
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
  createPlaylist,
  findPlaylistType
} from '../db/PlaylistRepository'
import {
  toSceneGroups,
  toSceneGroupItems,
  toPlaylistUpdate,
  toPlaylist,
  toAudioPlaylistItem,
  toScenePlaylistItem,
  toCaptionScriptPlaylistItem,
  toAudioPlaylistItemUpdate,
  toCaptionScriptPlaylistItemUpdate,
  toScenePlaylistItemUpdate,
  toScenePlaylistItemSceneInsert,
  toAudioPlaylistItemInsert,
  toCaptionScriptPlaylistItemInsert,
  toScenePlaylistItemInsert
} from '../db/mappers'
import { User } from '../db/types/entities'
import {
  createAudioPlaylistItem,
  createCaptionScriptPlaylistItem,
  createScenePlaylistItem,
  deletePlaylistItem,
  findAudioPlaylistItem,
  findAudioPlaylistItemIds,
  findCaptionScriptPlaylistItem,
  findCaptionScriptPlaylistItemIds,
  findScenePlaylistItem,
  findScenePlaylistItemIds,
  findScenePlaylistItemScenes,
  findSingleScenePlaylistItemSceneId,
  updateAudioPlaylistItem,
  updateCaptionScriptPlaylistItem,
  updateScenePlaylistItem
} from '../db/PlaylistItemRepository'
import players from '../player/PlayerService'
import { createTempDisplayForPlaylist } from '../db/DisplayRepository'
import { findVisibleDisplayViewIds } from '../db/DisplayViewRepository'

const router = express.Router()
router.get('/grouped', async (req, res) => {
  const groups = toSceneGroups(await findPlaylistsWithSceneGroup(), SG.playlist)
  res.status(200).send(groups)
})

router.get('/ungrouped', async (req, res) => {
  const items = toSceneGroupItems(await findPlaylistsWithoutSceneGroup())
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

router.get('/:id/selected', async (req, res) => {
  const playlist = await findPlaylistById(Number(req.params.id))
  if (playlist != null) {
    const id = playlist.id as number
    let itemId: number | undefined = undefined
    if (playlist.type === PLT.singleScene) {
      itemId = await findSingleScenePlaylistItemSceneId(id)
    }

    const body: SelectedPlaylist = { id, type: playlist.type, itemId }
    res.status(200).send(body)
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
    result != null && result.length === 1 && result[0].numDeletedRows === 1n
      ? 204
      : 500
  res.status(status).end()
})

router.post('/:id/clone', async (req, res) => {
  const userId = (req.user as User).id as number
  const newPlaylistId = await clonePlaylist(Number(req.params.id), userId)
  res.status(200).send({ value: newPlaylistId })
})

router.post('/:id/play', async (req, res) => {
  const playlistId = Number(req.params.id)
  const userId = (req.user as User).id as number
  const playlist = await findPlaylistType(playlistId)
  if (playlist?.type === PLT.scene) {
    const id = await createTempDisplayForPlaylist(playlistId, userId)
    const viewIds = (await findVisibleDisplayViewIds(id)).map(
      ({ id }) => id as number
    )
    const playerId = players().start(id, viewIds, req.user as User)
    const body: ValueResponse = { value: playerId }
    res.status(200).send(body)
  } else {
    // TODO implement playback for other playlist types
    res.status(204).end()
  }
})

router.post('/:id/items', async (req, res) => {
  const id = Number(req.params.id)
  const playlist = await findPlaylistType(id)
  switch (playlist?.type) {
    case PLT.audio: {
      const item = req.body as AudioPlaylistItem
      await createAudioPlaylistItem(toAudioPlaylistItemInsert(id, item))
      break
    }
    case PLT.scene: {
      const item = req.body as ScenePlaylistItem
      const update = toScenePlaylistItemInsert(id, item)
      const scenes = toScenePlaylistItemSceneInsert(item)
      await createScenePlaylistItem(update, scenes)
      break
    }
    case PLT.script: {
      const item = req.body as CaptionScriptPlaylistItem
      await createCaptionScriptPlaylistItem(
        toCaptionScriptPlaylistItemInsert(id, item)
      )
      break
    }
    default: {
      throw new Error(`Playlist type '${playlist?.type}' not supported`)
    }
  }
  res.status(204).end()
})

router.get('/:id/items', async (req, res) => {
  let items: number[]
  const playlistId = Number(req.params.id)
  const playlist = await findPlaylistType(playlistId)
  switch (playlist?.type) {
    case PLT.audio:
      items = await findAudioPlaylistItemIds(playlistId)
      break
    case PLT.scene:
      items = await findScenePlaylistItemIds(playlistId)
      break
    case PLT.script:
      items = await findCaptionScriptPlaylistItemIds(playlistId)
      break
    default:
      items = []
      break
  }

  res.status(200).send(items)
})

router.get('/:id/items/:itemId', async (req, res) => {
  const id = Number(req.params.id)
  const itemId = Number(req.params.itemId)

  let body: PlaylistItem | undefined
  const playlist = await findPlaylistType(id)
  switch (playlist?.type) {
    case PLT.audio: {
      const item = await findAudioPlaylistItem(id, itemId)
      body = toAudioPlaylistItem(item)
      break
    }
    case PLT.scene: {
      const item = await findScenePlaylistItem(id, itemId)
      const scenes =
        item != null ? await findScenePlaylistItemScenes(itemId) : undefined

      body = toScenePlaylistItem(item, scenes)
      break
    }
    case PLT.script: {
      const item = await findCaptionScriptPlaylistItem(id, itemId)
      body = toCaptionScriptPlaylistItem(item)
      break
    }
    default: {
      body = undefined
    }
  }

  if (body != null) {
    res.status(200).send(body)
  } else {
    res.status(404).end()
  }
})

router.patch('/:id/items/:itemId', async (req, res) => {
  const id = Number(req.params.id)
  const playlist = await findPlaylistType(id)
  switch (playlist?.type) {
    case PLT.audio: {
      const item = req.body as Partial<AudioPlaylistItem>
      item.id = Number(req.params.itemId)
      await updateAudioPlaylistItem(toAudioPlaylistItemUpdate(item))
      break
    }
    case PLT.scene: {
      const item = req.body as Partial<ScenePlaylistItem>
      item.id = Number(req.params.itemId)
      const update = toScenePlaylistItemUpdate(item)
      const scenes = toScenePlaylistItemSceneInsert(item)
      await updateScenePlaylistItem(update, scenes)
      break
    }
    case PLT.script: {
      const item = req.body as Partial<CaptionScriptPlaylistItem>
      item.id = Number(req.params.itemId)
      await updateCaptionScriptPlaylistItem(
        toCaptionScriptPlaylistItemUpdate(item)
      )
      break
    }
    default: {
      throw new Error(`Playlist type '${playlist?.type}' not supported`)
    }
  }
  res.status(204).end()
})

router.delete('/:id/items/:itemId', async (req, res) => {
  const id = Number(req.params.id)
  const itemId = Number(req.params.itemId)
  await deletePlaylistItem(id, itemId)
  res.status(204).end()
})

// TODO remove if not used (currently not used)
router.get('/', async (req, res) => {
  const ids = await findPlaylistIds()
  if (ids != null) {
    res.status(200).send(ids)
  } else {
    res.status(500).end()
  }
})

router.post('/', async (req, res) => {
  const { type, name } = req.body
  if (![PLT.audio, PLT.scene, PLT.script].includes(type)) {
    res.status(400).end()
  }

  const user = req.user as User
  const { id } = await createPlaylist(type, true, user.id as number, name)
  const response: ValueResponse = { value: id as number }
  res.status(200).send(response)
})

router.get('/options/:type', async (req, res) => {
  const rows = await findPlaylistOptionsByType(req.params.type)
  const options: SelectOption[] = []
  if (req.query.includeNone === 'true') {
    options.push({ value: '0', label: 'None' })
  }
  for (const { itemId, itemName } of rows) {
    options.push({ value: (itemId as number).toString(), label: itemName })
  }

  res.status(200).send(options)
})

export default router

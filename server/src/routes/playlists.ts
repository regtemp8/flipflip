import express from 'express'
import {
  AudioPlaylistItem,
  CaptionScriptPlaylistItem,
  PLT,
  SG,
  ScenePlaylistItem,
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
import { User } from '../db/types/generated'
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
  updateAudioPlaylistItem,
  updateCaptionScriptPlaylistItem,
  updateScenePlaylistItem
} from '../db/PlaylistItemRepository'
import { findSceneById } from '../db/SceneRepository'
import Logger from '../logging/Logger'
import players from '../player/PlayerService'
import { createTempDisplayForPlaylist } from '../db/DisplayRepository'

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

router.post('/:id/play', async (req, res) => {
  const playlistId = Number(req.params.id)
  const userId = (req.user as User).id as number
  const playlist = await findPlaylistType(playlistId)
  if (playlist?.type === PLT.scene) {
    const id = await createTempDisplayForPlaylist(playlistId, userId)
    const playerId = players().start(id, req.user as User)
    const body: ValueResponse = { value: playerId }
    res.status(200).send(body)
  } else {
    // TODO implement playback for other playlist types
    res.status(204).end()
  }
})

router.post('/:id/items', async (req, res, next) => {
  const id = Number(req.params.id)
  try {
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
  } catch (error) {
    next(error)
  }
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

  let body: any
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
      let sceneName: string | undefined = undefined
      if (scenes != null) {
        if (scenes.length === 1) {
          const scene = await findSceneById(scenes[0])
          sceneName = scene?.name
        } else {
          sceneName = 'Random'
        }
      }

      body = toScenePlaylistItem(item, scenes, sceneName)
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

router.patch('/:id/items/:itemId', async (req, res, next) => {
  const id = Number(req.params.id)
  try {
    const playlist = await findPlaylistType(id)
    switch (playlist?.type) {
      case PLT.audio: {
        const item = req.body as Partial<AudioPlaylistItem>
        await updateAudioPlaylistItem(toAudioPlaylistItemUpdate(item))
        break
      }
      case PLT.scene: {
        const item = req.body as Partial<ScenePlaylistItem>
        const update = toScenePlaylistItemUpdate(item)
        const scenes = toScenePlaylistItemSceneInsert(item)
        await updateScenePlaylistItem(update, scenes)
        break
      }
      case PLT.script: {
        const item = req.body as Partial<CaptionScriptPlaylistItem>
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
  } catch (error) {
    next(error)
  }
})

router.delete('/:id/items/:itemId', async (req, res, next) => {
  const id = Number(req.params.id)
  const itemId = Number(req.params.itemId)
  try {
    await deletePlaylistItem(id, itemId)
    res.status(204).end()
  } catch (error) {
    next(error)
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

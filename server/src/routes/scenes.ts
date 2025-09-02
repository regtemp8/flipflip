import express from 'express'
import { SG, ValueResponse } from 'flipflip-common'
import {
  createScene,
  findDefaultScene,
  findSceneById,
  findSceneHasBpm,
  findSceneIds,
  findSceneSelectOptions,
  findScenesWithSceneGroup,
  findScenesWithoutSceneGroup,
  isDefaultScene,
  updateScene,
  deleteScene,
  cloneScene,
  isSceneCreator
} from '../db/SceneRepository'
import {
  toSceneGroups,
  toSceneGroupItems,
  toScene,
  toSceneUpdate
} from '../db/mappers'
import { findContentSources } from '../db/ContentSourceRepository'
import { User } from '../db/types/entities'
import { createTempDisplayForScene } from '../db/DisplayRepository'
import players from '../player/PlayerService'
import { findVisibleDisplayViewIds } from '../db/DisplayViewRepository'

const router = express.Router()
router.get('/grouped', async (req, res) => {
  const groups = toSceneGroups(await findScenesWithSceneGroup(), SG.scene)
  res.status(200).send(groups)
})

router.get('/ungrouped', async (req, res) => {
  const items = toSceneGroupItems(await findScenesWithoutSceneGroup())
  res.status(200).send(items)
})

router.get('/default', async (req, res) => {
  const scene = toScene(await findDefaultScene())
  res.status(200).send(scene)
})

router.get('/', async (req, res) => {
  const ids = await findSceneIds()
  if (ids != null) {
    res.status(200).send(ids)
  } else {
    res.status(500).end()
  }
})

router.post('/', async (req, res, next) => {
  const user = req.user as User
  try {
    const { id } = await createScene(user.id as number)
    const response: ValueResponse = { value: id as number }
    res.status(200).send(response)
  } catch (error) {
    next(error)
  }
})

router.get('/select-options', async (req, res) => {
  const options = await findSceneSelectOptions()
  const { includeExtra, includeRandom, onlyExtra } = req.query
  if (includeExtra === 'true') {
    options['0'] = 'None'
    options['-1'] = 'Random'
  } else if (includeRandom === 'true') {
    options['-1'] = 'Random'
  } else if (onlyExtra === 'true') {
    options['-1'] = '~~EMPTY~~'
  } else {
    options['0'] = 'None'
  }

  res.status(200).send(options)
})

router.get('/:id', async (req, res) => {
  const scene = await findSceneById(Number(req.params.id))
  if (scene != null) {
    res.status(200).send(toScene(scene))
  } else {
    res.status(404).end()
  }
})

router.post('/:id/clone', async (req, res, next) => {
  try {
    const userId = (req.user as User).id as number
    const newSceneId = await cloneScene(Number(req.params.id), userId)
    res.status(200).send({ value: newSceneId })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  const userId = (req.user as User).id as number
  const sceneId = Number(req.params.id)
  try {
    const canDelete = await isSceneCreator(sceneId, userId)
    if (canDelete == null) {
      res.status(403).end()
      return
    }

    const result = await deleteScene(Number(req.params.id))
    const status = result[0].numDeletedRows > 0n ? 204 : 500
    res.status(status).end()
  } catch (error) {
    next(error)
  }
})

router.get('/:id/disable-weight-options', async (req, res) => {
  const id = Number(req.params.id)
  let disableWeightOptions = false
  const defaultScene = await isDefaultScene(id)
  if (!defaultScene) {
    const sources = await findContentSources(id)
    disableWeightOptions =
      sources.length === 0 ||
      (sources.length === 1 && !sources[0].localDirOfSources)
  }

  res.status(200).send(disableWeightOptions)
})

router.get('/:id/has-bpm', async (req, res) => {
  const hasBpm = await findSceneHasBpm(Number(req.params.id))
  res.status(200).send(hasBpm)
})

router.patch('/:id', async (req, res) => {
  const result = await updateScene(
    Number(req.params.id),
    toSceneUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})

router.get('/:id/weight-groups', (req, res) => {
  res.status(501).end()
})

router.get('/:id/script-playlists', (req, res) => {
  res.status(501).end()
})

router.post('/:id/script-playlists', (req, res) => {
  // create playlist
  res.status(501).end()
})

router.delete('/:id/script-playlists', (req, res) => {
  // delete 1 playlist
  res.status(501).end()
})

router.get('/:id/audio-playlists', (req, res) => {
  res.status(501).end()
})

router.post('/:id/audio-playlists', (req, res) => {
  // create playlist
  res.status(501).end()
})

router.delete('/:id/audio-playlists', (req, res) => {
  // delete 1 playlist
  res.status(501).end()
})

router.post('/:id/play', async (req, res) => {
  const sceneId = Number(req.params.id)
  const userId = (req.user as User).id as number
  const id = await createTempDisplayForScene(sceneId, userId)
  const viewIds = (await findVisibleDisplayViewIds(id)).map(
    ({ id }) => id as number
  )
  const playerId = players().start(id, viewIds, req.user as User)
  const body: ValueResponse = { value: playerId }
  res.status(200).send(body)
})

export default router

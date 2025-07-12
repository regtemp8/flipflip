import express from 'express'
import { Display, SG, SceneSelectOptionsRequest } from 'flipflip-common'
import {
  findDefaultScene,
  findSceneById,
  findSceneHasBpm,
  findSceneIds,
  findScenesWithSceneGroup,
  findScenesWithoutSceneGroup,
  isDefaultScene,
  updateScene
} from '../db/SceneRepository'
import {
  toSceneGroups,
  toSceneGroupItems,
  toScene,
  toSceneUpdate
} from '../db/mappers'
import { findContentSources } from '../db/ContentSourceRepository'
import { User } from '../db/types/generated'
import { createTempDisplayForScene } from '../db/DisplayRepository'

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

router.get('/select-options', (req, res) => {
  // TODO do db query
  // const {includeExtra, includeRandom, onlyExtra} = req.params
  res.status(200).send({})
})

router.get('/:id', async (req, res) => {
  const scene = await findSceneById(Number(req.params.id))
  if (scene != null) {
    res.status(200).send(toScene(scene))
  } else {
    res.status(404).end()
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
  const body: Pick<Display, 'id'> = {id}
  res.status(200).send(body)
})

export default router

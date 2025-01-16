import express from 'express'
import {
  toAudio,
  toAudioUpdate,
  toSearchSelectOptions,
  toTagSelectOptions
} from '../db/mappers'
import {
  findAudioById,
  updateAudio,
  findBatchTagOptions,
  findTotalCount,
  findUntaggedCount,
  findMarkedCount,
  findSearchOptions,
  addAudioTags,
  setAudioTags,
  removeAudioTags,
  markAudios,
  findAudioTagIds,
  sortAudios
} from '../db/AudioRepository'
import { User } from '../db/types/generated'
import { AudioSortRequest, BatchTagRequest, SortRequest } from 'flipflip-common'

const router = express.Router()
router.get('/batch-tag-options', async (req, res) => {
  if (req.user == null) {
    res.status(401).end()
    return
  }

  const userId = (req.user as User).id as number
  const options = await findBatchTagOptions(userId)
  res.status(200).send(toTagSelectOptions(options))
})
router.get('/search-options', async (req, res) => {
  if (req.user == null) {
    res.status(401).end()
    return
  }

  const userId = (req.user as User).id as number
  const totalCount = await findTotalCount(userId)
  const untaggedCount = await findUntaggedCount(userId)
  const markedCount = await findMarkedCount(userId)
  const options = await findSearchOptions(userId)
  res
    .status(200)
    .send(
      toSearchSelectOptions(options, totalCount, untaggedCount, markedCount)
    )
})
router.post('/tags', async (req, res, next) => {
  if (req.user == null) {
    res.status(401).end()
    return
  }

  const userId = (req.user as User).id as number
  const body = req.body as BatchTagRequest
  try {
    switch (body.operation) {
      case 'add':
        await addAudioTags(userId, body.ids, body.tags)
        break
      case 'overwrite':
        await setAudioTags(userId, body.ids, body.tags)
        break
      case 'remove':
        await removeAudioTags(userId, body.ids, body.tags)
        break
    }
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})
router.post('/mark', async (req, res, next) => {
  if (req.user == null) {
    res.status(401).end()
    return
  }

  const userId = (req.user as User).id as number
  const ids = req.body as number[]
  try {
    markAudios(userId, ids)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

// TODO make separate endpoint for audio playlist sorting
// TODO rename AudioSortRequest to PlaylistSortRequest
router.post('/sort', async (req, res) => {
  const sort = req.body as AudioSortRequest
  await sortAudios(sort)
  res.status(204).end()
})

router.get('/:id', async (req, res) => {
  if (req.user == null) {
    res.status(401).end()
    return
  }

  const userId = (req.user as User).id as number
  const id = Number(req.params.id)
  const source = await findAudioById(userId, id)
  if (source != null) {
    const tags = await findAudioTagIds(userId, id)
    res.status(200).send(toAudio(source, tags))
  } else {
    res.status(404).end()
  }
})
router.patch('/:id', async (req, res) => {
  if (req.user == null) {
    res.status(401).end()
    return
  }

  const result = await updateAudio(
    Number(req.params.id),
    toAudioUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})
export default router

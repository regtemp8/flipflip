import express from 'express'
import { toTag, toTagUpdate } from '../db/mappers'
import {
  findTagIds,
  findTagById,
  findTagsCount,
  updateTag,
  createTag,
  deleteTag,
  deleteAllTags,
  sortTags,
  moveTag
} from '../db/TagRepository'
import { MoveRequest, SortRequest, Tag } from 'flipflip-common'
import { User } from '../db/types/generated'

const router = express.Router()
router.get('/', async (req, res) => {
  const ids = await findTagIds()
  if (ids != null) {
    res.status(200).send(ids)
  } else {
    res.status(500).end()
  }
})
router.post('/', async (req, res, next) => {
  if (req.user == null) {
    res.status(401).end()
    return
  }

  const userId = (req.user as User).id as number
  const { name, phraseString } = req.body as Tag
  try {
    const { tagsCount } = await findTagsCount()
    const tag = await createTag({
      userId,
      name,
      phraseString: phraseString ?? null,
      index: tagsCount
    })
    res.status(200).send(tag)
  } catch (error) {
    next(error)
  }
})
router.delete('/', async (req, res) => {
  const result = await deleteAllTags()
  const status = result.numDeletedRows > 0n ? 204 : 500
  res.status(status).end()
})
router.post('/sort', async (req, res) => {
  const sort = req.body as SortRequest
  await sortTags(sort)
  res.status(204).end()
})
router.get('/count', async (req, res) => {
  const count = await findTagsCount()
  if (count != null) {
    res.status(200).send(count)
  } else {
    res.status(500).end()
  }
})
router.get('/:id', async (req, res) => {
  const tag = await findTagById(Number(req.params.id))
  if (tag != null) {
    res.status(200).send(toTag(tag))
  } else {
    res.status(404).end()
  }
})
router.patch('/:id', async (req, res) => {
  const result = await updateTag(Number(req.params.id), toTagUpdate(req.body))
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})
router.delete('/:id', async (req, res) => {
  const result = await deleteTag(Number(req.params.id))
  const status = result.numDeletedRows > 0n ? 204 : 500
  res.status(status).end()
})
router.post('/move', async (req, res) => {
  await moveTag(req.body as MoveRequest)
  res.status(204).end()
})
export default router

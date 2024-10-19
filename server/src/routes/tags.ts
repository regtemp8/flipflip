import express from 'express'
import { toTag, toTagUpdate } from '../db/mappers'
import {
  findTagIds,
  findTagById,
  findTagsCount,
  updateTag,
  createTag,
  deleteAllTags
} from '../db/TagRepository'
import { Tag } from 'flipflip-common'
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
router.post('/', async (req, res) => {
  if (req.user == null) {
    res.status(401).end()
    return
  }

  const userId = (req.user as User).id as number
  const { name, phraseString } = req.body as Tag
  const tag = await createTag({ userId, name, phraseString })
  if (tag != null) {
    res.status(200).send(tag)
  } else {
    res.status(500).end()
  }
})
router.delete('/', async (req, res) => {
  const result = await deleteAllTags()
  const status =
    result.length === 1 && result[0].numDeletedRows === 1n ? 204 : 500
  res.status(status).end()
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
  const source = await findTagById(Number(req.params.id))
  if (source != null) {
    res.status(200).send(toTag(source))
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

export default router

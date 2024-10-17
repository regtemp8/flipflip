import express from 'express'
import { toTag, toTagUpdate } from '../db/mappers'
import { findTagById, updateTag } from '../db/TagRepository'

const router = express.Router()
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

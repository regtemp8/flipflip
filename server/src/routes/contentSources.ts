import express from 'express'
import { toContentSource, toContentSourceUpdate } from '../db/mappers'
import {
  findContentSourceById,
  updateContentSource
} from '../db/ContentSourceRepository'

const router = express.Router()
router.get('/:id', async (req, res) => {
  const source = await findContentSourceById(Number(req.params.id))
  if (source != null) {
    res.status(200).send(toContentSource(source))
  } else {
    res.status(404).end()
  }
})
router.patch('/:id', async (req, res) => {
  const result = await updateContentSource(
    Number(req.params.id),
    toContentSourceUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})

export default router

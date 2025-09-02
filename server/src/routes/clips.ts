import express from 'express'
import { toClip, toClipUpdate } from '../db/mappers'
import { findClipById, updateClip } from '../db/ClipRepository'

const router = express.Router()
router.get('/:id', async (req, res) => {
  const clip = await findClipById(Number(req.params.id))
  if (clip != null) {
    res.status(200).send(toClip(clip))
  } else {
    res.status(404).end()
  }
})
router.patch('/:id', async (req, res) => {
  const result = await updateClip(Number(req.params.id), toClipUpdate(req.body))
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})

export default router

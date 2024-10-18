import express from 'express'
import { toAudio, toAudioUpdate } from '../db/mappers'
import { findAudioById, updateAudio } from '../db/AudioRepository'

const router = express.Router()
router.get('/:id', async (req, res) => {
  const source = await findAudioById(Number(req.params.id))
  if (source != null) {
    res.status(200).send(toAudio(source))
  } else {
    res.status(404).end()
  }
})
router.patch('/:id', async (req, res) => {
  const result = await updateAudio(
    Number(req.params.id),
    toAudioUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})

export default router

import express from 'express'
import {
  findDisplayViewById,
  updateDisplayView
} from '../db/DisplayViewRepository'
import { DisplayView } from 'flipflip-common'
import { toDisplayView, toDisplayViewUpdate } from '../db/mappers'

const router = express.Router()
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const displayView = await findDisplayViewById(id)
  if (displayView != null) {
    res.status(200).send(toDisplayView(displayView))
  } else {
    res.status(404).end()
  }
})

router.patch('/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  const body = req.body as Partial<DisplayView>
  try {
    await updateDisplayView(id, toDisplayViewUpdate(body))
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router

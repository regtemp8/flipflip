import express from 'express'
import players from '../player/PlayerService'

const router = express.Router()
router.post('/:id/stop', async (req, res, next) => {
  try {
    players().stop(req.params.id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.get('/:id/view-players', async (req, res) => {
  const player = players().get(req.params.id)
  if (player == null) {
    res.status(404).end()
  } else {
    res.status(200).send(player.getViewPlayerRefs())
  }
})

export default router

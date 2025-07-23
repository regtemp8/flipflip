import express from 'express'
import players from '../player/PlayerService'
import viewPlayers from '../player/ViewPlayerService'
import { ScraperProgress } from 'flipflip-common'

const router = express.Router()
router.post('/:id/stop', async (req, res) => {
  players().stop(req.params.id)
  res.status(204).end()
})

router.get('/:id/view-players', async (req, res) => {
  const player = players().get(req.params.id)
  if (player == null) {
    res.status(404).end()
  } else {
    res.status(200).send(player.getViewPlayerRefs())
  }
})

router.get('/:id/scraper-progress', async (req, res) => {
  const player = players().get(req.params.id)
  if (player == null) {
    res.status(404).end()
    return
  }

  const total: ScraperProgress = { current: 0, total: 0, message: [] }
  player
    .getViewPlayerRefs()
    .map((ref) => viewPlayers().get(ref)?.getProgress())
    .filter((progress) => progress != null)
    .map((progress) => progress as ScraperProgress)
    .forEach((progress) => {
      total.current += progress.current
      total.total += progress.total
      total.message.push(...progress.message)
    })

  res.status(200).send(total)
})

export default router

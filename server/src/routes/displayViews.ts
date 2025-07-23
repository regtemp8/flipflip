import express from 'express'
import displayViews from '../services/displayViewService'

const router = express.Router()
router.get('/:id', async (req, res) => {
  const displayView = await displayViews().getById(Number(req.params.id))
  if (displayView != null) {
    res.status(200).send(displayView)
  } else {
    res.status(404).end()
  }
})
export default router

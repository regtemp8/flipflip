import express from 'express'

const router = express.Router()
router.get('/:id', (req, res) => {
  // TODO return display playlist item
  res.status(200).send([])
})

export default router

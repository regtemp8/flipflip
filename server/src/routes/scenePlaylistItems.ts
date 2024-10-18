import express from 'express'

const router = express.Router()
router.get('/:id', (req, res) => {
  // TODO return scene playlist item
  res.status(200).send([])
})

export default router

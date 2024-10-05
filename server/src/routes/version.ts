import express from 'express'

const router = express.Router()
router.get('/version', (req, res) => {
  res.status(200).send('v4.0.0-beta5')
})

export default router

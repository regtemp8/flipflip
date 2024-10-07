import express from 'express'
import { Message } from 'flipflip-common'

const router = express.Router()
router.get('/version', (req, res) => {
  const message: Message = {success: '4.0.0-beta5'}
  res.status(200).send(message)
})

export default router

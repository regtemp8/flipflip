import express from 'express'
import proxy from './ProxyService'

const router = express.Router()
router.get('/nimja/visual/:id', (req, res) => {
  proxy().nimja(req, res)
})
router.get('/:uuid', (req, res) => {
  proxy().get(req.params.uuid, req, res)
})
export default router

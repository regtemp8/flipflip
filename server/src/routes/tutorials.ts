import express from 'express'
import { findTutorials } from '../db/TutorialsRepository'
import { User } from '../db/types/generated'
import { toTutorials } from '../db/mappers'

const router = express.Router()
router.get('/', async (req, res) => {
  const tutorials = toTutorials(await findTutorials(req.user as User))
  res.status(200).send(tutorials)
})

export default router

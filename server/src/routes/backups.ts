import express from 'express'
import db from '../db/database'
import moment from 'moment'
import { createBackup, findBackupFileNameById } from '../db/BackupRepository'
import { User } from '../db/types/generated'

const router = express.Router()
router.get('/', (req, res) => {
  res.status(200).send([])
})
router.post('/', async (req, res) => {
  const now = moment()
  const fileName = `flipflip-${now.unix()}.db`
  await db().createBackup(fileName)
  await createBackup(fileName, now)
  res.status(204).end()
})
router.post('/:id/restore', async (req, res) => {
  const { fileName } = await findBackupFileNameById(Number(req.params.id))
  await db().restoreBackup(fileName)
  res.status(204).end()
})
export default router

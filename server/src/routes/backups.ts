import express from 'express'
import db from '../db/database'
import moment from 'moment'
import {
  createBackup,
  findBackups,
  findBackupFileNameById
} from '../db/BackupRepository'
import { toBackup, toBackupSettings } from '../db/mappers'
import { CleanBackupsRequest } from 'flipflip-common'

const router = express.Router()
router.get('/', async (req, res) => {
  const backups = (await findBackups())
    .map((b) => toBackup(b))
    .filter((b) => b.size > 0)

  res.status(200).send(backups)
})
router.post('/', async (req, res) => {
  const now = moment()
  const fileName = `flipflip-${now.unix()}.db`
  await db().createBackup(fileName)
  await createBackup(fileName, now)
  res.status(200).send({ success: 'Backup success!' })
})
router.post('/:id/restore', async (req, res) => {
  const backup = await findBackupFileNameById(Number(req.params.id))
  if (backup != null) {
    await db().restoreBackup(backup.fileName)
    res.status(200).send({ success: 'Restore success!' })
  } else {
    res.status(404).send({ error: 'Backup not found.' })
  }
})
router.post('/clean', async (req, res) => {
  const body = req.body as CleanBackupsRequest
  await db().cleanBackups(toBackupSettings(body))
  res.status(200).send({ success: 'Clean success!' })
})
export default router

import fs from 'fs'
import path from 'path'
import schedule from 'node-schedule'
import { findBackupSettings } from './db/GeneralSettingsRepository'
import moment from 'moment'
import db from './db/database'
import {
  createBackup,
  findMostRecentToKeep,
  findByIntervalToKeep,
  deleteByIdsToKeep
} from './db/BackupRepository'
import { Backup } from './db/types/generated'
import { BackupSettings } from './db/types/BackupSettings'
import { getBackupsDir } from './utils'

export class SchedulerService {
  private static instance: SchedulerService

  private constructor() {}

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService()
    }

    return SchedulerService.instance
  }

  public async init() {
    const settings = await findBackupSettings()
    this.scheduleBackupJob(settings)
    this.scheduleCleanJob(settings)
  }

  private scheduleBackupJob(settings: BackupSettings) {
    if (!settings.autoBackup) {
      return
    }

    const m = moment().add(5, 'minutes')
    const cron = `${m.minute()} ${m.hour()} */${settings.autoBackupDays} * *`
    console.log(`+ Schedule auto backup job (cron: ${cron})`)
    schedule.scheduleJob('Auto Backup', cron, async () => {
      const now = moment()
      console.log(`+ Run auto backup job: ${now.toISOString()}`)
      const fileName = `flipflip-${now.unix()}.db`
      await db().createBackup(fileName)
      await createBackup(fileName, now)
    })
  }

  private scheduleCleanJob(settings: BackupSettings) {
    if (!settings.autoCleanBackup) {
      return
    }

    const m = moment().add(5, 'minutes')
    const cron = `${m.minute()} ${m.hour()} */${settings.autoBackupDays} * *`
    console.log(`+ Schedule clean backups job (cron: ${cron})`)
    schedule.scheduleJob('Clean Backups', cron, async () => {
      console.log(`+ Run auto backup job: ${moment().toISOString()}`)
      let toKeep: Array<Partial<Backup>>
      if (settings.autoCleanBackup) {
        toKeep = []
        const months = settings.autoCleanBackupMonths
        const keepMonths = await findByIntervalToKeep('month', months)
        toKeep.push(...keepMonths)
        if(keepMonths.length > 0) {
          keepMonths.forEach((keep) => console.log(`+ Keep monthly backup: ${keep.fileName}`))
        } else {
          console.log(': No monthly backups to keep')
        }

        const weeks = settings.autoCleanBackupWeeks
        const keepWeeks = await findByIntervalToKeep('week', weeks)
        toKeep.push(...keepWeeks)
        if(keepWeeks.length > 0) {
          keepWeeks.forEach((keep) => console.log(`+ Keep weekly backup: ${keep.fileName}`))
        } else {
          console.log(': No weekly backups to keep')
        }

        const days = settings.autoCleanBackupDays
        const keepDays = await findByIntervalToKeep('day', days)
        toKeep.push(...keepDays)
        if(keepDays.length > 0) {
          keepDays.forEach((keep) => console.log(`+ Keep daily backup: ${keep.fileName}`))
        } else {
          console.log(': No daily backups to keep')
        }
      } else {
        toKeep = await findMostRecentToKeep(settings.cleanRetain)
        if(toKeep.length > 0) {
          toKeep.forEach((keep) => console.log(`+ Keep recent backup: ${keep.fileName}`))
        } else {
          console.log(': No recent backups to keep')
        }
      }

      const filesToKeep = new Set<string>()
      toKeep.forEach((keep) => filesToKeep.add(keep.fileName as string))
      const backupsDir = getBackupsDir()
      const backupFiles = await fs.promises.readdir(backupsDir)
      const toRemove = backupFiles.filter((file) => !filesToKeep.has(file))
      await Promise.all(
        toRemove.map((file) => {
          const backupPath = path.join(backupsDir, file)
          console.log(`- Remove backup: ${backupPath}`)
          return fs.promises.unlink(backupPath)
        })
      )
      await deleteByIdsToKeep(toKeep.map((backup) => backup.id as number))
    })
  }
}

export default function scheduler() {
  return SchedulerService.getInstance()
}

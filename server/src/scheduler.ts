import schedule from 'node-schedule'
import { findBackupSettings } from './db/GeneralSettingsRepository'
import moment from 'moment'
import db from './db/database'
import { createBackup } from './db/BackupRepository'
import { BackupSettings } from './db/types/BackupSettings'
import Logger from './logging/Logger'

const logger = Logger.create('SchedulerService')
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
      logger.info(`+ Cancel auto create backup job`)
      schedule.cancelJob('Auto Backup')
      return
    }

    const m = moment().add(5, 'minutes')
    const cron = `${m.minute()} ${m.hour()} */${settings.autoBackupDays} * *`
    logger.info(`+ Schedule auto backup job (cron: ${cron})`)
    schedule.scheduleJob('Auto Backup', cron, async () => {
      const now = moment()
      logger.info(`+ Run auto create backup job: ${now.toISOString()}`)
      const fileName = `flipflip-${now.unix()}.db`
      await db().createBackup(fileName)
      await createBackup(fileName, now)
    })
  }

  private scheduleCleanJob(settings: BackupSettings) {
    if (!settings.autoCleanBackup) {
      logger.info(`+ Cancel auto clean backup job`)
      schedule.cancelJob('Clean Backups')
      return
    }

    const m = moment().add(5, 'minutes')
    const cron = `${m.minute()} ${m.hour()} */${settings.autoBackupDays} * *`
    logger.info(`+ Schedule clean backups job (cron: ${cron})`)
    schedule.scheduleJob('Clean Backups', cron, async () => {
      logger.info(`+ Run auto clean backup job: ${moment().toISOString()}`)
      await db().cleanBackups(settings)
    })
  }
}

export default function scheduler() {
  return SchedulerService.getInstance()
}

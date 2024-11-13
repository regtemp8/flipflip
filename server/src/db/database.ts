import * as path from 'path'
import { promises as fs } from 'fs'
import SQLite, { Database } from 'better-sqlite3'
import {
  Kysely,
  CamelCasePlugin,
  SqliteDialect,
  Migrator,
  FileMigrationProvider
} from 'kysely'
import { Backup, DB } from './types/generated'
import { getSaveDir, getBackupsDir } from '../utils'
import logger from '../logger'
import { BackupSettings } from './types/BackupSettings'
import {
  deleteByIdsToKeep,
  findByIntervalToKeep,
  findMostRecentToKeep
} from './BackupRepository'

export class DatabaseService {
  private static instance: DatabaseService

  private sqlite: Database
  private kysely: Kysely<DB>

  private constructor() {
    const fileName = this.databaseFileName()
    this.sqlite = new SQLite(fileName)
    this.kysely = new Kysely<DB>({
      dialect: new SqliteDialect({ database: this.sqlite }),
      plugins: [new CamelCasePlugin()]
    })
  }

  public query() {
    return this.kysely
  }

  public async migrateToLatest() {
    const migrator = new Migrator({
      db: this.kysely,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(__dirname, 'migration', 'scripts')
      })
    })

    const { error, results } = await migrator.migrateToLatest()
    results?.forEach((it) => {
      if (it.status === 'Success') {
        logger.info(
          `Migration "${it.migrationName}" was executed successfully.`
        )
      } else if (it.status === 'Error') {
        logger.error(`Failed to execute migration "${it.migrationName}".`)
      }
    })

    if (error) {
      logger.error('Failed to execute migrations', { error })
      throw error
    }
  }

  public async createBackup(fileName: string) {
    logger.info(`Create backup`)
    const path = this.backupFileName(fileName)
    logger.info(`+ Write backup to: {path}`, { path })
    await this.sqlite.backup(path)
  }

  public async restoreBackup(fileName: string) {
    logger.info(`Restore backup`)
    await this.destroy()
    const src = this.backupFileName(fileName)
    const dest = this.databaseFileName()
    logger.info(`+ Copy database {src} to {dest}`, { src, dest })
    await fs.copyFile(src, dest)
    logger.info('+ Open database connection')
    this.sqlite = new SQLite(dest)
    this.kysely = new Kysely<DB>({
      dialect: new SqliteDialect({ database: this.sqlite }),
      plugins: [new CamelCasePlugin()]
    })
  }

  public async cleanBackups(settings: BackupSettings) {
    let toKeep: Array<Partial<Backup>>
    if (settings.autoCleanBackup) {
      toKeep = []
      const months = settings.autoCleanBackupMonths
      const keepMonths = await findByIntervalToKeep('month', months)
      toKeep.push(...keepMonths)
      if (keepMonths.length > 0) {
        keepMonths.forEach((keep) =>
          logger.info(`+ Keep monthly backup: ${keep.fileName}`)
        )
      } else {
        logger.info(': No monthly backups to keep')
      }

      const weeks = settings.autoCleanBackupWeeks
      const keepWeeks = await findByIntervalToKeep('week', weeks)
      toKeep.push(...keepWeeks)
      if (keepWeeks.length > 0) {
        keepWeeks.forEach((keep) =>
          logger.info(`+ Keep weekly backup: ${keep.fileName}`)
        )
      } else {
        logger.info(': No weekly backups to keep')
      }

      const days = settings.autoCleanBackupDays
      const keepDays = await findByIntervalToKeep('day', days)
      toKeep.push(...keepDays)
      if (keepDays.length > 0) {
        keepDays.forEach((keep) =>
          logger.info(`+ Keep daily backup: ${keep.fileName}`)
        )
      } else {
        logger.info(': No daily backups to keep')
      }
    } else {
      toKeep = await findMostRecentToKeep(settings.cleanRetain)
      if (toKeep.length > 0) {
        toKeep.forEach((keep) =>
          logger.info(`+ Keep recent backup: ${keep.fileName}`)
        )
      } else {
        logger.info(': No recent backups to keep')
      }
    }

    const filesToKeep = new Set<string>()
    toKeep.forEach((keep) => filesToKeep.add(keep.fileName as string))
    const backupsDir = getBackupsDir()
    const backupFiles = await fs.readdir(backupsDir)
    const toRemove = backupFiles.filter((file) => !filesToKeep.has(file))
    await Promise.all(
      toRemove.map((file) => {
        logger.info(`- Remove backup: ${file}`)
        const backupPath = path.join(backupsDir, file)
        return fs.unlink(backupPath)
      })
    )
    await deleteByIdsToKeep(toKeep.map((backup) => backup.id as number))
  }

  public async destroy() {
    logger.info('+ Close database connection')
    await this.kysely.destroy()
  }

  private databaseFileName() {
    return getSaveDir() + path.sep + 'flipflip.db'
  }

  private backupFileName(fileName: string) {
    return getBackupsDir() + path.sep + fileName
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }

    return DatabaseService.instance
  }
}

export default function db() {
  return DatabaseService.getInstance()
}

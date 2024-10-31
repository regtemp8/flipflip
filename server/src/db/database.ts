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
import { DB } from './types/generated'
import { getSaveDir, getBackupsDir } from '../utils'
import logger from '../logger'

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
      logger.error('Failed to execute migrations', {error})
      throw error
    }
  }

  public async createBackup(fileName: string) {
    logger.info(`Create backup`)
    const path = this.backupFileName(fileName)
    logger.info(`+ Write backup to: {path}`, {path})
    await this.sqlite.backup(path)
  }

  public async restoreBackup(fileName: string) {
    logger.info(`Restore backup`)
    logger.info('+ Close database connection')
    await this.kysely.destroy()
    const src = this.backupFileName(fileName)
    const dest = this.databaseFileName()
    logger.info(`+ Copy database {src} to {dest}`, {src, dest})
    await fs.copyFile(src, dest)
    logger.info('+ Open database connection')
    this.sqlite = new SQLite(dest)
    this.kysely = new Kysely<DB>({
      dialect: new SqliteDialect({ database: this.sqlite }),
      plugins: [new CamelCasePlugin()]
    })
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

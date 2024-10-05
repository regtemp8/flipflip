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
import { getSaveDir } from '../utils'

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
        console.log(
          `Migration "${it.migrationName}" was executed successfully.`
        )
      } else if (it.status === 'Error') {
        console.error(`Failed to execute migration "${it.migrationName}".`)
      }
    })

    if (error) {
      console.log(error)
      throw error
    }
  }

  public async createBackup(fileName: string) {
    await this.sqlite.backup(fileName)
  }

  public async restoreBackup(fileName: string) {
    await this.kysely.destroy()
    const src = this.databaseFileName(fileName)
    const dest = this.databaseFileName()
    await fs.copyFile(src, dest)
    this.sqlite = new SQLite(dest)
    this.kysely = new Kysely<DB>({
      dialect: new SqliteDialect({ database: this.sqlite }),
      plugins: [new CamelCasePlugin()]
    })
  }

  private databaseFileName(fileName = 'flipflip.db') {
    return getSaveDir() + path.sep + fileName
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

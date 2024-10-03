import * as path from 'path'
import { existsSync, promises as fs, mkdirSync } from 'fs'
import SQLite from 'better-sqlite3'
import {
  Kysely,
  CamelCasePlugin,
  SqliteDialect,
  Migrator,
  FileMigrationProvider
} from 'kysely'
import { DB } from './types'
import { getSaveDir } from '../utils'

const saveDir = getSaveDir()
if (!existsSync(saveDir)) {
  console.log(`Create save directory: ${saveDir}`)
  mkdirSync(saveDir, { recursive: true })
}

const databaseFileName =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_URL
    : getSaveDir() + '/flipflip.db'

const dialect = new SqliteDialect({
  database: new SQLite(databaseFileName)
})

export const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()]
})

export async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migration', 'scripts')
    })
  })

  const { error, results } = await migrator.migrateToLatest()
  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`Migration "${it.migrationName}" was executed successfully.`)
    } else if (it.status === 'Error') {
      console.error(`Failed to execute migration "${it.migrationName}".`)
    }
  })

  if (error) {
    console.log(error)
    throw error
  }
}

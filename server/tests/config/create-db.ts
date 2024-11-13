import fs from 'fs'
import path from 'path'
import moment from 'moment'

process.env.NODE_ENV = 'test'
process.env.FF_USERNAME = 'admin'
process.env.FF_PASSWORD = 'admin'
process.env.FF_SAVE_DIR = path.join(process.cwd(), 'tests', 'data')

// imports that depend on env variables
import db from '../../src/db/database'

void (async function () {
  if (fs.existsSync(process.env.FF_SAVE_DIR as string)) {
    await fs.promises.rm(process.env.FF_SAVE_DIR as string, {
      force: true,
      recursive: true
    })
  }

  await fs.promises.mkdir(process.env.FF_SAVE_DIR as string)
  await db().migrateToLatest()

  await db()
    .query()
    .updateTable('user')
    .set({ tokenValue: '987654', tokenExpiry: 9223372036854775807 })
    .where('username', '=', process.env.FF_USERNAME as string)
    .execute()

  const now = moment('2024-10-18', 'YYYY-MM-DD')
  const backupFiles = new Set<string>()
  for (let d = 0; d < 16; d++) {
    const daily = now.clone().subtract(d, 'days')
    const fileName = `flipflip-${daily.unix()}.db`
    await db()
      .query()
      .insertInto('backup')
      .values({
        fileName,
        createdAt: daily.unix(),
        interval: 'day',
        intervalValue: daily.dayOfYear(),
        year: daily.year()
      })
      .execute()

    backupFiles.add(fileName)
  }
  for (let w = 0; w < 10; w++) {
    const weekly = now.clone().subtract(w, 'weeks')
    const fileName = `flipflip-${weekly.unix()}.db`
    await db()
      .query()
      .insertInto('backup')
      .values({
        fileName,
        createdAt: weekly.unix(),
        interval: 'week',
        intervalValue: weekly.week(),
        year: weekly.year()
      })
      .execute()

    backupFiles.add(fileName)
  }
  for (let m = 0; m < 7; m++) {
    const monthly = now.clone().subtract(m, 'months')
    const fileName = `flipflip-${monthly.unix()}.db`
    await db()
      .query()
      .insertInto('backup')
      .values({
        fileName,
        createdAt: monthly.unix(),
        interval: 'month',
        intervalValue: monthly.month(),
        year: monthly.year()
      })
      .execute()

    backupFiles.add(fileName)
  }

  await db().destroy()
  const src = path.join(process.env.FF_SAVE_DIR as string, 'flipflip.db')
  const backupsDir = path.join(process.env.FF_SAVE_DIR as string, 'backups')
  await fs.promises.mkdir(backupsDir)
  for (const backupFile of backupFiles) {
    const dest = path.join(backupsDir, backupFile)
    await fs.promises.copyFile(src, dest)
  }
})()

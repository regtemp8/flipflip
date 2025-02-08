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

  // TEST DATABASE
  await db().migrateToLatest()
  await db()
    .query()
    .updateTable('user')
    .set({ tokenValue: '987654', tokenExpiry: 9223372036854775807 })
    .where('username', '=', process.env.FF_USERNAME as string)
    .execute()

  // BACKUP TEST DATA
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

  // BACKUP FILES
  const backupsDir = path.join(process.env.FF_SAVE_DIR as string, 'backups')
  await fs.promises.mkdir(backupsDir)
  for (const backupFile of backupFiles) {
    const dest = path.join(backupsDir, backupFile)
    await fs.promises.copyFile(src, dest)
  }

  // CACHE FILES
  const oldCacheDir = path.join(process.env.FF_SAVE_DIR as string, 'old-cache')
  await fs.promises.mkdir(oldCacheDir)
  const oldCacheFiles = Array.from(backupFiles).slice(0, 10)
  for (const oldCacheFile of oldCacheFiles) {
    const dest = path.join(oldCacheDir, oldCacheFile)
    await fs.promises.copyFile(src, dest)
  }

  // CAPTION SCRIPTS
  const scriptsDir = path.join(process.env.FF_SAVE_DIR as string, 'scripts')
  await fs.promises.mkdir(scriptsDir)

  const phrasesScript =
    'storePhrase kittens are fluffy\nstorePhrase doggos are floofy\ncap $RANDOM_PHRASE\nblink $RANDOM_PHRASE / $RANDOM_PHRASE'
  await fs.promises.writeFile(
    path.join(scriptsDir, 'phrases.txt'),
    phrasesScript
  )

  const phraseGroupsScript =
    'storePhrase $1 Banana Cream Pie\nstorePhrase $1 Oreo Cheesecake\nstorePhrase $2 Vanilla Cake\nstorePhrase $2 Chocolate Cake\nblink $1 / IS SO MUCH BETTER THAN / $2'
  await fs.promises.writeFile(
    path.join(scriptsDir, 'phrase-groups.txt'),
    phraseGroupsScript
  )

  const randomTimingScript =
    'setBlinkDelayTF random\nsetBlinkGroupDelayTF random\nsetBlinkDelay 100 1000\nsetBlinkGroupDelay 1000 3000\nblink KITTENS / ARE / YOUR / LIFE'
  await fs.promises.writeFile(
    path.join(scriptsDir, 'random-timing.txt'),
    randomTimingScript
  )

  const waveTimingScript =
    'setBlinkDelayTF wave\nsetBlinkWaveRate 75\nsetBlinkDelay 100 1000\nsetBlinkGroupDelay 0\nblink KITTENS / ARE / YOUR / LIFE'
  await fs.promises.writeFile(
    path.join(scriptsDir, 'wave-timing.txt'),
    waveTimingScript
  )

  const bpmTimingScript =
    'setBlinkGroupDelayTF bpm\nsetBlinkGroupDelayBPMMulti 2\nsetBlinkDuration 100\nsetBlinkDelay 100\nblink KITTENS / ARE / YOUR / LIFE'
  await fs.promises.writeFile(
    path.join(scriptsDir, 'bpm-timing.txt'),
    bpmTimingScript
  )

  const scriptUrls = [
    'https://pastebin.com/raw/ZNJ5A40S',
    'https://pastebin.com/raw/48LPhQD3',
    'https://pastebin.com/raw/LDvJvg0C'
  ]
  for (const url of scriptUrls) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`${response.status} - ${response.statusText}: ${url}`)
    }
  }

  // AUDIO FILES
  const audioSrcDir = path.join(process.cwd(), 'tests', 'config', 'audio')
  const audioDestDir = path.join(process.env.FF_SAVE_DIR as string, 'audio')
  await fs.promises.mkdir(audioDestDir)
  const audioFiles = await fs.promises.readdir(audioSrcDir)
  for (const audioFile of audioFiles) {
    await fs.promises.copyFile(
      path.join(audioSrcDir, audioFile),
      path.join(audioDestDir, audioFile)
    )
  }

  const audioUrls = [
    'https://feeds.soundcloud.com/stream/336839158-royaltyfreemusic-nocopyrightmusic-sugar-vibe-tracks.mp3',
    'https://feeds.soundcloud.com/stream/337111059-royaltyfreemusic-nocopyrightmusic-vibe-tracks-take-you-home-tonight.mp3',
    'https://feeds.soundcloud.com/stream/338313073-royaltyfreemusic-nocopyrightmusic-foundation-vibe-tracks-free-download.mp3'
  ]
  for (const url of audioUrls) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`${response.status} - ${response.statusText}: ${url}`)
    }
  }

  // IMAGE FILES
  const imgSrcDir = path.join(process.cwd(), 'tests', 'config', 'img')
  const imgDestDir = path.join(process.env.FF_SAVE_DIR as string, 'img')
  await fs.promises.mkdir(imgDestDir)
  const imgFiles = await fs.promises.readdir(imgSrcDir)
  for (const imgFile of imgFiles) {
    await fs.promises.copyFile(
      path.join(imgSrcDir, imgFile),
      path.join(imgDestDir, imgFile)
    )
  }
})()

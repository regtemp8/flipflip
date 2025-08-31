import fs from 'fs'
import os, { NetworkInterfaceInfo } from 'os'
import path from 'path'
import express, { Request, Response } from 'express'
import session from 'express-session'
import passport from 'passport'
import connect from 'connect-sqlite3'
import cookieParser from 'cookie-parser'
import auth from './routes/auth'
import backups from './routes/backups'
import scenes from './routes/scenes'
import generators from './routes/generators'
import displays from './routes/displays'
import displayViews from './routes/displayViews'
import playlists from './routes/playlists'
import version from './routes/version'
import tutorials from './routes/tutorials'
import settings from './routes/settings'
import contentSources from './routes/contentSources'
import clips from './routes/clips'
import tags from './routes/tags'
import audios from './routes/audios'
import files from './routes/files'
import captionScripts from './routes/captionScripts'
import scenePlaylistItems from './routes/scenePlaylistItems'
import viewPlayers from './routes/viewPlayers'
import players from './routes/players'
import db from './db/database'
import {
  getBackupsDir,
  getCacheDir,
  getSaveDir,
  getServerPort,
  getThumbsDir,
  getBinDir,
  getFfprobePath,
  getServerHost
} from './utils'
import scheduler from './scheduler'
import Logger from './logging/Logger'
import proxy from './routes/proxy'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import { pipeline } from 'stream/promises'

const host = getServerHost()
const port = getServerPort()
const logger = Logger.create('server')

const getNetworkInterfaceURLs = (
  port: number
): Array<{ name: string; url: string }> => {
  const urls: Array<{ name: string; url: string }> = []
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    const infos = interfaces[name] as NetworkInterfaceInfo[]
    for (const info of infos) {
      if (info.family === 'IPv4' && !info.internal) {
        const url = `http://${info.address}:${port}`
        urls.push({ name, url })
      }
    }
  }

  return urls
}

const getNetworkURLs = (host: string, port: number) => {
  const urls: Array<{ name: string; url: string }> = []
  const allNetworkInterfaces = host === '0.0.0.0'
  if (allNetworkInterfaces) {
    urls.push({ name: 'Local', url: `http://localhost:${port}` })
    urls.push(...getNetworkInterfaceURLs(port))
  } else {
    urls.push({ name: 'URL', url: `http://${host}:${port}` })
  }

  return urls
}

const extractBinaries = async () => {
  if (process.pkg == null) {
    return
  }

  if (!fs.existsSync(getFfprobePath())) {
    const file = fs.createWriteStream(getFfprobePath())
    await pipeline(fs.createReadStream(ffprobeInstaller.path), file)

    fs.chmodSync(getFfprobePath(), 0o755)
    logger.info('+ ffprobe copied to {path}', { path: getFfprobePath() })
  }
}

void (async function () {
  const dirs = [
    getSaveDir(),
    getBackupsDir(),
    getCacheDir(),
    getThumbsDir(),
    getBinDir()
  ]
  for (const path of dirs) {
    if (!fs.existsSync(path)) {
      logger.info('+ Creating directory {path}', { path })
      await fs.promises.mkdir(path)
    }
  }

  await extractBinaries()
  await db().migrateToLatest()

  const SQLiteStore = connect(session)
  const app = express()
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'testing'
  ) {
    const { default: cors } = await import(path.join(__dirname, 'cors.js'))
    app.use(cors.default)
  }
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: new SQLiteStore({
        db: 'sessions.db',
        dir: getSaveDir()
      }) as session.Store
    })
  )
  app.use(passport.authenticate('session'))
  app.use(auth)
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')))
  }
  app.use('/api/version', version)
  app.use('/api/tutorials', tutorials)
  app.use('/api/scenes', scenes)
  app.use('/api/generators', generators)
  app.use('/api/displays', displays)
  app.use('/api/display-views', displayViews)
  app.use('/api/playlists', playlists)
  app.use('/api/settings', settings)
  app.use('/api/backups', backups)
  app.use('/api/content-sources', contentSources)
  app.use('/api/clips', clips)
  app.use('/api/tags', tags)
  app.use('/api/audios', audios)
  app.use('/api/caption-scripts', captionScripts)
  app.use('/api/scene-playlist-items', scenePlaylistItems)
  app.use('/api/players', players)
  app.use('/api/view-players', viewPlayers)
  app.use('/fs', files)
  app.use('/proxy', proxy)
  app.get('*', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(__dirname, 'public', 'index.html'))
    } else {
      res.status(200).send('Hello World!')
    }
  })
  app.use((error: NodeJS.ErrnoException, req: Request, res: Response) => {
    logger.error(`Failed to process request ${req.url}`, { error })
    const codes = ['SQLITE_CONSTRAINT_UNIQUE']
    const status = error.code != null && codes.includes(error.code) ? 400 : 500
    res.status(status).end()
  })

  const server = app.listen(port, host, () => {
    const url = getNetworkURLs(host, port)
      .map((url) => `${url.name}:\t${url.url}`)
      .join('\n\t\t')
    let template = '\n\n\tYou can now view FlipFlip in the browser.\n'
    template +=
      '\t+-----------------------------------------------------------------------------------------+\n'
    template += '\t\t{url}\n'
    template +=
      '\t+-----------------------------------------------------------------------------------------+\n'
    logger.info(template, { url })
  })

  const signals = ['SIGTERM', 'SIGINT']
  signals.forEach((signal) => {
    process.on(signal, () => {
      logger.info(`${signal} signal received: closing HTTP server`)
      server.close(async () => {
        logger.info('HTTP server closed')
        await db().destroy()
        logger.info('Database connection closed')
        process.exit(0)
      })
    })
  })

  scheduler().init()
})()

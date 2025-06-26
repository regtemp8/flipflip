import fs from 'fs'
import path from 'path'
import express, { NextFunction, Request, Response } from 'express'
import session from 'express-session'
import passport from 'passport'
import connect from 'connect-sqlite3'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import auth from './routes/auth'
import backups from './routes/backups'
import scenes from './routes/scenes'
import generators from './routes/generators'
import displays from './routes/displays'
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
import displayPlaylistItems from './routes/displayPlaylistItems'
import scenePlaylistItems from './routes/scenePlaylistItems'
import db from './db/database'
import { getBackupsDir, getCacheDir, getSaveDir, getThumbsDir } from './utils'
import scheduler from './scheduler'
import logger from './logger'

const port = process.env.FF_PORT || 5050

void (async function () {
  const dirs = [getSaveDir(), getBackupsDir(), getCacheDir(), getThumbsDir()]
  for (const path of dirs) {
    if (!fs.existsSync(path)) {
      logger.info('+ Creating directory {path}', { path })
      await fs.promises.mkdir(path)
    }
  }

  await db().migrateToLatest()

  const SQLiteStore = connect(session)
  const app = express()
  if (process.env.NODE_ENV !== "production") {
    const {default: cors} = await import(path.join(__dirname, "cors"));
    app.use(cors);
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
  app.use(express.static(path.join(__dirname, 'public')))
  app.use('/api/version', version)
  app.use('/api/tutorials', tutorials)
  app.use('/api/scenes', scenes)
  app.use('/api/generators', generators)
  app.use('/api/displays', displays)
  app.use('/api/playlists', playlists)
  app.use('/api/settings', settings)
  app.use('/api/backups', backups)
  app.use('/api/content-sources', contentSources)
  app.use('/api/clips', clips)
  app.use('/api/tags', tags)
  app.use('/api/audios', audios)
  app.use('/api/caption-scripts', captionScripts)
  app.use('/api/display-playlist-items', displayPlaylistItems)
  app.use('/api/scene-playlist-items', scenePlaylistItems)
  app.use('/fs', files)
  app.use(
    (
      error: NodeJS.ErrnoException,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      logger.error(`Failed to process request ${req.url}`, { error })
      const codes = ['SQLITE_CONSTRAINT_UNIQUE']
      const status =
        error.code != null && codes.includes(error.code) ? 400 : 500
      res.status(status).end()
    }
  )

  // start the Express server
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`)
  })

  scheduler().init()
})()

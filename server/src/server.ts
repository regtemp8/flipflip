import path from 'path'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import connect from 'connect-sqlite3'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import auth from './routes/auth'
import backups from './routes/backups'
import systemFonts from './routes/systemFonts'
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
import { getSaveDir } from './utils'

const PORT = process.env.PORT || 5050

const init = () => {
  const SQLiteStore = connect(session)

  const app = express()
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true
    })
  )
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: new SQLiteStore({
        db: 'flipflip.db',
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
  app.use('/api/system-fonts', systemFonts)
  app.use('/api/content-sources', contentSources)
  app.use('/api/clips', clips)
  app.use('/api/tags', tags)
  app.use('/api/audios', audios)
  app.use('/api/caption-scripts', captionScripts)
  app.use('api/display-playlist-items', displayPlaylistItems)
  app.use('api/scene-playlist-items', scenePlaylistItems)
  app.use('/fs', files)

  // start the Express server
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

db()
  .migrateToLatest()
  .then(init, () => {
    process.exit(1)
  })

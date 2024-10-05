import path from 'path'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import connect from 'connect-sqlite3'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import auth from './routes/auth'
import scenes from './routes/scenes'
import generators from './routes/generators'
import displays from './routes/displays'
import playlists from './routes/playlists'
import version from './routes/version'
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
  const storeDir =
    process.env.NODE_ENV === 'development' ? '/tmp' : getSaveDir()
  app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: new SQLiteStore({
        db: 'flipflip.db',
        dir: storeDir
      }) as session.Store
    })
  )
  app.use(passport.authenticate('session'))
  app.use(auth)
  app.use(express.static(path.join(__dirname, 'public')))
  app.use('/api', version)
  app.use('/api/scenes', scenes)
  app.use('/api/generators', generators)
  app.use('/api/displays', displays)
  app.use('/api/playlists', playlists)

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

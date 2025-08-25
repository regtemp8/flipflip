import express, { NextFunction, Request, Response } from 'express'
import passport from 'passport'
import passportCustom from 'passport-custom'
import { findUserByUsername } from '../db/UserRepository'
import { User } from '../db/types/entities'

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    const { id, username } = user as User
    cb(null, { id, username })
  })
})

passport.deserializeUser((user: User, cb) => {
  process.nextTick(() => {
    return cb(null, user)
  })
})

passport.use(
  'dummy',
  new passportCustom.Strategy(async (req, callback) => {
    const user = await findUserByUsername('dummy')
    callback(null, user)
  })
)

const allowed = ['/authenticated', '/', '/index.html', '/index.js']
const router = express.Router()
router.use((req: Request, res: Response, next: NextFunction) => {
  if (req.user != null || allowed.includes(req.path)) {
    next()
  } else {
    res.status(401).send('Unauthorized')
  }
})

router.get(
  '/authenticated',
  passport.authenticate('dummy', { failureMessage: true }),
  (req, res) => {
    const status = req.user != null ? 200 : 401
    res.status(status).send(req.user != null)
  }
)

export default router

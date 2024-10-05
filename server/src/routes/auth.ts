import crypto from 'crypto'
import express, { NextFunction, Request, Response } from 'express'
import passport from 'passport'
import { Strategy } from 'passport-local'
import { UniqueTokenStrategy } from 'passport-unique-token/dist/strategy'
import {
  findUserByTokenNotExpired,
  findUserByUsername,
  updateUser
} from '../db/UserRepository'
import { User } from '../db/types/generated'

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
  new Strategy((username, password, cb) => {
    findUserByUsername(username).then((user) => {
      if (!user) {
        return cb(null, false, { message: 'Incorrect username or password.' })
      }

      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        'sha256',
        (err, hashedPassword) => {
          if (err) {
            return cb(err)
          }
          if (!crypto.timingSafeEqual(user.hashedPassword, hashedPassword)) {
            return cb(null, false, {
              message: 'Incorrect username or password.'
            })
          }

          return cb(null, user)
        }
      )
    })
  })
)

passport.use(
  new UniqueTokenStrategy((token, cb) => {
    findUserByTokenNotExpired(token).then((user) => {
      if (!user) {
        return cb(null, false)
      }

      updateUser(user, { tokenExpiry: 0 })
      return cb(null, user)
    })
  })
)

const allowed = ['/login/password', '/login/token']
const router = express.Router()
router.use((req: Request, res: Response, next: NextFunction) => {
  if (req.user != null || allowed.includes(req.path)) {
    next()
  } else {
    res.status(401).send('Unauthorized')
  }
})

router.get('/authenticated', (req, res) => {
  // if unauthorized then the middleware above will return 401
  res.status(200).send(true)
})

router.get('/connect', async (req, res) => {
  const digits = '0123456789'
  let tokenValue = ''
  for (let i = 0; i < 6; i++) {
    tokenValue += digits[Math.floor(Math.random() * digits.length)]
  }

  const tokenExpiry = Date.now() + 3 * 60 * 1000
  await updateUser(req.user as User, { tokenValue, tokenExpiry })
  res.status(200).send(tokenValue)
})

router.post(
  '/login/password',
  passport.authenticate('local', { failureMessage: true }),
  (req, res) => res.status(req.user != null ? 200 : 401).send(req.user != null)
)
router.get(
  '/login/token',
  passport.authenticate('token', { failureMessage: true }),
  (req, res) => res.status(req.user != null ? 200 : 401).send(req.user != null)
)

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    res.status(200).send(false)
  })
})

export default router

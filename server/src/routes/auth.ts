import crypto from 'crypto'
import express, { NextFunction, Request, Response } from 'express'
import passport from 'passport'
import { Strategy } from 'passport-local'
import { UniqueTokenStrategy } from 'passport-unique-token/dist/strategy'
import {
  findUserByTokenNotExpired,
  findUserByUsername,
  findUserById,
  updateUser
} from '../db/UserRepository'
import { User } from '../db/types/generated'
import { AccountChange, Message } from 'flipflip-common'
import logger from '../logger'

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
        (error, hashedPassword) => {
          if (error) {
            return cb(error)
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

const allowed = [
  '/login/password',
  '/login/token',
  '/',
  '/index.html',
  '/index.js'
]
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

router.get('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error)
    }
    res.status(200).send(false)
  })
})

router.post('/change-username', async (req, res, next) => {
  const change = req.body as AccountChange
  if (change.new.trim().length === 0) {
    const message: Message = { error: `New username can't be empty.` }
    res.status(400).send(message)
    return
  }
  if (change.new !== change.confirm) {
    const message: Message = { error: 'New username could not be confirmed.' }
    res.status(400).send(message)
    return
  }

  const user = req.user as User
  if (user?.username !== change.current) {
    const message: Message = { error: 'Current username is invalid.' }
    res.status(400).send(message)
    return
  }

  await updateUser(user, { username: change.new })
  req.logout((error) => {
    if (error) {
      return next(error)
    }
    const message: Message = {
      success: 'Your username has been changed successfully.'
    }
    res.status(200).send(message)
  })
})

router.post('/change-password', async (req, res, next) => {
  const change = req.body as AccountChange
  if (change.new.trim().length === 0) {
    const message: Message = { error: `New password can't be empty.` }
    res.status(400).send(message)
    return
  }
  if (change.new !== change.confirm) {
    const message: Message = { error: 'New password could not be confirmed.' }
    res.status(400).send(message)
    return
  }

  const user = (await findUserById((req.user as User).id as number)) as User
  crypto.pbkdf2(
    change.current,
    user.salt,
    310000,
    32,
    'sha256',
    async (error, currentHashedPassword) => {
      if (error) {
        next(error)
      }
      if (!crypto.timingSafeEqual(user.hashedPassword, currentHashedPassword)) {
        const message: Message = { error: 'Current password is invalid.' }
        res.status(400).send(message)
        return
      }

      const salt = crypto.randomBytes(16)
      const hashedPassword = crypto.pbkdf2Sync(
        change.new,
        salt,
        310000,
        32,
        'sha256'
      )
      await updateUser(user, { salt, hashedPassword })
      req.logout((error) => {
        if (error) {
          return next(error)
        }
        const message: Message = {
          success: 'Your password has been changed successfully.'
        }
        res.status(200).send(message)
      })
    }
  )
})

export default router

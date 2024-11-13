import winston from 'winston'
import { getLogsDir } from './utils'
import fastRedact from 'fast-redact'
import format from 'string-template'
import { inspect } from 'util'

const redact = fastRedact({
  paths: [
    'username',
    'password',
    'path',
    'src',
    'dest',
    'name',
    'url',
    'error.path'
  ],
  serialize: false
})

const splatf = winston.format((info, opts) => {
  const splatSymbol = Object.getOwnPropertySymbols(info).find(
    (s) => s.description === 'splat'
  )
  if (splatSymbol != null) {
    const splat = info[splatSymbol]
    if (!Array.isArray(splat) || splat.length > 1) {
      throw new Error('Expects only 1 object entry in splat')
    }
    let entry = splat[0]
    if (entry == null || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error('Expects only 1 object entry in splat')
    }
    if (opts?.redacted === true) {
      const path = entry?.error?.path
      entry = redact(entry)
      if (path != null) {
        if (entry.error?.message != null) {
          entry.error.message = entry.error.message.replace(
            path,
            entry.error.path
          )
        }
        if (entry.error?.stack != null) {
          entry.error.stack = entry.error.stack.replace(path, entry.error.path)
        }
      }
    }

    info.message = format(info.message, entry)
    if (entry.error != null) {
      info.message += ` - ${inspect(entry.error)}`
    }
  }

  return info
})

const logFormat = (redacted?: boolean) => {
  const { combine, timestamp, align, printf } = winston.format
  return combine(
    splatf({ redacted }),
    timestamp(),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  )
}

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: logFormat()
    }),
    new winston.transports.File({
      dirname: getLogsDir(),
      filename: 'server.log',
      maxsize: 2 * 1024 * 1024,
      maxFiles: 5,
      format: logFormat(true)
    })
  ]
})

export default logger

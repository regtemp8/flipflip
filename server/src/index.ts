import express from 'express'
import session from 'express-session'
import path from 'path'
import fs from 'fs'
import os, { type NetworkInterfaceInfo } from 'os'
import { type AddressInfo } from 'net'
import ws from 'ws'
import selfsigned from 'selfsigned'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { getSaveDir, openExternal } from './ipc/MainUtils'
import { handleMessage } from './ipc/IPCEvents'
import { type WebSocketMessage } from 'flipflip-common'
import AppStorage from './ipc/data/AppStorage'
import FileRegistry from './ipc/FileRegistry'
import { createServer } from '@httptoolkit/httpolyglot'
import { generateUsername } from 'unique-username-generator'
import { generate } from 'generate-password'
import bodyParser from 'body-parser'
import yaml from 'js-yaml'

interface ServerConfig {
  host?: string
  port?: number
}

interface Config {
  server?: ServerConfig
  login?: {
    username?: string
    password?: string
  }
}

interface LoginDetails {
  username: string
  password: string
  generated: boolean
}

const defaultHost = '0.0.0.0'

const loadConfig = (): Config => {
  const configContents = fs.readFileSync(
    path.join('config', 'default.yml'),
    'utf-8'
  )
  const config = (yaml.load(configContents) ?? {}) as Config
  if (config.server == null) {
    config.server = {}
  }
  if (config.server.host == null) {
    config.server.host = defaultHost
  }
  if (config.server.port == null) {
    config.server.port = 0
  }

  return config
}

const writePermissions = [true]

const getLoginDetails = (config: Config): LoginDetails => {
  let generated = false
  let username: string
  if (config.login?.username == null) {
    username = generateUsername('-', 2, 20)
    generated = true
  } else {
    username = config.login.username
  }

  let password: string
  if (config.login?.password == null) {
    password = generatePassword()
    generated = true
  } else {
    password = config.login.password
  }

  return { username, password, generated }
}

export const getServerURL = (host = 'localhost'): string => {
  const port = (server.address() as AddressInfo).port
  return `https://${host}:${port}`
}

const getNetworkURLs = (): Record<string, string> => {
  const urls: Record<string, string> = {}
  const interfaces = os.networkInterfaces()
  for (const key of Object.keys(interfaces)) {
    const infos = interfaces[key] as NetworkInterfaceInfo[]
    for (const info of infos) {
      if (info.family === 'IPv4' && !info.internal) {
        urls[key] = getServerURL(info.address)
      }
    }
  }

  return urls
}

const printAllURLs = (localURL: string): void => {
  const space = ' '
  const local = 'Local'
  const networkURLs = getNetworkURLs()
  const networkURLKeys = Object.keys(networkURLs)
  const maxKeyLength =
    Math.max(...networkURLKeys.map((key) => key.length), local.length) + 4

  const lines = [
    `${local}:${space.repeat(maxKeyLength - local.length)}${localURL}`
  ]
  networkURLKeys.forEach((key) => {
    lines.push(
      `${key}:${space.repeat(maxKeyLength - key.length)}${networkURLs[key]}`
    )
  })

  console.log(lines.join('\n'))
}

const generatePassword = (): string => {
  return generate({
    length: 12,
    numbers: true,
    lowercase: true,
    uppercase: true,
    excludeSimilarCharacters: true,
    strict: true
  })
}

const saveDir = getSaveDir()
const privateKeyPath = path.join(saveDir, 'server.key')
const certificatePath = path.join(saveDir, 'server.crt')
let generateCertificate =
  !fs.existsSync(privateKeyPath) || !fs.existsSync(certificatePath)
if (!generateCertificate) {
  const certificate = new crypto.X509Certificate(
    fs.readFileSync(certificatePath, 'utf-8')
  )
  const validTo = new Date(certificate.validTo)
  generateCertificate = new Date().getTime() > validTo.getTime()
}
if (generateCertificate) {
  const attrs = [
    { name: 'commonName', value: 'flipflip.org' },
    { name: 'organizationName', value: 'flipflip' }
  ]
  const opts = {
    keySize: 2048,
    algorithm: 'sha256',
    days: 90
  }
  const pems = selfsigned.generate(attrs, opts)
  fs.writeFileSync(privateKeyPath, pems.private, 'utf-8')
  fs.writeFileSync(certificatePath, pems.cert, 'utf-8')
}

const config = loadConfig()
const loginDetails = getLoginDetails(config)
const sessionParser = session({
  secret: generatePassword(),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
})

const app = express()
app.use(sessionParser)
app.use((req, res, next) => {
  if (!req.secure) {
    res.redirect(301, getServerURL(req.hostname))
    return
  }

  let url = req.url
  if (url.length > 1 && url.charAt(url.length - 1) === '/') {
    url = url.substring(0, url.length - 1)
  }

  const allowedURLs = [
    '/login',
    '/login-theme',
    '/favicon.ico',
    '/static/js/main.b157757c.js',
    '/img/flipflip_logo.png'
  ]
  if (req.session?.authenticated !== true && !allowedURLs.includes(url)) {
    res.redirect(302, '/login')
  } else {
    next()
  }
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, '..', 'public')))
app.get('/file/:uuid', (req, res) => {
  const path = FileRegistry.getInstance().get(req.params.uuid)
  if (path == null) {
    res.status(404).end()
    return
  }
  fs.readFile(path, (err, data) => {
    if (err == null) {
      res.send(data)
    } else {
      res.statusMessage = `${err.name} - ${err.message}`
      res.status(503).end()
    }
  })
})
app.get('/login-theme', (req, res) => {
  const storage = new AppStorage(1)
  res.json(storage.initialState.theme)
})
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'))
})
app.post('/login', (req, res) => {
  bcrypt.compare(req.body.password, loginDetails.password, (err, result) => {
    req.session.authenticated =
      err == null && result && req.body.username === loginDetails.username
    const url = req.session.authenticated ? '/' : '/login'
    res.redirect(url)
  })
})

const privateKey = fs.readFileSync(privateKeyPath, 'utf8')
const certificate = fs.readFileSync(certificatePath, 'utf8')
const options = { key: privateKey, cert: certificate }
const server = createServer(options, app)

const { host, port } = config.server as ServerConfig
server.listen(port, host, () => {
  const allNetworkInterfaces = host === defaultHost
  const url = allNetworkInterfaces ? getServerURL() : getServerURL(host)
  const opened = openExternal(url)
  if (!opened) {
    console.log(`Unsupported platform: ${process.platform}`)
    server.close()
    return
  }

  const logoPath = path.join(__dirname, '..', 'assets', 'logo-ascii.txt')
  console.log(fs.readFileSync(logoPath, 'utf-8'))
  console.log('You can now view FlipFlip in the browser.')
  if (allNetworkInterfaces) {
    printAllURLs(url)
  } else {
    console.log(`URL: ${url}`)
  }

  if (loginDetails.generated) {
    console.log(
      `\nYour login details:\nusername: ${loginDetails.username}\npassword: ${loginDetails.password}`
    )
  }

  bcrypt.hash(loginDetails.password, 10, (err, hash) => {
    if (err == null) {
      loginDetails.password = hash
    } else {
      console.error(err)
      process.exit(1)
    }
  })
})

const wsServer = new ws.Server({ noServer: true })
wsServer.on('connection', (socket: ws.WebSocket, request) => {
  const canWrite = writePermissions.shift() ?? false
  if (canWrite) {
    socket.storage = new AppStorage(1)
  }
  socket.on('close', () => {
    if (socket.storage != null) {
      writePermissions.push(true)
    }
  })
  socket.on('message', (message: ws.RawData) => {
    let buffer: Buffer
    if (message instanceof Buffer) {
      buffer = message
    } else if (message instanceof ArrayBuffer) {
      buffer = Buffer.from(message)
    } else {
      buffer = Buffer.concat(message)
    }

    const text = buffer.toString('utf-8')
    const websocketMessage = JSON.parse(text) as WebSocketMessage
    handleMessage(websocketMessage, socket)
  })
})

server.on('upgrade', (request, socket, head) => {
  const response: any = {}
  sessionParser(request, response, () => {
    if (request.session.authenticated !== true) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    wsServer.handleUpgrade(request, socket, head, (ws) => {
      wsServer.emit('connection', ws, request)
    })
  })
})

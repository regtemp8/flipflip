import fs from 'fs'
import os, { NetworkInterfaceInfo } from 'os'
import path from 'path'
import express, { type Express, RequestHandler } from 'express'
import session from 'express-session'
import yaml from 'js-yaml'
import ws from 'ws'
import { randomUUID } from 'crypto'
import { createServer, Server } from '@httptoolkit/httpolyglot'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import DeviceDetector from 'device-detector-js'
import { SystemConstants, WebSocketMessage } from 'flipflip-common'
import ServerDetails from 'flipflip-server-details/src/ServerDetails'
import App from 'flipflip-client/src/App'
import createEmotionServer from '@emotion/server/create-instance'
import {
  createEmotionCache,
  createReduxStore
} from 'flipflip-client/src/server/renderer'
import { getContext, getServerURL, isLinux, isMacOSX, isWin32 } from './utils'
import AppStorage from './data/AppStorage'
import fileRegistry from './FileRegistry'
import security from './SecurityService'
import webSocketMessage from './websocket/WebSocketMessageService'
import { AddressInfo } from 'net'

interface ServerConfig {
  host?: string
  port?: number
}

interface Config {
  server?: ServerConfig
}

class FlipFlipServer {
  private static readonly DEFAULT_HOST = '0.0.0.0'
  private static readonly SERVER_DETAILS_BUNDLE = '/static/js/main.cada8c62.js'
  private static instance: FlipFlipServer

  private server: Server
  private wsServer: ws.Server
  private sessionParser: RequestHandler
  private writePermissions = [true]

  private constructor() {}

  public static getInstance(): FlipFlipServer {
    if (FlipFlipServer.instance == null) {
      FlipFlipServer.instance = new FlipFlipServer()
    }

    return FlipFlipServer.instance
  }

  private setMasonryProps(constants: SystemConstants, userAgent: string) {
    const detector = new DeviceDetector()
    const result = detector.parse(userAgent)
    switch (result.device.type) {
      case 'tablet':
        constants.masonryDefaultColumns = 2
        constants.masonryDefaultHeight = 800
        break
      case 'desktop':
      case 'television':
        constants.masonryDefaultColumns = 4
        constants.masonryDefaultHeight = 1080
        break
      default:
        constants.masonryDefaultColumns = 1
        constants.masonryDefaultHeight = 800
    }
  }

  private initSessionParser(): RequestHandler {
    return session({
      secret: security().generateSecret(),
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true }
    })
  }

  private initAPI(): Express {
    const api = express()
    api.use(this.sessionParser)
    api.use((req, res, next) => {
      if (!req.secure) {
        const { port } = this.server.address() as AddressInfo
        res.redirect(301, getServerURL(req.hostname, port))
        return
      }

      const url = new URL(req.url, `https://${req.headers.host}`)
      const allowedURLs = [
        '/details',
        '/login',
        '/favicon.ico',
        FlipFlipServer.SERVER_DETAILS_BUNDLE,
        '/img/flipflip_logo.png'
      ]
      if (
        req.session?.authenticated !== true &&
        !allowedURLs.includes(url.pathname)
      ) {
        res.status(401).end()
      } else {
        next()
      }
    })
    api.use(express.static(path.join(__dirname, 'public')))
    api.get('/file/:uuid', (req, res) => {
      const path = fileRegistry().get(req.params.uuid)
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
    api.get('/', (req, res) => {
      const cache = createEmotionCache()
      const { extractCriticalToChunks, constructStyleTagsFromChunks } =
        createEmotionServer(cache)

      const constants = getContext()
      const userAgent = req.headers['user-agent']
      this.setMasonryProps(constants, userAgent)

      const appStorage = new AppStorage(9).initialState
      const store = createReduxStore(appStorage, constants)

      const element = React.createElement(App, { store, cache })
      const renderOutput = ReactDOMServer.renderToString(element)

      const emotionChunks = extractCriticalToChunks(renderOutput)
      const emotionCss = constructStyleTagsFromChunks(emotionChunks)

      const htmlFilePath = path.join(__dirname, 'public', 'client.html')
      fs.readFile(htmlFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Something went wrong:', err)
          return res.status(500).send('Oops, better luck next time!')
        }

        const title = '<title>FlipFlip</title>'
        data = data.replace(title, title + emotionCss)

        const newAppDiv = `<div id="app" class="app">${renderOutput}</div>`
        const appData = `<script>window.flipflipAppStorage = ${JSON.stringify(
          appStorage
        )};window.flipflipConstants = ${JSON.stringify(constants)}</script>`
        data = data.replace(
          '<div id="app" class="app"></div>',
          newAppDiv + appData
        )
        return res.send(data)
      })
    })
    api.get('/details', (req, res) => {
      const storage = new AppStorage(1)
      const theme = storage.initialState.theme
      const nonce = Buffer.from(randomUUID()).toString('base64')
      const element = React.createElement(ServerDetails, { theme, nonce })
      const renderOutput = ReactDOMServer.renderToString(element)
      const htmlFilePath = path.join(__dirname, 'public', 'server-details.html')
      fs.readFile(htmlFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Something went wrong:', err)
          return res.status(500).send('Oops, better luck next time!')
        }

        const scriptTag = `<script defer="defer" src="${FlipFlipServer.SERVER_DETAILS_BUNDLE}"`
        data = data.replace(scriptTag, scriptTag + ` nonce="${nonce}"`)

        const newDetailsDiv = `<div id="details">${renderOutput}</div>`
        const themeData = `<script nonce="${nonce}">window.flipflipTheme = ${JSON.stringify(
          theme
        )}; window.flipflipNonce = '${nonce}'</script>`
        data = data.replace(
          '<div id="details"></div>',
          newDetailsDiv + themeData
        )

        return res
          .setHeader(
            'Content-Security-Policy',
            `default-src 'self'; style-src 'nonce-${nonce}' https://fonts.googleapis.com 'sha256-N/V+KmgnmpQtoPBNwft+a2OHHPzy8+KPWY+ksThFrZ0=' 'unsafe-hashes'; script-src 'nonce-${nonce}'; font-src https://fonts.gstatic.com; object-src 'none'; require-trusted-types-for 'script'; base-uri 'none'`
          )
          .send(data)
      })
    })
    api.get('/login', (req, res) => {
      const token = req.query.token as string
      security()
        .verifyToken(token)
        .then((valid) => {
          req.session.authenticated = valid
          if (valid) {
            res.redirect('/')
          } else {
            res.status(401).end()
          }
        })
    })

    return api
  }

  private loadConfig(): Config {
    const configContents = fs.readFileSync(
      path.join('config', 'default.yml'),
      'utf-8'
    )
    const config = (yaml.load(configContents) ?? {}) as Config
    if (config.server == null) {
      config.server = {}
    }
    if (config.server.host == null) {
      config.server.host = FlipFlipServer.DEFAULT_HOST
    }
    if (config.server.port == null) {
      config.server.port = 0
    }

    return config
  }

  private initWebSocketServer(): ws.Server {
    const wsServer = new ws.Server({ noServer: true })
    wsServer.on('connection', (socket: ws.WebSocket, request) => {
      const canWrite = this.writePermissions.shift() ?? false
      if (canWrite) {
        socket.storage = new AppStorage(1)
      }
      socket.on('close', () => {
        if (socket.storage != null) {
          this.writePermissions.push(true)
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
        webSocketMessage().handle(websocketMessage, socket)
      })
    })

    return wsServer
  }

  public init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sessionParser = this.initSessionParser()
      this.wsServer = this.initWebSocketServer()

      const privateKey = security().readPrivateKey()
      const certificate = security().readCertificate()
      const options = { key: privateKey, cert: certificate }
      this.server = createServer(options, this.initAPI())
      this.server.on('upgrade', (request, socket, head) => {
        const response: any = {}
        this.sessionParser(request, response, () => {
          if (request.session.authenticated !== true) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
            socket.destroy()
            return
          }

          this.wsServer.handleUpgrade(request, socket, head, (ws) => {
            this.wsServer.emit('connection', ws, request)
          })
        })
      })

      const config = this.loadConfig()
      const { host, port } = config.server as ServerConfig
      this.server.listen(port, host, () => {
        if (isWin32 === false && isLinux === false && isMacOSX === false) {
          console.log(`Unsupported platform: ${process.platform}`)
          this.server.close()
          reject()
        } else {
          resolve()
        }
      })
    })
  }

  public getServerURL() {
    const { host } = this.loadConfig().server
    const { port } = this.server.address() as AddressInfo
    const allNetworkInterfaces = host === FlipFlipServer.DEFAULT_HOST
    return allNetworkInterfaces
      ? getServerURL('localhost', port)
      : getServerURL(host, port)
  }

  private getNetworkInterfaceURLs(
    port: number
  ): Array<{ name: string; url: string }> {
    const urls: Array<{ name: string; url: string }> = []
    const interfaces = os.networkInterfaces()
    for (const key of Object.keys(interfaces)) {
      const infos = interfaces[key] as NetworkInterfaceInfo[]
      for (const info of infos) {
        if (info.family === 'IPv4' && !info.internal) {
          urls.push({ name: key, url: getServerURL(info.address, port) })
        }
      }
    }

    return urls
  }

  public getNetworkURLs() {
    const url = this.getServerURL()
    const { host, port } = this.loadConfig().server
    const allNetworkInterfaces = host === FlipFlipServer.DEFAULT_HOST
    const urls: Array<{ name: string; url: string }> = []
    if (allNetworkInterfaces) {
      urls.push({ name: 'Local', url })
      urls.push(...this.getNetworkInterfaceURLs(port))
    } else {
      urls.push({ name: 'Configured URL', url })
    }

    return urls
  }
}

export default function server() {
  return FlipFlipServer.getInstance()
}

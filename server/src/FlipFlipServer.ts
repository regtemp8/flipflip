import fs from 'fs'
import https from 'https'
import os, { NetworkInterfaceInfo } from 'os'
import path from 'path'
import express, { type Express, RequestHandler, Response } from 'express'
import session from 'express-session'
import { randomUUID } from 'crypto'
import { createServer, Server } from '@httptoolkit/httpolyglot'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import DeviceDetector from 'device-detector-js'
import { SystemConstants, isAudio, isVideo } from 'flipflip-common'
import Login from 'flipflip-login/src/Login'
import ServerDetails from 'flipflip-server-details/src/ServerDetails'
import App from 'flipflip-client/src/App'
import createEmotionServer from '@emotion/server/create-instance'
import {
  createEmotionCache,
  createReduxStore
} from 'flipflip-client/src/server/renderer'
import {
  getContext,
  getSaveDir,
  getServerURL,
  isLinux,
  isMacOSX,
  isWin32
} from './utils'
import AppStorage from './data/AppStorage'
import fileRegistry from './FileRegistry'
import security from './SecurityService'
import { AddressInfo } from 'net'
import webSocketServer from './FlipFlipWebSocketServer'
import {
  ServerSettings,
  initialServerSettings
} from 'flipflip-common/build/main/lib/storage/ServerSettings'

class FlipFlipServer {
  private static instance: FlipFlipServer

  private server: Server
  private sessionParser: RequestHandler
  private readonly defaultHost
  private readonly loginBundle
  private readonly serverDetailsBundle

  private constructor() {
    this.defaultHost = '0.0.0.0'
    this.loginBundle = '/static/js/main.dbd4deaf.js'
    this.serverDetailsBundle = '/static/js/main.34d1f89f.js'
  }

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

  private calcVideoChunkSize(userAgent: string) {
    const detector = new DeviceDetector()
    const result = detector.parse(userAgent)
    switch (result.device.type) {
      case 'tablet':
        return 768 * 1024
      case 'desktop':
      case 'television':
        return 1024 * 1024
      default:
        return 256 * 1024
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

  private getContentType(path: string): string {
    const contentTypes = new Map<string, string>()
    contentTypes.set('.txt', 'text/plain')
    contentTypes.set('.mp3', 'audio/mpeg')
    contentTypes.set('.m4a', 'audio/mp4')
    contentTypes.set('.wav', 'audio/wav')
    contentTypes.set('.ogg', 'audio/ogg')
    contentTypes.set('.gif', 'image/gif')
    contentTypes.set('.png', 'image/png')
    contentTypes.set('.jpeg', 'image/jpeg')
    contentTypes.set('.jpg', 'image/jpeg')
    contentTypes.set('.webp', 'image/webp')
    contentTypes.set('.avif', 'image/avif')
    contentTypes.set('.tiff', 'image/tiff')
    contentTypes.set('.svg', 'image/svg+xml')
    contentTypes.set('.mp4', 'video/mp4')
    contentTypes.set('.mkv', 'video/matroska')
    contentTypes.set('.webm', 'video/webm')
    contentTypes.set('.ogv', 'video/ogg')
    contentTypes.set('.mov', 'video/quicktime')
    contentTypes.set('.m4v', 'video/mp4')
    contentTypes.set('.asx', 'video/x-ms-asf')
    contentTypes.set('.m3u8', 'application/x-mpegURL')
    contentTypes.set('.pls', 'audio/x-scpls')
    contentTypes.set('.xspf', 'application/xspf+xml')

    const ext = path.substring(path.lastIndexOf('.'))
    return contentTypes.get(ext) ?? 'application/octet-stream'
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
      if (process.env.NODE_ENV === 'development') {
        // code in this block is not included in webpack production build
        if (process.env.DEV === 'true') {
          req.session.authenticated = true
        }
      }

      const url = new URL(req.url, `https://${req.headers.host}`)
      const allowedURLs = [
        '/details',
        '/login/code',
        '/login/token',
        '/favicon.ico',
        this.loginBundle,
        this.serverDetailsBundle,
        '/img/flipflip_logo.png'
      ]
      if (
        req.session?.authenticated !== true &&
        !allowedURLs.includes(url.pathname)
      ) {
        if (url.pathname === '/') {
          res.redirect('/login/code')
        } else {
          res.status(401).end()
        }
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

      const supportsRange = isVideo(path, true) || isAudio(path, true)
      const { size } = fs.statSync(path)
      let start = 0
      let end = size - 1
      let status = 200
      if (supportsRange && req.headers.range != null) {
        status = 206
        const range = req.headers.range
          .replace(/bytes=/, '')
          .split('-')
          .map((value) => parseInt(value, 10))
          .filter((value) => !isNaN(value))

        const userAgent = req.headers['user-agent']
        const chunk = this.calcVideoChunkSize(userAgent)
        start = range[0]
        end = range.length === 2 ? range[1] : Math.min(start + chunk, end)
        if (start < 0 || start >= size || end >= size || start > end) {
          res.appendHeader('Content-Range', `bytes */${size}`).status(416).end()
          return
        } else {
          res.appendHeader('Content-Range', `bytes ${start}-${end}/${size}`)
        }
      }
      if (supportsRange) {
        res.appendHeader('Accept-Ranges', 'bytes')
      }

      const contentType = this.getContentType(path)
      res
        .appendHeader('Content-Type', contentType)
        .appendHeader('Content-Length', `${end - start + 1}`)
        .status(status)

      fs.createReadStream(path, { start, end }).pipe(res)
    })
    api.get('/nimja/visual/:id', (req, res) => {
      const baseURL = 'https://hypno.nimja.com'
      const url = req.originalUrl.replace('/nimja', baseURL)
      https
        .get(url, (response) => {
          const data: Uint8Array[] = []
          response.on('data', (chunk) => {
            data.push(chunk)
          })

          response.on('end', () => {
            let html = Buffer.concat(data).toString()
            html = html.replace('<head>', `<head><base href="${baseURL}/">`)
            html = html.replace(
              '<link rel="manifest" href="/site.webmanifest">',
              ''
            )
            res
              .appendHeader('Content-Type', 'text/html')
              .status(200)
              .send(html)
              .end()
          })
        })
        .on('error', (error) => {
          res.statusMessage = `${error.name} - ${error.message}`
          res.status(503).end()
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

        const scriptTag = `<script defer="defer" src="${this.serverDetailsBundle}"`
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
    api.get('/login/code', async (req, res) => {
      const storage = new AppStorage(1)
      const theme = storage.initialState.theme
      const nonce = Buffer.from(randomUUID()).toString('base64')
      const element = React.createElement(Login, { theme, nonce })
      const renderOutput = ReactDOMServer.renderToString(element)
      const htmlFilePath = path.join(__dirname, 'public', 'login.html')
      fs.readFile(htmlFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Something went wrong:', err)
          return res.status(500).send('Oops, better luck next time!')
        }

        const scriptTag = `<script defer="defer" src="${this.loginBundle}"`
        data = data.replace(scriptTag, scriptTag + ` nonce="${nonce}"`)

        const newLoginDiv = `<div id="login">${renderOutput}</div>`
        const themeData = `<script nonce="${nonce}">window.flipflipTheme = ${JSON.stringify(
          theme
        )}; window.flipflipNonce = '${nonce}'</script>`
        data = data.replace('<div id="login"></div>', newLoginDiv + themeData)

        return res
          .setHeader(
            'Content-Security-Policy',
            `default-src 'self'; style-src 'nonce-${nonce}' https://fonts.googleapis.com 'sha256-N/V+KmgnmpQtoPBNwft+a2OHHPzy8+KPWY+ksThFrZ0=' 'unsafe-hashes'; script-src 'nonce-${nonce}'; font-src https://fonts.gstatic.com; object-src 'none'; require-trusted-types-for 'script'; base-uri 'none'`
          )
          .send(data)
      })
    })
    api.get('/login/token', (req, res) => {
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

  private loadConfig(): ServerSettings {
    return (
      new AppStorage(1).initialState.config.serverSettings ??
      initialServerSettings
    )
  }

  public init(listener: () => void) {
    const saveDir = getSaveDir()
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true })
    }

    this.sessionParser = this.initSessionParser()
    webSocketServer().init({ noServer: true })

    security().generateCertificates()
    const privateKey = security().readPrivateKey()
    const certificate = security().readCertificate()
    const options = { key: privateKey, cert: certificate }
    this.server = createServer(options, this.initAPI())
    this.server.on('upgrade', (request, socket, head) => {
      const response = {} as Response
      this.sessionParser(request, response, () => {
        if (request.url === '/flipflip') {
          let unauthorized = request.session.authenticated !== true
          if (process.env.NODE_ENV === 'development') {
            // code in this block is not included in webpack production build
            if (process.env.DEV === 'true') {
              unauthorized = false
            }
          }
          if (unauthorized) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
            socket.destroy()
            return
          }
        }

        webSocketServer().handleUpgrade(request, socket, head)
      })
    })

    const { host, port } = this.loadConfig()
    this.server.listen(port, host, () => {
      if (isWin32 === false && isLinux === false && isMacOSX === false) {
        console.log(`Unsupported platform: ${process.platform}`)
        this.server.close()
      } else {
        listener()
      }
    })
  }

  public getServerURL() {
    const { host } = this.loadConfig()
    const { port } = this.server.address() as AddressInfo
    const allNetworkInterfaces = host === this.defaultHost
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
    const { host, port } = this.loadConfig()
    const allNetworkInterfaces = host === this.defaultHost
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

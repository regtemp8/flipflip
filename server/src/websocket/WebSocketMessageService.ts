import fs from 'fs'
import type ws from 'ws'
import { move, outputFile } from 'fs-extra'
import { parseBuffer, parseFile } from 'music-metadata'
import rimraf from 'rimraf'
import { cleanBackups, getBackups } from '../data/Backup'
import fontList from 'font-list'
import recursiveReaddir from 'recursive-readdir'
import {
  cachePath,
  getFilesRecursively,
  generateThumbnailFile,
  getContext,
  isWin32,
  isMacOSX
} from '../utils'
import getFolderSize from 'get-folder-size'
import {
  type Config,
  type WebSocketMessage,
  isText,
  filterPathsToJustPlayable,
  isAudio,
  isImage,
  isVideo,
  isVideoPlaylist,
  urlToPath,
  IF,
  IPC
} from 'flipflip-common'
import AppStorage from '../data/AppStorage'
import SystemFonts from 'system-font-families'
import fileRegistry from '../FileRegistry'
import windowManager from '../WindowManager'
import server from '../FlipFlipServer'
import fileUrl from 'file-url'

type WebSocketMessageHandler = (
  msg: WebSocketMessage,
  socket: ws.WebSocket
) => Promise<any[]>

class WebSocketMessageService {
  private static instance: WebSocketMessageService

  private handlers: Record<string, WebSocketMessageHandler>

  private constructor() {
    this.handlers = {}
    this.handlers[IPC.getWindowId] = this.getWindowId
    this.handlers[IPC.appStorageInitialState] = this.getAppStorageInitialState
    this.handlers[IPC.appStorageSave] = this.saveAppStorage
    this.handlers[IPC.appStorageBackup] = this.backupAppStorage
    this.handlers[IPC.getBackups] = this.getBackups
    this.handlers[IPC.cleanBackups] = this.cleanBackups
    this.handlers[IPC.openJsonFile] = this.openJsonFile
    this.handlers[IPC.openSubtitleFile] = this.openSubtitleFile
    this.handlers[IPC.openTextFile] = this.openTextFile
    this.handlers[IPC.openDirectory] = this.openDirectory
    this.handlers[IPC.openDirectories] = this.openDirectories
    this.handlers[IPC.openVideos] = this.openVideos
    this.handlers[IPC.saveTextFile] = this.saveTextFile
    this.handlers[IPC.saveJsonFile] = this.saveJsonFile
    this.handlers[IPC.readTextFile] = this.readTextFile
    this.handlers[IPC.readBinaryFile] = this.readBinaryFile
    this.handlers[IPC.showItemInFolder] = this.showItemInFolder
    this.handlers[IPC.loadThumb] = this.loadThumbnail
    this.handlers[IPC.loadAudioSources] = this.loadAudioSources
    this.handlers[IPC.loadScriptSources] = this.loadScriptSources
    this.handlers[IPC.loadVideoSources] = this.loadVideoSources
    this.handlers[IPC.cachePath] = this.getCachePath
    this.handlers[IPC.pathExists] = this.pathExists
    this.handlers[IPC.deletePath] = this.deletePath
    this.handlers[IPC.mkdir] = this.makeDirectory
    this.handlers[IPC.writeFile] = this.writeFile
    this.handlers[IPC.hasFiles] = this.hasFiles
    this.handlers[IPC.getDirectories] = this.getDirectories
    this.handlers[IPC.unlink] = this.unlinkPath
    this.handlers[IPC.readdir] = this.readDirectory
    this.handlers[IPC.move] = this.moveFile
    this.handlers[IPC.outputFile] = this.outputFile
    this.handlers[IPC.getFolderSize] = this.getFolderSize
    this.handlers[IPC.getSystemFonts] = this.getSystemFonts
    this.handlers[IPC.parseMusicMetadataFile] = this.parseMusicMetadataFile
    this.handlers[IPC.parseMusicMetadataBpm] = this.parseMusicMetadataBpm
    this.handlers[IPC.parseMusicMetadataBuffer] = this.parseMusicMetadataBuffer
    this.handlers[IPC.rimrafSync] = this.rimrafSync
    // this.handlers[IPC.tumblrOAuth] = getTumblrOAuth
    // this.handlers[IPC.twitterOAuth] = getTwitterOAuth
    // this.handlers[IPC.redditOAuth] = getRedditOAuth
    this.handlers[IPC.getFileUrl] = this.getFileUrl
    this.handlers[IPC.recursiveReaddir] = this.recursiveReadDirectory
    this.handlers[IPC.getContext] = this.getContext
    // this.handlers[IPC.loadInWorker] = getLoadInWorker
    // this.handlers[IPC.workerSendMessage] = getWorkerSendMessage

    // const imgurClient = new ImgurClient()
    // const instagramClient = new InstagramClient()
    // const redditClient = new RedditClient()
    // const tumblrClient = new TumblrClient()
    // const twitterClient = new TwitterClient()

    // imgurClient.initializeIpcEvents(ipcMain)
    // instagramClient.initializeIpcEvents(ipcMain)
    // redditClient.initializeIpcEvents(ipcMain)
    // tumblrClient.initializeIpcEvents(ipcMain)
    // twitterClient.initializeIpcEvents(ipcMain)
  }

  public static getInstance(): WebSocketMessageService {
    if (WebSocketMessageService.instance == null) {
      WebSocketMessageService.instance = new WebSocketMessageService()
    }

    return WebSocketMessageService.instance
  }

  private async getWindowId(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return await new Promise((resolve) => {
      const id = socket.storage != null ? 1 : 9
      resolve([id])
    })
  }

  private async getAppStorageInitialState(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return await new Promise((resolve) => {
      const storage = socket.storage ?? new AppStorage(9)
      resolve([storage.initialState])
    })
  }

  private async saveAppStorage(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    if (socket.storage != null) {
      const state = message.args[0]
      return await socket.storage.save(state, false).then(
        (saved) => [saved],
        () => []
      )
    } else {
      return await Promise.resolve([])
    }
  }

  private async backupAppStorage(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return await new Promise((resolve) => {
      if (socket.storage != null) {
        const state = message.args[0]
        socket.storage.backup(state)
      }

      resolve([])
    })
  }

  private async openJsonFile(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return windowManager()
      .openJsonFile()
      .then(
        (file) => [file],
        () => []
      )
  }

  private async openSubtitleFile(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return windowManager()
      .openSubtitleFile()
      .then(
        (file) => [file],
        () => []
      )
  }

  private async openTextFile(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return windowManager()
      .openTextFile()
      .then(
        (file) => [file],
        () => []
      )
  }

  private async openTextFiles(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return windowManager()
      .openTextFiles()
      .then(
        (file) => [file],
        () => []
      )
  }

  private async openAudioFiles(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return windowManager()
      .openAudioFiles()
      .then(
        (file) => [file],
        () => []
      )
  }

  private async openDirectory(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return windowManager()
      .openDirectory()
      .then(
        (dir) => [dir],
        () => []
      )
  }

  private async openDirectories(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return windowManager()
      .openDirectories()
      .then(
        (dirs) => [dirs],
        () => []
      )
  }

  private async openVideos(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return windowManager()
      .openVideos()
      .then(
        (files) => [files],
        () => []
      )
  }

  private async saveTextFile(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const defaultPath = message.args[0] as string
    const filePath = await windowManager().saveTextFile(defaultPath)
    if (filePath != null) {
      const text = message.args[1] as string
      await fs.promises.writeFile(filePath, text, 'utf-8')
    }
  
    return [filePath]
  }

  private async saveJsonFile(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const defaultPath = message.args[0] as string
    const filePath = await windowManager().saveJsonFile(defaultPath)
    if (filePath != null) {
      const text = message.args[1] as string
      await fs.promises.writeFile(filePath, text, 'utf-8')
    }

    return [filePath]
  }

  private async readTextFile(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    return await fs.promises.readFile(path, 'utf-8').then(
      (text) => [text],
      () => []
    )
  }

  private async readBinaryFile(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    return await fs.promises.readFile(path).then(
      (buffer) => [buffer],
      () => []
    )
  }

  private async showItemInFolder(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return await new Promise((resolve) => {
      const source = message.args[0] as string
      if (fs.existsSync(source)) {
        windowManager().openExternal(source)
      }

      resolve([])
    })
  }

  private async loadThumbnail(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return windowManager()
      .openImageFiles()
      .then((files) => files.filter((i) => isImage(i, true)))
      .then(async (files) => {
        return files.length > 0
          ? await fs.promises.readFile(files[0])
          : undefined
      })
      .then((data) => {
        const cachePath = message.args[0] as string
        const thumb =
          data != null ? generateThumbnailFile(cachePath, data) : undefined

        return [thumb]
      })
  }

  private async loadAudioSources(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    let promise: Promise<any[]>
    if (message.args[0] != null) {
      promise = this.openDirectories(message, socket).then((dirs) => {
        const audioSources: string[] = []
        for (const path of dirs) {
          if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
            audioSources.push(...getFilesRecursively(path))
          } else {
            audioSources.push(path)
          }
        }

        return audioSources
      })
    } else {
      promise = this.openAudioFiles(message, socket)
    }
    return await promise.then((sources) =>
      sources.filter((r) => isAudio(r, true))
    )
  }

  private async loadScriptSources(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    let promise: Promise<any[]>
    if (message.args[0] != null) {
      promise = this.openDirectories(message, socket).then((dirs) => {
        const scriptSources: string[] = []
        for (const path of dirs) {
          if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
            scriptSources.push(...getFilesRecursively(path))
          } else {
            scriptSources.push(path)
          }
        }

        return scriptSources
      })
    } else {
      promise = this.openTextFiles(message, socket)
    }

    return await promise.then((sources) =>
      sources.filter((r) => isText(r, true))
    )
  }

  private async loadVideoSources(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return await this.openDirectories(message, socket).then((vdResult) => {
      const rvResult: string[] = []
      for (const path of vdResult) {
        if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
          rvResult.push(...getFilesRecursively(path))
        } else {
          rvResult.push(path)
        }
      }

      return rvResult.filter(
        (r) => isVideo(r, true) || isVideoPlaylist(r, true)
      )
    })
  }

  private async getBackups(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return await Promise.resolve(getBackups())
  }

  private async getCachePath(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return await new Promise((resolve) => {
      const baseDir = message.args[0] as string
      const source =
        message.args.length >= 2 ? (message.args[1] as string) : undefined
      const typeDir =
        message.args.length >= 3 ? (message.args[2] as string) : undefined
      const path = cachePath(baseDir, source, typeDir)
      resolve([path])
    })
  }

  private async pathExists(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return await new Promise((resolve) => {
      const path = message.args[0] as string
      const exists = fs.existsSync(path)
      resolve([exists])
    })
  }

  private async deletePath(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    return await fs.promises.unlink(path).then(
      () => [],
      () => []
    )
  }

  private async makeDirectory(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    return await fs.promises.mkdir(path).then(
      () => [],
      () => []
    )
  }

  private async writeFile(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    const text = message.args[1] as string
    return await fs.promises.writeFile(path, text).then(
      () => [],
      () => []
    )
  }

  private async hasFiles(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return await new Promise((resolve) => {
      const path = message.args[0] as string
      const hasFiles = fs.existsSync(path) && fs.readdirSync(path).length > 0
      resolve([hasFiles])
    })
  }

  private async getDirectories(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    return await fs.promises.readdir(path, { withFileTypes: true }).then(
      (dirs) => {
        return dirs
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => dirent.name)
      },
      () => []
    )
  }

  private async unlinkPath(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    return await fs.promises.unlink(path).then(
      () => [],
      () => []
    )
  }

  private async readDirectory(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    return await fs.promises.readdir(path)
  }

  private async moveFile(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const from = message.args[0] as string
    const to = message.args[1] as string
    return await move(from, to).then(
      () => [],
      () => []
    )
  }

  private async outputFile(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    const output = message.args[1]
    const data =
      typeof output === 'string'
        ? (output as string)
        : Buffer.from(
            output as
              | WithImplicitCoercion<string>
              | { [Symbol.toPrimitive](hint: 'string'): string }
          )

    return await outputFile(path, data).then(
      () => [],
      () => []
    )
  }

  private async getFolderSize(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    return await getFolderSize.loose(path).then(
      (size) => [size],
      () => [undefined]
    )
  }

  private async getSystemFonts(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    if (isMacOSX) {
      return await new SystemFonts().getFonts().then(
        (fonts: string[]) => [fonts],
        () => []
      )
    } else {
      return await fontList.getFonts().then(
        (fonts) => {
          fonts = fonts.map((r: string) => {
            if (r.startsWith('"') && r.endsWith('"')) {
              r = r.substring(1, r.length - 1)
            }

            return r
          })

          return [fonts]
        },
        () => []
      )
    }
  }

  private async parseMusicMetadataFile(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const url = message.args[0] as string
    const cachePath = message.args[1] as string
    return await parseFile(url).then((metadata) => [
      this.extractMusicMetadata(metadata, cachePath)
    ])
  }

  private async parseMusicMetadataBpm(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const url = message.args[0] as string
    return await parseFile(url).then((metadata) => [metadata?.common?.bpm])
  }

  private async parseMusicMetadataBuffer(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const bufferJSON = message.args[0] as
      | WithImplicitCoercion<string>
      | { [Symbol.toPrimitive](hint: 'string'): string }
    const cachePath = message.args[1] as string
    return await parseBuffer(Buffer.from(bufferJSON)).then((metadata) => [
      this.extractMusicMetadata(metadata, cachePath)
    ])
  }

  private extractMusicMetadata(metadata: any, cachePath: string): any {
    const audio: any = {}
    if (metadata.common != null) {
      if (metadata.common.title != null) {
        audio.name = metadata.common.title
      }
      if (metadata.common.album != null) {
        audio.album = metadata.common.album
      }
      if (metadata.common.artist != null) {
        audio.artist = metadata.common.artist
      }
      if (
        metadata.common.picture != null &&
        metadata.common.picture.length > 0
      ) {
        audio.thumb = generateThumbnailFile(
          cachePath,
          metadata.common.picture[0].data
        )
      }
      if (metadata.common.track?.no != null) {
        audio.trackNum = parseInt(metadata.common.track.no)
      }
      if (metadata.common.bpm != null) {
        audio.bpm = parseFloat(metadata.common.bpm)
      }
    }
    if (metadata.format?.duration != null) {
      audio.duration = metadata.format.duration
    }

    return audio
  }

  private async rimrafSync(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    return await Promise.resolve([rimraf.sync(path)])
  }

  private async cleanBackups(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return await new Promise((resolve) => {
      try {
        const config = message.args[0] as Config
        cleanBackups(config)
      } catch (err) {
        console.error(err)
      }

      resolve([])
    })
  }

  // async function getTumblrOAuth (
  //   message: WebSocketMessage
  // ) {
  //   const requestTokenUrl = message.args[0]
  //   const accessTokenUrl = message.args[1]
  //   const tumblrKey = message.args[2]
  //   const tumblrSecret = message.args[3]
  //   const authorizeUrl = message.args[4]

  //   return await new Promise((resolve, reject) => {
  //     const oauth = new OAuth(
  //       requestTokenUrl,
  //       accessTokenUrl,
  //       tumblrKey,
  //       tumblrSecret,
  //       '1.0A',
  //       'http://localhost:65010',
  //       'HMAC-SHA1'
  //     )

  //     const sharedSecret = ''
  //     // oauth.getOAuthRequestToken(
  //     //   (
  //     //     err: { statusCode: number, data: string },
  //     //     token: string,
  //     //     secret: string
  //     //   ) => {
  //     //     if (err) {
  //     //       reject(err)
  //     //       if (server) {
  //     //         server.close()
  //     //       }
  //     //       return
  //     //     }

  //     //     sharedSecret = secret
  //     //
  //     //     getOpenExternal(ev, authorizeUrl + '?oauth_token=' + token)
  //     //   }
  //     // )

  //     // Start a server to listen for Tumblr OAuth response
  //     const server = http
  //       .createServer((req, res) => {
  //         // Can't seem to get electron to properly return focus to FlipFlip, just alert the user in the response
  //         const html =
  //           '<html><body><h1>Please return to FlipFlip</h1></body></html>'
  //         res.writeHead(200, { 'Content-Type': 'text/html' })
  //         res.write(html)

  //         const url = req.url ?? ''
  //         if (!url.endsWith('favicon.ico')) {
  //           if (url.includes('oauth_token') && url.includes('oauth_verifier')) {
  //             const args = url.replace('/?', '').split('&')
  //             const oauthToken = args[0].substring(12)
  //             const oauthVerifier = args[1].substring(15)

  //             oauth.getOAuthAccessToken(
  //               oauthToken,
  //               sharedSecret,
  //               oauthVerifier,
  //               (err: any, token: string, secret: string) => {
  //                 if (err != null) {
  //                   reject(err)
  //                   server?.close()
  //                   req.socket.destroy()
  //                   res.end()
  //                   return
  //                 }

  //                 resolve({ token, secret })
  //                 server?.close()
  //                 req.socket.destroy()
  //               }
  //             )
  //           } else {
  //             reject(new Error('Access Denied'))
  //             server?.close()
  //             req.socket.destroy()
  //           }
  //         }
  //         res.end()
  //       })
  //       .listen(65010)
  //   })
  // }

  // async function getTwitterOAuth (
  //   message: WebSocketMessage
  // ) {
  //   const requestTokenUrl = message.args[0]
  //   const accessTokenUrl = message.args[1]
  //   const consumerKey = message.args[2]
  //   const consumerSecret = message.args[3]
  //   const authorizeUrl = message.args[4]

  //   return await new Promise((resolve, reject) => {
  //     const oauth = new OAuth(
  //       requestTokenUrl,
  //       accessTokenUrl,
  //       consumerKey,
  //       consumerSecret,
  //       '1.0A',
  //       'http://localhost:65011',
  //       'HMAC-SHA1'
  //     )

  //     const sharedSecret = ''
  //     // oauth.getOAuthRequestToken(
  //     //   (
  //     //     err: { statusCode: number, data: string },
  //     //     token: string,
  //     //     secret: string
  //     //   ) => {
  //     //     if (err) {
  //     //       reject(err)
  //     //       if (server) {
  //     //         server.close()
  //     //       }

  //     //       return
  //     //     }

  //     //     sharedSecret = secret
  //     //     getOpenExternal(ev, authorizeUrl + '?oauth_token=' + token)
  //     //   }
  //     // )

  //     // Start a server to listen for Twitter OAuth response
  //     const server = http
  //       .createServer((req, res) => {
  //         // Can't seem to get electron to properly return focus to FlipFlip, just alert the user in the response
  //         const html =
  //           '<html><body><h1>Please return to FlipFlip</h1></body></html>'
  //         res.writeHead(200, { 'Content-Type': 'text/html' })
  //         res.write(html)

  //         const url = req.url ?? ''
  //         if (!url.endsWith('favicon.ico')) {
  //           if (url.includes('oauth_token') && url.includes('oauth_verifier')) {
  //             const args = url.replace('/?', '').split('&')
  //             const oauthToken = args[0].substring(12)
  //             const oauthVerifier = args[1].substring(15)

  //             oauth.getOAuthAccessToken(
  //               oauthToken,
  //               sharedSecret,
  //               oauthVerifier,
  //               (err: any, token: string, secret: string) => {
  //                 if (err != null) {
  //                   reject(err)
  //                   server?.close()
  //                   req.socket.destroy()
  //                   res.end()
  //                   return
  //                 }

  //                 resolve({ token, secret })
  //                 server?.close()
  //                 req.socket.destroy()
  //               }
  //             )
  //           } else {
  //             reject(new Error('Access Denied'))
  //             server?.close()
  //             req.socket.destroy()
  //           }
  //         }
  //         res.end()
  //       })
  //       .listen(65011)
  //   })
  // }

  // async function getRedditOAuth (
  //   message: WebSocketMessage
  // ): Promise<any[]> {
  //   const deviceID = message.args[0]
  //   const userAgent = message.args[1]
  //   const clientID = message.args[2]

  //   return await new Promise((resolve, reject) => {
  //     // Start a server to listen for Reddit OAuth response
  //     const server = http
  //       .createServer((req, res) => {
  //         // Can't seem to get electron to properly return focus to FlipFlip, just alert the user in the response
  //         const html =
  //           '<html><body><h1>Please return to FlipFlip</h1></body></html>'
  //         res.writeHead(200, { 'Content-Type': 'text/html' })
  //         res.write(html)

  //         const url = req.url ?? ''
  //         if (!url.endsWith('favicon.ico')) {
  //           if (url.includes('state') && url.includes('code')) {
  //             const args = url.replace('/?', '').split('&')
  //             // This should be the same as the deviceID
  //             const state = args[0].substring(6)
  //             if (state === deviceID) {
  //               // This is what we use to get our token
  //               const code = args[1].substring(5)
  //               wretch('https://www.reddit.com/api/v1/access_token')
  //                 .addon(FormDataAddon)
  //                 .headers({
  //                   'User-Agent': userAgent,
  //                   Authorization: 'Basic ' + btoa(clientID + ':')
  //                 })
  //                 .formData({
  //                   grant_type: 'authorization_code',
  //                   code,
  //                   redirect_uri: 'http://localhost:65012'
  //                 })
  //                 .post()
  //                 .json((json: any) => {
  //                   resolve(json)
  //                   server.close()
  //                   req.connection.destroy()
  //                 })
  //                 .catch((e: any) => {
  //                   reject(e)
  //                   server.close()
  //                   req.connection.destroy()
  //                   res.end()
  //                 })
  //             }
  //           } else if (url.includes('state') && url.includes('error')) {
  //             const args = url.replace('/?', '').split('&')
  //             // This should be the same as the deviceID
  //             const state = args[0].substring(6)
  //             if (state === deviceID) {
  //               const error = args[1].substring(6)
  //               reject(new Error(error))
  //             }

  //             server.close()
  //             req.socket.destroy()
  //           }
  //         }
  //         res.end()
  //       })
  //       .listen(65012)
  //   })
  // }

  private getFileUrl(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const path = message.args[0] as string
    return Promise.resolve([fileUrl(path)])
  }

  private async recursiveReadDirectory(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    const url = message.args[0] as string
    const blacklist = message.args[1] as string[]
    const sourceBlacklist = message.args[2] as string[]
    const filter = message.args[3] as string
    const local = message.args[4] as boolean

    return await recursiveReaddir(url, blacklist)
      .then((rawFiles: string[]) => {
        const collator = new Intl.Collator(undefined, {
          numeric: true,
          sensitivity: 'base'
        })
        let sources: string[] = filterPathsToJustPlayable(
          filter,
          rawFiles,
          true
        )
          .map((p: string) => fileUrl(p))
          .sort((a: string, b: string) => collator.compare(a, b))

        if (sourceBlacklist != null && sourceBlacklist.length > 0) {
          sources = sources.filter(
            (url: string) =>
              !sourceBlacklist.includes(url) &&
              !sourceBlacklist.includes(urlToPath(url, isWin32))
          )
        }

        const serverURL = server().getServerURL()
        sources = sources.map((url) => {
          const uuid = fileRegistry().set(url)
          return `${serverURL}/file/${uuid}`
        })

        const count = local
          ? filterPathsToJustPlayable(IF.any, rawFiles, true).length
          : undefined
        return [{ sources, count }]
      })
      .catch(() => {
        return [{ sources: [], count: 0 }]
      })
  }

  private async getContext(
    message: WebSocketMessage,
    socket: ws.WebSocket
  ): Promise<any[]> {
    return await new Promise((resolve) => {
      resolve([getContext()])
    })
  }

  // function getLoadInWorker (message: WebSocketMessage) {
  //   const event = message.args[0]
  //   const args = message.args[1]
  //   // loadInWorker(event, args, ev.sender.id)
  // }

  // function getWorkerSendMessage (
  //   message: WebSocketMessage
  // ) {
  //   const webContentsId = message.args[0]
  //   const data = message.args[1]
  //   workerResponse(webContentsId, data)
  // }

  public handle(message: WebSocketMessage, socket: ws.WebSocket): void {
    const handler = this.handlers[message.operation]
    if (handler != null) {
      handler(message, socket)
        .then((args) => {
          if (args.length > 0) {
            const response: WebSocketMessage = {
              operation: message.operation,
              correlationID: message.messageID,
              args
            }

            socket.send(JSON.stringify(response))
          }
        })
        .catch((err) => {
          console.error(err)
        })
    } else {
      console.log('UNHANDLED MSG: ' + message.operation)
    }
  }
}

export default function webSocketMessage() {
  return WebSocketMessageService.getInstance()
}

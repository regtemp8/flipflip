import fs from 'fs'
import type ws from 'ws'
import { move, outputFile } from 'fs-extra'
import { parseBuffer, parseFile } from 'music-metadata'
import rimraf from 'rimraf'
import { cleanBackups, getBackups } from './data/Backup'
import fontList from 'font-list'
import recursiveReaddir from 'recursive-readdir'
import {
  cachePath,
  getFilesRecursively,
  generateThumbnailFile,
  getContext,
  isWin32,
  isMacOSX,
  openExternal
} from './MainUtils'
import getFolderSize from 'get-folder-size'
import {
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
import AppStorage from './data/AppStorage'
import FileRegistry from './FileRegistry'
import { getServerURL } from '..'
import SystemFonts from 'system-font-families'
import fileUrl from 'file-url'
import * as fileDialog from 'popups-file-dialog'

async function onRequestWindowId (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await new Promise((resolve) => {
    const id = socket.storage != null ? 1 : 9
    resolve([id])
  })
}

async function onRequestAppStorageInitialState (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await new Promise((resolve) => {
    const storage = socket.storage ?? new AppStorage(9)
    resolve([storage.initialState])
  })
}

async function onRequestAppStorageSave (
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

async function onRequestAppStorageBackup (
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

async function onRequestOpenJsonFile (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return fileDialog
    .openFile({
      title: 'Open JSON File',
      filterPatterns: ['*.json', '*'],
      filterPatternsDescription: 'JSON files',
      allowMultipleSelects: false
    })
    .then(
      (files: string[]) => files,
      () => []
    )
}

async function onRequestOpenSubtitleFile (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return fileDialog
    .openFile({
      title: 'Open Subtitle File',
      filterPatterns: ['*.vtt', '*'],
      filterPatternsDescription: 'Subtitle files',
      allowMultipleSelects: false
    })
    .then(
      (files: string[]) => files,
      () => []
    )
}

async function onRequestOpenTextFile (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return fileDialog
    .openFile({
      title: 'Open Text File',
      filterPatterns: ['*.txt', '*'],
      filterPatternsDescription: 'Text files',
      allowMultipleSelects: false
    })
    .then(
      (files: string[]) => files,
      () => []
    )
}

async function openTextFiles (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return fileDialog
    .openFile({
      title: 'Open Text Files',
      filterPatterns: ['*.txt', '*'],
      filterPatternsDescription: 'Text files',
      allowMultipleSelects: true
    })
    .then(
      (files: string[]) => files,
      () => []
    )
}

async function openAudioFiles (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return fileDialog
    .openFile({
      title: 'Open Audio Files',
      filterPatterns: ['*.mp3', '*.m4a', '*.wav', '*.ogg', '*'],
      filterPatternsDescription: 'Audio files',
      allowMultipleSelects: true
    })
    .then(
      (files: string[]) => files,
      () => []
    )
}

async function openImageFile (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return fileDialog
    .openFile({
      title: 'Open Image Files',
      filterPatterns: [
        '*.gif',
        '*.png',
        '*.jpeg',
        '*.jpg',
        '*.webp',
        '*.tiff',
        '*.svg'
      ],
      filterPatternsDescription: 'Image files',
      allowMultipleSelects: false
    })
    .then(
      (files: string[]) => files,
      () => []
    )
}

async function onRequestOpenDirectory (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return fileDialog
    .openDirectory({
      title: 'Open Directory',
      allowMultipleSelects: false
    })
    .then(
      (files: string[]) => files,
      () => []
    )
}

async function onRequestOpenDirectories (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return fileDialog
    .openDirectory({
      title: 'Open Directories',
      allowMultipleSelects: true
    })
    .then(
      (files: string[]) => files,
      () => []
    )
}

async function onRequestOpenVideos (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return fileDialog
    .openFile({
      title: 'Open Video or Playlist Files',
      filterPatterns: [
        'mp4',
        'mkv',
        'webm',
        'ogv',
        'mov',
        'asx',
        'm3u8',
        'pls',
        'xspf',
        '*'
      ],
      filterPatternsDescription: 'Video or playlist files',
      allowMultipleSelects: true
    })
    .then(
      (files: string[]) => files,
      () => []
    )
}

async function onRequestSaveTextFile (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return fileDialog
    .saveFile({
      title: 'Save Text File',
      startPath: message.args[0],
      filterPatterns: ['*.txt', '*'],
      filterPatternsDescription: 'Text files'
    })
    .then(
      (file: string) => {
        fs.writeFileSync(file, message.args[1], 'utf-8')
        return [file]
      },
      () => []
    )
}

async function onRequestSaveJsonFile (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return fileDialog
    .saveFile({
      title: 'Save JSON File',
      startPath: message.args[0],
      filterPatterns: ['*.json', '*'],
      filterPatternsDescription: 'JSON files'
    })
    .then(
      (file: string) => {
        fs.writeFileSync(file, message.args[1], 'utf-8')
        return [file]
      },
      () => []
    )
}

async function onRequestReadTextFile (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await fs.promises.readFile(message.args[0], 'utf-8').then(
    (text) => [text],
    () => []
  )
}

async function onRequestReadBinaryFile (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await fs.promises.readFile(message.args[0]).then(
    (buffer) => [buffer],
    () => []
  )
}

async function onRequestShowItemInFolder (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await new Promise((resolve) => {
    const source = message.args[0]
    if (fs.existsSync(source)) {
      openExternal(source)
    }

    resolve([])
  })
}

async function onRequestLoadThumb (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await openImageFile(message, socket)
    .then((files) => files.filter((i) => isImage(i, true)))
    .then(async (files) => {
      return files.length > 0 ? await fs.promises.readFile(files[0]) : undefined
    })
    .then((data) => {
      const thumb =
        data != null ? generateThumbnailFile(message.args[0], data) : undefined

      return [thumb]
    })
}

async function onRequestLoadAudioSources (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  let promise: Promise<any[]>
  if (message.args[0] != null) {
    promise = onRequestOpenDirectories(message, socket).then((dirs) => {
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
    promise = openAudioFiles(message, socket)
  }
  return await promise.then((sources) =>
    sources.filter((r) => isAudio(r, true))
  )
}

async function onRequestLoadScriptSources (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  let promise: Promise<any[]>
  if (message.args[0] != null) {
    promise = onRequestOpenDirectories(message, socket).then((dirs) => {
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
    promise = openTextFiles(message, socket)
  }

  return await promise.then((sources) => sources.filter((r) => isText(r, true)))
}

async function onRequestLoadVideoSources (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await onRequestOpenDirectories(message, socket).then((vdResult) => {
    const rvResult: string[] = []
    for (const path of vdResult) {
      if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        rvResult.push(...getFilesRecursively(path))
      } else {
        rvResult.push(path)
      }
    }

    return rvResult.filter((r) => isVideo(r, true) || isVideoPlaylist(r, true))
  })
}

async function onRequestGetBackups (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await Promise.resolve(getBackups())
}

async function onRequestCachePath (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await new Promise((resolve) => {
    const baseDir = message.args[0]
    const source = message.args.length >= 2 ? message.args[1] : undefined
    const typeDir = message.args.length >= 3 ? message.args[2] : undefined
    const path = cachePath(baseDir, source, typeDir)
    resolve([path])
  })
}

async function onRequestPathExists (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await new Promise((resolve) => {
    const exists = fs.existsSync(message.args[0])
    resolve([exists])
  })
}

async function onRequestDeletePath (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await fs.promises.unlink(message.args[0]).then(
    () => [],
    () => []
  )
}

async function onRequestMkdir (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await fs.promises.mkdir(message.args[0]).then(
    () => [],
    () => []
  )
}

async function onRequestWriteFile (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await fs.promises.writeFile(message.args[0], message.args[1]).then(
    () => [],
    () => []
  )
}

async function onRequestHasFiles (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await new Promise((resolve) => {
    const path = message.args[0]
    const hasFiles = fs.existsSync(path) && fs.readdirSync(path).length > 0
    resolve([hasFiles])
  })
}

async function onRequestGetDirectories (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await fs.promises
    .readdir(message.args[0], { withFileTypes: true })
    .then(
      (dirs) => {
        return dirs
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => dirent.name)
      },
      () => []
    )
}

async function onRequestUnlink (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await fs.promises.unlink(message.args[0]).then(
    () => [],
    () => []
  )
}

async function onRequestReaddir (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await fs.promises.readdir(message.args[0])
}

async function onRequestMove (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await move(message.args[0], message.args[1]).then(
    () => [],
    () => []
  )
}

async function onRequestOutputFile (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  const path = message.args[0]
  let data = message.args[1]
  if (data?.type === 'Buffer') {
    data = Buffer.from(data)
  }

  return await outputFile(path, data).then(
    () => [],
    () => []
  )
}

async function onRequestGetFolderSize (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await getFolderSize.loose(message.args[0]).then(
    (size) => [size],
    () => [undefined]
  )
}

async function onRequestGetSystemFonts (
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
        return fonts.map((r: string) => {
          if (r.startsWith('"') && r.endsWith('"')) {
            return r.substring(1, r.length - 1)
          } else {
            return r
          }
        })
      },
      () => []
    )
  }
}

async function onRequestParseMusicMetadataFile (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  const url = message.args[0]
  const cachePath = message.args[1]
  return await parseFile(url).then((metadata) => [
    extractMusicMetadata(metadata, cachePath)
  ])
}

async function onRequestParseMusicMetadataBpm (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  const url = message.args[0]
  return await parseFile(url).then((metadata) => [metadata?.common?.bpm])
}

async function onRequestParseMusicMetadataBuffer (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  const buffer = message.args[0]
  const cachePath = message.args[1]
  return await parseBuffer(Buffer.from(buffer)).then((metadata) => [
    extractMusicMetadata(metadata, cachePath)
  ])
}

export function extractMusicMetadata (metadata: any, cachePath: string): any {
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
    if (metadata.common.picture != null && metadata.common.picture.length > 0) {
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

async function onRequestRimrafSync (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await Promise.resolve([rimraf.sync(message.args[0])])
}

async function onRequestCleanBackups (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await new Promise((resolve) => {
    try {
      cleanBackups(message.args[0])
    } catch (err) {
      console.error(err)
    }

    resolve([])
  })
}

// async function onRequestTumblrOAuth (
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
//     //     onRequestOpenExternal(ev, authorizeUrl + '?oauth_token=' + token)
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

// async function onRequestTwitterOAuth (
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
//     //     onRequestOpenExternal(ev, authorizeUrl + '?oauth_token=' + token)
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

// async function onRequestRedditOAuth (
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

async function onRequestGetFileUrl (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await Promise.resolve([fileUrl(message.args[0])])
}

async function onRequestRecursiveReaddir (
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
      let sources: string[] = filterPathsToJustPlayable(filter, rawFiles, true)
        .map((p) => fileUrl(p))
        .sort((a, b) => collator.compare(a, b))

      if (sourceBlacklist != null && sourceBlacklist.length > 0) {
        sources = sources.filter(
          (url: string) =>
            !sourceBlacklist.includes(url) &&
            !sourceBlacklist.includes(urlToPath(url, isWin32))
        )
      }

      const registry = FileRegistry.getInstance()
      const serverURL = getServerURL()
      sources = sources.map((url) => {
        const uuid = registry.set(url)
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

async function onRequestGetContext (
  message: WebSocketMessage,
  socket: ws.WebSocket
): Promise<any[]> {
  return await new Promise((resolve) => {
    resolve([getContext()])
  })
}

// function onRequestLoadInWorker (message: WebSocketMessage) {
//   const event = message.args[0]
//   const args = message.args[1]
//   // loadInWorker(event, args, ev.sender.id)
// }

// function onRequestWorkerSendMessage (
//   message: WebSocketMessage
// ) {
//   const webContentsId = message.args[0]
//   const data = message.args[1]
//   workerResponse(webContentsId, data)
// }

// Initialize and release listeners
let initialized = false
// const imgurClient = new ImgurClient()
// const instagramClient = new InstagramClient()
// const redditClient = new RedditClient()
// const tumblrClient = new TumblrClient()
// const twitterClient = new TwitterClient()
export function initializeIpcEvents (): void {
  if (initialized) {
    return
  }

  initialized = true
  // imgurClient.initializeIpcEvents(ipcMain)
  // instagramClient.initializeIpcEvents(ipcMain)
  // redditClient.initializeIpcEvents(ipcMain)
  // tumblrClient.initializeIpcEvents(ipcMain)
  // twitterClient.initializeIpcEvents(ipcMain)
}

export function handleMessage (
  message: WebSocketMessage,
  socket: ws.WebSocket
): void {
  const handlers: Record<
  string,
  (msg: WebSocketMessage, socket: ws.WebSocket) => Promise<any[]>
  > = {}
  handlers[IPC.getWindowId] = onRequestWindowId
  handlers[IPC.appStorageInitialState] = onRequestAppStorageInitialState
  handlers[IPC.appStorageSave] = onRequestAppStorageSave
  handlers[IPC.appStorageBackup] = onRequestAppStorageBackup
  handlers[IPC.getBackups] = onRequestGetBackups
  handlers[IPC.cleanBackups] = onRequestCleanBackups
  handlers[IPC.openJsonFile] = onRequestOpenJsonFile
  handlers[IPC.openSubtitleFile] = onRequestOpenSubtitleFile
  handlers[IPC.openTextFile] = onRequestOpenTextFile
  handlers[IPC.openDirectory] = onRequestOpenDirectory
  handlers[IPC.openDirectories] = onRequestOpenDirectories
  handlers[IPC.openVideos] = onRequestOpenVideos
  handlers[IPC.saveTextFile] = onRequestSaveTextFile
  handlers[IPC.saveJsonFile] = onRequestSaveJsonFile
  handlers[IPC.readTextFile] = onRequestReadTextFile
  handlers[IPC.readBinaryFile] = onRequestReadBinaryFile
  handlers[IPC.showItemInFolder] = onRequestShowItemInFolder
  handlers[IPC.loadThumb] = onRequestLoadThumb
  handlers[IPC.loadAudioSources] = onRequestLoadAudioSources
  handlers[IPC.loadScriptSources] = onRequestLoadScriptSources
  handlers[IPC.loadVideoSources] = onRequestLoadVideoSources
  handlers[IPC.cachePath] = onRequestCachePath
  handlers[IPC.pathExists] = onRequestPathExists
  handlers[IPC.deletePath] = onRequestDeletePath
  handlers[IPC.mkdir] = onRequestMkdir
  handlers[IPC.writeFile] = onRequestWriteFile
  handlers[IPC.hasFiles] = onRequestHasFiles
  handlers[IPC.getDirectories] = onRequestGetDirectories
  handlers[IPC.unlink] = onRequestUnlink
  handlers[IPC.readdir] = onRequestReaddir
  handlers[IPC.move] = onRequestMove
  handlers[IPC.outputFile] = onRequestOutputFile
  handlers[IPC.getFolderSize] = onRequestGetFolderSize
  handlers[IPC.getSystemFonts] = onRequestGetSystemFonts
  handlers[IPC.parseMusicMetadataFile] = onRequestParseMusicMetadataFile
  handlers[IPC.parseMusicMetadataBpm] = onRequestParseMusicMetadataBpm
  handlers[IPC.parseMusicMetadataBuffer] = onRequestParseMusicMetadataBuffer
  handlers[IPC.rimrafSync] = onRequestRimrafSync
  // handlers[IPC.tumblrOAuth] = onRequestTumblrOAuth
  // handlers[IPC.twitterOAuth] = onRequestTwitterOAuth
  // handlers[IPC.redditOAuth] = onRequestRedditOAuth
  handlers[IPC.getFileUrl] = onRequestGetFileUrl
  handlers[IPC.recursiveReaddir] = onRequestRecursiveReaddir
  handlers[IPC.getContext] = onRequestGetContext
  // handlers[IPC.loadInWorker] = onRequestLoadInWorker
  // handlers[IPC.workerSendMessage] = onRequestWorkerSendMessage

  const handler = handlers[message.operation]
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

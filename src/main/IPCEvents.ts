import {
  clipboard,
  ipcMain,
  nativeImage,
  shell,
  powerSaveBlocker,
  Menu,
  MenuItem
} from 'electron'
import type { IpcMainEvent } from 'electron'
import * as fs from 'fs'
import { move, outputFile } from 'fs-extra'
import SystemFonts from 'system-font-families'
import { parseBuffer, parseFile } from 'music-metadata'
import rimraf from 'rimraf'
import { cleanBackups, getBackups } from './data/Backup'
import { OAuth } from 'oauth'
import http from 'http'
import wretch from 'wretch'
import FormDataAddon from 'wretch/addons/formData'
import fontList from 'font-list'
import fileURL from 'file-url'
import recursiveReaddir from 'recursive-readdir'
import {
  getSaveDir,
  getSavePath,
  getPortablePath,
  getPortablePathExists
} from './main'
import en from '../renderer/data/en'
import {
  getSourceType,
  filterPathsToJustPlayable,
  isAudio,
  isImage,
  isVideo,
  isVideoPlaylist
} from '../renderer/components/player/Scrapers'
import {
  defaultBuildMenu,
  createNewWindow,
  getAppStorageInitialState,
  saveAppStorage,
  backupAppStorage,
  getWindowId,
  reloadWindow,
  showWindow,
  openAudioFiles,
  openTextFiles,
  openJsonFile,
  openSubtitleFile,
  openTextFile,
  openImageFiles,
  openDirectories,
  openDirectory,
  openVideos,
  gridToggleFullScreen,
  playerToggleFullScreen,
  gridSetAlwaysOnTop,
  playerSetAlwaysOnTop,
  gridMenuBarVisibility,
  playerMenuBarVisibility,
  gridSetFullScreen,
  playerSetFullScreen,
  playerBuildMenu,
  playerBack,
  saveTextFile,
  saveJsonFile,
  setProgressBar,
  clearSessionCache,
  loadInWorker,
  workerResponse
} from './WindowManager'
import type { PlayerMenuState } from './WindowManager'
import {
  cachePath,
  getFilesRecursively,
  generateThumbnailFile,
  isWin32,
  isMacOSX,
  pathSep,
  toArrayBuffer
} from './MainUtils'
import { isText, urlToPath } from '../renderer/data/utils'
import InstagramClient from './InstagramClient'
import ImgurClient from './ImgurClient'
import getFolderSize from 'get-folder-size'
import { IF, IPC, ST } from '../renderer/data/const'
import TwitterClient from './TwitterClient'
import RedditClient from './RedditClient'
import TumblrClient from './TumblrClient'
import type Config from '../storage/Config'

// Define functions
function onRequestCreateNewWindow (ev: IpcMainEvent): void {
  createNewWindow()
}

function onRequestWindowId (ev: IpcMainEvent): number {
  return getWindowId(ev.sender.id)
}

function onRequestAppStorageInitialState (ev: IpcMainEvent): any {
  return getAppStorageInitialState(ev.sender.id)
}

function onRequestAppStorageSave (ev: IpcMainEvent, state: any): void {
  saveAppStorage(ev.sender.id, state, false)
}

function onRequestAppStorageBackup (ev: IpcMainEvent, state: any): void {
  backupAppStorage(ev.sender.id, state)
}

function onRequestErrorReport (
  ev: IpcMainEvent,
  title: string,
  body: string
): void {
  const link =
    'https://github.com/regtemp8/flipflip/issues/new?title=' +
    title +
    '&body=' +
    body
  onRequestOpenExternal(ev, link)
}

function onRequestOpenExternal (ev: IpcMainEvent, link: string): void {
  shell.openExternal(link)
}

function onRequestOpenPath (ev: IpcMainEvent, link: string): void {
  shell.openPath(link)
}

function onRequestReloadWindow (ev: IpcMainEvent): void {
  reloadWindow(ev.sender.id)
}

function onRequestShowCurrentWindow (ev: IpcMainEvent): void {
  showWindow(ev.sender.id)
}

async function onRequestOpenJsonFile (
  ev: IpcMainEvent
): Promise<string | undefined> {
  return await openJsonFile(ev.sender.id)
}

async function onRequestOpenSubtitleFile (
  ev: IpcMainEvent
): Promise<string | undefined> {
  return await openSubtitleFile(ev.sender.id)
}

async function onRequestOpenTextFile (
  ev: IpcMainEvent
): Promise<string | undefined> {
  return await openTextFile(ev.sender.id)
}

async function onRequestOpenDirectory (
  ev: IpcMainEvent
): Promise<string | undefined> {
  return await openDirectory(ev.sender.id)
}

export async function onRequestOpenDirectories (
  ev: IpcMainEvent
): Promise<string[] | undefined> {
  return await openDirectories(ev.sender.id)
}

export async function onRequestOpenVideos (
  ev: IpcMainEvent
): Promise<string[] | undefined> {
  return await openVideos(ev.sender.id)
}

async function onRequestReadTextFile (ev: IpcMainEvent, path: string) {
  return await fs.promises.readFile(path, 'utf-8')
}

async function onRequestReadBinaryFile (ev: IpcMainEvent, path: string) {
  const buffer = await fs.promises.readFile(path)
  return toArrayBuffer(buffer)
}

function onRequestShowItemInFolder (ev: IpcMainEvent, source: string) {
  if (fs.existsSync(source)) {
    shell.showItemInFolder(source)
  }
}

async function onRequestLoadThumb (ev: IpcMainEvent, cachePath: string) {
  let files = await openImageFiles(ev.sender.id)
  if (!files) return
  files = files.filter((i) => isImage(i, true))

  let thumbFile: string | undefined
  if (files.length > 0) {
    const file = await fs.promises.readFile(files[0])
    thumbFile = generateThumbnailFile(cachePath, file)
  }

  return thumbFile
}

async function onRequestLoadAudioSources (ev: IpcMainEvent, shiftKey: boolean) {
  let audioSources: string[] | undefined = []
  if (shiftKey) {
    const dirs = await openDirectories(ev.sender.id)
    if (!dirs) return
    for (const path of dirs) {
      if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        audioSources = audioSources.concat(getFilesRecursively(path))
      } else {
        audioSources.push(path)
      }
    }
  } else {
    audioSources = await openAudioFiles(ev.sender.id)
    if (!audioSources) return
  }
  return audioSources.filter((r) => isAudio(r, true))
}

async function onRequestLoadScriptSources (ev: IpcMainEvent, shiftKey: boolean) {
  let scriptSources: string[] | undefined = []
  if (shiftKey) {
    const dirs = await openDirectories(ev.sender.id)
    if (!dirs) return
    for (const path of dirs) {
      if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        scriptSources = scriptSources.concat(getFilesRecursively(path))
      } else {
        scriptSources.push(path)
      }
    }
  } else {
    scriptSources = await openTextFiles(ev.sender.id)
    if (!scriptSources) return
  }
  return scriptSources.filter((r) => isText(r, true))
}

async function onRequestLoadVideoSources (ev: IpcMainEvent) {
  const vdResult = await onRequestOpenDirectories(ev)
  if (!vdResult) return
  let rvResult = new Array<string>()
  for (const path of vdResult) {
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
      rvResult = rvResult.concat(getFilesRecursively(path))
    } else {
      rvResult.push(path)
    }
  }
  return rvResult.filter((r) => isVideo(r, true) || isVideoPlaylist(r, true))
}

function onRequestBuildMenu (ev: IpcMainEvent): void {
  defaultBuildMenu(ev.sender.id)
}

function onRequestGridToggleFullScreen (ev: IpcMainEvent): void {
  gridToggleFullScreen(ev.sender.id)
}

function onRequestGridSetAlwaysOnTop (
  ev: IpcMainEvent,
  alwaysOnTop: boolean
): void {
  gridSetAlwaysOnTop(ev.sender.id, alwaysOnTop)
}

function onRequestGridSetMenuBarVisibility (
  ev: IpcMainEvent,
  menuBarVisible: boolean
): void {
  gridMenuBarVisibility(ev.sender.id, menuBarVisible)
}

function onRequestGridSetFullScreen (
  ev: IpcMainEvent,
  fullScreen: boolean
): void {
  gridSetFullScreen(ev.sender.id, fullScreen)
}

function onRequestPlayerBack (ev: IpcMainEvent): void {
  playerBack(ev.sender.id)
}

function onRequestPlayerToggleFullScreen (
  ev: IpcMainEvent,
  isPlaying: boolean,
  canDelete: boolean,
  canChangeSource: boolean
): void {
  const menuState: PlayerMenuState = {
    isPlaying,
    canDelete,
    canChangeSource
  }

  playerToggleFullScreen(ev.sender.id, menuState)
}

function onRequestPlayerSetAlwaysOnTop (
  ev: IpcMainEvent,
  alwaysOnTop: boolean,
  isPlaying: boolean,
  canDelete: boolean,
  canChangeSource: boolean
): void {
  const menuState: PlayerMenuState = {
    isPlaying,
    canDelete,
    canChangeSource
  }

  playerSetAlwaysOnTop(ev.sender.id, alwaysOnTop, menuState)
}

function onRequestPlayerSetMenuBarVisibility (
  ev: IpcMainEvent,
  menuBarVisible: boolean,
  isPlaying: boolean,
  canDelete: boolean,
  canChangeSource: boolean
): void {
  const menuState: PlayerMenuState = {
    isPlaying,
    canDelete,
    canChangeSource
  }

  playerMenuBarVisibility(ev.sender.id, menuBarVisible, menuState)
}

function onRequestPlayerSetFullScreen (
  ev: IpcMainEvent,
  fullScreen: boolean,
  isPlaying: boolean,
  canDelete: boolean,
  canChangeSource: boolean
) {
  const menuState: PlayerMenuState = {
    isPlaying,
    canDelete,
    canChangeSource
  }

  playerSetFullScreen(ev.sender.id, fullScreen, menuState)
}

function onRequestPlayerBuildMenu (
  ev: IpcMainEvent,
  isPlaying: boolean,
  canDelete: boolean,
  canChangeSource: boolean
) {
  const menuState: PlayerMenuState = {
    isPlaying,
    canDelete,
    canChangeSource
  }

  playerBuildMenu(ev.sender.id, menuState)
}

async function onRequestSaveTextFile (
  ev: IpcMainEvent,
  defaultPath: string,
  text: string
) {
  const filePath = await saveTextFile(ev.sender.id, defaultPath)
  if (filePath) {
    await fs.promises.writeFile(filePath, text, 'utf-8')
  }

  return filePath
}

async function onRequestSaveJsonFile (
  ev: IpcMainEvent,
  defaultPath: string,
  text: string
) {
  const filePath = await saveJsonFile(ev.sender.id, defaultPath)
  if (filePath) {
    await fs.promises.writeFile(filePath, text, 'utf-8')
  }
}

function onRequestSetProgressBar (ev: IpcMainEvent, progress: number) {
  setProgressBar(ev.sender.id, progress)
}

function onRequestGetMemoryReport (ev: IpcMainEvent, resourceUsage: any) {
  function format (x: any) {
    let f = x.toString()
    while (f.length < 15) {
      f = ' ' + f
    }
    f = f.substr(0, 15)
    return f
  }
  function logB (x: any) {
    return [
      format(x[0]),
      format((x[1] / (1000.0 * 1000)).toFixed(2)),
      'MB'
    ].join(' ')
  }
  function logKB (x: any) {
    return [format(x[0]), format((x[1] / 1000.0).toFixed(2)), 'MB'].join(' ')
  }
  function logCount (x: any) {
    return [
      format(x[0]),
      format(x[1].count),
      format((x[1].size / (1000.0 * 1000)).toFixed(2)),
      'MB',
      format((x[1].liveSize / (1000.0 * 1000)).toFixed(2)),
      'MB'
    ].join(' ')
  }

  const lines = new Array<string>()
  Object.entries(process.memoryUsage()).forEach((x) => lines.push(logB(x)))
  Object.entries(process.getProcessMemoryInfo()).forEach((x) =>
    lines.push(logKB(x))
  )
  Object.entries(process.getSystemMemoryInfo()).forEach((x) =>
    lines.push(logKB(x))
  )
  lines.push('\n')
  lines.push(
    [
      format('object'),
      format('count'),
      format('size'),
      format('liveSize')
    ].join(' ')
  )
  Object.entries(resourceUsage).forEach((x) => lines.push(logCount(x)))
  lines.push('------')
  return lines.join('\n')
}

function onRequestPreventDisplaySleep (ev: IpcMainEvent) {
  return powerSaveBlocker.start('prevent-display-sleep')
}

function onRequestStopPreventDisplaySleep (ev: IpcMainEvent, id: number) {
  powerSaveBlocker.stop(id)
}

async function onRequestClearCaches (ev: IpcMainEvent) {
  await clearSessionCache(ev.sender.id)
}

function onRequestGetBackups () {
  return getBackups()
}

function onRequestCachePath (
  ev: IpcMainEvent,
  baseDir: string,
  source?: string,
  typeDir?: string
) {
  return cachePath(baseDir, source, typeDir)
}

function onRequestCopyTextToClipboard (ev: IpcMainEvent, text: string) {
  clipboard.writeText(text)
}

function onRequestCopyImageToClipboard (ev: IpcMainEvent, imagePath: string) {
  clipboard.writeImage(nativeImage.createFromPath(imagePath))
}

function onRequestTryCopyBufferToClipboard (
  ev: IpcMainEvent,
  arrayBuffer: ArrayBuffer,
  imagePath: string
) {
  const buffer = Buffer.from(arrayBuffer)
  const bufferImage = nativeImage.createFromBuffer(buffer)
  if (bufferImage.isEmpty()) {
    clipboard.writeText(imagePath)
  } else {
    clipboard.writeImage(bufferImage)
  }
}

function onRequestPathExists (ev: IpcMainEvent, path: string) {
  return fs.existsSync(path)
}

async function onRequestDeletePath (ev: IpcMainEvent, path: string) {
  try {
    await fs.promises.unlink(path)
    return null
  } catch (err) {
    return err
  }
}

function onRequestShowContextMenu (
  ev: IpcMainEvent,
  literalSource: string,
  sourceURL: string,
  post: string,
  isFile: boolean,
  path: string,
  url: string,
  type: string,
  cachingEnabled: boolean,
  cachingDirectory: string,
  canGotoTagSource: boolean,
  recentPictureGrid: boolean,
  downloadScene: boolean
) {
  const contextMenu = new Menu()
  contextMenu.append(
    new MenuItem({
      label: literalSource,
      click: () => {
        clipboard.writeText(sourceURL)
      }
    })
  )
  if (post) {
    contextMenu.append(
      new MenuItem({
        label: post,
        click: () => {
          clipboard.writeText(post)
        }
      })
    )
  }
  contextMenu.append(
    new MenuItem({
      label: isFile ? path : url,
      click: () => {
        clipboard.writeText(isFile ? path : url)
      }
    })
  )
  if (
    url.toLocaleLowerCase().endsWith('.png') ||
    url.toLocaleLowerCase().endsWith('.jpg') ||
    url.toLocaleLowerCase().endsWith('.jpeg')
  ) {
    contextMenu.append(
      new MenuItem({
        label: 'Copy Image',
        click: () => {
          onRequestCopyImageToClipboard(ev, url)
        }
      })
    )
  }
  contextMenu.append(
    new MenuItem({
      label: 'Open Source',
      click: () => {
        onRequestOpenExternal(ev, sourceURL)
      }
    })
  )
  if (post) {
    contextMenu.append(
      new MenuItem({
        label: 'Open Post',
        click: () => {
          onRequestOpenExternal(ev, post)
        }
      })
    )
  }
  contextMenu.append(
    new MenuItem({
      label: 'Open File',
      click: () => {
        onRequestOpenExternal(ev, url)
      }
    })
  )

  if (cachingEnabled && type !== ST.local) {
    contextMenu.append(
      new MenuItem({
        label: 'Open Cached Images',
        click: async () => {
          const typeDir = en.get(getSourceType(sourceURL))?.toLowerCase() || ''
          const path = cachePath(sourceURL, typeDir, cachingDirectory)
          // for some reason windows uses URLs and everyone else uses paths
          if (isWin32) {
            onRequestOpenExternal(ev, path)
          } else {
            onRequestOpenPath(ev, path)
          }
        }
      })
    )
  }
  if (
    (!isFile && type !== ST.video && type !== ST.playlist) ||
    type === ST.local
  ) {
    contextMenu.append(
      new MenuItem({
        label: 'Blacklist File',
        click: () => {
          ev.sender.send(IPC.blackListFile, literalSource, isFile ? path : url)
        }
      })
    )
  }
  if (isFile) {
    contextMenu.append(
      new MenuItem({
        label: 'Reveal',
        click: () => {
          // for some reason windows uses URLs and everyone else uses paths
          if (isWin32) {
            onRequestShowItemInFolder(ev, url)
          } else {
            onRequestShowItemInFolder(ev, path)
          }
        }
      })
    )
    contextMenu.append(
      new MenuItem({
        label: 'Delete',
        click: () => {
          this.onDeletePath(path)
        }
      })
    )
  }
  if (canGotoTagSource) {
    contextMenu.append(
      new MenuItem({
        label: 'Goto Tag Source',
        click: () => {
          ev.sender.send(IPC.gotoTagSource, sourceURL)
        }
      })
    )
  }
  if (type === ST.video) {
    contextMenu.append(
      new MenuItem({
        label: 'Goto Clip Source',
        click: () => {
          ev.sender.send(IPC.gotoClipSource, sourceURL)
        }
      })
    )
  }
  if (!recentPictureGrid && !downloadScene) {
    contextMenu.append(
      new MenuItem({
        label: 'Recent Picture Grid',
        click: () => {
          ev.sender.send(IPC.recentPictureGrid)
        }
      })
    )
  }
  contextMenu.popup({})
}

async function onRequestMkdir (ev: IpcMainEvent, path: string) {
  await fs.promises.mkdir(path)
}

async function onRequestWriteFile (
  ev: IpcMainEvent,
  path: string,
  data: string
) {
  await fs.promises.writeFile(path, data)
}

function onRequestHasFiles (ev: IpcMainEvent, path: string) {
  return fs.existsSync(path) && fs.readdirSync(path).length > 0
}

async function onRequestGetDirectories (ev: IpcMainEvent, path: string) {
  const dir = await fs.promises.readdir(path, { withFileTypes: true })
  return dir
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
}

async function onRequestUnlink (ev: IpcMainEvent, path: string) {
  await fs.promises.unlink(path)
}

async function onRequestReaddir (ev: IpcMainEvent, path: string) {
  return await fs.promises.readdir(path)
}

function onRequestMove (ev: IpcMainEvent, fromPath: string, toPath: string) {
  move(fromPath, toPath)
}

function onRequestOutputFile (
  ev: IpcMainEvent,
  path: string,
  data: string | ArrayBuffer
) {
  if (data instanceof ArrayBuffer) {
    const arrayBuffer = data
    const buffer = Buffer.from(arrayBuffer)
    outputFile(path, buffer)
  } else {
    outputFile(path, data)
  }
}

async function onRequestGetFolderSize (ev: IpcMainEvent, folder: string) {
  return await getFolderSize.loose(folder)
}

async function onRequestGetSystemFonts (ev: IpcMainEvent) {
  if (isMacOSX) {
    return await new SystemFonts().getFonts()
  } else {
    const res = await fontList.getFonts()
    return res.map((r: string) => {
      if (r.startsWith('"') && r.endsWith('"')) {
        return r.substring(1, r.length - 1)
      } else {
        return r
      }
    })
  }
}

async function onRequestParseMusicMetadataFile (
  ev: IpcMainEvent,
  url: string,
  cachePath: string
) {
  const metadata = await parseFile(url)
  return extractMusicMetadata(metadata, cachePath)
}

async function onRequestParseMusicMetadataBpm (ev: IpcMainEvent, url: string) {
  const metadata = await parseFile(url)
  return metadata?.common?.bpm ? metadata.common.bpm : undefined
}

async function onRequestParseMusicMetadataBuffer (
  ev: IpcMainEvent,
  arrayBuffer: ArrayBuffer,
  cachePath: string
) {
  const metadata = await parseBuffer(Buffer.from(arrayBuffer))
  return extractMusicMetadata(metadata, cachePath)
}

export function extractMusicMetadata (metadata: any, cachePath: string): any {
  const audio: any = {}
  if (metadata.common) {
    if (metadata.common.title) {
      audio.name = metadata.common.title
    }
    if (metadata.common.album) {
      audio.album = metadata.common.album
    }
    if (metadata.common.artist) {
      audio.artist = metadata.common.artist
    }
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      audio.thumb = generateThumbnailFile(
        cachePath,
        metadata.common.picture[0].data
      )
    }
    if (metadata.common.track?.no) {
      audio.trackNum = parseInt(metadata.common.track.no)
    }
    if (metadata.common.bpm) {
      audio.bpm = parseFloat(metadata.common.bpm)
    }
  }
  if (metadata.format?.duration) {
    audio.duration = metadata.format.duration
  }

  return audio
}

function onRequestRimrafSync (ev: IpcMainEvent, path: string) {
  rimraf.sync(path)
}

function onRequestCleanBackups (ev: IpcMainEvent, config: Config) {
  cleanBackups(config)
}

async function onRequestTumblrOAuth (
  ev: IpcMainEvent,
  requestTokenUrl: string,
  accessTokenUrl: string,
  tumblrKey: string,
  tumblrSecret: string,
  authorizeUrl: string
) {
  return await new Promise((resolve, reject) => {
    const oauth = new OAuth(
      requestTokenUrl,
      accessTokenUrl,
      tumblrKey,
      tumblrSecret,
      '1.0A',
      'http://localhost:65010',
      'HMAC-SHA1'
    )

    let server: http.Server | undefined
    let sharedSecret = ''
    oauth.getOAuthRequestToken(
      (
        err: { statusCode: number, data: string },
        token: string,
        secret: string
      ) => {
        if (err) {
          reject(err)
          if (server) {
            server.close()
          }
          return
        }

        sharedSecret = secret
        onRequestOpenExternal(ev, authorizeUrl + '?oauth_token=' + token)
      }
    )

    // Start a server to listen for Tumblr OAuth response
    server = http
      .createServer((req, res) => {
        // Can't seem to get electron to properly return focus to FlipFlip, just alert the user in the response
        const html =
          '<html><body><h1>Please return to FlipFlip</h1></body></html>'
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write(html)

        const url = req.url || ''
        if (!url.endsWith('favicon.ico')) {
          if (url.includes('oauth_token') && url.includes('oauth_verifier')) {
            const args = url.replace('/?', '').split('&')
            const oauthToken = args[0].substring(12)
            const oauthVerifier = args[1].substring(15)

            oauth.getOAuthAccessToken(
              oauthToken,
              sharedSecret,
              oauthVerifier,
              (err: any, token: string, secret: string) => {
                if (err) {
                  reject(err)
                  server?.close()
                  req.socket.destroy()
                  res.end()
                  return
                }

                resolve({ token, secret })
                server?.close()
                req.socket.destroy()
              }
            )
          } else {
            reject({ statusCode: 401, data: 'Access Denied' })
            server?.close()
            req.socket.destroy()
          }
        }
        res.end()
      })
      .listen(65010)
  })
}

async function onRequestTwitterOAuth (
  ev: IpcMainEvent,
  requestTokenUrl: string,
  accessTokenUrl: string,
  consumerKey: string,
  consumerSecret: string,
  authorizeUrl: string
) {
  return await new Promise((resolve, reject) => {
    const oauth = new OAuth(
      requestTokenUrl,
      accessTokenUrl,
      consumerKey,
      consumerSecret,
      '1.0A',
      'http://localhost:65011',
      'HMAC-SHA1'
    )

    let sharedSecret = ''
    let server: http.Server | undefined
    oauth.getOAuthRequestToken(
      (
        err: { statusCode: number, data: string },
        token: string,
        secret: string
      ) => {
        if (err) {
          reject(err)
          if (server) {
            server.close()
          }

          return
        }

        sharedSecret = secret
        onRequestOpenExternal(ev, authorizeUrl + '?oauth_token=' + token)
      }
    )

    // Start a server to listen for Twitter OAuth response
    server = http
      .createServer((req, res) => {
        // Can't seem to get electron to properly return focus to FlipFlip, just alert the user in the response
        const html =
          '<html><body><h1>Please return to FlipFlip</h1></body></html>'
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write(html)

        const url = req.url || ''
        if (!url.endsWith('favicon.ico')) {
          if (url.includes('oauth_token') && url.includes('oauth_verifier')) {
            const args = url.replace('/?', '').split('&')
            const oauthToken = args[0].substring(12)
            const oauthVerifier = args[1].substring(15)

            oauth.getOAuthAccessToken(
              oauthToken,
              sharedSecret,
              oauthVerifier,
              (err: any, token: string, secret: string) => {
                if (err) {
                  reject(err)
                  server?.close()
                  req.socket.destroy()
                  res.end()
                  return
                }

                resolve({ token, secret })
                server?.close()
                req.socket.destroy()
              }
            )
          } else {
            reject({ statusCode: 401, data: 'Access Denied' })
            server?.close()
            req.socket.destroy()
          }
        }
        res.end()
      })
      .listen(65011)
  })
}

async function onRequestRedditOAuth (
  ev: IpcMainEvent,
  deviceID: string,
  userAgent: string,
  clientID: string
) {
  return await new Promise((resolve, reject) => {
    // Start a server to listen for Reddit OAuth response
    const server = http
      .createServer((req, res) => {
        // Can't seem to get electron to properly return focus to FlipFlip, just alert the user in the response
        const html =
          '<html><body><h1>Please return to FlipFlip</h1></body></html>'
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write(html)

        const url = req.url || ''
        if (!url.endsWith('favicon.ico')) {
          if (url.includes('state') && url.includes('code')) {
            const args = url.replace('/?', '').split('&')
            // This should be the same as the deviceID
            const state = args[0].substring(6)
            if (state === deviceID) {
              // This is what we use to get our token
              const code = args[1].substring(5)
              wretch('https://www.reddit.com/api/v1/access_token')
                .addon(FormDataAddon)
                .headers({
                  'User-Agent': userAgent,
                  Authorization: 'Basic ' + btoa(clientID + ':')
                })
                .formData({
                  grant_type: 'authorization_code',
                  code,
                  redirect_uri: 'http://localhost:65012'
                })
                .post()
                .json((json) => {
                  resolve(json)
                  server.close()
                  req.connection.destroy()
                })
                .catch((e) => {
                  reject(e)
                  server.close()
                  req.connection.destroy()
                  res.end()
                })
            }
          } else if (url.includes('state') && url.includes('error')) {
            const args = url.replace('/?', '').split('&')
            // This should be the same as the deviceID
            const state = args[0].substring(6)
            if (state === deviceID) {
              const error = args[1].substring(6)
              reject({ message: error })
            }

            server.close()
            req.socket.destroy()
          }
        }
        res.end()
      })
      .listen(65012)
  })
}

function onRequestGetFileUrl (ev: IpcMainEvent, source: string) {
  return fileURL(source)
}

async function onRequestRecursiveReaddir (
  ev: IpcMainEvent,
  url: string,
  blacklist: string[],
  sourceBlacklist: string[],
  filter: string,
  local: boolean
) {
  return await new Promise((resolve, reject) => {
    recursiveReaddir(url, blacklist, (err: any, rawFiles: string[]) => {
      if (err) {
        reject(err)
      } else {
        const collator = new Intl.Collator(undefined, {
          numeric: true,
          sensitivity: 'base'
        })
        let sources = filterPathsToJustPlayable(filter, rawFiles, true)
          .map((p) => fileURL(p))
          .sort(collator.compare)

        if (sourceBlacklist && sourceBlacklist.length > 0) {
          sources = sources.filter(
            (url: string) =>
              !sourceBlacklist.includes(url) &&
              !sourceBlacklist.includes(urlToPath(url, isWin32))
          )
        }

        const count = local
          ? filterPathsToJustPlayable(IF.any, rawFiles, true).length
          : undefined
        resolve({ sources, count })
      }
    })
  })
}

function onRequestGetContext (ev: IpcMainEvent) {
  return {
    isWin32,
    isMacOSX,
    pathSep,
    saveDir: getSaveDir(),
    savePath: getSavePath(),
    portablePath: getPortablePath(),
    portablePathExists: getPortablePathExists()
  }
}

function onRequestLoadInWorker (ev: IpcMainEvent, event: string, args: any[]) {
  loadInWorker(event, args, ev.sender.id)
}

function onRequestWorkerSendMessage (
  ev: IpcMainEvent,
  webContentsId: number,
  data: any
) {
  workerResponse(webContentsId, data)
}

// Initialize and release listeners
let initialized = false
const imgurClient = new ImgurClient()
const instagramClient = new InstagramClient()
const redditClient = new RedditClient()
const tumblrClient = new TumblrClient()
const twitterClient = new TwitterClient()
export function initializeIpcEvents () {
  if (initialized) {
    return
  }

  initialized = true
  imgurClient.initializeIpcEvents(ipcMain)
  instagramClient.initializeIpcEvents(ipcMain)
  redditClient.initializeIpcEvents(ipcMain)
  tumblrClient.initializeIpcEvents(ipcMain)
  twitterClient.initializeIpcEvents(ipcMain)
  ipcMain.on(IPC.newWindow, onRequestCreateNewWindow)
  ipcMain.handle(IPC.getWindowId, onRequestWindowId)
  ipcMain.handle(IPC.appStorageInitialState, onRequestAppStorageInitialState)
  ipcMain.on(IPC.appStorageSave, onRequestAppStorageSave)
  ipcMain.handle(IPC.appStorageBackup, onRequestAppStorageBackup)
  ipcMain.on(IPC.errorReport, onRequestErrorReport)
  ipcMain.on(IPC.reloadWindow, onRequestReloadWindow)
  ipcMain.on(IPC.showCurrentWindow, onRequestShowCurrentWindow)
  ipcMain.handle(IPC.openJsonFile, onRequestOpenJsonFile)
  ipcMain.handle(IPC.openSubtitleFile, onRequestOpenSubtitleFile)
  ipcMain.handle(IPC.openTextFile, onRequestOpenTextFile)
  ipcMain.handle(IPC.openDirectory, onRequestOpenDirectory)
  ipcMain.handle(IPC.openDirectories, onRequestOpenDirectories)
  ipcMain.handle(IPC.openVideos, onRequestOpenVideos)
  ipcMain.on(IPC.openExternal, onRequestOpenExternal)
  ipcMain.on(IPC.openPath, onRequestOpenPath)
  ipcMain.handle(IPC.readTextFile, onRequestReadTextFile)
  ipcMain.handle(IPC.readBinaryFile, onRequestReadBinaryFile)
  ipcMain.on(IPC.showItemInFolder, onRequestShowItemInFolder)
  ipcMain.handle(IPC.loadThumb, onRequestLoadThumb)
  ipcMain.handle(IPC.loadAudioSources, onRequestLoadAudioSources)
  ipcMain.handle(IPC.loadScriptSources, onRequestLoadScriptSources)
  ipcMain.handle(IPC.loadVideoSources, onRequestLoadVideoSources)
  ipcMain.on(IPC.buildMenu, onRequestBuildMenu)
  ipcMain.handle(IPC.gridToggleFullScreen, onRequestGridToggleFullScreen)
  ipcMain.on(IPC.gridSetAlwaysOnTop, onRequestGridSetAlwaysOnTop)
  ipcMain.on(IPC.gridSetMenuBarVisibility, onRequestGridSetMenuBarVisibility)
  ipcMain.on(IPC.gridSetFullScreen, onRequestGridSetFullScreen)
  ipcMain.handle(IPC.playerBack, onRequestPlayerBack)
  ipcMain.handle(IPC.playerToggleFullScreen, onRequestPlayerToggleFullScreen)
  ipcMain.on(IPC.playerSetAlwaysOnTop, onRequestPlayerSetAlwaysOnTop)
  ipcMain.on(
    IPC.playerSetMenuBarVisibility,
    onRequestPlayerSetMenuBarVisibility
  )
  ipcMain.on(IPC.playerSetFullScreen, onRequestPlayerSetFullScreen)
  ipcMain.on(IPC.playerBuildMenu, onRequestPlayerBuildMenu)
  ipcMain.handle(IPC.saveTextFile, onRequestSaveTextFile)
  ipcMain.on(IPC.saveJsonFile, onRequestSaveJsonFile)
  ipcMain.on(IPC.setProgressBar, onRequestSetProgressBar)
  ipcMain.handle(IPC.getMemoryReport, onRequestGetMemoryReport)
  ipcMain.handle(IPC.preventDisplaySleep, onRequestPreventDisplaySleep)
  ipcMain.on(IPC.stopPreventDisplaySleep, onRequestStopPreventDisplaySleep)
  ipcMain.on(IPC.clearCaches, onRequestClearCaches)
  ipcMain.handle(IPC.getBackups, onRequestGetBackups)
  ipcMain.handle(IPC.cachePath, onRequestCachePath)
  ipcMain.on(IPC.copyTextToClipboard, onRequestCopyTextToClipboard)
  ipcMain.on(IPC.copyImageToClipboard, onRequestCopyImageToClipboard)
  ipcMain.on(IPC.tryCopyBufferToClipboard, onRequestTryCopyBufferToClipboard)
  ipcMain.handle(IPC.pathExists, onRequestPathExists)
  ipcMain.handle(IPC.deletePath, onRequestDeletePath)
  ipcMain.on(IPC.showContextMenu, onRequestShowContextMenu)
  ipcMain.handle(IPC.mkdir, onRequestMkdir)
  ipcMain.handle(IPC.writeFile, onRequestWriteFile)
  ipcMain.handle(IPC.hasFiles, onRequestHasFiles)
  ipcMain.handle(IPC.getDirectories, onRequestGetDirectories)
  ipcMain.handle(IPC.unlink, onRequestUnlink)
  ipcMain.handle(IPC.readdir, onRequestReaddir)
  ipcMain.handle(IPC.move, onRequestMove)
  ipcMain.handle(IPC.outputFile, onRequestOutputFile)
  ipcMain.handle(IPC.getFolderSize, onRequestGetFolderSize)
  ipcMain.handle(IPC.getSystemFonts, onRequestGetSystemFonts)
  ipcMain.handle(IPC.parseMusicMetadataFile, onRequestParseMusicMetadataFile)
  ipcMain.handle(IPC.parseMusicMetadataBpm, onRequestParseMusicMetadataBpm)
  ipcMain.handle(
    IPC.parseMusicMetadataBuffer,
    onRequestParseMusicMetadataBuffer
  )
  ipcMain.handle(IPC.rimrafSync, onRequestRimrafSync)
  ipcMain.handle(IPC.cleanBackups, onRequestCleanBackups)
  ipcMain.handle(IPC.tumblrOAuth, onRequestTumblrOAuth)
  ipcMain.handle(IPC.twitterOAuth, onRequestTwitterOAuth)
  ipcMain.handle(IPC.redditOAuth, onRequestRedditOAuth)
  ipcMain.handle(IPC.getFileUrl, onRequestGetFileUrl)
  ipcMain.handle(IPC.recursiveReaddir, onRequestRecursiveReaddir)
  ipcMain.handle(IPC.getContext, onRequestGetContext)
  ipcMain.on(IPC.loadInWorker, onRequestLoadInWorker)
  ipcMain.on(IPC.workerSendMessage, onRequestWorkerSendMessage)
}

export function releaseIpcEvents () {
  if (initialized) {
    imgurClient.releaseIpcEvents(ipcMain)
    instagramClient.releaseIpcEvents(ipcMain)
    redditClient.releaseIpcEvents(ipcMain)
    tumblrClient.releaseIpcEvents(ipcMain)
    twitterClient.releaseIpcEvents(ipcMain)
    Object.values(IPC).forEach((value) => ipcMain.removeAllListeners(value))
  }

  initialized = false
}

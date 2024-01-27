import * as fs from 'fs'
import * as path from 'path'
import crypto from 'crypto'
import { app } from 'electron'
import {
  getFileGroup,
  getSourceType,
  en,
  ST,
  type SystemConstants
} from 'flipflip-common'

export const isWin32 = process.platform === 'win32'
export const isMacOSX = process.platform === 'darwin'
export const isLinux = process.platform === 'linux'
export const pathSep = path.sep

export function getContext(): SystemConstants {
  return {
    isWin32,
    isMacOSX,
    pathSep,
    saveDir: getSaveDir(),
    savePath: getSavePath(),
    portablePath: getPortablePath(),
    portablePathExists: getPortablePathExists(),
    masonryDefaultColumns: 0,
    masonryDefaultHeight: 0
  }
}

export function getSaveDir(): string {
  return path.join(app.getPath('appData'), 'flipflip')
}

export function getSavePath(): string {
  return path.join(getSaveDir(), 'data.json')
}

export function getPortablePath(): string {
  return path.join(path.dirname(app.getAppPath()), 'data.json')
}

export function getPortablePathExists(): boolean {
  return fs.existsSync(getPortablePath())
}

export function cachePath(
  baseDir: string,
  source?: string,
  typeDir?: string
): string {
  if (baseDir !== '') {
    if (!baseDir.endsWith(path.sep)) {
      baseDir += path.sep
    }
    if (source != null) {
      if (typeDir == null) {
        typeDir = en.get(getSourceType(source))?.toLowerCase()
      }
      if (source !== ST.video && source !== ST.playlist) {
        return (
          baseDir +
          typeDir +
          path.sep +
          getFileGroup(source, path.sep) +
          path.sep
        )
      } else {
        return baseDir + typeDir + path.sep
      }
    } else {
      return baseDir
    }
  } else {
    const sep = path.sep
    const saveDir = getSaveDir()
    let cachePathParts
    if (source != null) {
      if (source !== ST.video && source !== ST.playlist) {
        cachePathParts = [
          saveDir,
          'ImageCache',
          typeDir,
          getFileGroup(source, sep)
        ]
      } else {
        cachePathParts = [saveDir, 'ImageCache', typeDir]
      }
    } else {
      cachePathParts = [saveDir, 'ImageCache']
    }

    return cachePathParts.join(sep) + sep
  }
}

export function getFilesRecursively(fsPath: string): string[] {
  const isDirectory = (fsPath: string): boolean =>
    fs.statSync(fsPath).isDirectory()
  const getDirectories = (fsPath: string): string[] =>
    fs
      .readdirSync(fsPath)
      .map((name) => path.join(fsPath, name))
      .filter(isDirectory)

  const isFile = (fsPath: string): boolean => fs.statSync(fsPath).isFile()
  const getFiles = (fsPath: string): string[] =>
    fs
      .readdirSync(fsPath)
      .map((name) => path.join(fsPath, name))
      .filter(isFile)

  const dirs = getDirectories(fsPath)
  const files = dirs
    .map((dir) => getFilesRecursively(dir)) // go through each directory
    .reduce((a, b) => a.concat(b), []) // map returns a 2d array (array of file arrays) so flatten
  return files.concat(getFiles(fsPath))
}

export function generateThumbnailFile(cachePath: string, data: Buffer): string {
  let checksumThumbnailPath = cachePath
  if (!checksumThumbnailPath.endsWith(path.sep)) {
    checksumThumbnailPath += path.sep
  }
  checksumThumbnailPath += 'thumbs' + path.sep
  if (!fs.existsSync(checksumThumbnailPath)) {
    fs.mkdirSync(checksumThumbnailPath)
  }
  const checksum = crypto.createHash('md5').update(data).digest('hex')
  checksumThumbnailPath += checksum + '.png'
  if (!fs.existsSync(checksumThumbnailPath)) {
    fs.writeFileSync(checksumThumbnailPath, data)
  }
  return checksumThumbnailPath
}

export function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let j = 0; j < buf.length; ++j) {
    view[j] = buf[j]
  }
  return ab
}

export function getServerURL(host: string, port: number) {
  return `https://${host}:${port}`
}

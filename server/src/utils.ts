import {
  Audio,
  en,
  getFileGroup,
  getSourceType,
  IF,
  isImage,
  isImageOrVideo,
  isVideo,
  Scene,
  ST,
  TT,
  WeightGroup
} from 'flipflip-common'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { ProxyRequest } from './routes/ProxyService'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import { parseBuffer, parseFile, selectCover } from 'music-metadata'
import mime from 'mime-types'

export const isMacOSX = process.platform === 'darwin'
export const isWin32 = process.platform === 'win32'

export function getElectronSaveDir() {
  let directory: string | undefined
  switch (process.platform) {
    case 'win32':
      directory = process.env.APPDATA
      break
    case 'darwin':
      if (process.env.HOME != null) {
        directory = path.join(
          process.env.HOME,
          'Library',
          'Application Support'
        )
      }
      break
    case 'linux':
      directory = process.env.XDG_CONFIG_HOME ?? process.env.HOME
      if (directory != null) {
        directory = path.join(directory, '.config')
      }
      break
  }

  return directory != null ? path.join(directory, 'flipflip') : undefined
}

export function getSaveDir() {
  return process.env.FF_SAVE_DIR ?? process.cwd()
}

export function getBackupsDir() {
  return path.resolve(getSaveDir(), 'backups')
}

export function getBinDir() {
  return path.resolve(getSaveDir(), 'bin')
}

export function getThumbsDir() {
  return path.resolve(getSaveDir(), 'thumbs')
}

export function getCacheDir() {
  return path.resolve(getSaveDir(), 'cache')
}

export function getLogsDir() {
  return path.resolve(getSaveDir(), 'logs')
}

export function getFfprobePath() {
  if (process.pkg != null) {
    let file = 'ffprobe'
    if (isWin32) {
      file += '.exe'
    }

    return path.join(getBinDir(), file)
  } else {
    return ffprobeInstaller.path
  }
}

export function getServerHost() {
  return process.env.FF_HOST ?? 'localhost'
}

export function getServerPort() {
  return process.env.FF_PORT != null ? Number(process.env.FF_PORT) : 5050
}

export async function readAudioMetadata(url: string): Promise<Partial<Audio>> {
  const metadata = await parseAudioMetadata(url)

  const { duration } = metadata.format
  const { title: name, album, artist, picture, track, bpm } = metadata.common
  const audio: Partial<Audio> = {
    url,
    name,
    album,
    artist,
    bpm,
    duration,
    trackNum: track.no ?? undefined
  }

  const cover = selectCover(picture)
  if (cover != null) {
    const hash = crypto.createHash('sha256').update(cover.data).digest('hex')
    const extension = mime.extension(cover.format)
    const thumb = path.join(getThumbsDir(), `${hash}.${extension}`)
    if (!fs.existsSync(thumb)) {
      await fs.promises.writeFile(thumb, cover.data)
    }

    audio.thumb = thumb
  }
  if (audio.name == null) {
    const sep = url.startsWith('http') ? '/' : path.sep
    audio.name = url.substring(url.lastIndexOf(sep) + 1, url.lastIndexOf('.'))
  }

  return audio
}

async function parseAudioMetadata(url: string) {
  if (url.startsWith('http')) {
    const response = await fetch(url)
    if (!response.ok || response.body == null) {
      throw new Error(`Failed to fetch audio ${url}`)
    }

    let type = response.headers.get('Content-Type')
    if (type == null || !type.startsWith('audio/')) {
      const path = url.split('/').pop() ?? url
      type = mime.contentType(path) || null
    }

    const buffer = await response.arrayBuffer()
    return await parseBuffer(new Uint8Array(buffer), type ?? undefined, {
      duration: true
    })
  } else {
    return await parseFile(url, { duration: true })
  }
}

async function getFileHash(path: string) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const rs = fs.createReadStream(path)
    rs.on('error', reject)
    rs.on('data', (chunk) => hash.update(chunk))
    rs.on('end', () => resolve(hash.digest('hex')))
  })
}

export async function copyThumbFile(thumb: string) {
  const hash = await getFileHash(thumb)
  const extension = thumb.split('.').pop() ?? ''
  const thumbPath = path.join(getThumbsDir(), `${hash}.${extension}`)
  if (!fs.existsSync(thumbPath)) {
    await fs.promises.copyFile(thumb, thumbPath)
  }

  return thumbPath
}

export function getRandomIndex(list: unknown[]) {
  return Math.floor(Math.random() * list.length)
}

export function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomFloat(min: number, max: number, decimals: number) {
  const float = Math.random() * (max - min) + min
  return parseFloat(float.toFixed(decimals))
}

export function getRandomBoolean() {
  return Math.random() < 0.5
}

export function getRandomListItem<T>(list: Array<T>) {
  return list[getRandomIndex(list)]
}

export function getRandomListItems<T>(list: Array<T>, count: number) {
  const newList = []
  for (let c = 0; c < count && list.length > 0; c++) {
    newList.push(list.splice(getRandomIndex(list), 1)[0])
  }
  return newList
}

export function filterRequestsToJustPlayable(
  imageTypeFilter: string,
  requests: ProxyRequest[],
  strict: boolean
): ProxyRequest[] {
  switch (imageTypeFilter) {
    default:
    case IF.any:
      return requests.filter((r) => isImageOrVideo(r.url, strict))
    case IF.stills:
    case IF.images:
      return requests.filter((r) => isImage(r.url, strict))
    case IF.animated:
      return requests.filter(
        (r) => r.url.toLowerCase().endsWith('.gif') || isVideo(r.url, strict)
      )
    case IF.videos:
      return requests.filter((r) => isVideo(r.url, strict))
  }
}

export function getCachePath(
  baseDir: string,
  source?: string,
  typeDir?: string
) {
  if (typeDir == null && source != null) {
    typeDir = (en.get(getSourceType(source)) as string).toLowerCase()
  }

  return cachePath(baseDir, source, typeDir)
}

export function cachePath(
  baseDir: string,
  source?: string,
  typeDir?: string
): string {
  let addImageCacheDir = false
  if (baseDir === '') {
    baseDir = getSaveDir()
    addImageCacheDir = true
  }
  if (baseDir.endsWith(path.sep)) {
    baseDir = baseDir.substring(0, baseDir.length - 1)
  }

  const cachePath = [baseDir]
  if (addImageCacheDir) {
    cachePath.push('ImageCache')
  }

  if (source != null) {
    cachePath.push(typeDir as string)
    if (source !== ST.video && source !== ST.playlist) {
      cachePath.push(`${getFileGroup(source, path.sep)}`)
    }
  }

  return path.join(...cachePath) + path.sep
}

function areRulesValid(wg: WeightGroup) {
  const rules = wg.rules as WeightGroup[]
  const orRules = rules.filter((r) => r.type === TT.or)
  const weightRules = rules.filter((r) => r.type === TT.weight)
  let rulesRemaining = 100
  for (const rule of weightRules) {
    rulesRemaining = rulesRemaining - (rule.percent as number)
  }
  return (
    rules.length > 0 &&
    (orRules.length === 0 ||
      (orRules.length + weightRules.length === rules.length &&
        rulesRemaining === 0) ||
      orRules.length === rules.length) &&
    (rulesRemaining === 0 ||
      (rulesRemaining === 100 && weightRules.length === 0))
  )
}

export function areWeightsValid(scene: Scene): boolean {
  if (!scene.generatorWeights) return false
  let remaining = 100
  const orRules = scene.generatorWeights.filter((r) => r.type === TT.or)
  const weightRules = scene.generatorWeights.filter((r) => r.type === TT.weight)
  for (const wg of scene.generatorWeights) {
    if (wg.rules) {
      const rulesValid = areRulesValid(wg)
      if (!rulesValid) return false
    }
    if (wg.type === TT.weight) {
      remaining = remaining - (wg.percent as number)
    }
  }
  return (
    scene.generatorWeights.length > 0 &&
    (orRules.length === 0 ||
      (orRules.length + weightRules.length === scene.generatorWeights.length &&
        remaining === 0) ||
      orRules.length === scene.generatorWeights.length) &&
    (remaining === 0 || (remaining === 100 && weightRules.length === 0))
  )
}

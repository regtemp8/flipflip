import {
  Audio,
  en,
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

export function getFileName(url: string, extension = true): string {
  let sep
  if (/^(https?:\/\/)|(file:\/\/)/g.exec(url) != null) {
    sep = '/'
  } else {
    sep = path.sep
  }
  url = url.substring(url.lastIndexOf(sep) + 1)
  if (url.includes('?')) {
    url = url.substring(0, url.indexOf('?'))
  }
  if (!extension) {
    url = url.substring(0, url.lastIndexOf('.'))
  }
  return url
}

export function getFileGroup(url: string): string {
  let sep
  switch (getSourceType(url)) {
    case ST.tumblr: {
      let tumblrID = url.replace(/https?:\/\//, '')
      tumblrID = tumblrID.replace(/\.tumblr\.com\/?/, '')
      return tumblrID
    }
    case ST.reddit: {
      let redditID = url
      if (redditID.endsWith('/'))
        redditID = redditID.slice(0, url.lastIndexOf('/'))
      if (redditID.endsWith('/saved')) redditID = redditID.replace('/saved', '')
      redditID = redditID.substring(redditID.lastIndexOf('/') + 1)
      return redditID
    }
    case ST.redgifs: {
      let redgifID = ''
      if (url.includes('/browse?')) {
        const redgifRegex =
          /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*tags=([^&]*)/.exec(url)
        return redgifRegex != null ? redgifRegex[1] : 'all'
      } else if (url.includes('/users/')) {
        redgifID = url.replace(/^https?:\/\/(www\.)?redgifs\.com\/users\//, '')
        if (redgifID.includes('/')) {
          redgifID = redgifID.substring(0, redgifID.indexOf('/'))
        }
      }
      return redgifID
    }
    case ST.imagefap: {
      let imagefapID = url.replace(/https?:\/\/www.imagefap.com\//, '')
      imagefapID = imagefapID.replace(/pictures\//, '')
      imagefapID = imagefapID.replace(/organizer\//, '')
      imagefapID = imagefapID.replace(/video\.php\?vid=/, '')
      imagefapID = imagefapID.split('/')[0]
      return imagefapID
    }
    case ST.sexcom: {
      let sexcomID = url.replace(/https?:\/\/www.sex.com\//, '')
      sexcomID = sexcomID.replace(/user\//, '')
      sexcomID = sexcomID.split('?')[0]
      if (sexcomID.endsWith('/')) {
        sexcomID = sexcomID.substring(0, sexcomID.length - 1)
      }
      return sexcomID
    }
    case ST.imgur: {
      let imgurID = url.replace(/https?:\/\/imgur.com\//, '')
      imgurID = imgurID.replace(/a\//, '')
      return imgurID
    }
    case ST.twitter: {
      let twitterID = url.replace(/https?:\/\/twitter.com\//, '')
      if (twitterID.includes('?')) {
        twitterID = twitterID.substring(0, twitterID.indexOf('?'))
      }
      if (twitterID.endsWith('/')) {
        twitterID = twitterID.substring(0, twitterID.length - 1)
      }
      return twitterID
    }
    case ST.deviantart: {
      let authorID = url.replace(/https?:\/\/www.deviantart.com\//, '')
      if (authorID.includes('/')) {
        authorID = authorID.substring(0, authorID.indexOf('/'))
      }
      return authorID
    }
    case ST.instagram: {
      let instagramID = url.replace(/https?:\/\/www.instagram.com\//, '')
      if (instagramID.includes('/')) {
        instagramID = instagramID.substring(0, instagramID.indexOf('/'))
      }
      return instagramID
    }
    case ST.e621: {
      const hostRegexE621 = /^https?:\/\/(?:www\.)?([^.]*)\./g
      const regexResult = hostRegexE621.exec(url)
      const hostE621 = regexResult != null ? regexResult[1] : ''
      let E621ID = ''
      if (url.includes('/pools/')) {
        E621ID = 'pool' + url.substring(url.lastIndexOf('/'))
      } else {
        const tagRegex = /[?&]tags=(.*)&?/g
        let tags
        if ((tags = tagRegex.exec(url)) !== null) {
          E621ID = tags[1]
        }
        if (E621ID.endsWith('+')) {
          E621ID = E621ID.substring(0, E621ID.length - 1)
        }
      }
      return hostE621 + '/' + decodeURIComponent(E621ID)
    }
    case ST.luscious: {
      let albumID = url.replace(
        /^https?:\/\/(www\.|members\.)?luscious\.net\/(albums|users)\//,
        ''
      )
      if (albumID.includes('/')) {
        albumID = albumID.substring(0, albumID.indexOf('/'))
      }
      return albumID
    }
    case ST.danbooru:
    case ST.gelbooru1:
    case ST.gelbooru2: {
      const hostRegex = /^https?:\/\/(?:www\.)?([^.]*)\./g
      const regexResult = hostRegex.exec(url)
      const host = regexResult != null ? regexResult[1] : ''
      let danbooruID = ''
      if (url.includes('/pools/')) {
        danbooruID = 'pools/' + url.substring(url.lastIndexOf('/'))
      } else if (url.includes('/favorite_groups/')) {
        danbooruID = 'favorite_groups/' + url.substring(url.lastIndexOf('/'))
      } else {
        const tagRegex = /[?&]tags=(.*)&?/g
        let tags
        if ((tags = tagRegex.exec(url)) !== null) {
          danbooruID = tags[1]
        }
        const titleRegex = /[?&]title=(.*)&?/g
        let title
        if ((title = titleRegex.exec(url)) !== null) {
          if (tags == null) {
            danbooruID = ''
          } else if (!danbooruID.endsWith('+')) {
            danbooruID += '+'
          }
          danbooruID += title[1]
        }
        if (danbooruID.endsWith('+')) {
          danbooruID = danbooruID.substring(0, danbooruID.length - 1)
        }
      }
      return host + '/' + decodeURIComponent(danbooruID)
    }
    case ST.ehentai: {
      const galleryRegex = /^https?:\/\/(?:www\.)?e-hentai\.org\/g\/([^/]*)/g
      const gallery = galleryRegex.exec(url)
      return gallery != null ? gallery[1] : ''
    }
    case ST.list: {
      if (/^https?:\/\//g.exec(url) != null) {
        sep = '/'
      } else {
        sep = path.sep
      }
      return url.substring(url.lastIndexOf(sep) + 1).replace('.txt', '')
    }
    case ST.local: {
      if (url.endsWith(path.sep)) {
        url = url.substring(0, url.length - 1)
        return url.substring(url.lastIndexOf(path.sep) + 1)
      } else {
        return url.substring(url.lastIndexOf(path.sep) + 1)
      }
    }
    case ST.video:
    case ST.playlist:
    case ST.nimja: {
      if (/^https?:\/\//g.exec(url) != null) {
        sep = '/'
      } else {
        sep = path.sep
      }
      const name = url.substring(0, url.lastIndexOf(sep))
      return name.substring(name.lastIndexOf(sep) + 1)
    }
    case ST.bdsmlr: {
      let bdsmlrID = url.replace(/https?:\/\//, '')
      bdsmlrID = bdsmlrID.replace(/\/rss/, '')
      bdsmlrID = bdsmlrID.replace(/\.bdsmlr\.com\/?/, '')
      return bdsmlrID
    }
    case ST.hydrus: {
      const tagsRegex = /tags=([^&]*)&?.*$/.exec(url)
      if (tagsRegex == null) return 'hydrus'
      let tags = tagsRegex[1]
      if (!tags.startsWith('[')) {
        tags = decodeURIComponent(tags)
      }
      tags = tags.substring(1, tags.length - 1)
      tags = tags.replace(/"/g, '')
      return tags
    }
    case ST.piwigo: {
      const catRegex = /cat_id\[]=(\d*)/.exec(url)
      if (catRegex != null) return catRegex[1]

      const tagRegex = /tag_id\[]=(\d*)/.exec(url)
      if (tagRegex != null) return tagRegex[1]

      return 'piwigo'
    }
    default: {
      return ''
    }
  }
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
  if (baseDir !== '') {
    if (!baseDir.endsWith(path.sep)) {
      baseDir += path.sep
    }
    if (source != null) {
      if (source !== ST.video && source !== ST.playlist) {
        return baseDir + typeDir + path.sep + getFileGroup(source) + path.sep
      } else {
        return baseDir + typeDir + path.sep
      }
    } else {
      return baseDir
    }
  } else {
    const saveDir = getSaveDir()
    let cachePathParts
    if (source != null) {
      if (source !== ST.video && source !== ST.playlist) {
        cachePathParts = [saveDir, 'ImageCache', typeDir, getFileGroup(source)]
      } else {
        cachePathParts = [saveDir, 'ImageCache', typeDir]
      }
    } else {
      cachePathParts = [saveDir, 'ImageCache']
    }

    return cachePathParts.join(path.sep) + path.sep
  }
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

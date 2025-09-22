import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import recursiveReaddir from 'recursive-readdir'
import { JSDOM } from 'jsdom'
import {
  filterPathsToJustPlayable,
  getFileGroup,
  isImage,
  isImageOrVideo,
  isVideo,
  IF,
  getFileName,
  urlToPath,
  ST,
  ContentSource,
  getSourceType,
  CacheSettings,
  RemoteSettings,
  ScraperHelpers
} from 'flipflip-common'
import { ScrapeResult } from './ScrapeResult'
import { ScrapeRequest } from './ScrapeRequest'
import {
  fileExists,
  filterRequestsToJustPlayable,
  getCachePath,
  isWin32
} from '../utils'
import tumblr from './TumblrClient'
import reddit from './RedditClient'
import imgur from './ImgurClient'
import { ProxyRequest } from '../routes/ProxyService'
import Logger from '../logging/Logger'
import { findClipById } from '../db/ClipRepository'
import { parentPort } from 'worker_threads'

export type WorkerFunction = (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => Promise<ScrapeResult>

const logger = Logger.create('Scrapers')
const getError = (error: unknown) =>
  error instanceof Error ? error.message : String(error)
const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === 'AbortError'

export const getFileURL = (path: string): string => {
  if (!path.startsWith('file://')) {
    path = pathToFileURL(path).toString()
  }

  return path
}

export const loadNimja: WorkerFunction = (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  helpers.next = undefined
  return Promise.resolve({
    data: [source.url],
    allPosts,
    weight,
    helpers,
    source,
    timeout: 0
  })
}

export const loadLocalDirectory = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers,
  cachePath: string
) => {
  const blacklist = ['*.css', '*.html', 'avatar.png', '*.txt']
  const url = cachePath || source.url
  const localSource = helpers.next === -1
  try {
    const data = await recursiveReadDirectory(
      url,
      blacklist,
      source.blacklist,
      filter,
      localSource
    )

    // If this is a local source (not a cacheDir call)
    if (localSource) {
      helpers.count = data.count
      helpers.next = undefined
    }

    const urls: string[] = []
    for (const source of data.sources) {
      urls.push(getFileURL(source))
    }

    return {
      data: urls,
      allPosts,
      weight,
      helpers,
      source,
      timeout: 0
    }
  } catch (e: unknown) {
    return {
      error: (e as Error).message,
      helpers,
      source,
      timeout: 0
    }
  }
}

const recursiveReadDirectory = async (
  url: string,
  blacklist: string[],
  sourceBlacklist: string[],
  filter: string,
  local: boolean
): Promise<{ sources: string[]; count: number }> => {
  try {
    const rawFiles = await recursiveReaddir(url, blacklist)
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base'
    })
    let sources: string[] = filterPathsToJustPlayable(filter, rawFiles, true)
      .map((p: string) => pathToFileURL(p).toString())
      .sort((a: string, b: string) => collator.compare(a, b))

    if (sourceBlacklist != null && sourceBlacklist.length > 0) {
      sources = sources.filter(
        (url_1: string) =>
          !sourceBlacklist.includes(url_1) &&
          !sourceBlacklist.includes(urlToPath(url_1, isWin32))
      )
    }

    const count = local
      ? filterPathsToJustPlayable(IF.any, rawFiles, true).length
      : 0
    return { sources, count }
  } catch {
    return { sources: [], count: 0 }
  }
}

export const loadVideo = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers,
  cachePath: string
) => {
  const url = cachePath || source.url
  const missingVideo = () => {
    return {
      error: 'Could not find ' + source.url,
      data: [],
      allPosts,
      weight,
      helpers,
      source,
      timeout: 0
    }
  }
  const ifExists = async (url: string) => {
    if (!url.startsWith('http')) {
      url = getFileURL(url)
    }
    helpers.count = 1

    let paths
    if (source.clips && source.clips.length > 0) {
      const clipPaths = Array<string>()
      for (const clipId of source.clips) {
        if (!source.disabledClips || !source.disabledClips.includes(clipId)) {
          const clip = await findClipById(clipId)
          if (clip == null) {
            logger.warn(`Failed to find clip (id: ${clipId})`)
            continue
          }

          let clipPath =
            url +
            ':::' +
            clip.id +
            ':' +
            (clip.volume != null ? clip.volume : '-') +
            ':::' +
            clip.start +
            ':' +
            clip.end
          if (source.subtitleFile != null && source.subtitleFile.length > 0) {
            clipPath = clipPath + '|||' + source.subtitleFile
          }
          clipPaths.push(clipPath)
        }
      }
      paths = clipPaths
    } else {
      if (source.subtitleFile != null && source.subtitleFile.length > 0) {
        url = url + '|||' + source.subtitleFile
      }
      paths = [url]
    }

    if (source.blacklist && source.blacklist.length > 0) {
      paths = paths.filter((url: string) => !source.blacklist.includes(url))
    }
    helpers.next = undefined

    return {
      data: paths,
      allPosts,
      weight,
      helpers,
      source,
      timeout: 0
    }
  }

  if (!isVideo(url, false)) {
    return missingVideo()
  }
  if (url.startsWith('http')) {
    const res = await fetch(url)
    if (res.status === 404) {
      return missingVideo()
    } else {
      return await ifExists(url)
    }
  } else {
    const exists = await fileExists(url)
    if (exists) {
      return await ifExists(url)
    } else {
      return missingVideo()
    }
  }
}

export const loadPlaylist = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers,
  cachePath: string
) => {
  const url = cachePath || source.url
  try {
    const res = await fetch(url)
    const data = await res.text()
    let urls: string[] = []
    if (url.endsWith('.asx')) {
      const refs = new JSDOM(data, {
        contentType: 'text/xml'
      }).window.document.getElementsByTagName('Ref')
      for (let r = 0; r < refs.length; r++) {
        const l = refs[r]
        urls.push(l.getAttribute('href') as string)
      }
    } else if (url.endsWith('.m3u8')) {
      for (const l of data.split('\n')) {
        if (l.length > 0 && !l.startsWith('#')) {
          urls.push(l.trim())
        }
      }
    } else if (url.endsWith('.pls')) {
      for (const l of data.split('\n')) {
        if (l.startsWith('File')) {
          urls.push(l.split('=')[1].trim())
        }
      }
    } else if (url.endsWith('.xspf')) {
      const locations = new JSDOM(data, {
        contentType: 'text/xml'
      }).window.document.getElementsByTagName('location')
      for (let r = 0; r < locations.length; r++) {
        const l = locations[r]
        urls.push(l.textContent as string)
      }
    }

    if (urls.length > 0) {
      helpers.count = urls.length
    }

    urls = filterPathsToJustPlayable(filter, urls, true)

    if (source.blacklist && source.blacklist.length > 0) {
      urls = urls.filter((url: string) => !source.blacklist.includes(url))
    }
    helpers.next = undefined

    return {
      data: urls,
      allPosts,
      weight,
      helpers,
      source,
      timeout: 0
    }
  } catch (e) {
    return {
      error: getError(e),
      helpers,
      source,
      timeout: 0
    }
  }
}

let redditAlerted = false
let tumblrAlerted = false
let tumblr429Alerted = false
let hydrusAlerted = false
let piwigoAlerted = false

export const reset = () => {
  redditAlerted = false
  tumblrAlerted = false
  tumblr429Alerted = false
  hydrusAlerted = false
  piwigoAlerted = false
}

export const loadRemoteImageURLList = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const url = source.url
  try {
    const res = await fetch(url)
    const data = await res.text()
    const matches = data.match(/[^\r\n]+/g) as RegExpMatchArray
    const lines = matches.filter(
      (line) =>
        line.startsWith('http://') ||
        line.startsWith('https://') ||
        line.startsWith('file:///')
    )
    if (lines.length > 0) {
      let convertedSource = Array<string>()
      let error
      for (const url of lines) {
        try {
          error = undefined
          const urls = await convertURL(url)
          convertedSource = convertedSource.concat(urls)
        } catch (e) {
          error = getError(e)
        }
      }

      helpers.count = filterPathsToJustPlayable(
        IF.any,
        convertedSource,
        true
      ).length
      return {
        error,
        data: filterPathsToJustPlayable(filter, convertedSource, true),
        allPosts,
        weight,
        helpers,
        source,
        timeout: 0
      }
    } else {
      return {
        warning: 'No lines in' + url + ' are links or files',
        helpers,
        source,
        timeout: 0
      }
    }
  } catch (e) {
    return {
      error: getError(e),
      helpers,
      source,
      timeout: 0
    }
  }
}

export const loadTumblr: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 3000
  const configured =
    remoteSettings.tumblrOAuthToken !== '' &&
    remoteSettings.tumblrOAuthTokenSecret !== ''
  if (!configured) {
    let systemMessage
    if (!tumblrAlerted) {
      systemMessage =
        "You haven't authorized FlipFlip to work with Tumblr yet.\nVisit Settings to authorize Tumblr."
      tumblrAlerted = true
    }
    return {
      systemMessage,
      helpers,
      source,
      timeout
    }
  }

  if (tumblr429Alerted) {
    return {
      helpers,
      source,
      timeout
    }
  }

  try {
    const url = source.url
    // TumblrID takes the form of <blog_name>.tumblr.com
    let tumblrID = url.replace(/https?:\/\//, '')
    tumblrID = tumblrID.replace('/', '')

    const images = await tumblr().getBlogPosts(
      remoteSettings.tumblrKey,
      remoteSettings.tumblrSecret,
      remoteSettings.tumblrOAuthToken,
      remoteSettings.tumblrOAuthTokenSecret,
      tumblrID,
      (helpers.next as number) * 20
    )

    // End loop if we're at end of posts
    if (!images || images.length === 0) {
      helpers.next = undefined
      return {
        data: [],
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    }

    let convertedSource = Array<string>()
    let error
    for (const url of images) {
      try {
        const urls = await convertURL(url)
        convertedSource = convertedSource.concat(urls)
        error = undefined
      } catch (e) {
        error = getError(e)
      }
    }

    helpers.next = (helpers.next as number) + 1
    helpers.count =
      helpers.count +
      filterPathsToJustPlayable(IF.any, convertedSource, false).length
    return {
      error,
      data: filterPathsToJustPlayable(filter, convertedSource, false),
      allPosts,
      weight,
      helpers,
      source,
      timeout
    }
  } catch (e: unknown) {
    let systemMessage
    if (
      (e as Error).message.includes('429 Limit Exceeded') &&
      !tumblr429Alerted &&
      helpers.next === 0
    ) {
      if (!remoteSettings.silenceTumblrAlert) {
        systemMessage =
          'Tumblr has temporarily throttled your FlipFlip due to high traffic. Try again in a few minutes or visit Settings to try a different Tumblr API key.'
      }
      tumblr429Alerted = true
    }
    return {
      error: (e as Error).message,
      systemMessage,
      helpers,
      source,
      timeout
    }
  }
}

export const loadReddit: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 3000
  const configured = remoteSettings.redditRefreshToken !== ''
  if (!configured) {
    let systemMessage
    if (!redditAlerted) {
      systemMessage =
        "You haven't authorized FlipFlip to work with Reddit yet.\nVisit Settings to authorize Reddit."
      redditAlerted = true
    }
    return {
      systemMessage,
      helpers,
      source,
      timeout
    }
  }

  const url = source.url
  if (url.includes('/r/')) {
    try {
      const submissionListing = await reddit().getSubreddit(
        remoteSettings.redditUserAgent,
        remoteSettings.redditClientID,
        remoteSettings.redditRefreshToken,
        source.redditFunc as string,
        getFileGroup(url, path.sep) as string,
        helpers.next as string,
        source.redditTime
      )
      if (submissionListing.length === 0) {
        helpers.next = undefined
        return {
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      }

      let error
      let convertedListing = Array<string>()
      for (const s of submissionListing) {
        try {
          error = undefined
          const urls = await convertURL(s.url)
          convertedListing = convertedListing.concat(urls)
          for (const u of urls) {
            allPosts[u] = 'https://www.reddit.com' + s.permalink
          }
        } catch (e) {
          error = getError(e)
        }
      }

      helpers.next = submissionListing[submissionListing.length - 1].name
      helpers.count =
        helpers.count +
        filterPathsToJustPlayable(IF.any, convertedListing, false).length
      return {
        error,
        data: filterPathsToJustPlayable(filter, convertedListing, false),
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    } catch (e) {
      return {
        error: getError(e),
        helpers,
        source,
        timeout
      }
    }
  } else if (url.includes('/saved')) {
    try {
      const submissionListing = await reddit().getSavedContent(
        remoteSettings.redditUserAgent,
        remoteSettings.redditClientID,
        remoteSettings.redditRefreshToken,
        getFileGroup(url, path.sep) as string,
        helpers.next as string
      )
      if (submissionListing.length === 0) {
        helpers.next = undefined
        return {
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      }

      let error
      let convertedListing = Array<string>()
      for (const s of submissionListing) {
        try {
          error = undefined
          const urls = await convertURL(s.url)
          convertedListing = convertedListing.concat(urls)
          for (const u of urls) {
            allPosts[u] = 'https://www.reddit.com' + s.permalink
          }
        } catch (e) {
          error = getError(e)
        }
      }

      helpers.next = submissionListing[submissionListing.length - 1].name
      helpers.count =
        helpers.count +
        filterPathsToJustPlayable(IF.any, convertedListing, false).length
      return {
        error,
        data: filterPathsToJustPlayable(filter, convertedListing, false),
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    } catch (e) {
      return {
        error: getError(e),
        helpers,
        source,
        timeout
      }
    }
  } else if (url.includes('/user/') || url.includes('/u/')) {
    try {
      const submissionListing = await reddit().getUser(
        remoteSettings.redditUserAgent,
        remoteSettings.redditClientID,
        remoteSettings.redditRefreshToken,
        getFileGroup(url, path.sep) as string,
        helpers.next as string
      )
      if (submissionListing.length === 0) {
        helpers.next = undefined
        return {
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      }

      let error
      let convertedListing = Array<string>()
      for (const s of submissionListing) {
        try {
          error = undefined
          const urls = await convertURL(s.url)
          convertedListing = convertedListing.concat(urls)
          for (const u of urls) {
            allPosts[u] = 'https://www.reddit.com' + s.permalink
          }
        } catch (e) {
          error = getError(e)
        }
      }

      helpers.next = submissionListing[submissionListing.length - 1].name
      helpers.count =
        helpers.count +
        filterPathsToJustPlayable(IF.any, convertedListing, false).length
      return {
        error,
        data: filterPathsToJustPlayable(filter, convertedListing, false),
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    } catch (e) {
      return {
        error: getError(e),
        helpers,
        source,
        timeout
      }
    }
  } else {
    helpers.next = undefined
    return {
      data: [],
      allPosts,
      weight,
      helpers,
      source,
      timeout
    }
  }
}

export const loadRedGifs: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 10000
  const url = source.url
  let apiURL = 'https://api.redgifs.com/v2/'
  const orderRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*order=([^&]*)/.exec(url)
  let order = null
  if (orderRegex) {
    order = orderRegex[1]
  }
  const typeRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*type=(\w)/.exec(url)
  let type = null
  if (typeRegex) {
    type = typeRegex[1]
  }
  const tagsRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*tags=([^&]*)/.exec(url)
  let tags = null
  if (tagsRegex) {
    tags = tagsRegex[1]
  }
  const ratioRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*ratio=(\w)/.exec(url)
  let ratio = null
  if (ratioRegex) {
    ratio = ratioRegex[1]
  }
  const verifiedRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*verified=(\w)/.exec(url)
  let verified = null
  if (verifiedRegex) {
    verified = verifiedRegex[1]
  }
  const longRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*long=(\w)/.exec(url)
  let long = null
  if (longRegex) {
    long = longRegex[1]
  }
  const soundRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*sound=(\w)/.exec(url)
  let sound = null
  if (soundRegex) {
    sound = soundRegex[1]
  }

  if (url.includes('/users/')) {
    apiURL += 'users/' + getFileGroup(url, path.sep) + '/search?'
    if (!order) {
      order = 'recent'
    }
  } else if (url.includes('/browse?')) {
    apiURL += 'gifs/search?search_text=' + tags + '&count=80&'
    if (!order) {
      order = 'trending'
    }
  }
  const page = (helpers.next as number) + 1
  if (type) {
    apiURL += 'type=' + type + '&'
  }
  if (ratio) {
    apiURL += 'ratio=' + ratio + '&'
  }
  if (verified) {
    apiURL += 'verified=' + verified + '&'
  }
  if (long) {
    apiURL += 'long=' + long + '&'
  }
  if (sound) {
    apiURL += 'sound=' + sound + '&'
  }
  apiURL += 'order=' + order + '&page=' + page + ''

  const controller = new AbortController()
  const timeoutID = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(apiURL, { signal: controller.signal })
    clearTimeout(timeoutID)
    const json = await res.json()

    const images = json.gifs
      .map((g?: { urls?: { hd?: string; sd?: string } }) => {
        return g?.urls?.hd ?? g?.urls?.sd ?? ''
      })
      .filter((url: string) => url != '')

    helpers.next =
      json.page === json.pages ? undefined : (helpers.next as number) + 1
    helpers.count =
      helpers.count + filterPathsToJustPlayable(IF.any, images, false).length
    return {
      data: filterPathsToJustPlayable(filter, images, false),
      allPosts,
      weight,
      helpers,
      source,
      timeout
    }
  } catch (e) {
    if (!isAbortError(e)) {
      clearTimeout(timeoutID)
    }

    return {
      error: getError(e),
      helpers,
      source,
      timeout
    }
  }
}

const loadImageFapGallery = async (
  galleryURL: string,
  allPosts: Record<string, string>,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers,
  timeout: number,
  images: Array<string>,
  baseGalleryURL: string,
  onFinishedLoading: (helpers: ScraperHelpers) => void
) => {
  const controller = new AbortController()
  const timeoutID = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(galleryURL, { signal: controller.signal })
    clearTimeout(timeoutID)
    const html = await res.text()
    const galleryDoc = new JSDOM(html, { contentType: 'text/html' }).window
      .document
    const nextGalleryLink = galleryDoc.querySelector(
      '#gallery > font > span > a:last-child'
    )
    const next = helpers.next as number[]
    if (nextGalleryLink && nextGalleryLink.innerHTML === ':: next ::') {
      const search = nextGalleryLink.getAttribute('href') as string
      const params = new URLSearchParams(search)
      next[2] = Number(params.get('page'))
    } else {
      next[2] = -1
    }

    const imageEl = galleryDoc.querySelector(
      '.expp-container > form > table > tbody > tr > td > table > tbody > tr > td > a'
    )

    if (imageEl) {
      const imageURL = 'https://www.imagefap.com' + imageEl.getAttribute('href')
      const imageRes = await fetch(imageURL)
      const imageHtml = await imageRes.text()
      let captcha = undefined
      const ahrefs = new JSDOM(imageHtml, {
        contentType: 'text/html'
      }).window.document.querySelectorAll(
        'a[href^="https://cdnc.imagefap.com/images/full/"]'
      )

      if (ahrefs.length > 0) {
        for (let i = 0; i < ahrefs.length; i++) {
          const url = ahrefs.item(i).getAttribute('href') as string
          images.push(url)
        }
      } else {
        captcha = imageURL
      }

      onFinishedLoading(helpers)
      return {
        captcha,
        data: images,
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    } else {
      let captcha = undefined
      if (html.includes('Enter the captcha')) {
        helpers.count = source.count
        captcha = galleryURL
        return { warning: source.url + ' - blocked due to captcha' }
      }

      onFinishedLoading(helpers)
      return {
        captcha,
        data: [],
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    }
  } catch (e) {
    if (!isAbortError(e)) {
      clearTimeout(timeoutID)
    }

    return {
      error: getError(e),
      helpers,
      source,
      timeout
    }
  }
}

export const loadImageFap: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  if (helpers.next === 0) {
    helpers.next = [0, 0, 0]
  }

  const timeout = 8000
  const url = source.url
  const next = helpers.next as number[]
  if (
    url.includes('/gallery.php') ||
    url.includes('/gallery/') ||
    url.includes('/pictures/')
  ) {
    const images = Array<string>()
    const gid = getFileGroup(url, path.sep)
    const baseGalleryURL = 'https://www.imagefap.com/gallery/' + gid
    return await loadImageFapGallery(
      baseGalleryURL + '?gid=' + gid + '&page=' + next[2] + '&view=0',
      allPosts,
      source,
      filter,
      weight,
      helpers,
      timeout,
      images,
      baseGalleryURL,
      (h) => {
        if (next[2] === -1) {
          h.next = undefined
        }
      }
    )
  } else if (url.includes('/organizer/')) {
    const controller = new AbortController()
    const timeoutID = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(url + '?page=' + next[0], {
        signal: controller.signal
      })
      clearTimeout(timeoutID)
      const html = await res.text()
      const albumEls = new JSDOM(html, {
        contentType: 'text/html'
      }).window.document.querySelectorAll(
        'td.blk_galleries > font > a.blk_galleries'
      )
      if (albumEls.length === 0) {
        let captcha
        if (html.includes('Enter the captcha')) {
          helpers.count = source.count
          captcha =
            'https://www.imagefap.com/gallery/' +
            getFileGroup(url, path.sep) +
            '?view=2'
          return { warning: source.url + ' - blocked due to captcha' }
        }
        helpers.next = undefined
        return {
          captcha,
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      } else if (albumEls.length > next[1]) {
        const albumEl = albumEls[next[1]]
        const albumHref = albumEl.getAttribute('href') as string
        const albumID = albumHref.substring(albumHref.lastIndexOf('/') + 1)

        const images = Array<string>()
        const baseGalleryURL = 'https://www.imagefap.com/gallery/' + albumID
        return await loadImageFapGallery(
          baseGalleryURL + '?gid=' + albumID + '&page=' + next[2] + '&view=0',
          allPosts,
          source,
          filter,
          weight,
          helpers,
          timeout,
          images,
          baseGalleryURL,
          (h) => {
            const n = h.next as number[]
            if (n[2] === -1) {
              n[2] = 0
              n[1] += 1
            }
          }
        )
      } else {
        let captcha
        if (html.includes('Enter the captcha')) {
          helpers.count = source.count
          captcha =
            'https://www.imagefap.com/gallery/' +
            getFileGroup(url, path.sep) +
            '?view=0'
          return { warning: source.url + ' - blocked due to captcha' }
        } else {
          next[0] += 1
          next[1] = 0
        }
        return {
          captcha,
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      }
    } catch (e) {
      if (!isAbortError(e)) {
        clearTimeout(timeoutID)
      }
      return {
        error: getError(e),
        helpers,
        source,
        timeout
      }
    }
  } else if (url.includes('/video.php?vid=')) {
    helpers.next = undefined
    const controller = new AbortController()
    const timeoutID = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutID)
      const html = await res.text()

      const foundVideoConfigURLs =
        /url: '(https:\/\/cdn-fck\.moviefap\.com\/moviefap\/.*)',/g.exec(html)
      if (foundVideoConfigURLs != null && foundVideoConfigURLs.length === 2) {
        const controller = new AbortController()
        const timeoutID = setTimeout(() => controller.abort(), 10000)
        const videoConfigURL = foundVideoConfigURLs[1] // get first group
        try {
          const videoConfigRes = await fetch(videoConfigURL, {
            signal: controller.signal
          })
          clearTimeout(timeoutID)
          const xml = await videoConfigRes.text()
          // Get highest resolution video link
          let res = 0
          let videoLink = ''

          const videoQualities = new JSDOM(xml, {
            contentType: 'application/xml'
          }).window.document.querySelectorAll('flixV2 > quality > item')

          for (let i = 0; i < videoQualities.length; i++) {
            const quality = videoQualities.item(i)
            const newResText =
              quality.querySelector('res')?.innerHTML.slice(0, -1) ?? '-1'
            const newRes = Number(newResText)
            const newVideoLink =
              newRes > res
                ? (quality.querySelector('videoLink')?.textContent ?? '')
                : ''

            if (newVideoLink !== '') {
              res = newRes
              videoLink = newVideoLink
            }
          }

          const data = videoLink
            ? filterPathsToJustPlayable(filter, [videoLink], false)
            : []
          if (data.length > 0) {
            helpers.count = helpers.count + data.length
          }

          helpers.next = undefined
          return {
            data,
            allPosts,
            weight,
            helpers,
            source,
            timeout
          }
        } catch (e) {
          clearTimeout(timeoutID)
          return {
            error: getError(e),
            helpers,
            source,
            timeout
          }
        }
      } else {
        helpers.next = undefined
        return {
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      }
    } catch (e) {
      if (!isAbortError(e)) {
        clearTimeout(timeoutID)
      }
      return {
        error: getError(e),
        helpers,
        source,
        timeout
      }
    }
  } else {
    helpers.next = undefined
    return {
      data: [],
      allPosts,
      weight,
      helpers,
      source,
      timeout
    }
  }
}

export const loadImgur: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 3000
  const url = source.url
  try {
    const album = getFileGroup(url, path.sep) as string
    const images = await imgur().getAlbumImages(album)
    helpers.next = undefined
    helpers.count =
      helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
    return {
      data: filterPathsToJustPlayable(filter, images, true),
      allPosts,
      weight,
      helpers,
      source,
      timeout
    }
  } catch (err) {
    return {
      error: (err as Error).message,
      helpers,
      source,
      timeout
    }
  }
}

export const loadDeviantArt: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 3000
  const controller = new AbortController()
  const timeoutID = setTimeout(() => controller.abort(), 5000)
  const url = source.url
  try {
    const res = await fetch(
      'https://backend.deviantart.com/rss.xml?type=deviation&q=by%3A' +
        getFileGroup(url, path.sep) +
        '+sort%3Atime+meta%3Aall' +
        (helpers.next !== 0 ? '&offset=' + helpers.next : ''),
      { signal: controller.signal }
    )

    clearTimeout(timeoutID)
    if (res.status === 404) {
      return {
        error: 'Not Found',
        helpers,
        source,
        timeout
      }
    }

    const text = await res.text()
    const xml = new JSDOM(text, { contentType: 'application/xml' }).window
      .document
    let hasNextPage = false
    const pages = xml.getElementsByTagName('atom:link')
    for (let l = 0; l < pages.length; l++) {
      if (pages[l].getAttribute('rel') === 'next') hasNextPage = true
    }
    const images = Array<string>()
    const items = xml.getElementsByTagName('item')
    for (let i = 0; i < items.length; i++) {
      helpers.next = (helpers.next as number) + 1
      const contents = items[i].getElementsByTagName('media:content')
      for (let c = 0; c < contents.length; c++) {
        const content = contents[c]
        if (content.getAttribute('medium') === 'image') {
          images.push(content.getAttribute('url') as string)
        }
      }
    }
    if (!hasNextPage) {
      helpers.next = undefined
    }
    helpers.count += filterPathsToJustPlayable(IF.any, images, false).length
    const data = filterPathsToJustPlayable(filter, images, false)
    return {
      data,
      allPosts,
      weight,
      helpers,
      source,
      timeout
    }
  } catch (e) {
    return {
      error: getError(e),
      helpers,
      source,
      timeout
    }
  }
}

export const loadE621: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 8000
  const url = source.url
  const hostRegex = /^(https?:\/\/[^/]*)\//g
  const regexResult = hostRegex.exec(url)
  const thisHost = regexResult != null ? regexResult[1] : ''
  let suffix = ''
  if (url.includes('/pools/')) {
    suffix = '/pools.json?search[id]=' + url.substring(url.lastIndexOf('/') + 1)
    const controller = new AbortController()
    const timeoutID = setTimeout(() => controller.abort(), 5000)
    try {
      const res = await fetch(thisHost + suffix, { signal: controller.signal })
      clearTimeout(timeoutID)
      if (res.status === 400 || res.status === 404 || res.status === 500) {
        return {
          error: res.statusText,
          helpers,
          source,
          timeout
        }
      }

      const json = await res.json()
      if (json.length === 0) {
        helpers.next = undefined
        return {
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      }

      const images = Array<string>()
      for (const postID of json[0].post_ids) {
        const controller = new AbortController()
        const timeoutID = setTimeout(() => controller.abort(), 5000)
        suffix = '/posts/' + postID + '.json'
        const postRes = await fetch(thisHost + suffix, {
          signal: controller.signal
        })

        clearTimeout(timeoutID)
        if (
          postRes.status === 400 ||
          postRes.status === 404 ||
          postRes.status === 500
        ) {
          return {
            error: postRes.statusText,
            helpers,
            source,
            timeout
          }
        }

        const postJson = await postRes.json()
        if (postJson.post?.file.url) {
          let fileURL = postJson.post.file.url
          if (!fileURL.startsWith('http')) {
            fileURL = 'https://' + fileURL
          }
          images.push(fileURL)
        }
      }

      helpers.next = undefined
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
      return {
        data: filterPathsToJustPlayable(filter, images, true),
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    } catch (e) {
      clearTimeout(timeoutID)
      return {
        error: getError(e),
        helpers,
        source,
        timeout
      }
    }
  } else {
    suffix = '/posts.json?limit=20&page=' + ((helpers.next as number) + 1)
    const tagRegex = /[?&]tags=(.*)&?/g
    let tags
    if ((tags = tagRegex.exec(url)) !== null) {
      suffix += '&tags=' + tags[1]
    }

    const controller = new AbortController()
    const timeoutID = setTimeout(() => controller.abort(), 5000)
    try {
      const res = await fetch(thisHost + suffix, { signal: controller.signal })
      clearTimeout(timeoutID)
      if (res.status === 400 || res.status === 404 || res.status === 500) {
        return {
          error: res.statusText,
          helpers,
          source,
          timeout
        }
      }

      const json = await res.json()
      if (json.length === 0) {
        helpers.next = undefined
        return {
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      }

      const list = json.posts
      const images = Array<string>()
      for (const p of list) {
        if (p.file.url) {
          let fileURL = p.file.url
          if (!fileURL.startsWith('http')) {
            fileURL = 'https://' + fileURL
          }
          images.push(fileURL)
        }
      }

      helpers.next = (helpers.next as number) + 1
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
      return {
        data: filterPathsToJustPlayable(filter, images, true),
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    } catch (e) {
      clearTimeout(timeoutID)
      return {
        error: getError(e),
        helpers,
        source,
        timeout
      }
    }
  }
}

export const loadDanbooru: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 8000
  const url = source.url
  const hostRegex = /^(https?:\/\/[^/]*)\//g
  const regexResult = hostRegex.exec(url)
  const thisHost = regexResult != null ? regexResult[1] : ''
  let suffix = ''
  if (url.includes('/pools/')) {
    suffix = '/pools/' + url.substring(url.lastIndexOf('/') + 1) + '.json'
  } else if (url.includes('favorite_groups')) {
    suffix =
      '/favorite_groups/' + url.substring(url.lastIndexOf('/') + 1) + '.json'
  } else {
    suffix = '/post/index.json?limit=20&page=' + ((helpers.next as number) + 1)
    const tagRegex = /[?&]tags=(.*)&?/g
    let tags
    if ((tags = tagRegex.exec(url)) !== null) {
      suffix += '&tags=' + tags[1]
    }
    const titleRegex = /[?&]title=(.*)&?/g
    let title
    if ((title = titleRegex.exec(url)) !== null) {
      if (tags == null) {
        suffix += '&tags='
      } else if (!suffix.endsWith('+')) {
        suffix += '+'
      }
      suffix += title[1]
    }
  }

  const controller = new AbortController()
  const timeoutID = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(thisHost + suffix)
    clearTimeout(timeoutID)
    if (res.status === 400 || res.status === 404 || res.status === 500) {
      return {
        error: res.statusText,
        helpers,
        source,
        timeout
      }
    }

    const json = await res.json()
    if (json.length === 0) {
      helpers.next = undefined
      return {
        data: [],
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    }

    if (json.post_ids) {
      if (json.post_ids.length === 0) {
        helpers.next = undefined
        return {
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      }

      const images = Array<string>()
      const postIDs = json.post_ids
      const limit = 10
      let current = 0
      const end = Math.min(current + limit, postIDs.length)
      while (current < end) {
        const controller = new AbortController()
        const timeoutID = setTimeout(() => controller.abort(), 5000)
        const postRes = await fetch(
          thisHost + '/posts/' + postIDs[current++] + '.json',
          {
            signal: controller.signal
          }
        )

        clearTimeout(timeoutID)
        if (
          postRes.status === 400 ||
          postRes.status === 404 ||
          postRes.status === 500
        ) {
          return {
            error: postRes.statusText,
            helpers,
            source,
            timeout
          }
        }

        const postJson = await postRes.json()
        images.push(postJson.file_url)
      }

      helpers.next = postIDs.length === current ? undefined : current
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
      return {
        data: filterPathsToJustPlayable(filter, images, true),
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    } else {
      const images = Array<string>()
      for (const p of json) {
        if (p.file_url) {
          let fileURL = p.file_url
          if (!p.file_url.startsWith('http')) {
            fileURL = 'https://' + p.file_url
          }
          images.push(fileURL)
        }
      }

      helpers.next = (helpers.next as number) + 1
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
      return {
        data: filterPathsToJustPlayable(filter, images, true),
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    }
  } catch (e) {
    clearTimeout(timeoutID)
    return {
      error: getError(e),
      helpers,
      source,
      timeout
    }
  }
}

export const loadGelbooru1: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 8000
  const url = source.url
  const hostRegex = /^(https?:\/\/[^/]*)\//g
  const regexResult = hostRegex.exec(url)
  const thisHost = regexResult != null ? regexResult[1] : ''
  const controller = new AbortController()
  const timeoutID = setTimeout(() => controller.abort(), 5000)
  const limit = 10
  try {
    const res = await fetch(url + '&pid=' + (helpers.next as number) * limit, {
      signal: controller.signal
    })

    clearTimeout(timeoutID)
    if (res.status === 404 || res.status === 503) {
      return {
        error: res.statusText,
        helpers,
        source,
        timeout
      }
    }

    const html = await res.text()
    const imageEls = new JSDOM(html, {
      contentType: 'text/html'
    }).window.document.querySelectorAll('span.thumb > a')
    if (imageEls.length === 0) {
      helpers.next = undefined
      return {
        data: [],
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    }

    const images = Array<string>()
    const end = Math.min(limit, imageEls.length)
    for (let index = 0; index < end; index++) {
      let link = imageEls.item(index).getAttribute('href') as string
      if (!link.startsWith('http')) {
        link = thisHost + '/' + link
      }

      const controller = new AbortController()
      const timeoutID = setTimeout(() => controller.abort(), 5000)
      const imgRes = await fetch(link, { signal: controller.signal })
      clearTimeout(timeoutID)
      if (imgRes.status === 404 || imgRes.status === 503) {
        throw new Error(imgRes.statusText)
      }

      const imgHtml = await imgRes.text()
      let contentURL = imgHtml.match('<img[^>]*id="?image"?[^>]*src="([^"]*)"')
      if (contentURL != null) {
        let url = contentURL[1]
        if (url.startsWith('//')) url = 'http:' + url
        images.push(url)
      }
      contentURL = imgHtml.match('<img[^>]*src="([^"]*)"[^>]*id="?image"?')
      if (contentURL != null) {
        let url = contentURL[1]
        if (url.startsWith('//')) url = 'http:' + url
        images.push(url)
      }
      contentURL = imgHtml.match('<video[^>]*src="([^"]*)"')
      if (contentURL != null) {
        let url = contentURL[1]
        if (url.startsWith('//')) url = 'http:' + url
        images.push(url)
      }
    }

    helpers.next = (helpers.next as number) + 1
    helpers.count =
      helpers.count + filterPathsToJustPlayable(IF.any, images, false).length
    return {
      data: filterPathsToJustPlayable(filter, images, false),
      allPosts,
      weight,
      helpers,
      source,
      timeout
    }
  } catch (e) {
    clearTimeout(timeoutID)
    return {
      error: getError(e),
      helpers,
      source,
      timeout
    }
  }
}

export const loadGelbooru2: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 8000
  const url = source.url
  const hostRegex = /^(https?:\/\/[^/]*)\//g
  const regexResult = hostRegex.exec(url)
  const thisHost = regexResult != null ? regexResult[1] : ''
  let suffix =
    '/index.php?page=dapi&s=post&q=index&limit=20&json=1&pid=' +
    ((helpers.next as number) + 1)
  const tagRegex = /[?&]tags=(.*)&?/g
  let tags
  if ((tags = tagRegex.exec(url)) !== null) {
    suffix += '&tags=' + tags[1]
  }

  const controller = new AbortController()
  const timeoutID = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(thisHost + suffix, { signal: controller.signal })
    clearTimeout(timeoutID)
    if (res.status === 400 || res.status === 404 || res.status === 500) {
      return {
        error: res.statusText,
        helpers,
        source,
        timeout
      }
    }

    const json = await res.json()
    if (json.length === 0) {
      helpers.next = undefined
      return {
        data: [],
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    }

    const images = Array<string>()
    for (const p of json) {
      if (p.file_url) {
        images.push(p.file_url)
      } else if (p.image) {
        images.push(thisHost + '//images/' + p.directory + '/' + p.image)
      }
    }

    helpers.next = (helpers.next as number) + 1
    helpers.count =
      helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
    return {
      data: filterPathsToJustPlayable(filter, images, true),
      allPosts,
      weight,
      helpers,
      source,
      timeout
    }
  } catch (e) {
    clearTimeout(timeoutID)
    return {
      error: getError(e),
      helpers,
      source,
      timeout
    }
  }
}

export const loadEHentai: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 8000
  const url = source.url
  const controller = new AbortController()
  const timeoutID = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(url + '?p=' + ((helpers.next as number) + 1), {
      signal: controller.signal
    })

    clearTimeout(timeoutID)
    if (res.status === 404) {
      return {
        error: res.statusText,
        helpers,
        source,
        timeout
      }
    }

    const html = await res.text()
    const imageEls = new JSDOM(html, {
      contentType: 'text/html'
    }).window.document.querySelectorAll('#gdt > .gdtm > div > a')
    if (imageEls.length > 0) {
      const images = Array<string>()
      for (let i = 0; i < imageEls.length; i++) {
        const image = imageEls.item(i)
        const controller = new AbortController()
        const timeoutID = setTimeout(() => controller.abort(), 5000)
        const imgRes = await fetch(image.getAttribute('href') as string, {
          signal: controller.signal
        })

        clearTimeout(timeoutID)
        if (imgRes.status === 404) {
          throw new Error(imgRes.statusText)
        }

        const imgHtml = await imgRes.text()
        const contentURL = imgHtml.match('<img id="img" src="(.*?)"')
        if (contentURL != null) {
          images.push(contentURL[1])
        }
      }

      helpers.next = (helpers.next as number) + 1
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
      return {
        data: filterPathsToJustPlayable(filter, images, true),
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    } else {
      helpers.next = undefined
      return {
        data: [],
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    }
  } catch (e) {
    clearTimeout(timeoutID)
    return {
      error: getError(e),
      helpers,
      source,
      timeout
    }
  }
}

export const loadLuscious: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 5000
  const url = source.url
  if (url.includes('albums')) {
    const name = getFileGroup(url, path.sep) as string
    const id = name.substring(name.indexOf('_') + 1, name.length)
    const controller = new AbortController()
    const timeoutID = setTimeout(() => controller.abort(), 5000)
    try {
      const res = await fetch(
        'https://members.luscious.net/graphql/nobatch/?operationName=AlbumListOwnPictures',
        {
          method: 'post',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            operationName: 'AlbumListOwnPictures',
            query:
              'query AlbumListOwnPictures($input: PictureListInput!) {\n' +
              'picture {\n' +
              'list(input: $input) {\n' +
              'info {...FacetCollectionInfo}\n' +
              'items {...PictureStandardWithoutAlbum}\n' +
              '}\n' +
              '}\n' +
              '}\n' +
              'fragment FacetCollectionInfo on FacetCollectionInfo {\n' +
              'page\n' +
              'has_next_page\n' +
              'has_previous_page\n' +
              'total_items\n' +
              'total_pages\n' +
              'items_per_page\n' +
              '}\n' +
              'fragment PictureStandardWithoutAlbum on Picture {\n' +
              'url_to_original\n' +
              'url_to_video\n' +
              'url\n' +
              '}',
            variables: {
              input: {
                filters: [
                  {
                    name: 'album_id',
                    value: id
                  }
                ],
                display: 'position',
                page: (helpers.next as number) + 1
              }
            }
          })
        }
      )

      clearTimeout(timeoutID)
      if (res.status === 404) {
        return {
          error: res.statusText,
          helpers,
          source,
          timeout
        }
      }

      const json = await res.json()
      const hasNextPage = json.data.picture.list.info.has_next_page
      const items = json.data.picture.list.items
      const totalItems = json.data.picture.list.info.total_items
      if (items.length > 0) {
        const images = []
        for (const item of items) {
          images.push(item.url_to_original)
        }
        helpers.next = hasNextPage ? (helpers.next as number) + 1 : undefined
        helpers.count = totalItems
        // If cdnio image server goes down, use this: filterPathsToJustPlayable(filter, images, true).map((s) => s.replace('cdnio.', 'w1680.')),
        const data = filterPathsToJustPlayable(filter, images, true)
        return {
          data,
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      } else {
        helpers.next = undefined
        return {
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      }
    } catch (e) {
      clearTimeout(timeoutID)
      return {
        error: getError(e),
        helpers,
        source,
        timeout
      }
    }
  } else {
    const id = getFileGroup(url, path.sep)
    if (helpers.next === 0) {
      helpers.next = [0, 0, 0]
    }

    const next = helpers.next as number[]
    const controller = new AbortController()
    const timeoutID = setTimeout(() => controller.abort(), 5000)
    try {
      const res = await fetch(
        'https://members.luscious.net/graphql/nobatch/?operationName=AlbumList',
        {
          method: 'post',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            operationName: 'AlbumList',
            query:
              'query AlbumList($input: AlbumListInput!) {\n' +
              'album {\n' +
              'list(input: $input) {\n' +
              'info {...FacetCollectionInfo}\n' +
              'items {...AlbumMinimal}\n' +
              '}\n' +
              '}\n' +
              '}\n' +
              'fragment FacetCollectionInfo on FacetCollectionInfo {\n' +
              'page\n' +
              'has_next_page\n' +
              'has_previous_page\n' +
              'total_items\n' +
              'total_pages\n' +
              'url_complete\n' +
              '}\n' +
              'fragment AlbumMinimal on Album {\n' +
              'id\n' +
              '}',
            variables: {
              input: {
                display: 'date_newest',
                filters: [
                  {
                    name: 'created_by_id',
                    value: id
                  }
                ],
                page: next[0] + 1
              }
            }
          })
        }
      )

      clearTimeout(timeoutID)
      if (res.status === 404) {
        return {
          error: res.statusText,
          helpers,
          source,
          timeout
        }
      }

      const json = await res.json()
      const userHasNextPage = json.data.album.list.info.has_next_page
      const albums = json.data.album.list.items
      if (albums.length > 0) {
        const album = albums[next[1]]
        const controller = new AbortController()
        const timeoutID = setTimeout(() => controller.abort(), 5000)
        const albumRes = await fetch(
          'https://members.luscious.net/graphql/nobatch/?operationName=AlbumListOwnPictures',
          {
            method: 'post',
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              operationName: 'AlbumListOwnPictures',
              query:
                'query AlbumListOwnPictures($input: PictureListInput!) {\n' +
                'picture {\n' +
                'list(input: $input) {\n' +
                'info {...FacetCollectionInfo}\n' +
                'items {...PictureStandardWithoutAlbum}\n' +
                '}\n' +
                '}\n' +
                '}\n' +
                'fragment FacetCollectionInfo on FacetCollectionInfo {\n' +
                'page\n' +
                'has_next_page\n' +
                'has_previous_page\n' +
                'total_items\n' +
                'total_pages\n' +
                'items_per_page\n' +
                '}\n' +
                'fragment PictureStandardWithoutAlbum on Picture {\n' +
                'url_to_original\n' +
                'url_to_video\n' +
                'url\n' +
                '}',
              variables: {
                input: {
                  filters: [
                    {
                      name: 'album_id',
                      value: album.id
                    }
                  ],
                  display: 'rating_all_time',
                  page: next[2] + 1
                }
              }
            })
          }
        )

        clearTimeout(timeoutID)
        if (res.status === 404) {
          return {
            error: res.statusText,
            helpers,
            source,
            timeout
          }
        }

        const albumJson = await albumRes.json()
        const hasNextPage = albumJson.data.picture.list.info.has_next_page
        if (hasNextPage) {
          next[2] += 1
        } else {
          if (next[1] < albums.length - 1) {
            next[1] += 1
            next[2] = 0
          } else {
            if (userHasNextPage) {
              next[0] += 1
              next[1] = 0
              next[2] = 0
            } else {
              helpers.next = undefined
            }
          }
        }
        const items = albumJson.data.picture.list.items
        if (items.length > 0) {
          const images = []
          for (const item of items) {
            images.push(item.url_to_original)
          }
          helpers.count += filterPathsToJustPlayable(
            IF.any,
            images,
            true
          ).length
          const data = filterPathsToJustPlayable(filter, images, true)
          return {
            data,
            allPosts,
            weight,
            helpers,
            source,
            timeout
          }
        } else {
          return {
            data: [],
            allPosts,
            weight,
            helpers,
            source,
            timeout
          }
        }
      } else {
        helpers.next = undefined
        return {
          warning: json,
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      }
    } catch (e) {
      clearTimeout(timeoutID)
      return {
        error: getError(e),
        helpers,
        source,
        timeout
      }
    }
  }
}

export const loadBDSMlr: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 8000
  let url = source.url
  if (url.endsWith('/rss')) {
    url = url.substring(0, url.indexOf('/rss'))
  }
  const retry = () => {
    if (helpers.retries < 3) {
      helpers.retries += 1
      return {
        data: [],
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    } else {
      return {
        helpers,
        source,
        timeout
      }
    }
  }

  const controller = new AbortController()
  const timeoutID = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(
      url + '/rss?page=' + ((helpers.next as number) + 1),
      {
        signal: controller.signal
      }
    )

    if (res.status === 404) {
      return {
        error: res.statusText,
        helpers,
        source,
        timeout
      }
    } else if (res.status === 500) {
      return retry()
    }

    const xml = await res.text()
    helpers.retries = 0
    const itemEls = new JSDOM(xml, {
      contentType: 'application/xml'
    }).window.document.querySelectorAll('item')
    if (itemEls.length > 0) {
      const requests: ProxyRequest[] = []
      for (let i = 0; i < itemEls.length; i++) {
        const item = itemEls.item(i)
        const link = item.querySelector('link')?.textContent
        const referer = new URL(link as string).origin
        const headers = { Referer: referer }

        const embeddedImages = item.querySelectorAll('description > img')
        if (embeddedImages.length > 0) {
          for (const image of embeddedImages) {
            const url = image.getAttribute('src') as string
            requests.push({ url, headers })
          }
        }
      }
      helpers.next = (helpers.next as number) + 1
      helpers.count += filterRequestsToJustPlayable(
        IF.any,
        requests,
        true
      ).length
      const data = filterRequestsToJustPlayable(filter, requests, true).map(
        (request) => request.url + ':::' + JSON.stringify(request.headers)
      )
      return {
        data,
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    } else {
      helpers.next = undefined
      return {
        data: [],
        allPosts,
        weight,
        helpers,
        source,
        timeout
      }
    }
  } catch (e) {
    clearTimeout(timeoutID)
    if (isAbortError(e)) {
      return retry()
    } else {
      return {
        error: getError(e),
        helpers,
        source,
        timeout
      }
    }
  }
}

let piwigoLoggedIn = false
export const loadPiwigo: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 8000
  const url = source.url

  const user = remoteSettings.piwigoUsername
  const pass = remoteSettings.piwigoPassword
  const host = remoteSettings.piwigoHost
  const protocol = remoteSettings.piwigoProtocol
  const configured =
    host !== '' && protocol !== '' && user !== '' && pass !== ''

  if (configured) {
    const login = async () => {
      const controller = new AbortController()
      const timeoutID = setTimeout(() => controller.abort(), 5000)
      try {
        const res = await fetch(
          protocol + '://' + host + '/ws.php?format=json',
          {
            method: 'post',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              method: 'pwg.session.login',
              username: user,
              password: pass
            })
          }
        )

        clearTimeout(timeoutID)
        if (res.status === 404 || res.status === 500) {
          return {
            error: res.statusText,
            helpers,
            source,
            timeout
          }
        }

        const json = await res.json()
        if (json.stat === 'ok') {
          piwigoLoggedIn = true
          return await search()
        } else {
          return {
            error: 'Piwigo login failed.',
            helpers,
            source,
            timeout
          }
        }
      } catch (e) {
        clearTimeout(timeoutID)
        return {
          error: getError(e),
          helpers,
          source,
          timeout
        }
      }
    }

    const retry = () => {
      if (helpers.retries < 3) {
        helpers.retries += 1
        return {
          data: [],
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      } else {
        return {
          helpers,
          source,
          timeout
        }
      }
    }

    const search = async () => {
      const controller = new AbortController()
      const timeoutID = setTimeout(() => controller.abort(), 5000)
      try {
        const res = await fetch(url + '&page=' + helpers.next, {
          signal: controller.signal
        })
        clearTimeout(timeoutID)
        if (res.status === 404) {
          return {
            error: res.statusText,
            helpers,
            source,
            timeout
          }
        } else if (res.status === 500) {
          return retry()
        }

        const json = await res.json()
        if (json.stat !== 'ok') {
          helpers.next = undefined
          return {
            data: [],
            allPosts,
            weight,
            helpers,
            source,
            timeout
          }
        }

        const images = Array<string>()
        if (json?.result?.images) {
          for (let o = 0; o < json.result.images.length; o++) {
            const image = json.result.images[o]
            if (image.element_url) {
              images.push(image.element_url)
            }
          }
        }

        if (images.length > 0) {
          helpers.next = (helpers.next as number) + 1
          helpers.count =
            helpers.count +
            filterPathsToJustPlayable(IF.any, images, true).length
        } else {
          helpers.next = undefined
        }

        return {
          data: filterPathsToJustPlayable(filter, images, true),
          allPosts,
          weight,
          helpers,
          source,
          timeout
        }
      } catch (e) {
        clearTimeout(timeoutID)
        return {
          error: getError(e),
          helpers,
          source,
          timeout
        }
      }
    }

    if (!piwigoLoggedIn) {
      return await login()
    } else {
      return await search()
    }
  } else {
    let systemMessage
    if (!piwigoAlerted) {
      systemMessage =
        "You haven't configured FlipFlip to work with Piwigo yet.\nVisit Settings to configure Piwigo."
      piwigoAlerted = true
    }
    return {
      systemMessage,
      helpers,
      source,
      timeout
    }
  }
}

export const loadHydrus: WorkerFunction = async (
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
) => {
  const timeout = 8000
  const chunk = 1000
  const apiKey = remoteSettings.hydrusAPIKey
  const configured = apiKey !== ''
  if (configured) {
    const protocol = remoteSettings.hydrusProtocol
    const domain = remoteSettings.hydrusDomain
    const port = remoteSettings.hydrusPort
    const hydrusURL = protocol + '://' + domain + ':' + port

    if (!source.url.startsWith(hydrusURL)) {
      let systemMessage
      if (!hydrusAlerted) {
        systemMessage =
          "Source url '" +
          source.url +
          "' does not match configured Hydrus server '" +
          hydrusURL
        hydrusAlerted = true
      }
      return {
        systemMessage,
        helpers,
        source,
        timeout
      }
    }

    const tagsRegex = /tags=([^&]*)&?.*$/.exec(source.url)
    const noTags = tagsRegex == null || tagsRegex.length <= 1

    let pages = 0
    const search = async () => {
      const controller = new AbortController()
      const timeoutID = setTimeout(() => controller.abort(), 15000)
      const url = noTags
        ? hydrusURL + '/get_files/search_files'
        : hydrusURL + '/get_files/search_files?tags=' + tagsRegex[1]
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'Hydrus-Client-API-Access-Key': apiKey }
        })

        clearTimeout(timeoutID)
        if (res.status === 404 || res.status === 500) {
          return {
            error: res.statusText,
            helpers,
            source,
            timeout
          }
        }

        const json = await res.json()
        const fileIDs = json.file_ids
        pages = Math.ceil(fileIDs.length / chunk)
        return await getFileMetadata(fileIDs, 0)
      } catch (e) {
        clearTimeout(timeoutID)
        return {
          error: getError(e),
          helpers,
          source,
          timeout
        }
      }
    }

    const images = Array<string>()
    const getFileMetadata = async (fileIDs: number[], page: number) => {
      const controller = new AbortController()
      const timeoutID = setTimeout(() => controller.abort(), 15000)
      const pageIDs = fileIDs.slice(page * chunk, (page + 1) * chunk)
      try {
        const res = await fetch(
          hydrusURL +
            '/get_files/file_metadata?file_ids=[' +
            pageIDs.toString() +
            ']',
          {
            signal: controller.signal,
            headers: { 'Hydrus-Client-API-Access-Key': apiKey }
          }
        )

        clearTimeout(timeoutID)
        if (res.status === 404 || res.status === 500) {
          return {
            error: res.statusText,
            helpers,
            source,
            timeout
          }
        }

        const json = await res.json()
        for (const metadata of json.metadata) {
          if (
            (filter === IF.any && isImageOrVideo(metadata.ext, true)) ||
            ((filter === IF.stills || filter === IF.images) &&
              isImage(metadata.ext, true)) ||
            (filter === IF.animated &&
              metadata.ext.toLowerCase().endsWith('.gif')) ||
            isVideo(metadata.ext, true) ||
            (filter === IF.videos && isVideo(metadata.ext, true))
          ) {
            const { file_id, ext } = metadata
            const url = `${hydrusURL}/get_files/file?file_id=${file_id}&Hydrus-Client-API-Access-Key=${apiKey}&ext=${ext}`
            images.push(url)
          }
        }

        page += 1
        if (page === pages) {
          return {
            data: images,
            allPosts,
            weight,
            helpers,
            source,
            timeout
          }
        } else {
          return await getFileMetadata(fileIDs, page)
        }
      } catch (e) {
        clearTimeout(timeoutID)
        return {
          error: getError(e),
          helpers,
          source,
          timeout
        }
      }
    }

    return await search()
  } else {
    let systemMessage
    if (!hydrusAlerted) {
      systemMessage =
        "You haven't configured FlipFlip to work with Hydrus yet.\nVisit Settings to configure Hydrus."
      hydrusAlerted = true
    }
    return {
      systemMessage,
      helpers,
      source,
      timeout
    }
  }
}

let _redgifOAuth: string | undefined = undefined
async function convertURL(url: string): Promise<string[]> {
  if (url.includes('.gifv')) {
    return [url.replace('.gifv', '.mp4')]
  }

  // If this is a imgur image page, return image file
  const imgurMatch = url.match('^https?://(?:m.)?imgur.com/([\\w\\d]{7})$')
  if (imgurMatch != null) {
    return ['https://i.imgur.com/' + imgurMatch[1] + '.jpg']
  }

  // If this is imgur album, return album images
  const imgurAlbumMatch = url.match('^https?://imgur.com/a/([\\w\\d]{7})$')
  if (imgurAlbumMatch != null) {
    const album = getFileGroup(url, path.sep) as string
    return await imgur().getAlbumImages(album)
  }

  // If this is gfycat page, return gfycat image
  const gfycatMatch = url.match('^https?://gfycat.com/(?:ifr/)?(\\w*)$')
  if (gfycatMatch != null) {
    // Only lookup CamelCase url if not already CamelCase
    if (/[A-Z]/.test(gfycatMatch[1])) {
      return ['https://giant.gfycat.com/' + gfycatMatch[1] + '.mp4']
    }

    const res = await fetch(url)
    if (res.status === 404) {
      return [url]
    }

    const html = await res.text()
    const gfycat = new JSDOM(html, {
      contentType: 'text/html'
    }).window.document.querySelectorAll(
      '#video-' + gfycatMatch[1].toLocaleLowerCase() + ' > source'
    )

    if (gfycat.length > 0) {
      for (const source of gfycat) {
        if (source.getAttribute('type') === 'video/webm') {
          return [source.getAttribute('src') as string]
        }
      }
      // Fallback to MP4
      for (const source of gfycat) {
        if (
          source.getAttribute('type') === 'video/mp4' &&
          !source.getAttribute('src')?.endsWith('-mobile.mp4')
        ) {
          return [source.getAttribute('src') as string]
        }
      }
      // Fallback to MP4-mobile
      for (const source of gfycat) {
        if (source.getAttribute('type') === 'video/mp4') {
          return [source.getAttribute('src') as string]
        }
      }
    }

    return [url] // Not Found
  }

  // If this is redgif page, return redgif image
  const redgifMatch =
    /^https?:\/\/(?:www\.)?redgifs\.com\/watch\/(\w*).*$/.exec(url)
  if (redgifMatch != null) {
    if (_redgifOAuth == null) {
      const res = await fetch('https://api.redgifs.com/v2/oauth/client', {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: '183c871ed84-0009-314e-0005-2eb73632ccb8',
          client_secret: 'e600b7ca33a0d5a012df08468b3adb25'
        })
      })

      const json = await res.json()
      _redgifOAuth = json.access_token
        ? 'Bearer ' + json.access_token
        : undefined
    }
    if (_redgifOAuth == null) {
      return []
    }

    const res = await fetch(
      'https://api.redgifs.com/v2/gifs/' + redgifMatch[1],
      {
        headers: {
          Authorization: _redgifOAuth
        }
      }
    )
    if (res.status === 404) {
      return [url]
    }

    const json = await res.json()
    if (json.gif.urls.hd) {
      return [json.gif.urls.hd]
    }
    if (json.gif.urls.sd) {
      return [json.gif.urls.sd]
    }
    return []
  }

  if (url.includes('redgifs') || url.includes('gfycat')) {
    logger.warn('Possible missed file: ' + url)
  }

  return [url]
}

parentPort?.on('message', async (request) => {
  const { allPosts, caching, remoteSettings, source, filter, weight, helpers } =
    request as ScrapeRequest

  const result = await scrapeFiles(
    allPosts,
    caching,
    remoteSettings,
    source,
    filter,
    weight,
    helpers
  )
  parentPort?.postMessage(result)
})

export async function scrapeFiles(
  allPosts: Record<string, string>,
  caching: CacheSettings,
  remoteSettings: RemoteSettings,
  source: ContentSource,
  filter: string,
  weight: string,
  helpers: ScraperHelpers
): Promise<ScrapeResult> {
  const cachePath = async (caching: CacheSettings, source: ContentSource) => {
    if (!caching.enabled) {
      return undefined
    }

    const sourceCachePath =
      getCachePath(caching.directory, source.url) +
      getFileName(source.url, path.sep)

    const exists = await fileExists(sourceCachePath)
    return exists ? sourceCachePath : undefined
  }

  const sourceType = getSourceType(source.url)
  if (sourceType === ST.local) {
    // Local files
    return await loadLocalDirectory(
      allPosts,
      caching,
      source,
      filter,
      weight,
      helpers,
      ''
    )
  } else if (sourceType === ST.list) {
    // Image List
    helpers.next = undefined
    return await loadRemoteImageURLList(
      allPosts,
      caching,
      source,
      filter,
      weight,
      helpers
    )
  } else if (sourceType === ST.video) {
    const path = (await cachePath(caching, source)) ?? ''
    return await loadVideo(
      allPosts,
      caching,
      source,
      filter,
      weight,
      helpers,
      path
    )
  } else if (sourceType === ST.playlist) {
    const path = (await cachePath(caching, source)) ?? ''
    return await loadPlaylist(
      allPosts,
      caching,
      source,
      filter,
      weight,
      helpers,
      path
    )
  } else if (sourceType === ST.nimja) {
    return await loadNimja(
      allPosts,
      caching,
      remoteSettings,
      source,
      filter,
      weight,
      helpers
    )
  } else {
    // Paging sources
    let workerFunction: WorkerFunction | undefined = undefined
    if (sourceType === ST.tumblr) {
      workerFunction = loadTumblr
    } else if (sourceType === ST.reddit) {
      workerFunction = loadReddit
    } else if (sourceType === ST.redgifs) {
      workerFunction = loadRedGifs
    } else if (sourceType === ST.imagefap) {
      workerFunction = loadImageFap
    } else if (sourceType === ST.imgur) {
      workerFunction = loadImgur
    } else if (sourceType === ST.deviantart) {
      workerFunction = loadDeviantArt
    } else if (sourceType === ST.danbooru) {
      workerFunction = loadDanbooru
    } else if (sourceType === ST.e621) {
      workerFunction = loadE621
    } else if (sourceType === ST.luscious) {
      workerFunction = loadLuscious
    } else if (sourceType === ST.gelbooru1) {
      workerFunction = loadGelbooru1
    } else if (sourceType === ST.gelbooru2) {
      workerFunction = loadGelbooru2
    } else if (sourceType === ST.ehentai) {
      workerFunction = loadEHentai
    } else if (sourceType === ST.bdsmlr) {
      workerFunction = loadBDSMlr
    } else if (sourceType === ST.hydrus) {
      workerFunction = loadHydrus
    } else if (sourceType === ST.piwigo) {
      workerFunction = loadPiwigo
    }
    if (workerFunction == null) {
      return {
        allPosts,
        weight,
        helpers,
        source,
        error: `No worker for type: ${sourceType}`
      }
    }
    if (helpers.next === -1) {
      helpers.next = 0
      const cacheDir = getCachePath(caching.directory, source.url)
      if (
        caching.enabled &&
        (await fileExists(cacheDir)) &&
        (await fs.promises.readdir(cacheDir)).length > 0
      ) {
        // If the cache directory exists, use it
        return await loadLocalDirectory(
          allPosts,
          caching,
          source,
          filter,
          weight,
          helpers,
          cacheDir
        )
      } else {
        return await workerFunction(
          allPosts,
          caching,
          remoteSettings,
          source,
          filter,
          weight,
          helpers
        )
      }
    } else {
      return await workerFunction(
        allPosts,
        caching,
        remoteSettings,
        source,
        filter,
        weight,
        helpers
      )
    }
  }
}

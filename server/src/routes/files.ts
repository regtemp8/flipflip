import fs, { Dirent } from 'fs'
import path from 'path'
import express, { Request, Response } from 'express'
import {
  AF,
  FilePickerData,
  FilePickerItem,
  isAudio,
  isImage,
  isVideo,
  isVideoPlaylist
} from 'flipflip-common'
import Logger from '../logging/Logger'
import { getSaveDir, getThumbsDir } from '../utils'
import { findCaptionScriptUrlById } from '../db/CaptionScriptRepository'
import { findAudioUrlById } from '../db/AudioRepository'
import { findContentSourceUrlById } from '../db/ContentSourceRepository'
import { User } from '../db/types/entities'
import proxy from './ProxyService'
import fileRegistry from './FileRegistry'

const logger = Logger.create('files')
const typeDirs = new Map<string, string | undefined>([
  [AF.script, process.env.FF_SCRIPT_DIR],
  [AF.audios, process.env.FF_AUDIO_DIR],
  [AF.directory, process.env.FF_CONTENT_DIR],
  [AF.videos, process.env.FF_VIDEO_DIR],
  [AF.videoDir, process.env.FF_VIDEO_DIR]
])

const router = express.Router()
router.get('/pick', async (req, res) => {
  const type = req.query.type as string
  let dir = req.query.dir
    ? (req.query.dir as string)
    : (typeDirs.get(type) ?? getSaveDir())

  dir = path.resolve(dir)
  if (!fs.existsSync(dir)) {
    res.status(400).send({ error: `Path '${dir}' doesn't exist` })
    return
  }
  if (!fs.statSync(dir).isDirectory()) {
    res.status(400).send({ error: `Path '${dir}' is not a directory` })
    return
  }

  let dirents: Dirent[]
  try {
    dirents = await fs.promises.readdir(dir, { withFileTypes: true })
  } catch (error) {
    logger.error(`Failed to read directory {path}`, { path: dir, error })
    res.status(500).end()
    return
  }
  if (dirents.length === 0) {
    const data: FilePickerData = { path: dir, sep: path.sep, items: [] }
    res.status(200).send(data)
    return
  }

  if (type === 'dir' || type === AF.directory || type === AF.videoDir) {
    dirents = dirents.filter((dirent) => dirent.isDirectory())
  } else if (type === AF.script) {
    dirents = dirents.filter(
      (dirent) => dirent.isDirectory() || dirent.name.endsWith('.txt')
    )
  } else if (type === AF.audios) {
    dirents = dirents.filter(
      (dirent) => dirent.isDirectory() || isAudio(dirent.name, true)
    )
  } else if (type === 'img') {
    dirents = dirents.filter(
      (dirent) => dirent.isDirectory() || isImage(dirent.name, true)
    )
  } else if (type === AF.videos) {
    dirents = dirents.filter(
      (dirent) =>
        dirent.isDirectory() ||
        isVideo(dirent.name, true) ||
        isVideoPlaylist(dirent.name, true)
    )
  }

  const items: FilePickerItem[] = []
  for (const dirent of dirents) {
    const stat = await fs.promises.stat(
      path.join(dirent.parentPath, dirent.name)
    )
    items.push({
      name: dirent.name,
      lastModified: stat.mtimeMs,
      size: stat.size,
      directory: dirent.isDirectory()
    })
  }

  const data: FilePickerData = { path: dir, sep: path.sep, items }
  res.status(200).send(data)
})

router.post('/create-directory', async (req, res) => {
  try {
    await fs.promises.mkdir(req.body.path, { recursive: false })
    res.status(204).end()
  } catch (error) {
    logger.error('Failed to create directory {path}', {
      path: req.body.path,
      error
    })
    res.status(500).end()
  }
})

router.get('/file/audio-thumb/:name', async (req, res) => {
  const { name } = req.params
  const thumb = path.join(getThumbsDir(), name)
  if (fs.existsSync(thumb)) {
    res.status(200).type(name.substring(name.lastIndexOf('.')))
    fs.createReadStream(thumb).pipe(res)
  } else {
    res.status(404).end()
  }
})

router.get('/file/registry/:uuid', async (req, res) => {
  const url = fileRegistry().get(req.params.uuid)
  await handleFileUrl(req, res, url)
})

router.get('/file/:type/:id', async (req, res) => {
  const { id, type } = req.params
  const queries = new Map([
    ['caption-script', findCaptionScriptUrlById],
    ['audio', findAudioUrlById],
    ['content-source', findContentSourceUrlById]
  ])

  const query = queries.get(type)
  if (query == null) {
    res.status(400).send({ error: `Unsupported type: '${type}'` })
    return
  }

  const userId = (req.user as User).id as number
  const url = await query(Number(id), userId)
  await handleFileUrl(req, res, url)
})

async function handleFileUrl(req: Request, res: Response, url?: string) {
  if (url == null) {
    res.status(404).end()
  } else if (url.startsWith('http')) {
    if (isVideo(url, true) || isAudio(url, true)) {
      const uuid = proxy().set({ url })
      proxy().get(uuid, req, res)
    } else {
      res.status(302).location(url).end()
    }
  } else {
    try {
      await fs.promises.access(url, fs.constants.F_OK)
    } catch {
      res.status(404).end()
      return
    }

    let ranges = undefined
    const { size } = await fs.promises.stat(url)
    if (isVideo(url, true) || isAudio(url, true)) {
      res.setHeader('Accept-Ranges', 'bytes')
      ranges = req.range(size)
    }

    if (ranges == -1) {
      // Unsatisfiable range parser result, return HTTP status 416: range not satisfiable
      res.setHeader('Content-Range', `bytes */${size}`).status(416).end()
    } else if (ranges == -2) {
      // Syntactically invalid parser result, return HTTP status 400: bad request
      res.status(400).end()
    } else {
      let start: number
      let end: number
      const chunk = 1024 * 1024 // 1MB
      if (ranges != null && ranges.length > 0 && ranges.type === 'bytes') {
        start = ranges[0].start
        end = Math.min(start + chunk, start + ranges[0].end, size - 1)
      } else {
        start = 0
        end = Math.min(chunk, size - 1)
      }

      res
        .status(206)
        .set({
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1
        })
        .type(url.substring(url.lastIndexOf('.')))
        .on('error', (error) => {
          logger.error(`Failed to process file request ${req.url}`, { error })
        })

      const stream = fs.createReadStream(url, { start, end })
      stream.on('error', (error) => {
        logger.error(`Failed to read file ${req.url}`, { error })
      })
      stream.pipe(res)
    }
  }
}

export default router

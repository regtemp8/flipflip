import fs, { Dirent } from 'fs'
import path from 'path'
import express from 'express'
import { FilePickerData, FilePickerItem, isAudio, isImage, isVideo } from 'flipflip-common'
import logger from '../logger'
import { getSaveDir, getThumbsDir } from '../utils'
import { findCaptionScriptUrlById } from '../db/CaptionScriptRepository'
import { findAudioUrlById, findAudioThumbById } from '../db/AudioRepository'
import { findContentSourceUrlById } from '../db/ContentSourceRepository'
import { User } from '../db/types/generated'

const router = express.Router()
router.get('/pick/:cwd(*)?', async (req, res) => {
  let dir = getSaveDir()
  if (req.params.cwd) {
    let cwd = req.params.cwd
    if (!cwd.startsWith('/')) {
      cwd = '/' + cwd
    }
    if (fs.existsSync(cwd) && fs.statSync(cwd).isDirectory()) {
      dir = cwd
    }
  }

  dir = path.resolve(dir)
  let dirents: Dirent[]
  try {
    dirents = await fs.promises.readdir(dir, { withFileTypes: true })
  } catch (error) {
    logger.error(`Failed to read directory {path}`, { path: dir, error })
    res.status(500).end()
    return
  }
  if (dirents.length === 0) {
    const data: FilePickerData = { path: dir, items: [] }
    res.status(200).send(data)
    return
  }

  const type = req.query.type
  if (type === 'dir') {
    dirents = dirents.filter((dirent) => dirent.isDirectory())
  } else if (type === 'txt') {
    dirents = dirents.filter(
      (dirent) => dirent.isDirectory() || dirent.name.endsWith('.txt')
    )
  } else if (type === 'audio') {
    dirents = dirents.filter(
      (dirent) => dirent.isDirectory() || isAudio(dirent.name, true)
    )
  } else if (type === 'img') {
    dirents = dirents.filter(
      (dirent) => dirent.isDirectory() || isImage(dirent.name, true)
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

  const data: FilePickerData = { path: dir, items }
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

router.get('/file/audio-thumb/:name', async (req, res, next) => {
  const { name } = req.params
  try {
    const thumb = path.join(getThumbsDir(), name)
    if(fs.existsSync(thumb)) {
      res.status(200).type(name.substring(name.lastIndexOf('.')))
      fs.createReadStream(thumb).pipe(res)
    } else {
      res.status(404).end()
    }
  } catch(error) {
    next(error)
  }
})

router.get('/file/:type/:id', async (req, res, next) => {
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

  try {
    const userId = (req.user as User).id as number
    const url = await query(Number(id), userId)
    if(url == null) {
      res.status(404).end()
    } else if (url.startsWith('http')) {
      res.status(302).location(url).end()
    } else if(!fs.existsSync(url)) {
      res.status(404).end()
    } else {
      let ranges = undefined
      const {size} = await fs.promises.stat(url)
      if(isVideo(url, true) || isAudio(url, true)) {
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
        let status = 200
        let start = undefined
        let end = undefined
        if(ranges != null && ranges.length > 0 && ranges.type === 'bytes') {
          status = 206

          // TODO handle multi part ranges
          start = ranges[0].start
          end = ranges[0].end
          res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`)
        }

        res.status(status).type(url.substring(url.lastIndexOf('.')))
        res.on('error', (error) => {
          logger.error(`Failed to process file request ${req.url}`, { error })
        })
        const stream = fs.createReadStream(url, {start, end})
        stream.on('error', (error) => {
          logger.error(`Failed to read file ${req.url}`, { error })
        })
        stream.pipe(res)
      }
    }
  } catch(error) {
    next(error)
  }
})

export default router

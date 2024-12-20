import fs, { Dirent } from 'fs'
import path from 'path'
import express from 'express'
import { FilePickerData, FilePickerItem, Message } from 'flipflip-common'
import logger from '../logger'
import { getSaveDir } from '../utils'
import { findCaptionScriptUrlById } from '../db/CaptionScriptRepository'
import { findAudioUrlById } from '../db/AudioRepository'
import { findContentSourceUrlById } from '../db/ContentSourceRepository'

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

router.get('/open/:type/:id', async (req, res) => {
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

  const url = await query(Number(id))
  if (url.startsWith('http')) {
    res.status(302).location(url).end()
  } else {
    res.status(200).type(url.substring(url.lastIndexOf('.')))
    fs.createReadStream(url).pipe(res)
  }
})

export default router

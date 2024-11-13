import fs, { Dirent } from 'fs'
import path from 'path'
import express from 'express'
import { FilePickerData, FilePickerItem, Message } from 'flipflip-common'
import logger from '../logger'

const router = express.Router()
router.get('/pick/:cwd(*)?', async (req, res) => {
  let cwd: string
  if (req.params.cwd) {
    cwd = req.params.cwd
    if (!cwd.startsWith('/')) {
      cwd = '/' + cwd
    }
  } else {
    cwd = process.cwd()
  }

  if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
    res.status(404).end()
    return
  }

  let dirents: Dirent[]
  try {
    dirents = await fs.promises.readdir(cwd, { withFileTypes: true })
  } catch (error) {
    logger.error(`Failed to read directory {path}`, { path: cwd, error })
    res.status(500).end()
    return
  }
  if (dirents.length === 0) {
    const data: FilePickerData = { path: cwd, items: [] }
    res.status(200).send(data)
    return
  }

  const type = req.query.type
  if (type === 'dir') {
    dirents = dirents.filter((dirent) => dirent.isDirectory())
  }

  const items = dirents.map((dirent): FilePickerItem => {
    const stat = fs.statSync(path.join(dirent.parentPath, dirent.name))
    return {
      name: dirent.name,
      lastModified: stat.mtimeMs,
      size: stat.size,
      directory: dirent.isDirectory()
    }
  })

  const data: FilePickerData = { path: cwd, items }
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

export default router

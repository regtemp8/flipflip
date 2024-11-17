import fs, { Dirent } from 'fs'
import path from 'path'
import express from 'express'
import { FilePickerData, FilePickerItem, Message } from 'flipflip-common'
import logger from '../logger'
import { getSaveDir } from '../utils'

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
  }

  const { default: getFolderSize } = await import('get-folder-size')
  const items: FilePickerItem[] = []
  for (const dirent of dirents) {
    const stat = fs.statSync(path.join(dirent.parentPath, dirent.name))
    let size = stat.size
    if (dirent.isDirectory()) {
      const result = await getFolderSize(path.join(dir, dirent.name))
      if (result.errors == null) {
        size = result.size
      }
    }

    items.push({
      name: dirent.name,
      lastModified: stat.mtimeMs,
      size,
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

export default router

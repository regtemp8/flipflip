import fs from 'fs'
import express from 'express'
import {
  toCaptionScript,
  toCaptionScriptUpdate,
  toFontSettings,
  toFontSettingsUpdate,
  toSearchSelectOptions,
  toTagSelectOptions
} from '../db/mappers'
import {
  findCaptionScriptIds,
  findCaptionScriptById,
  updateCaptionScript,
  findFontSettingsByType,
  updateFontSettings,
  createCaptionScripts,
  deleteCaptionScript,
  findCaptionScripts,
  isUntagged,
  hasTag,
  sortCaptionScripts,
  moveCaptionScript,
  deleteAllCaptionScripts,
  findBatchTagOptions,
  findSearchOptions,
  findUntaggedCount,
  findMarkedCount,
  findTotalCount,
  addCaptionScriptTags,
  setCaptionScriptTags,
  removeCaptionScriptTags,
  markCaptionScripts,
  findCaptionScriptTagIds
} from '../db/CaptionScriptRepository'
import {
  FontSettingsType,
  MoveRequest,
  SortRequest,
  BatchTagRequest,
  isText,
  Message
} from 'flipflip-common'
import { User } from '../db/types/entities'
import { toBoolean } from '../db/utils'

const router = express.Router()
router.get('/', async (req, res) => {
  const ids = await findCaptionScriptIds()
  if (ids != null) {
    res.status(200).send(ids)
  } else {
    res.status(500).end()
  }
})
router.post('/', async (req, res) => {
  const userId = (req.user as User).id as number
  const messages: Message[] = []
  const urls: string[] = []
  for (const url of req.body) {
    if (
      url === '' ||
      url.startsWith('http') ||
      (isText(url, true) && fs.existsSync(url))
    ) {
      urls.push(url)
    } else {
      messages.push({ error: `Invalid caption script file: ${url}` })
    }
  }

  if (urls.length > 0) {
    const ids = await createCaptionScripts(urls, userId)
    if (ids.length === 0) {
      messages.push({ info: 'No new caption scripts added' })
    }
  }

  if (messages.length > 0) {
    res.status(200).send(messages)
  } else {
    res.status(204).end()
  }
})
router.delete('/', async (req, res) => {
  const ids = req.body?.ids as number[] | undefined
  await deleteAllCaptionScripts(ids)
  res.status(204).end()
})
router.get('/filtered', async (req, res) => {
  let filtersQuery = req.query.filters
  const scripts = await findCaptionScripts()
  if (filtersQuery == null) {
    res.status(200).send(scripts.map((s) => s.id as number))
    return
  }

  const filteredScripts: number[] = []
  filtersQuery = decodeURIComponent(filtersQuery as string)
  const filters = JSON.parse(filtersQuery)
  for (const source of scripts) {
    let matchesFilter = true
    for (const filter of filters) {
      if (filter == '<Marked>') {
        // This is a marked filter
        matchesFilter = toBoolean(source.marked)
      } else if (filter == '<Untagged>') {
        // This is untagged filter
        matchesFilter = await isUntagged(source.id as number)
      } else if (
        (filter.startsWith('[') || filter.startsWith('-[')) &&
        filter.endsWith(']')
      ) {
        // This is a tag filter
        if (filter.startsWith('-')) {
          const tag = filter.substring(2, filter.length - 1)
          matchesFilter = !(await hasTag(source.id as number, tag))
        } else {
          const tag = filter.substring(1, filter.length - 1)
          matchesFilter = await hasTag(source.id as number, tag)
        }
      } else if (
        ((filter.startsWith('"') || filter.startsWith('-"')) &&
          filter.endsWith('"')) ||
        ((filter.startsWith("'") || filter.startsWith("-'")) &&
          filter.endsWith("'"))
      ) {
        if (filter.startsWith('-')) {
          const pattern = filter.substring(2, filter.length - 1)
          const regex = new RegExp(pattern, 'i')
          matchesFilter = source.url != null && !regex.test(source.url)
        } else {
          const pattern = filter.substring(1, filter.length - 1)
          const regex = new RegExp(pattern, 'i')
          matchesFilter = source.url != null && regex.test(source.url)
        }
      } else {
        // This is a search filter
        if (filter.startsWith('-')) {
          const regex = new RegExp(filter.substring(1, filter.length), 'i')
          matchesFilter = source.url != null && !regex.test(source.url)
        } else {
          const regex = new RegExp(filter, 'i')
          matchesFilter = source.url != null && regex.test(source.url)
        }
      }
      if (!matchesFilter) break
    }
    if (matchesFilter) {
      filteredScripts.push(source.id as number)
    }
  }

  res.status(200).send(filteredScripts)
})
router.post('/sort', async (req, res) => {
  const sort = req.body as SortRequest
  await sortCaptionScripts(sort)
  res.status(204).end()
})
router.post('/move', async (req, res) => {
  await moveCaptionScript(req.body as MoveRequest)
  res.status(204).end()
})
router.get('/batch-tag-options', async (req, res) => {
  const userId = (req.user as User).id as number
  const options = await findBatchTagOptions(userId)
  res.status(200).send(toTagSelectOptions(options))
})
router.get('/search-options', async (req, res) => {
  const userId = (req.user as User).id as number
  const totalCount = await findTotalCount(userId)
  const untaggedCount = await findUntaggedCount(userId)
  const markedCount = await findMarkedCount(userId)
  const options = await findSearchOptions(userId)
  res
    .status(200)
    .send(
      toSearchSelectOptions(options, totalCount, untaggedCount, markedCount)
    )
})
router.post('/tags', async (req, res) => {
  const userId = (req.user as User).id as number
  const body = req.body as BatchTagRequest
  switch (body.operation) {
    case 'add':
      await addCaptionScriptTags(userId, body.ids, body.tags)
      break
    case 'overwrite':
      await setCaptionScriptTags(userId, body.ids, body.tags)
      break
    case 'remove':
      await removeCaptionScriptTags(userId, body.ids, body.tags)
      break
  }
  res.status(204).end()
})
router.post('/mark', async (req, res) => {
  const userId = (req.user as User).id as number
  const ids = req.body as number[]
  await markCaptionScripts(userId, ids)
  res.status(204).end()
})
router.get('/:id', async (req, res) => {
  const userId = (req.user as User).id as number
  const id = Number(req.params.id)
  const source = await findCaptionScriptById(userId, id)
  if (source != null) {
    const tags = await findCaptionScriptTagIds(userId, id)
    res.status(200).send(toCaptionScript(source, tags, req))
  } else {
    res.status(404).end()
  }
})
router.patch('/:id', async (req, res) => {
  let isUrl = false
  const update = toCaptionScriptUpdate(req.body)
  if (update.url) {
    isUrl = update.url.startsWith('http')
    if (!isUrl && (!isText(update.url, true) || !fs.existsSync(update.url))) {
      res
        .status(400)
        .send({ error: `Invalid caption script path: ${update.url}` })
      return
    }
  }

  const didDeleteRow = await updateCaptionScript(Number(req.params.id), update)
  if (didDeleteRow) {
    res.status(404).send({
      error: `Duplicate caption script ${isUrl ? 'URL' : 'path'}: ${update.url}`
    })
  } else {
    res.status(204).end()
  }
})
router.delete('/:id', async (req, res) => {
  const result = await deleteCaptionScript(Number(req.params.id))
  const status = result[0].numDeletedRows > 0n ? 204 : 500
  res.status(status).end()
})
router.get(
  '/:id/font-settings/:type(blink|count|caption|captionBig)',
  async (req, res) => {
    const source = await findFontSettingsByType(
      Number(req.params.id),
      req.params.type as FontSettingsType
    )
    if (source != null) {
      res.status(200).send(toFontSettings(source))
    } else {
      res.status(404).end()
    }
  }
)
router.patch(
  '/:id/font-settings/:type(blink|count|caption|captionBig)',
  async (req, res) => {
    const result = await updateFontSettings(
      Number(req.params.id),
      req.params.type as FontSettingsType,
      toFontSettingsUpdate(req.body)
    )
    const status =
      result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
    res.status(status).end()
  }
)
export default router

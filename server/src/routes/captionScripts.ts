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
  BatchTagRequest
} from 'flipflip-common'
import { User } from '../db/types/generated'
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
router.post('/', async (req, res, next) => {
  const userId = (req.user as User).id as number
  const urls = req.body as string[]
  try {
    await createCaptionScripts(urls, userId)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})
router.delete('/', async (req, res, next) => {
  try {
    await deleteAllCaptionScripts(req.body)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})
router.get('/filtered', async (req, res) => {
  let filtersQuery = req.query.filters
  const scripts = await findCaptionScripts()
  if (filtersQuery == null) {
    res.status(200).send(scripts.map((s) => s.id as number))
    return
  }

  let filteredScripts: number[] = []
  filtersQuery = decodeURIComponent(filtersQuery as string)
  const filters = filtersQuery.split(',')
  for (const source of scripts) {
    let matchesFilter = true
    for (let filter of filters) {
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
          let tag = filter.substring(2, filter.length - 1)
          matchesFilter = await !hasTag(source.id as number, tag)
        } else {
          let tag = filter.substring(1, filter.length - 1)
          matchesFilter = await hasTag(source.id as number, tag)
        }
      } else if (
        ((filter.startsWith('"') || filter.startsWith('-"')) &&
          filter.endsWith('"')) ||
        ((filter.startsWith("'") || filter.startsWith("-'")) &&
          filter.endsWith("'"))
      ) {
        if (filter.startsWith('-')) {
          filter = filter.substring(2, filter.length - 1)
          const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
          matchesFilter = source.url != null && !regex.test(source.url)
        } else {
          filter = filter.substring(1, filter.length - 1)
          const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
          matchesFilter = source.url != null && regex.test(source.url)
        }
      } else {
        // This is a search filter
        filter = filter.replace('\\', '\\\\')
        if (filter.startsWith('-')) {
          filter = filter.substring(1, filter.length)
          const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
          matchesFilter = source.url != null && !regex.test(source.url)
        } else {
          const regex = new RegExp(filter.replace('\\', '\\\\'), 'i')
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
  const untaggedCount = await findUntaggedCount(userId)
  const markedCount = await findMarkedCount(userId)
  const options = await findSearchOptions(userId)
  res
    .status(200)
    .send(toSearchSelectOptions(options, untaggedCount, markedCount))
})
router.post('/tags', async (req, res, next) => {
  const userId = (req.user as User).id as number
  const body = req.body as BatchTagRequest
  try {
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
  } catch (error) {
    next(error)
  }
})
router.post('/mark', async (req, res, next) => {
  const userId = (req.user as User).id as number
  const ids = req.body as number[]
  try {
    markCaptionScripts(userId, ids)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})
router.get('/:id', async (req, res) => {
  const userId = (req.user as User).id as number
  const id = Number(req.params.id)
  const source = await findCaptionScriptById(userId, id)
  if (source != null) {
    const tags = await findCaptionScriptTagIds(userId, id)
    res.status(200).send(toCaptionScript(source, tags))
  } else {
    res.status(404).end()
  }
})
router.patch('/:id', async (req, res, next) => {
  try {
    const didDeleteRow = await updateCaptionScript(
      Number(req.params.id),
      toCaptionScriptUpdate(req.body)
    )

    const status = didDeleteRow ? 205 : 204
    res.status(status).end()
  } catch (error) {
    next(error)
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

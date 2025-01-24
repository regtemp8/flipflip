import express from 'express'
import {
  toAudio,
  toAudioUpdate,
  toSearchSelectOptions,
  toTagSelectOptions
} from '../db/mappers'
import {
  findAudioIds,
  findAudioById,
  updateAudio,
  findBatchTagOptions,
  findTotalCount,
  findUntaggedCount,
  findMarkedCount,
  findSearchOptions,
  addAudioTags,
  setAudioTags,
  removeAudioTags,
  markAudios,
  findAudioTagIds,
  sortAudios,
  createAudios,
  findAudioUrlById,
  findAudios
} from '../db/AudioRepository'
import { User } from '../db/types/generated'
import {
  Audio,
  AudioSortRequest,
  BatchTagRequest,
  SortRequest
} from 'flipflip-common'
import { readAudioMetadata } from '../utils'
import { createThumb } from '../db/FileRepository'
import { toBoolean } from '../db/utils'
import { hasTag, isUntagged } from '../db/CaptionScriptRepository'

const router = express.Router()
router.get('/', async (req, res) => {
  const ids = await findAudioIds()
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
    const audios: Array<Partial<Audio>> = []
    for (const url of urls) {
      audios.push(await readAudioMetadata(url))
    }

    await createAudios(audios, userId)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})
router.get('/filtered', async (req, res) => {
  // TODO fix filtering
  let filtersQuery = req.query.filters
  const audios = await findAudios()
  if (filtersQuery == null) {
    res.status(200).send(audios.map((s) => s.id as number))
    return
  }

  let filteredScripts: number[] = []
  filtersQuery = decodeURIComponent(filtersQuery as string)
  const filters = filtersQuery.split(',')
  for (const source of audios) {
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
          const regex = new RegExp(pattern.replace('\\', '\\\\'), 'i')
          matchesFilter = source.url != null && !regex.test(source.url)
        } else {
          const pattern = filter.substring(1, filter.length - 1)
          const regex = new RegExp(pattern.replace('\\', '\\\\'), 'i')
          matchesFilter = source.url != null && regex.test(source.url)
        }
      } else {
        // This is a search filter
        let pattern = filter.replace('\\', '\\\\')
        if (pattern.startsWith('-')) {
          pattern = pattern.substring(1, pattern.length)
          const regex = new RegExp(pattern.replace('\\', '\\\\'), 'i')
          matchesFilter = source.url != null && !regex.test(source.url)
        } else {
          const regex = new RegExp(pattern.replace('\\', '\\\\'), 'i')
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
router.post('/tags', async (req, res, next) => {
  const userId = (req.user as User).id as number
  const body = req.body as BatchTagRequest
  try {
    switch (body.operation) {
      case 'add':
        await addAudioTags(userId, body.ids, body.tags)
        break
      case 'overwrite':
        await setAudioTags(userId, body.ids, body.tags)
        break
      case 'remove':
        await removeAudioTags(userId, body.ids, body.tags)
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
    markAudios(userId, ids)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

// TODO make separate endpoint for audio playlist sorting
// TODO rename AudioSortRequest to PlaylistSortRequest
router.post('/sort', async (req, res) => {
  const sort = req.body as AudioSortRequest
  await sortAudios(sort)
  res.status(204).end()
})

router.get('/:id', async (req, res) => {
  const userId = (req.user as User).id as number
  const id = Number(req.params.id)
  const source = await findAudioById(userId, id)
  if (source != null) {
    const tags = await findAudioTagIds(userId, id)
    res.status(200).send(toAudio(source, tags))
  } else {
    res.status(404).end()
  }
})
router.patch('/:id', async (req, res) => {
  const userId = (req.user as User).id as number
  const body = req.body as Partial<Audio>
  let thumb: number | undefined = undefined
  if (body.thumb != null) {
    thumb = await createThumb(userId, body.thumb)
  }
  const result = await updateAudio(
    Number(req.params.id),
    toAudioUpdate(body, thumb)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})
router.post('/:id/use-metadata', async (req, res) => {
  const userId = (req.user as User).id as number
  const id = Number(req.params.id)
  const url = await findAudioUrlById(id)
  const metadata = await readAudioMetadata(url)
  let thumb: number | undefined = undefined
  if (metadata.thumb != null) {
    thumb = await createThumb(userId, metadata.thumb)
  }
  const result = await updateAudio(
    Number(req.params.id),
    toAudioUpdate(metadata, thumb)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})
router.get('/:id/bpm', async (req, res) => {
  // const userId = (req.user as User).id as number
  // const id = Number(req.params.id)
  // const source = await findAudioUrlById(userId, id)
  // if (source != null) {
  //   const tags = await findAudioTagIds(userId, id)
  //   res.status(200).send(toAudio(source, tags))
  // } else {
  //   res.status(404).end()
  // }
})
export default router

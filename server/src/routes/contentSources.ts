import express from 'express'
import {
  toContentSource,
  toContentSourceUpdate,
  toSearchSelectOptions,
  toTagSelectOptions,
  toIgnoredTagSelectOptions
} from '../db/mappers'
import {
  findContentSourceById,
  updateContentSource,
  findBatchTagOptions,
  findTypeOptions,
  findUntaggedCount,
  findMarkedCount,
  findOfflineCount,
  findSearchOptions,
  addContentSourceTags,
  setContentSourceTags,
  removeContentSourceTags,
  markContentSources,
  findContentSourceTagIds,
  findTotalCount,
  sortContentSources,
  deleteContentSource
} from '../db/ContentSourceRepository'
import { User } from '../db/types/generated'
import { BatchTagRequest, ContentSortRequest } from 'flipflip-common'

const router = express.Router()
router.get('/batch-tag-options', async (req, res) => {
  const userId = (req.user as User).id as number
  const options = await findBatchTagOptions(userId)
  res.status(200).send(toTagSelectOptions(options))
})
router.get('/search-options', async (req, res) => {
  // TODO only use content sources in library
  const userId = (req.user as User).id as number
  const totalCount = await findTotalCount(userId)
  const untaggedCount = await findUntaggedCount(userId)
  const markedCount = await findMarkedCount(userId)
  const offlineCount = await findOfflineCount(userId)
  const tagOptions = await findSearchOptions(userId)
  const typeOptions = await findTypeOptions(userId)
  res
    .status(200)
    .send(
      toSearchSelectOptions(
        tagOptions,
        totalCount,
        untaggedCount,
        markedCount,
        offlineCount,
        typeOptions
      )
    )
})
router.get('/ignored-tag-options', async (req, res) => {
  const userId = (req.user as User).id as number
  const tagOptions = await findBatchTagOptions(userId)
  const typeOptions = await findTypeOptions(userId)
  res.status(200).send(toIgnoredTagSelectOptions(tagOptions, typeOptions))
})
router.post('/tags', async (req, res, next) => {
  const userId = (req.user as User).id as number
  const body = req.body as BatchTagRequest
  try {
    switch (body.operation) {
      case 'add':
        await addContentSourceTags(userId, body.ids, body.tags)
        break
      case 'overwrite':
        await setContentSourceTags(userId, body.ids, body.tags)
        break
      case 'remove':
        await removeContentSourceTags(userId, body.ids, body.tags)
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
    markContentSources(userId, ids)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})
router.post('/sort', async (req, res) => {
  const sort = req.body as ContentSortRequest
  await sortContentSources(sort)
  res.status(204).end()
})
router.get('/:id', async (req, res) => {
  const userId = (req.user as User).id as number
  const id = Number(req.params.id)
  const source = await findContentSourceById(userId, id)
  if (source != null) {
    const tags = await findContentSourceTagIds(userId, id)
    res.status(200).send(toContentSource(source, tags))
  } else {
    res.status(404).end()
  }
})
router.patch('/:id', async (req, res) => {
  const result = await updateContentSource(
    Number(req.params.id),
    toContentSourceUpdate(req.body)
  )
  const status =
    result.length === 1 && result[0].numUpdatedRows === 1n ? 204 : 500
  res.status(status).end()
})
router.delete('/:id', async (req, res) => {
  const result = await deleteContentSource(Number(req.params.id))
  const status = result[0].numDeletedRows > 0n ? 204 : 500
  res.status(status).end()
})
export default router

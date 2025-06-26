import fs from 'fs'
import express from 'express'
import {
  fromAudioThumb,
  toAudio,
  toAudioThumb,
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
  moveAudio,
  createAudios,
  findAudioUrlById,
  findAudios,
  deleteAudio,
  deleteAllAudios,
  hasTag,
  isUntagged,
  isArtistDefined,
  hasArtist,
  isAlbumDefined,
  hasAlbum,
  findAudioAlbums,
  findAudioArtists
} from '../db/AudioRepository'
import { User } from '../db/types/generated'
import {
  Audio,
  AudioSortRequest,
  BatchTagRequest,
  isAudio,
  Message,
  MoveRequest,
  SortRequest
} from 'flipflip-common'
import { copyThumbFile, readAudioMetadata } from '../utils'
import { toBoolean } from '../db/utils'
import { isAudioPlaylistItem } from '../db/PlaylistRepository'

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
  const messages: Message[] = []
  const urls: string[] = []
  for (const url of req.body) {
    const isUrl = url.startsWith('http')
    if (isAudio(url, false) && (isUrl || fs.existsSync(url))) {
      urls.push(url)
    } else {
      messages.push({
        error: `Invalid audio ${isUrl ? 'URL' : 'file'}: ${url}`
      })
    }
  }

  if (urls.length > 0) {
    try {
      const audios: Array<Partial<Audio>> = []
      for (const url of urls) {
        audios.push(await readAudioMetadata(url))
      }
      const ids = await createAudios(audios, userId)
      if (ids.length === 0) {
        messages.push({ info: 'No new audios added' })
      }
    } catch (error) {
      next(error)
    }
  }

  if (messages.length > 0) {
    res.status(200).send(messages)
  } else {
    res.status(204).end()
  }
})
router.delete('/', async (req, res, next) => {
  const ids = req.body?.ids as number[] | undefined
  try {
    await deleteAllAudios(ids)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})
router.get('/filtered', async (req, res) => {
  let filtersQuery = req.query.filters
  if (filtersQuery == null) {
    const audioIds = await findAudioIds()
    res.status(200).send(audioIds)
    return
  }

  const isDefined = (value: string | null) => !!value?.length
  const matches = (value: string | null, filter: string) => filter === value

  const filteredAudios: number[] = []
  filtersQuery = decodeURIComponent(filtersQuery as string)
  const filters = JSON.parse(filtersQuery)
  const audios = await findAudios()
  for (const source of audios) {
    const id = source.id as number
    let matchesFilter = true
    let countRegex
    for (const filter of filters) {
      if (filter == '<Marked>') {
        // This is a marked filter
        matchesFilter = toBoolean(source.marked)
      } else if (filter == '<Untagged>') {
        // This is untagged filter
        matchesFilter = await isUntagged(id)
      } else if (
        (filter.startsWith('[') || filter.startsWith('-[')) &&
        filter.endsWith(']')
      ) {
        // This is a tag filter
        if (filter.startsWith('-')) {
          const tag = filter.substring(2, filter.length - 1)
          matchesFilter = !(await hasTag(id, tag))
        } else {
          const tag = filter.substring(1, filter.length - 1)
          matchesFilter = await hasTag(id, tag)
        }
      } else if (
        filter.startsWith('artist:') ||
        filter.startsWith('-artist:')
      ) {
        let artist = filter.replace('artist:', '')
        if (artist.startsWith('-')) {
          artist = artist.substring(1, artist.length)
          if (artist.length == 0) {
            matchesFilter = isDefined(source.artist)
          } else {
            matchesFilter = !matches(source.artist, artist)
          }
        } else {
          if (artist.length == 0) {
            matchesFilter = !isDefined(source.artist)
          } else {
            matchesFilter = matches(source.artist, artist)
          }
        }
      } else if (filter.startsWith('album:') || filter.startsWith('-album:')) {
        let album = filter.replace('album:', '')
        if (album.startsWith('-')) {
          album = album.substring(1, album.length)
          if (album.length == 0) {
            matchesFilter = isDefined(source.album)
          } else {
            matchesFilter = !matches(source.album, album)
          }
        } else {
          if (album.length == 0) {
            matchesFilter = !isDefined(source.album)
          } else {
            matchesFilter = matches(source.album, album)
          }
        }
      } else if (filter.startsWith('playlist:')) {
        const playlist = filter.replace('playlist:', '')
        matchesFilter = await isAudioPlaylistItem(id, playlist)
      } else if (
        filter.startsWith('comment:') ||
        filter.startsWith('-comment:')
      ) {
        let comment = filter.replace('comment:', '')
        if (comment.startsWith('-')) {
          comment = comment.substring(1, comment.length)
          if (comment.length == 0) {
            matchesFilter = isDefined(source.comment)
          } else {
            const regex = new RegExp(comment, 'i')
            matchesFilter = !regex.test(source.comment ?? '')
          }
        } else {
          if (filter.length == 0) {
            matchesFilter = !isDefined(source.comment)
          } else {
            const regex = new RegExp(filter, 'i')
            matchesFilter = regex.test(source.comment ?? '')
          }
        }
      } else if ((countRegex = /^count([>=<])(\d*)$/.exec(filter)) != null) {
        const symbol = countRegex[1]
        const value = parseInt(countRegex[2])
        const count = source.playedCount
        switch (symbol) {
          case '=':
            matchesFilter = count == value
            break
          case '>':
            matchesFilter = count > value
            break
          case '<':
            matchesFilter = count < value
            break
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
          matchesFilter =
            !regex.test(source.url) &&
            (source.name == null || !regex.test(source.name)) &&
            (source.artist == null || !regex.test(source.artist)) &&
            (source.album == null || !regex.test(source.album))
        } else {
          const pattern = filter.substring(1, filter.length - 1)
          const regex = new RegExp(pattern, 'i')
          matchesFilter =
            regex.test(source.url) ||
            (source.name != null && regex.test(source.name)) ||
            (source.artist != null && regex.test(source.artist)) ||
            (source.album != null && regex.test(source.album))
        }
      } else {
        // This is a search filter
        if (filter.startsWith('-')) {
          const pattern = filter.substring(1, filter.length)
          const regex = new RegExp(pattern, 'i')
          matchesFilter =
            !regex.test(source.url) &&
            (source.name == null || !regex.test(source.name)) &&
            (source.artist == null || !regex.test(source.artist)) &&
            (source.album == null || !regex.test(source.album))
        } else {
          const regex = new RegExp(filter, 'i')
          matchesFilter =
            regex.test(source.url) ||
            (source.name != null && regex.test(source.name)) ||
            (source.artist != null && regex.test(source.artist)) ||
            (source.album != null && regex.test(source.album))
        }
      }
      if (!matchesFilter) break
    }
    if (matchesFilter) {
      filteredAudios.push(id)
    }
  }

  res.status(200).send(filteredAudios)
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
    await markAudios(userId, ids)
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
router.post('/move', async (req, res) => {
  await moveAudio(req.body as MoveRequest)
  res.status(204).end()
})
router.post('/upload-thumb', async (req, res) => {
  const path = req.body.thumb as string
  const thumb = await copyThumbFile(path)
  res.status(200).send({ thumb: toAudioThumb(thumb) })
})
router.get('/albums', async (req, res) => {
  let ids: number[] = []
  let idsQuery = req.query.ids
  if (idsQuery != null) {
    idsQuery = decodeURIComponent(idsQuery as string)
    ids = JSON.parse(idsQuery)
  }

  const userId = (req.user as User).id as number
  const albums = await findAudioAlbums(ids, userId)
  albums.forEach((album) => {
    if (album.thumb != null) {
      album.thumb = toAudioThumb(album.thumb)
    }
  })
  res.status(200).send(albums)
})
router.get('/artists', async (req, res) => {
  let ids: number[] = []
  let idsQuery = req.query.ids
  if (idsQuery != null) {
    idsQuery = decodeURIComponent(idsQuery as string)
    ids = JSON.parse(idsQuery)
  }

  const userId = (req.user as User).id as number
  const artists = await findAudioArtists(ids, userId)
  artists.forEach((artist) => {
    if (artist.thumb != null) {
      artist.thumb = toAudioThumb(artist.thumb)
    }
  })
  res.status(200).send(artists)
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

router.patch('/:id', async (req, res, next) => {
  try {
    const body = req.body as Partial<Audio>
    if (body.thumb != null) {
      body.thumb = fromAudioThumb(body.thumb)
    }

    let isUrl = false
    const update = toAudioUpdate(body)
    if (update.url) {
      isUrl = update.url.startsWith('http')
      if (
        !isAudio(update.url, false) ||
        (!isUrl && !fs.existsSync(update.url))
      ) {
        res.status(400).send({
          error: `Invalid audio ${isUrl ? 'URL' : 'path'}: ${update.url}`
        })
        return
      }
    }

    const didDeleteRow = await updateAudio(Number(req.params.id), update)
    if (didDeleteRow) {
      res.status(404).send({
        error: `Duplicate audio ${isUrl ? 'URL' : 'path'}: ${update.url}`
      })
    } else {
      res.status(204).end()
    }
  } catch (error) {
    next(error)
  }
})
router.delete('/:id', async (req, res) => {
  const result = await deleteAudio(Number(req.params.id))
  const status = result[0].numDeletedRows > 0n ? 204 : 500
  res.status(status).end()
})
router.get('/:id/metadata', async (req, res) => {
  const userId = (req.user as User).id as number
  const id = Number(req.params.id)
  const url = await findAudioUrlById(id, userId)
  const metadata = await readAudioMetadata(url)
  if (metadata?.thumb != null) {
    metadata.thumb = toAudioThumb(metadata.thumb)
  }

  res.status(200).send({ ...metadata, id })
})
router.get('/:id/bpm', async (req, res) => {
  const userId = (req.user as User).id as number
  const id = Number(req.params.id)
  const url = await findAudioUrlById(id, userId)
  const metadata = await readAudioMetadata(url)
  res.status(200).send({ id, bpm: metadata.bpm })
})
export default router

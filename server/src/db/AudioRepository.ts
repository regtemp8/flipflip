import { DeleteResult, Kysely, SelectExpression, sql } from 'kysely'
import {
  Audio,
  AudioPlaylistItem,
  AudioTagInsert,
  AudioUpdate
} from './types/entities'
import { DB } from './types/generated'
import db from './database'
import { SearchOption } from './types/SearchOption'
import { sortNumber, sortString, toNumber } from './utils'
import {
  ASF,
  AudioAlbum,
  AudioSortRequest,
  getSourceType,
  randomizeList,
  Audio as AudioJson,
  TF,
  MoveRequest,
  AudioArtist
} from 'flipflip-common'
import { findTagIdsByName } from './TagRepository'

export async function findAudios(): Promise<Audio[]> {
  return await db()
    .query()
    .selectFrom('audio')
    .selectAll()
    .orderBy('index asc')
    .execute()
}

export async function findAudioIds(): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('audio')
    .select('id')
    .orderBy('index asc')
    .execute()
    .then((value) => value.map((v) => v.id as number))
}

export async function findAudioById(
  userId: number,
  id: number
): Promise<Audio | undefined> {
  return await db()
    .query()
    .selectFrom('audio')
    .selectAll()
    .where('userId', '=', userId)
    .where('id', '=', id)
    .executeTakeFirst()
}

export async function findAudioTagIds(
  userId: number,
  id: number
): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('audioTag as at')
    .innerJoin('tag as t', 't.id', 'at.tagId')
    .select('at.tagId')
    .where('at.userId', '=', userId)
    .where('t.userId', '=', userId)
    .where('at.audioId', '=', id)
    .orderBy('t.name asc')
    .execute()
    .then((value) => value.map(({ tagId }) => tagId))
}

export async function findAudioUrlById(
  id: number,
  userId: number
): Promise<string> {
  return await db()
    .query()
    .selectFrom('audio')
    .select('url')
    .where('id', '=', id)
    .where('userId', '=', userId)
    .executeTakeFirstOrThrow()
    .then((row) => row.url)
}

export async function findAudioThumbById(
  id: number,
  userId: number
): Promise<string | undefined> {
  return await db()
    .query()
    .selectFrom('audio')
    .select('thumb')
    .where('id', '=', id)
    .where('userId', '=', userId)
    .executeTakeFirst()
    .then((row) => row?.thumb ?? undefined)
}

export async function findAudioAlbums(
  ids: number[],
  userId: number
): Promise<AudioAlbum[]> {
  return await db()
    .query()
    .selectFrom('audio')
    .select((eb) => [
      'album',
      sql<string>`json_group_array(artist)`.as('artists'),
      eb.fn.max('thumb').as('thumb'),
      eb.fn.countAll<number>().as('count')
    ])
    .where('id', 'in', ids)
    .where('userId', '=', userId)
    .where('album', '<>', '')
    .groupBy('album')
    .orderBy('album asc')
    .execute()
    .then((rows) => {
      return rows.map((row) => {
        let artist: string
        let isSingleArtist = false
        const artists = JSON.parse(row.artists).filter((a: string) => !!a)
        if (artists.length === 1) {
          artist = artists[0]
          isSingleArtist = true
        } else if (artists.length > 1) {
          artist = 'Various Artists'
        } else {
          artist = 'Unknown Artist'
        }

        return {
          name: row.album as string,
          artist,
          isSingleArtist,
          thumb: row.thumb ?? undefined,
          count: row.count
        }
      })
    })
}

export async function findAudioArtists(
  ids: number[],
  userId: number
): Promise<AudioArtist[]> {
  return await db()
    .query()
    .selectFrom('audio')
    .select((eb) => ['artist', eb.fn.max('thumb').as('thumb')])
    .where('id', 'in', ids)
    .where('userId', '=', userId)
    .where('artist', '<>', '')
    .groupBy('artist')
    .orderBy('artist asc')
    .execute()
    .then((rows) =>
      rows.map((row) => ({
        name: row.artist as string,
        thumb: row.thumb ?? undefined
      }))
    )
}

export async function createAudios(
  audios: Array<Partial<AudioJson>>,
  userId: number
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      await trx
        .updateTable('audio')
        .set((eb) => ({ index: eb('index', '+', audios.length) }))
        .execute()

      const values = audios.map((audio, index) => {
        const url = audio.url as string
        const { name, album, artist, bpm, duration, thumb, trackNum } = audio
        return {
          marked: toNumber(false),
          volume: 100,
          speed: 10,
          stopAtEnd: toNumber(false),
          nextSceneAtEnd: toNumber(false),
          tick: toNumber(false),
          tickMode: TF.constant,
          tickDelay: 1000,
          tickMinDelay: 500,
          tickMaxDelay: 5000,
          tickSinRate: 100,
          tickBpmMulti: 10,
          playedCount: 0,
          url,
          type: getSourceType(url),
          name,
          album,
          artist,
          bpm: bpm ?? 0,
          duration,
          trackNum,
          thumb,
          index,
          createdAt: Date.now(),
          userId
        }
      })

      return await trx
        .insertInto('audio')
        .values(values)
        .onConflict((oc) => oc.doNothing())
        .returning('id')
        .execute()
    })
}

export async function updateAudio(id: number, update: AudioUpdate) {
  if (update.url == null) {
    await db()
      .query()
      .updateTable('audio')
      .set(update)
      .where('id', '=', id)
      .execute()

    return false
  } else {
    update.type = getSourceType(update.url)
  }

  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const url = update.url as string
      const sameUrl = await trx
        .selectFrom('audio')
        .select(['id', 'index'])
        .where('id', '<>', id)
        .where('url', '=', url)
        .executeTakeFirst()

      if (sameUrl != null) {
        await trx
          .deleteFrom('audioPlaylistItem')
          .where('audioId', '=', id)
          .execute()
        await trx.deleteFrom('audioTag').where('audioId', '=', id).execute()

        const { index } = await trx
          .deleteFrom('audio')
          .where('id', '=', id)
          .returning('index')
          .executeTakeFirstOrThrow()

        if (index < sameUrl.index) {
          await trx
            .updateTable('audio')
            .set({ index })
            .where('id', '=', sameUrl.id)
            .execute()
        }

        await trx
          .updateTable('audio')
          .set((eb) => ({ index: eb('index', '-', 1) }))
          .where('index', '>', Math.max(index, sameUrl.index))
          .execute()
      } else {
        await trx
          .updateTable('audio')
          .set(update)
          .where('id', '=', id)
          .execute()
      }

      return sameUrl != null
    })
}

export async function isUntagged(id: number) {
  const { count } = await db()
    .query()
    .selectFrom('audioTag')
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .where('audioId', '=', id)
    .executeTakeFirstOrThrow()

  return count === 0
}

export async function hasTag(id: number, tagName: string) {
  const rows = await db()
    .query()
    .selectFrom('tag as t')
    .select((eb) => eb.lit(1).as('exists'))
    .innerJoin('audioTag as at', 'at.tagId', 't.id')
    .where('at.audioId', '=', id)
    .where('t.name', '=', tagName)
    .execute()

  return rows.length === 1
}

export async function isArtistDefined(id: number) {
  const rows = await db()
    .query()
    .selectFrom('audio')
    .select((eb) => eb.lit(1).as('exists'))
    .where('id', '=', id)
    .where('artist', '<>', '')
    .execute()

  return rows.length === 1
}

export async function hasArtist(id: number, artist: string) {
  const rows = await db()
    .query()
    .selectFrom('audio')
    .select((eb) => eb.lit(1).as('exists'))
    .where('id', '=', id)
    .where('artist', '=', artist)
    .execute()

  return rows.length === 1
}

export async function isAlbumDefined(id: number) {
  const rows = await db()
    .query()
    .selectFrom('audio')
    .select((eb) => eb.lit(1).as('exists'))
    .where('id', '=', id)
    .where('album', '<>', '')
    .execute()

  return rows.length === 1
}

export async function hasAlbum(id: number, album: string) {
  const rows = await db()
    .query()
    .selectFrom('audio')
    .select((eb) => eb.lit(1).as('exists'))
    .where('id', '=', id)
    .where('album', '=', album)
    .execute()

  return rows.length === 1
}

export async function findBatchTagOptions(
  userId: number
): Promise<SearchOption[]> {
  return await db()
    .query()
    .selectFrom('tag as t')
    .leftJoin('audioTag as at', 'at.tagId', 't.id')
    .select(({ fn }) => ['t.name', fn.count<number>('at.tagId').as('count')])
    .where('t.userId', '=', userId)
    .where((eb) =>
      eb.or([eb('at.userId', '=', userId), eb('at.tagId', 'is', null)])
    )
    .groupBy('t.name')
    .orderBy('count desc')
    .orderBy('t.name asc')
    .execute()
}

export async function findUntaggedCount(userId: number): Promise<number> {
  return await db()
    .query()
    .selectFrom('audio as a')
    .leftJoin('audioTag as at', 'at.audioId', 'a.id')
    .select(({ fn }) => [fn.count<number>('a.id').as('count')])
    .where('a.userId', '=', userId)
    .where('at.id', 'is', null)
    .executeTakeFirstOrThrow()
    .then((value) => value.count)
}

export async function findMarkedCount(userId: number): Promise<number> {
  return await db()
    .query()
    .selectFrom('audio')
    .select(({ fn }) => [fn.count<number>('id').as('count')])
    .where('userId', '=', userId)
    .where('marked', '=', toNumber(true))
    .executeTakeFirstOrThrow()
    .then((value) => value.count)
}

export async function findTotalCount(userId: number): Promise<number> {
  return await db()
    .query()
    .selectFrom('audio')
    .select(({ fn }) => [fn.count<number>('id').as('count')])
    .where('userId', '=', userId)
    .executeTakeFirstOrThrow()
    .then((value) => value.count)
}

export async function findSearchOptions(
  userId: number
): Promise<SearchOption[]> {
  return await db()
    .query()
    .selectFrom('tag as t')
    .innerJoin('audioTag as at', 'at.tagId', 't.id')
    .select(({ fn }) => ['t.name', fn.count<number>('at.tagId').as('count')])
    .where('t.userId', '=', userId)
    .where('at.userId', '=', userId)
    .groupBy('t.id')
    .orderBy('count desc')
    .orderBy('t.name asc')
    .execute()
}

export async function addAudioTags(
  userId: number,
  ids: number[],
  tags: string[]
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const tagIds = await findTagIdsByName(tags, trx)
      await insertAudioTags(userId, ids, tagIds, trx)
    })
}

async function insertAudioTags(
  userId: number,
  ids: number[],
  tagIds: number[],
  trx: Kysely<DB>
) {
  const values: AudioTagInsert[] = []
  for (const audioId of ids) {
    for (const tagId of tagIds) {
      values.push({ userId, audioId, tagId })
    }
  }

  return await trx
    .insertInto('audioTag')
    .values(values)
    .onConflict((oc) => oc.doNothing())
    .execute()
}

export async function setAudioTags(
  userId: number,
  ids: number[],
  tags: string[]
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      await trx
        .deleteFrom('audioTag')
        .where('userId', '=', userId)
        .where('audioId', 'in', ids)
        .execute()

      if (tags.length > 0) {
        const tagIds = await findTagIdsByName(tags, trx)
        await insertAudioTags(userId, ids, tagIds, trx)
      }
    })
}

export async function removeAudioTags(
  userId: number,
  ids: number[],
  tags: string[]
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const tagIds = await findTagIdsByName(tags, trx)
      await trx
        .deleteFrom('audioTag')
        .where('userId', '=', userId)
        .where('audioId', 'in', ids)
        .where('tagId', 'in', tagIds)
        .execute()
    })
}

export async function markAudios(userId: number, ids: number[]) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const existingRows = await trx
        .selectFrom('audio')
        .select(({ lit }) => lit(1).as('one'))
        .where('userId', '=', userId)
        .where('marked', '=', toNumber(true))
        .execute()
      if (existingRows.length === 0) {
        await trx
          .updateTable('audio')
          .set({ marked: toNumber(true) })
          .where('userId', '=', userId)
          .where('id', 'in', ids)
          .execute()
      } else {
        await trx
          .updateTable('audio')
          .set({ marked: toNumber(false) })
          .where('userId', '=', userId)
          .execute()
      }
    })
}

export async function deleteAudio(id: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const { index } = await trx
        .selectFrom('audio')
        .select('index')
        .where('id', '=', id)
        .executeTakeFirstOrThrow()

      await trx
        .deleteFrom('audioPlaylistItem')
        .where('audioId', '=', id)
        .execute()
      await trx.deleteFrom('audioTag').where('audioId', '=', id).execute()
      const result = await trx
        .deleteFrom('audio')
        .where('id', '=', id)
        .execute()
      await trx
        .updateTable('audio')
        .set((eb) => ({ index: eb('index', '-', 1) }))
        .where('index', '>', index)
        .execute()

      return result
    })
}

export async function deleteAllAudios(ids?: number[]) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      let playlistItemQuery = trx.deleteFrom('audioPlaylistItem')
      let tagQuery = trx.deleteFrom('audioTag')
      let audioQuery = trx.deleteFrom('audio')

      if (ids != null) {
        playlistItemQuery = playlistItemQuery.where('audioId', 'in', ids)
        tagQuery = tagQuery.where('audioId', 'in', ids)
        audioQuery = audioQuery.where('id', 'in', ids)
      }

      const result = await Promise.all(
        [playlistItemQuery, tagQuery, audioQuery].map((query) =>
          query.execute()
        )
      )
      const numDeletedRows = result
        .flatMap((r) => r)
        .map((r) => r.numDeletedRows)
        .reduce<bigint>((accumulator, currentValue) => {
          return accumulator + currentValue
        }, BigInt(0))
      return new DeleteResult(numDeletedRows)
    })
}

const selectColumns = new Map<string, Array<keyof Audio>>([
  [ASF.url, ['id', 'url']],
  [ASF.name, ['id', 'name', 'url']],
  [ASF.artist, ['id', 'artist', 'album', 'trackNum', 'name', 'url']],
  [ASF.album, ['id', 'album', 'trackNum', 'name', 'url']],
  [ASF.date, ['id', 'createdAt', 'url']],
  [ASF.duration, ['id', 'duration', 'url']],
  [
    ASF.playedCount,
    ['id', 'playedCount', 'artist', 'album', 'trackNum', 'name', 'url']
  ],
  [ASF.random, ['id']]
])
export async function sortAudios({
  sortBy,
  sortOrder,
  playlistId
}: AudioSortRequest) {
  const selections = selectColumns.get(sortBy)
  if (selections == null) {
    return
  }

  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      let rows: Array<Partial<Audio>> = []
      if (playlistId == null) {
        rows = await trx.selectFrom('audio').select(selections).execute()
      } else {
        rows = await trx
          .selectFrom('audio as a')
          .innerJoin('audioPlaylistItem as i', 'i.audioId', 'a.id')
          .where('i.playlistId', '=', playlistId)
          .select(
            selections.map((s) => `a.${s}`) as Array<
              SelectExpression<
                DB & { a: Audio; i: AudioPlaylistItem },
                'a' | 'i'
              >
            >
          )
          .execute()
      }

      if (sortBy === ASF.random) {
        rows = randomizeList(rows)
      } else {
        rows.sort(audioSortFunction(sortBy, sortOrder === 'asc'))
      }

      if (playlistId == null) {
        await trx
          .updateTable('audio')
          .set((eb) => ({ index: eb(`index`, '+', rows.length) }))
          .execute()

        for (let i = 0; i < rows.length; i++) {
          await trx
            .updateTable('audio')
            .set({ index: i })
            .where('id', '=', rows[i].id as number)
            .execute()
        }
      } else {
        await trx
          .updateTable('audioPlaylistItem')
          .set((eb) => ({ index: eb(`index`, '+', rows.length) }))
          .where('playlistId', '=', playlistId)
          .execute()

        for (let i = 0; i < rows.length; i++) {
          await trx
            .updateTable('audioPlaylistItem')
            .set({ index: i })
            .where('audioId', '=', rows[i].id as number)
            .where('playlistId', '=', playlistId)
            .execute()
        }
      }
    })
}

function audioSortFunction(
  algorithm: string,
  ascending: boolean
): (a: Partial<Audio>, b: Partial<Audio>) => number {
  return (a, b) => {
    let secondary: string | undefined = undefined
    let compare: number
    switch (algorithm) {
      case ASF.url: {
        compare = sortString(a.url as string, b.url as string, ascending)
        break
      }
      case ASF.name: {
        const reA = /^(A\s|a\s|The\s|the\s)/g
        const aValue = (a.name ?? '').replace(reA, '')
        const bValue = (b.name ?? '').replace(reA, '')
        compare = sortString(aValue, bValue, ascending, { numeric: true })
        secondary = ASF.url
        break
      }
      case ASF.artist: {
        compare = sortString(a.artist ?? '', b.artist ?? '', ascending)
        secondary = ASF.album
        break
      }
      case ASF.album: {
        compare = sortString(a.album ?? '', b.album ?? '', ascending)
        secondary = ASF.trackNum
        break
      }
      case ASF.date: {
        compare = sortNumber(
          a.createdAt as number,
          b.createdAt as number,
          ascending
        )
        secondary = ASF.url
        break
      }
      case ASF.trackNum: {
        compare = sortNumber(a.trackNum ?? 0, b.trackNum ?? 0, ascending)
        secondary = ASF.name
        break
      }
      case ASF.duration: {
        compare = sortNumber(a.duration ?? 0, b.duration ?? 0, ascending)
        secondary = ASF.url
        break
      }
      case ASF.playedCount: {
        compare = sortNumber(
          a.playedCount as number,
          b.playedCount as number,
          ascending
        )
        secondary = ASF.artist
        break
      }
      default: {
        compare = 0
        break
      }
    }

    return compare === 0 && secondary != null
      ? audioSortFunction(secondary, true)(a, b)
      : compare
  }
}

export async function moveAudio(move: MoveRequest) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const { ids } = move
      await trx
        .updateTable('audio')
        .set((eb) => ({ index: eb('index', '+', ids.length) }))
        .execute()

      for (let i = 0; i < ids.length; i++) {
        await trx
          .updateTable('audio')
          .set({ index: i })
          .where('id', '=', ids[i])
          .execute()
      }
    })
}

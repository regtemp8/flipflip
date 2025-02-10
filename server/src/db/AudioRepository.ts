import { Insertable, Kysely, SelectExpression, Updateable } from 'kysely'
import { Audio, AudioPlaylistItem, AudioTag, DB } from './types/generated'
import db from './database'
import { SearchOption } from './types/SearchOption'
import { toNumber } from './utils'
import {
  ASF,
  AudioSortRequest,
  getSourceType,
  randomizeList,
  Audio as AudioJson,
  TF
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
): Promise<Audio> {
  return await db()
    .query()
    .selectFrom('audio')
    .selectAll()
    .where('userId', '=', userId)
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

export async function findAudioTagIds(
  userId: number,
  id: number
): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('audioTag')
    .select('tagId')
    .where('userId', '=', userId)
    .where('id', '=', id)
    .execute()
    .then((value) => value.map(({ tagId }) => tagId))
}

export async function findAudioUrlById(id: number, userId: number): Promise<string> {
  return await db()
    .query()
    .selectFrom('audio')
    .select('url')
    .where('id', '=', id)
    .where('userId', '=', userId)
    .executeTakeFirstOrThrow()
    .then((row) => row.url)
}

export async function findAudioThumbById(id: number, userId: number): Promise<string|undefined> {
  return await db()
    .query()
    .selectFrom('audio')
    .select('thumb')
    .where('id', '=', id)
    .where('userId', '=', userId)
    .executeTakeFirst()
    .then((row) => row?.thumb ?? undefined)
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

      await trx
        .insertInto('audio')
        .values(values)
        .onConflict((oc) => oc.doNothing())
        .execute()
    })
}

export type AudioUpdate = Updateable<Audio>
export async function updateAudio(id: number, update: AudioUpdate) {
  if (update.url != null) {
    update.type = getSourceType(update.url)
  }

  return await db()
    .query()
    .updateTable('audio')
    .set(update)
    .where('id', '=', id)
    .execute()
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

type AudioTagInsert = Insertable<AudioTag>
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

  return await trx.insertInto('audioTag').values(values).execute()
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

      const tagIds = await findTagIdsByName(tags, trx)
      await insertAudioTags(userId, ids, tagIds, trx)
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
      await trx
        .deleteFrom('audioTag')
        .where('audioId', '=', id)
        .execute()
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

      const updateTable = playlistId == null ? 'audio' : 'audioPlaylistItem'
      await trx
        .updateTable(updateTable)
        .set((eb) => ({ index: eb(`index`, '+', rows.length) }))
        .execute()

      const updateColumn = playlistId == null ? 'id' : 'audioId'
      for (let i = 0; i < rows.length; i++) {
        await trx
          .updateTable(updateTable)
          .set({ index: i })
          .where(updateColumn, '=', rows[i].id as number)
          .execute()
      }
    })
}

function audioSortFunction(
  algorithm: string,
  ascending: boolean
): (a: Partial<Audio>, b: Partial<Audio>) => number {
  return (a, b) => {
    let secondary = null
    let aValue: any, bValue: any
    switch (algorithm) {
      case ASF.url:
        aValue = a.url
        bValue = b.url
        break
      case ASF.name:
        const reA = /^(A\s|a\s|The\s|the\s)/g
        aValue = (a.name ?? '').replace(reA, '')
        bValue = (b.name ?? '').replace(reA, '')

        const compare = aValue.localeCompare(bValue, 'en', { numeric: true })
        if(compare != 0) {
          return ascending ? compare : compare * -1
        }

        aValue = ''
        bValue = ''
        secondary = ASF.url
        break
      case ASF.artist:
        aValue = a.artist
        bValue = b.artist
        secondary = ASF.album
        break
      case ASF.album:
        aValue = a.album
        bValue = b.album
        secondary = ASF.trackNum
        break
      case ASF.date:
        aValue = a.createdAt
        bValue = b.createdAt
        secondary = ASF.url
        break
      case ASF.trackNum:
        aValue = parseInt(a.trackNum as any)
        bValue = parseInt(b.trackNum as any)
        secondary = ASF.name
        break
      case ASF.duration:
        aValue = a.duration
        bValue = b.duration
        secondary = ASF.url
        break
      case ASF.playedCount:
        aValue = a.playedCount
        bValue = b.playedCount
        secondary = ASF.artist
        break
      default:
        aValue = ''
        bValue = ''
    }
    if (aValue < bValue) {
      return ascending ? -1 : 1
    } else if (aValue > bValue) {
      return ascending ? 1 : -1
    } else {
      if (!!secondary) {
        return audioSortFunction(secondary, true)(a, b)
      } else {
        return 0
      }
    }
  }
}

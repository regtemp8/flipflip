import { Insertable, Kysely, Updateable } from 'kysely'
import { Audio, AudioTag, DB } from './types/generated'
import db from './database'
import { SearchOption } from './types/SearchOption'
import { toNumber } from './utils'
import { getSourceType } from 'flipflip-common'
import { findTagIdsByName } from './TagRepository'

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

export async function findAudioUrlById(id: number): Promise<string> {
  return await db()
    .query()
    .selectFrom('audio')
    .select('url')
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
    .then((row) => row.url)
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

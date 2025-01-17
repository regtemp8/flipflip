import { Insertable, Kysely, sql, Updateable } from 'kysely'
import { ContentSource, ContentSourceTag, DB } from './types/generated'
import db from './database'
import { SearchOption } from './types/SearchOption'
import { toNumber } from './utils'
import { getSourceType, randomizeList, SF, SortRequest, ST } from 'flipflip-common'
import { findTagIdsByName } from './TagRepository'
import { getFileName, getFileGroup } from '../utils'

export const IS_LIBRARY = 0

export async function findContentSourceById(
  userId: number,
  id: number
): Promise<ContentSource> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .selectAll()
    .where('userId', '=', userId)
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

export async function findContentSourceTagIds(
  userId: number,
  id: number
): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('contentSourceTag')
    .select('tagId')
    .where('userId', '=', userId)
    .where('id', '=', id)
    .execute()
    .then((value) => value.map(({ tagId }) => tagId))
}

export async function findContentSourceUrlById(id: number): Promise<string> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .select('url')
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
    .then((row) => row.url)
}

export async function findContentSources(
  sceneId: number
): Promise<ContentSource[]> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .selectAll()
    .where('sceneId', '=', sceneId)
    .execute()
}

export type ContentSourceUpdate = Updateable<ContentSource>
export async function updateContentSource(
  id: number,
  update: ContentSourceUpdate
) {
  if (update.url != null) {
    update.type = getSourceType(update.url)
  }

  return await db()
    .query()
    .updateTable('contentSource')
    .set(update)
    .where('id', '=', id)
    .execute()
}

export async function findBatchTagOptions(
  userId: number
): Promise<SearchOption[]> {
  return await db()
    .query()
    .selectFrom((eb) => {
      return eb
        .selectFrom('tag as t')
        .leftJoin('contentSourceTag as cst', 'cst.tagId', 't.id')
        .select(({ fn }) => [
          't.name',
          fn.count<number>('cst.tagId').as('count')
        ])
        .where('t.userId', '=', userId)
        .where((eb) =>
          eb.or([eb('cst.userId', '=', userId), eb('cst.tagId', 'is', null)])
        )
        .groupBy('t.name')
        .unionAll(
          eb
            .selectFrom('tag as t')
            .leftJoin('clipTag as ct', 'ct.tagId', 't.id')
            .select(({ fn }) => [
              't.name',
              fn.count<number>('ct.tagId').as('count')
            ])
            .where('t.userId', '=', userId)
            .where((eb) =>
              eb.or([eb('ct.userId', '=', userId), eb('ct.tagId', 'is', null)])
            )
            .groupBy('t.name')
        )
        .as('r')
    })
    .select(({ fn }) => ['r.name', fn.sum<number>('r.count').as('count')])
    .groupBy('r.name')
    .orderBy('count desc')
    .orderBy('r.name asc')
    .execute()
}

export async function findSearchOptions(
  userId: number
): Promise<SearchOption[]> {
  return await db()
    .query()
    .selectFrom((eb) => {
      return eb
        .selectFrom('tag as t')
        .innerJoin('contentSourceTag as cst', 'cst.tagId', 't.id')
        .select(({ fn }) => [
          't.name',
          fn.count<number>('cst.tagId').as('count')
        ])
        .where('t.userId', '=', userId)
        .where('cst.userId', '=', userId)
        .groupBy('t.name')
        .unionAll(
          eb
            .selectFrom('tag as t')
            .innerJoin('clipTag as ct', 'ct.tagId', 't.id')
            .select(({ fn }) => [
              't.name',
              fn.count<number>('ct.tagId').as('count')
            ])
            .where('t.userId', '=', userId)
            .where('ct.userId', '=', userId)
            .groupBy('t.name')
        )
        .as('r')
    })
    .select(({ fn }) => ['r.name', fn.sum<number>('r.count').as('count')])
    .groupBy('r.name')
    .orderBy('count desc')
    .orderBy('r.name asc')
    .execute()
}

export async function findTypeOptions(userId: number): Promise<SearchOption[]> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .select(({ fn }) => ['type as name', fn.count<number>('id').as('count')])
    .where('userId', '=', userId)
    .groupBy('name')
    .orderBy('count desc')
    .orderBy('name asc')
    .execute()
}

export async function findUntaggedCount(userId: number): Promise<number> {
  return await db()
    .query()
    .selectFrom('contentSource as cs')
    .leftJoin('contentSourceTag as cst', 'cst.contentSourceId', 'cs.id')
    .select(({ fn }) => [fn.count<number>('cs.id').as('count')])
    .where('cs.userId', '=', userId)
    .where('cst.id', 'is', null)
    .executeTakeFirstOrThrow()
    .then((value) => value.count)
}

export async function findMarkedCount(userId: number): Promise<number> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .select(({ fn }) => [fn.count<number>('id').as('count')])
    .where('userId', '=', userId)
    .where('marked', '=', toNumber(true))
    .executeTakeFirstOrThrow()
    .then((value) => value.count)
}

export async function findTotalCount(userId: number): Promise<number> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .select(({ fn }) => [fn.count<number>('id').as('count')])
    .where('userId', '=', userId)
    .executeTakeFirstOrThrow()
    .then((value) => value.count)
}

export async function findOfflineCount(userId: number): Promise<number> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .select(({ fn }) => [fn.count<number>('id').as('count')])
    .where('userId', '=', userId)
    .where('offline', '=', toNumber(true))
    .executeTakeFirstOrThrow()
    .then((value) => value.count)
}

type ContentSourceTagInsert = Insertable<ContentSourceTag>
export async function addContentSourceTags(
  userId: number,
  ids: number[],
  tags: string[]
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const tagIds = await findTagIdsByName(tags, trx)
      await insertContentSourceTags(userId, ids, tagIds, trx)
    })
}

async function insertContentSourceTags(
  userId: number,
  ids: number[],
  tagIds: number[],
  trx: Kysely<DB>
) {
  const values: ContentSourceTagInsert[] = []
  for (const contentSourceId of ids) {
    for (const tagId of tagIds) {
      values.push({ userId, contentSourceId, tagId })
    }
  }

  return await trx.insertInto('contentSourceTag').values(values).execute()
}

export async function setContentSourceTags(
  userId: number,
  ids: number[],
  tags: string[]
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      await trx
        .deleteFrom('contentSourceTag')
        .where('userId', '=', userId)
        .where('contentSourceId', 'in', ids)
        .execute()

      const tagIds = await findTagIdsByName(tags, trx)
      await insertContentSourceTags(userId, ids, tagIds, trx)
    })
}

export async function removeContentSourceTags(
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
        .deleteFrom('contentSourceTag')
        .where('userId', '=', userId)
        .where('contentSourceId', 'in', ids)
        .where('tagId', 'in', tagIds)
        .execute()
    })
}

export async function markContentSources(userId: number, ids: number[]) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const existingRows = await trx
        .selectFrom('contentSource')
        .select(({ lit }) => lit(1).as('one'))
        .where('userId', '=', userId)
        .where('marked', '=', toNumber(true))
        .execute()
      if (existingRows.length === 0) {
        await trx
          .updateTable('contentSource')
          .set({ marked: toNumber(true) })
          .where('userId', '=', userId)
          .where('id', 'in', ids)
          .execute()
      } else {
        await trx
          .updateTable('contentSource')
          .set({ marked: toNumber(false) })
          .where('userId', '=', userId)
          .execute()
      }
    })
}

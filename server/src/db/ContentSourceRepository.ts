import { Insertable, Kysely, Updateable } from 'kysely'
import { ContentSource, ContentSourceTag } from './types/entities'
import { DB } from './types/generated'
import db from './database'
import { SearchOption } from './types/SearchOption'
import { toNumber } from './utils'
import {
  getSourceType,
  randomizeList,
  SF,
  ContentSortRequest,
  ST
} from 'flipflip-common'
import { findTagIdsByName } from './TagRepository'
import { getFileName, getFileGroup } from '../utils'

export const IS_LIBRARY = 0
export type ContentSourceInsert = Insertable<ContentSource>
export async function createContentSources(
  urls: string[],
  sceneId: number,
  userId: number
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const createdAt = new Date().getTime()

      await trx
        .updateTable('contentSource')
        .set((eb) => ({ index: eb('index', '+', urls.length) }))
        .execute()

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        const librarySource = await trx
          .selectFrom('contentSource')
          .select(['id', 'count', 'countComplete'])
          .where('sceneId', '=', IS_LIBRARY)
          .executeTakeFirst()

        const id = await trx
          .insertInto('contentSource')
          .values({
            url,
            userId,
            sceneId,
            type: getSourceType(url),
            offline: toNumber(false),
            marked: toNumber(false),
            lastCheck: createdAt,
            count: librarySource?.count ?? 0,
            countComplete: librarySource?.countComplete ?? toNumber(false),
            weight: 1,
            localDirOfSources: toNumber(false),
            twitterIncludeRetweets: toNumber(false),
            twitterIncludeReplies: toNumber(false),
            createdAt,
            index: i
          })
          .onConflict((oc) => oc.doNothing())
          .returning('id')
          .executeTakeFirst()
          .then((result) => result?.id)

        if (id == null || sceneId == IS_LIBRARY || librarySource?.id == null) {
          continue
        }

        await trx
          .insertInto('contentSourceTag')
          .expression((eb) =>
            eb
              .selectFrom('contentSourceTag')
              .select([
                'tagId',
                (eb) => eb.lit(userId).as('userId'),
                (eb) => eb.lit(id).as('contentSourceId')
              ])
              .where('contentSourceId', '=', librarySource.id)
          )
          .execute()

        const clips = await trx
          .selectFrom('clip')
          .select(['id', 'disabled', 'start', 'end', 'volume'])
          .where('contentSourceId', '=', librarySource.id)
          .execute()

        for (const clip of clips) {
          const { disabled, start, end, volume } = clip
          const newClip = await trx
            .insertInto('clip')
            .values({
              userId,
              contentSourceId: id,
              disabled,
              start,
              end,
              volume
            })
            .returning('id')
            .executeTakeFirst()

          await trx
            .insertInto('clipTag')
            .expression((eb) =>
              eb
                .selectFrom('clipTag')
                .select([
                  'tagId',
                  (eb) => eb.lit(userId).as('userId'),
                  (eb) => eb.lit(newClip?.id as number).as('clipId')
                ])
                .where('clipId', '=', clip.id)
            )
            .execute()
        }

        await trx
          .insertInto('contentSourceBlacklistItem')
          .expression((eb) =>
            eb
              .selectFrom('contentSourceBlacklistItem')
              .select(['url', (eb) => eb.lit(id).as('contentSourceId')])
              .where('contentSourceId', '=', librarySource.id)
          )
          .execute()
      }
    })
}

export async function findSceneContentSourceIds(
  sceneId: number
): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .select('id')
    .where('sceneId', '=', sceneId)
    .orderBy('index asc')
    .execute()
    .then((value) => value.map((v) => v.id as number))
}

export async function findContentSourceById(
  userId: number,
  id: number
): Promise<ContentSource | undefined> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .selectAll()
    .where('userId', '=', userId)
    .where('id', '=', id)
    .executeTakeFirst()
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

export async function findContentSourceUrlById(
  id: number,
  userId: number
): Promise<string> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .select('url')
    .where('id', '=', id)
    .where('userId', '=', userId)
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

type SortRow = {
  id: number | null
  type: string
  duration: number
  resolution: number
  url: string
  count: number
  clips: number
}
export async function sortContentSources({
  sortBy,
  sortOrder,
  sceneId
}: ContentSortRequest) {
  sceneId = sceneId ?? IS_LIBRARY
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      let rows = await trx
        .selectFrom('contentSource as c')
        .leftJoin('clip as cl', 'cl.contentSourceId', 'c.id')
        .select(({ fn, val }) => [
          'c.id',
          'c.type',
          'c.count',
          fn<number>('coalesce', ['c.videoDuration', val(0)]).as('duration'),
          fn<number>('coalesce', ['c.videoResolution', val(0)]).as(
            'resolution'
          ),
          fn<string>('lower', ['c.url']).as('url'),
          fn<number>('count', ['cl.id']).as('clips')
        ])
        .where('c.sceneId', '=', sceneId)
        .execute()

      if (sortBy === SF.random) {
        rows = randomizeList(rows)
      } else {
        let secondary: string | undefined = undefined
        if (sortBy === SF.alpha) {
          secondary = SF.type
        } else if (sortBy === SF.type) {
          secondary = SF.alpha
        }

        rows.sort(sortFunction(sortBy, sortOrder === 'asc', secondary))
      }

      await trx
        .updateTable('contentSource')
        .set((eb) => ({ index: eb(`index`, '+', rows.length) }))
        .where('sceneId', '=', sceneId)
        .execute()

      for (let i = 0; i < rows.length; i++) {
        await trx
          .updateTable('contentSource')
          .set({ index: i })
          .where('id', '=', rows[i].id)
          .execute()
      }
    })
}

function getName({ type, url }: SortRow) {
  return type === ST.video || type === ST.playlist
    ? getFileName(url)
    : getFileGroup(url)
}

function getCount({ type, count, clips }: SortRow) {
  return type === ST.video ? clips : count
}

function sortFunction(
  algorithm: string,
  ascending: boolean,
  secondary?: string
): (a: SortRow, b: SortRow) => number {
  return (a, b) => {
    let aValue: any, bValue: any
    switch (algorithm) {
      case SF.alpha:
        aValue = getName(a)
        bValue = getName(b)
        break
      case SF.alphaFull:
        aValue = a.url
        bValue = b.url
        break
      case SF.date:
        aValue = a.id
        bValue = b.id
        break
      case SF.count:
        aValue = getCount(a)
        bValue = getCount(b)
        break
      case SF.type:
        aValue = a.type
        bValue = b.type
        break
      case SF.duration:
        aValue = a.duration
        bValue = b.duration
        break
      case SF.resolution:
        aValue = a.resolution
        bValue = b.resolution
        break
      default:
        aValue = ''
        bValue = ''
    }

    if (aValue < bValue) {
      return ascending ? -1 : 1
    } else if (aValue > bValue) {
      return ascending ? 1 : -1
    } else if (secondary != null) {
      return sortFunction(secondary, true)(a, b)
    } else {
      return 0
    }
  }
}

export async function updateContentSourceCount(
  url: string,
  count: number,
  countComplete: boolean
) {
  if (countComplete) {
    return await db()
      .query()
      .updateTable('contentSource')
      .set({
        count,
        countComplete: toNumber(countComplete)
      })
      .where('url', '=', url)
      .execute()
  } else {
    return await db()
      .query()
      .updateTable('contentSource')
      .set({ count })
      .where('url', '=', url)
      .where('count', '<', count)
      .execute()
  }
}

export async function deleteContentSource(id: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const { index } = await trx
        .selectFrom('contentSource')
        .select('index')
        .where('id', '=', id)
        .executeTakeFirstOrThrow()

      await trx
        .deleteFrom('contentSourceBlacklistItem')
        .where('contentSourceId', '=', id)
        .execute()

      await trx.deleteFrom('clip').where('contentSourceId', '=', id).execute()

      await trx
        .deleteFrom('contentSourceTag')
        .where('contentSourceId', '=', id)
        .execute()

      const result = await trx
        .deleteFrom('contentSource')
        .where('id', '=', id)
        .execute()

      await trx
        .updateTable('contentSource')
        .set((eb) => ({ index: eb('index', '-', 1) }))
        .where('index', '>', index)
        .execute()

      return result
    })
}

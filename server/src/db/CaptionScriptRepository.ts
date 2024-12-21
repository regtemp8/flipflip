import { DeleteResult, Insertable, Kysely, Updateable } from 'kysely'
import {
  CaptionScript,
  CaptionScriptTag,
  DB,
  FontSettings
} from './types/generated'
import db from './database'
import {
  FontSettingsType,
  MoveRequest,
  randomizeList,
  getSourceType,
  SF,
  SortRequest
} from 'flipflip-common'
import { toNumber } from './utils'
import { getFileName } from '../utils'
import { SearchOption } from './types/SearchOption'
import { findTagIdsByName } from './TagRepository'

export type CaptionScriptInsert = Insertable<CaptionScript>
export type FontSettingsInsert = Insertable<FontSettings>
type CaptionScriptTagInsert = Insertable<CaptionScriptTag>
export async function createCaptionScripts(urls: string[], userId: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      await trx
        .updateTable('captionScript')
        .set((eb) => ({ index: eb('index', '+', urls.length) }))
        .execute()

      const captionScripts = urls.map((url, index) => ({
        url,
        type: getSourceType(url),
        userId,
        index,
        marked: toNumber(false),
        nextSceneAtEnd: toNumber(false),
        opacity: 100,
        stopAtEnd: toNumber(false),
        syncWithAudio: toNumber(true)
      }))

      const rows = await trx
        .insertInto('captionScript')
        .values(captionScripts)
        .onConflict((oc) => oc.doNothing())
        .returningAll()
        .execute()

      const fontSettings: FontSettingsInsert[] = []
      for (const { id } of rows) {
        fontSettings.push({
          userId,
          captionScriptId: id as number,
          type: 'blink',
          color: '#FFFFFF',
          fontSize: 20,
          fontFamily: 'Arial Black,Arial Bold,Gadget,sans-serif',
          border: toNumber(false),
          borderpx: 5,
          borderColor: '#000000'
        })
        fontSettings.push({
          userId,
          captionScriptId: id as number,
          type: 'caption',
          color: '#FFFFFF',
          fontSize: 8,
          fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif',
          border: toNumber(false),
          borderpx: 3,
          borderColor: '#000000'
        })
        fontSettings.push({
          userId,
          captionScriptId: id as number,
          type: 'captionBig',
          color: '#FFFFFF',
          fontSize: 12,
          fontFamily: 'Arial Black,Arial Bold,Gadget,sans-serif',
          border: toNumber(false),
          borderpx: 4,
          borderColor: '#000000'
        })
        fontSettings.push({
          userId,
          captionScriptId: id as number,
          type: 'count',
          color: '#FFFFFF',
          fontSize: 20,
          fontFamily: 'Arial Black,Arial Bold,Gadget,sans-serif',
          border: toNumber(false),
          borderpx: 5,
          borderColor: '#000000'
        })
      }

      if(fontSettings.length > 0) {
        await trx.insertInto('fontSettings').values(fontSettings).execute()
      }
      
      return rows
    })
}

export async function findCaptionScripts(): Promise<CaptionScript[]> {
  return await db()
    .query()
    .selectFrom('captionScript')
    .selectAll()
    .orderBy('index asc')
    .execute()
}

export async function findCaptionScriptIds(): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('captionScript')
    .select('id')
    .execute()
    .then((value) => value.map((v) => v.id as number))
}

export async function findCaptionScriptById(
  userId: number,
  id: number
): Promise<CaptionScript | undefined> {
  return await db()
    .query()
    .selectFrom('captionScript')
    .selectAll()
    .where('userId', '=', userId)
    .where('id', '=', id)
    .executeTakeFirst()
}

export async function findCaptionScriptTagIds(
  userId: number,
  id: number
): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('captionScriptTag')
    .select('tagId')
    .where('userId', '=', userId)
    .where('captionScriptId', '=', id)
    .execute()
    .then((value) => value.map(({ tagId }) => tagId))
}

export async function findCaptionScriptUrlById(id: number): Promise<string> {
  return await db()
    .query()
    .selectFrom('captionScript')
    .select('url')
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
    .then((row) => row.url)
}

export type CaptionScriptUpdate = Updateable<CaptionScript>
export async function updateCaptionScript(
  id: number,
  update: CaptionScriptUpdate
) {
  if (update.url == null) {
    await db()
      .query()
      .updateTable('captionScript')
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
        .selectFrom('captionScript')
        .select(['id', 'index'])
        .where('id', '<>', id)
        .where('url', '=', url)
        .executeTakeFirst()

      if (sameUrl != null) {
        await trx
          .deleteFrom('captionScriptPlaylistItem')
          .where('captionScriptId', '=', id)
          .execute()
        await trx
          .deleteFrom('captionScriptTag')
          .where('captionScriptId', '=', id)
          .execute()
        await trx
          .deleteFrom('fontSettings')
          .where('captionScriptId', '=', id)
          .execute()

        const { index } = await trx
          .deleteFrom('captionScript')
          .where('id', '=', id)
          .returning('index')
          .executeTakeFirstOrThrow()

        if (index < sameUrl.index) {
          await trx
            .updateTable('captionScript')
            .set({ index })
            .where('id', '=', sameUrl.id)
            .execute()
        }

        await trx
          .updateTable('captionScript')
          .set((eb) => ({ index: eb('index', '-', 1) }))
          .where('index', '>', Math.max(index, sameUrl.index))
          .execute()
      } else {
        await trx
          .updateTable('captionScript')
          .set(update)
          .where('id', '=', id)
          .execute()
      }

      return sameUrl != null
    })
}

export async function deleteAllCaptionScripts() {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const result = await Promise.all([
        trx.deleteFrom('captionScriptPlaylistItem').execute(),
        trx.deleteFrom('captionScriptTag').execute(),
        trx.deleteFrom('fontSettings').execute(),
        trx.deleteFrom('captionScript').execute()
      ])

      const numDeletedRows = result
        .flatMap((r) => r)
        .map((r) => r.numDeletedRows)
        .reduce<bigint>((accumulator, currentValue) => {
          return accumulator + currentValue
        }, BigInt(0))
      return new DeleteResult(numDeletedRows)
    })
}

export async function deleteCaptionScript(id: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const { index } = await trx
        .selectFrom('captionScript')
        .select('index')
        .where('id', '=', id)
        .executeTakeFirstOrThrow()

      await trx
        .deleteFrom('captionScriptPlaylistItem')
        .where('captionScriptId', '=', id)
        .execute()
      await trx
        .deleteFrom('captionScriptTag')
        .where('captionScriptId', '=', id)
        .execute()
      await trx
        .deleteFrom('fontSettings')
        .where('captionScriptId', '=', id)
        .execute()
      const result = await trx
        .deleteFrom('captionScript')
        .where('id', '=', id)
        .execute()
      await trx
        .updateTable('captionScript')
        .set((eb) => ({ index: eb('index', '-', 1) }))
        .where('index', '>', index)
        .execute()

      return result
    })
}

const sortColumns = new Map<string, string>([
  [SF.alpha, 'url'],
  [SF.alphaFull, 'url'],
  [SF.date, 'id'],
  [SF.random, 'id']
])
export async function sortCaptionScripts({ sortBy, sortOrder }: SortRequest) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      let rows = await trx
        .selectFrom('captionScript')
        .select(['id', trx.fn<string | null>('lower', ['url']).as('url')])
        .orderBy(
          `${sortColumns.get(sortBy) as keyof CaptionScript} ${sortOrder}`
        )
        .execute()

      if (sortBy === SF.random) {
        rows = randomizeList(rows)
      } else if (sortBy === SF.alpha) {
        rows = rows.sort((a, b) =>
          getFileName(a.url ?? '') < getFileName(b.url ?? '') ? -1 : 1
        )
        if (sortOrder === 'desc') {
          rows.reverse()
        }
      }

      await trx
        .updateTable('captionScript')
        .set((eb) => ({ index: eb(`index`, '+', rows.length) }))
        .execute()

      for (let i = 0; i < rows.length; i++) {
        await trx
          .updateTable('captionScript')
          .set({ index: i })
          .where('id', '=', rows[i].id)
          .execute()
      }
    })
}

export async function moveCaptionScript(move: MoveRequest) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const { ids } = move
      await trx
        .updateTable('captionScript')
        .set((eb) => ({ index: eb('index', '+', ids.length) }))
        .execute()

      for (let i = 0; i < ids.length; i++) {
        await trx
          .updateTable('captionScript')
          .set({ index: i })
          .where('id', '=', ids[i])
          .execute()
      }
    })
}

export async function findFontSettingsByType(
  id: number,
  type: FontSettingsType
): Promise<FontSettings | undefined> {
  return await db()
    .query()
    .selectFrom('fontSettings')
    .selectAll()
    .where('captionScriptId', '=', id)
    .where('type', '=', type)
    .executeTakeFirst()
}

export type FontSettingsUpdate = Updateable<FontSettings>
export async function updateFontSettings(
  id: number,
  type: FontSettingsType,
  update: FontSettingsUpdate
) {
  return await db()
    .query()
    .updateTable('fontSettings')
    .set(update)
    .where('captionScriptId', '=', id)
    .where('type', '=', type)
    .execute()
}

export async function findCaptionScriptsCount() {
  return await db()
    .query()
    .selectFrom('captionScript')
    .select((eb) => eb.fn.countAll<number>().as('captionScriptsCount'))
    .executeTakeFirstOrThrow()
}

export async function isUntagged(id: number) {
  const { count } = await db()
    .query()
    .selectFrom('captionScriptTag')
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .where('captionScriptId', '=', id)
    .executeTakeFirstOrThrow()

  return count === 0
}

export async function hasTag(id: number, tagName: string) {
  const rows = await db()
    .query()
    .selectFrom('tag as t')
    .select((eb) => eb.lit(1).as('exists'))
    .innerJoin('captionScriptTag as cst', (jb) =>
      jb.on('cst.captionScriptId', '=', id)
    )
    .where('cst.captionScriptId', '=', id)
    .where('t.name', '=', tagName)
    .execute()

  return rows.length === 1
}

export async function findBatchTagOptions(
  userId: number
): Promise<SearchOption[]> {
  return await db()
    .query()
    .selectFrom('tag as t')
    .leftJoin('captionScriptTag as cst', 'cst.tagId', 't.id')
    .select(({ fn }) => ['t.name', fn.count<number>('cst.tagId').as('count')])
    .where('t.userId', '=', userId)
    .where((eb) =>
      eb.or([eb('cst.userId', '=', userId), eb('cst.tagId', 'is', null)])
    )
    .groupBy('t.name')
    .orderBy('count desc')
    .orderBy('t.name asc')
    .execute()
}

export async function findUntaggedCount(userId: number): Promise<number> {
  return await db()
    .query()
    .selectFrom('captionScript as cs')
    .leftJoin('captionScriptTag as cst', 'cst.captionScriptId', 'cs.id')
    .select(({ fn }) => [fn.count<number>('cs.id').as('count')])
    .where('cs.userId', '=', userId)
    .where('cst.id', 'is', null)
    .executeTakeFirstOrThrow()
    .then((value) => value.count)
}

export async function findMarkedCount(userId: number): Promise<number> {
  return await db()
    .query()
    .selectFrom('captionScript')
    .select(({ fn }) => [fn.count<number>('id').as('count')])
    .where('userId', '=', userId)
    .where('marked', '=', toNumber(true))
    .executeTakeFirstOrThrow()
    .then((value) => value.count)
}

export async function findSearchOptions(
  userId: number
): Promise<SearchOption[]> {
  return await db()
    .query()
    .selectFrom('tag as t')
    .innerJoin('captionScriptTag as cst', 'cst.tagId', 't.id')
    .select(({ fn }) => ['t.name', fn.count<number>('cst.tagId').as('count')])
    .where('t.userId', '=', userId)
    .where('cst.userId', '=', userId)
    .groupBy('t.name')
    .orderBy('count desc')
    .orderBy('t.name asc')
    .execute()
}

export async function addCaptionScriptTags(
  userId: number,
  ids: number[],
  tags: string[]
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const tagIds = await findTagIdsByName(tags, trx)
      await insertCaptionScriptTags(userId, ids, tagIds, trx)
    })
}

async function insertCaptionScriptTags(
  userId: number,
  ids: number[],
  tagIds: number[],
  trx: Kysely<DB>
) {
  const values: CaptionScriptTagInsert[] = []
  for (const captionScriptId of ids) {
    for (const tagId of tagIds) {
      values.push({ userId, captionScriptId, tagId })
    }
  }

  return await trx.insertInto('captionScriptTag').values(values).execute()
}

export async function setCaptionScriptTags(
  userId: number,
  ids: number[],
  tags: string[]
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      await trx
        .deleteFrom('captionScriptTag')
        .where('userId', '=', userId)
        .where('captionScriptId', 'in', ids)
        .execute()

      const tagIds = await findTagIdsByName(tags, trx)
      await insertCaptionScriptTags(userId, ids, tagIds, trx)
    })
}

export async function removeCaptionScriptTags(
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
        .deleteFrom('captionScriptTag')
        .where('userId', '=', userId)
        .where('captionScriptId', 'in', ids)
        .where('tagId', 'in', tagIds)
        .execute()
    })
}

export async function markCaptionScripts(userId: number, ids: number[]) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const existingRows = await trx
        .selectFrom('captionScript')
        .select(({ lit }) => lit(1).as('one'))
        .where('userId', '=', userId)
        .where('marked', '=', toNumber(true))
        .execute()
      if (existingRows.length === 0) {
        await trx
          .updateTable('captionScript')
          .set({ marked: toNumber(true) })
          .where('userId', '=', userId)
          .where('id', 'in', ids)
          .execute()
      } else {
        await trx
          .updateTable('captionScript')
          .set({ marked: toNumber(false) })
          .where('userId', '=', userId)
          .execute()
      }
    })
}

import { DeleteResult, Insertable, Kysely, Updateable } from 'kysely'
import { Tag } from './types/entities'
import { DB } from './types/generated'
import db from './database'
import { MoveRequest, SF, SortRequest } from 'flipflip-common'

export async function findTagIds(): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('tag')
    .select('id')
    .orderBy('index asc')
    .execute()
    .then((value) => value.map((v) => v.id as number))
}

export async function findTagById(id: number): Promise<Tag | undefined> {
  return await db()
    .query()
    .selectFrom('tag')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
}

export type TagUpdate = Updateable<Tag>
export async function updateTag(id: number, update: TagUpdate) {
  return await db()
    .query()
    .updateTable('tag')
    .set(update)
    .where('id', '=', id)
    .execute()
}

export async function moveTag(move: MoveRequest) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const { ids } = move
      await trx
        .updateTable('tag')
        .set((eb) => ({ index: eb('index', '+', ids.length) }))
        .execute()

      for (let i = 0; i < ids.length; i++) {
        await trx
          .updateTable('tag')
          .set({ index: i })
          .where('id', '=', ids[i])
          .execute()
      }
    })
}

export type TagInsert = Insertable<Tag>
export async function createTag(tag: TagInsert) {
  return await db()
    .query()
    .insertInto('tag')
    .values(tag)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function deleteTag(id: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const { index } = await trx
        .selectFrom('tag')
        .select('index')
        .where('id', '=', id)
        .executeTakeFirstOrThrow()

      const result = await Promise.all([
        trx.deleteFrom('ignoredTag').where('tagId', '=', id).execute(),
        trx.deleteFrom('contentSourceTag').where('tagId', '=', id).execute(),
        trx.deleteFrom('clipTag').where('tagId', '=', id).execute(),
        trx.deleteFrom('audioTag').where('tagId', '=', id).execute(),
        trx.deleteFrom('captionScriptTag').where('tagId', '=', id).execute(),
        trx.deleteFrom('tag').where('id', '=', id).execute()
      ])

      const numDeletedRows = result
        .flatMap((r) => r)
        .map((r) => r.numDeletedRows)
        .reduce<bigint>((accumulator, currentValue) => {
          return accumulator + currentValue
        }, BigInt(0))

      await trx
        .updateTable('tag')
        .set((eb) => ({ index: eb('index', '-', 1) }))
        .where('index', '>', index)
        .execute()

      return new DeleteResult(numDeletedRows)
    })
}

const sortColumns = new Map<string, string>([
  [SF.alpha, 'name'],
  [SF.date, 'id']
])
export async function sortTags({ sortBy, sortOrder }: SortRequest) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const rows = await trx
        .selectFrom('tag')
        .select('id')
        .orderBy(`${sortColumns.get(sortBy) as keyof Tag} ${sortOrder}`)
        .execute()

      await trx
        .updateTable('tag')
        .set((eb) => ({ index: eb(`index`, '+', rows.length) }))
        .execute()

      for (let i = 0; i < rows.length; i++) {
        await trx
          .updateTable('tag')
          .set({ index: i })
          .where('id', '=', rows[i].id)
          .execute()
      }
    })
}

export async function deleteAllTags() {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const result = await Promise.all([
        trx.deleteFrom('ignoredTag').execute(),
        trx.deleteFrom('contentSourceTag').execute(),
        trx.deleteFrom('clipTag').execute(),
        trx.deleteFrom('audioTag').execute(),
        trx.deleteFrom('captionScriptTag').execute(),
        trx.deleteFrom('tag').execute()
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

export async function findTagsCount() {
  return await db()
    .query()
    .selectFrom('tag')
    .select((eb) => eb.fn.countAll<number>().as('tagsCount'))
    .executeTakeFirstOrThrow()
}

export async function findTagIdsByName(tags: string[], trx: Kysely<DB>) {
  return await trx
    .selectFrom('tag')
    .select('id')
    .where('name', 'in', tags)
    .execute()
    .then((value) => value.map((v) => v.id as number))
}

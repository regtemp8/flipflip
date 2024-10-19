import { Insertable, Updateable } from 'kysely'
import { Tag } from './types/generated'
import db from './database'

export async function findTagIds(): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('tag')
    .select('id')
    .execute()
    .then((value) => value.map((v) => v.id as number))
}

export async function findTagById(id: number): Promise<Tag> {
  return await db()
    .query()
    .selectFrom('tag')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
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

export type TagInsert = Insertable<Tag>
export async function createTag(tag: TagInsert) {
  return await db()
    .query()
    .insertInto('tag')
    .values(tag)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function deleteAllTags() {
  // TODO delete all references in other tables first
  return await db().query().deleteFrom('tag').execute()
}

export async function findTagsCount() {
  return await db()
    .query()
    .selectFrom('tag')
    .select((eb) => eb.fn.countAll().as('tagsCount'))
    .execute()
}

import { Updateable } from 'kysely'
import { Tag } from './types/generated'
import db from './database'

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

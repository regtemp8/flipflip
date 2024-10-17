import { Updateable } from 'kysely'
import { ContentSource } from './types/generated'
import db from './database'

export async function findContentSourceById(
  id: number
): Promise<ContentSource> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

export type ContentSourceUpdate = Updateable<ContentSource>
export async function updateContentSource(
  id: number,
  update: ContentSourceUpdate
) {
  return await db()
    .query()
    .updateTable('contentSource')
    .set(update)
    .where('id', '=', id)
    .execute()
}

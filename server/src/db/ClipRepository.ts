import { Updateable } from 'kysely'
import { Clip } from './types/generated'
import db from './database'

export async function findClipById(id: number): Promise<Clip> {
  return await db()
    .query()
    .selectFrom('clip')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

export type ClipUpdate = Updateable<Clip>
export async function updateClip(id: number, update: ClipUpdate) {
  return await db()
    .query()
    .updateTable('clip')
    .set(update)
    .where('id', '=', id)
    .execute()
}

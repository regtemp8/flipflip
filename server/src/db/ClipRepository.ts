import { ClipUpdate } from './types/entities'
import db from './database'

export async function findClipById(id: number) {
  return await db()
    .query()
    .selectFrom('clip')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
}

export async function findContentSourceClipIds(
  userId: number,
  contentSourceId: number
): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('clip')
    .select('id')
    .where('userId', '=', userId)
    .where('contentSourceId', '=', contentSourceId)
    .execute()
    .then((rows) => rows.map(({ id }) => id as number))
}

export async function updateClip(id: number, update: ClipUpdate) {
  return await db()
    .query()
    .updateTable('clip')
    .set(update)
    .where('id', '=', id)
    .execute()
}

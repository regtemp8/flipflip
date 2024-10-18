import { Updateable } from 'kysely'
import { Audio } from './types/generated'
import db from './database'

export async function findAudioById(id: number): Promise<Audio> {
  return await db()
    .query()
    .selectFrom('audio')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

export type AudioUpdate = Updateable<Audio>
export async function updateAudio(id: number, update: AudioUpdate) {
  return await db()
    .query()
    .updateTable('audio')
    .set(update)
    .where('id', '=', id)
    .execute()
}

import { Updateable } from 'kysely'
import db from './database'
import { CacheSettings, User } from './types/generated'

export async function findCacheSettings(user: User): Promise<CacheSettings> {
  return await db()
    .query()
    .selectFrom('cacheSettings as cs')
    .selectAll()
    .where('cs.userId', '=', user.id)
    .executeTakeFirstOrThrow()
}

export type CacheSettingsUpdate = Updateable<CacheSettings>
export async function updateCacheSettings(
  user: User,
  update: CacheSettingsUpdate
) {
  return await db()
    .query()
    .updateTable('cacheSettings')
    .set(update)
    .where('userId', '=', user.id)
    .execute()
}

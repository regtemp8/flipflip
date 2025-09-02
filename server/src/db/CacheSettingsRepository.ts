import db from './database'
import { CacheSettings, CacheSettingsUpdate, User } from './types/entities'

export async function findCacheSettings(user: User): Promise<CacheSettings> {
  return await db()
    .query()
    .selectFrom('cacheSettings as cs')
    .selectAll()
    .where('cs.userId', '=', user.id)
    .executeTakeFirstOrThrow()
}

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

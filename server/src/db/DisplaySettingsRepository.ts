import { Updateable } from 'kysely'
import db from './database'
import { DisplaySettings, User } from './types/generated'

export async function findDisplaySettings(
  user: User
): Promise<DisplaySettings> {
  return await db()
    .query()
    .selectFrom('displaySettings as ds')
    .selectAll()
    .where('ds.userId', '=', user.id)
    .executeTakeFirstOrThrow()
}

export type DisplaySettingsUpdate = Updateable<DisplaySettings>
export async function updateDisplaySettings(
  user: User,
  update: DisplaySettingsUpdate
) {
  return await db()
    .query()
    .updateTable('displaySettings')
    .set(update)
    .where('userId', '=', user.id)
    .execute()
}

import { Updateable } from 'kysely'
import db from './database'
import { DisplaySettings, User } from './types/entities'

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

export async function deleteIgnoredTags(user: User) {
  return await db()
    .query()
    .deleteFrom('ignoredTag')
    .where('displaySettingsId', '=', (eb) =>
      eb
        .selectFrom('displaySettings')
        .select('id')
        .where('userId', '=', user.id)
    )
    .execute()
}

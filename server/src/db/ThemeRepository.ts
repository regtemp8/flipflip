import db from './database'
import { Theme, ThemeUpdate, User } from './types/entities'

export async function findTheme(user: User): Promise<Theme> {
  return await db()
    .query()
    .selectFrom('theme')
    .selectAll()
    .where('userId', '=', user.id)
    .executeTakeFirstOrThrow()
}

export async function updateTheme(user: User, update: ThemeUpdate) {
  return await db()
    .query()
    .updateTable('theme')
    .set(update)
    .where('userId', '=', user.id)
    .execute()
}

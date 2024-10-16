import { Updateable } from 'kysely'
import db from './database'
import { Theme, User } from './types/generated'

export async function findTheme(user: User): Promise<Theme> {
  return await db()
    .query()
    .selectFrom('theme as t')
    .selectAll()
    .where('t.userId', '=', user.id)
    .executeTakeFirstOrThrow()
}

export type ThemeUpdate = Updateable<Theme>
export async function updateTheme(user: User, update: ThemeUpdate) {
  return await db()
    .query()
    .updateTable('theme')
    .set(update)
    .where('userId', '=', user.id)
    .execute()
}

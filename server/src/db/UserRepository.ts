import { Updateable } from 'kysely'
import db from './database'
import { User } from './types/generated'

export async function findUserByUsername(username: string) {
  return await db()
    .query()
    .selectFrom('user')
    .where('username', '=', username)
    .selectAll()
    .executeTakeFirst()
}

export async function findUserByTokenNotExpired(token: string) {
  return await db()
    .query()
    .selectFrom('user')
    .where('tokenValue', '=', token)
    .where('tokenExpiry', '>', Date.now())
    .selectAll()
    .executeTakeFirst()
}

type UserUpdate = Updateable<User>
export async function updateUser(user: User, update: UserUpdate) {
  return await db()
    .query()
    .updateTable('user')
    .set(update)
    .where('id', '=', user.id)
    .execute()
}

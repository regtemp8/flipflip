import { Updateable } from 'kysely'
import db from './database'
import { RemoteSettings, User } from './types/generated'

export async function findRemoteSettings(user: User): Promise<RemoteSettings> {
  return await db()
    .query()
    .selectFrom('remoteSettings as rs')
    .selectAll()
    .where('rs.userId', '=', user.id)
    .executeTakeFirstOrThrow()
}

export type RemoteSettingsUpdate = Updateable<RemoteSettings>
export async function updateRemoteSettings(
  user: User,
  update: RemoteSettingsUpdate
) {
  return await db()
    .query()
    .updateTable('remoteSettings')
    .set(update)
    .where('userId', '=', user.id)
    .execute()
}

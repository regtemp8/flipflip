import db from './database'
import { RemoteSettings, RemoteSettingsUpdate, User } from './types/entities'

export async function findRemoteSettings(user: User): Promise<RemoteSettings> {
  return await db()
    .query()
    .selectFrom('remoteSettings as rs')
    .selectAll()
    .where('rs.userId', '=', user.id)
    .executeTakeFirstOrThrow()
}

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

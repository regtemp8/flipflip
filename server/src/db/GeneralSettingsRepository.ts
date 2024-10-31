import { Updateable } from 'kysely'
import db from './database'
import { GeneralSettings, User } from './types/generated'
import { BackupSettings } from './types/BackupSettings'
import { toBoolean } from './utils'

export async function findBackupSettings(): Promise<BackupSettings> {
  return await db()
    .query()
    .selectFrom('generalSettings')
    .select([
      'autoBackup',
      'autoBackupDays',
      'autoCleanBackup',
      'autoCleanBackupDays',
      'autoCleanBackupMonths',
      'autoCleanBackupWeeks',
      'cleanRetain'
    ])
    .executeTakeFirstOrThrow()
    .then(
      ({
        autoBackup,
        autoBackupDays,
        autoCleanBackup,
        autoCleanBackupDays,
        autoCleanBackupMonths,
        autoCleanBackupWeeks,
        cleanRetain
      }) => ({
        autoBackup: toBoolean(autoBackup),
        autoBackupDays,
        autoCleanBackup: toBoolean(autoCleanBackup),
        autoCleanBackupDays,
        autoCleanBackupMonths,
        autoCleanBackupWeeks,
        cleanRetain
      })
    )
}

export async function findGeneralSettings(
  user: User
): Promise<GeneralSettings> {
  return await db()
    .query()
    .selectFrom('generalSettings as gs')
    .selectAll()
    .where('gs.userId', '=', user.id)
    .executeTakeFirstOrThrow()
}

export type GeneralSettingsUpdate = Updateable<GeneralSettings>
export async function updateGeneralSettings(
  user: User,
  update: GeneralSettingsUpdate
) {
  return await db()
    .query()
    .updateTable('generalSettings')
    .set(update)
    .where('userId', '=', user.id)
    .execute()
}

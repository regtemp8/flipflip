import logger from '../logger'
import db from './database'
import { User } from './types/generated'
import { Moment } from 'moment'

export async function createBackup(
  fileName: string,
  createdAt: Moment
): Promise<void> {
  logger.info(`+ Store backup data in database (file: ${fileName}, created: ${createdAt.unix()})`)
  return db()
    .query()
    .transaction()
    .execute(async (trx) => {
      await trx
        .insertInto('backup')
        .values({
          fileName,
          createdAt: createdAt.unix(),
          interval: 'day',
          intervalValue: createdAt.dayOfYear(),
          year: createdAt.year()
        })
        .onConflict((oc) =>
          oc
            .columns(['interval', 'intervalValue', 'year'])
            .doUpdateSet({ fileName, createdAt: createdAt.unix() })
        )
        .execute()

      await trx
        .insertInto('backup')
        .values({
          fileName,
          createdAt: createdAt.unix(),
          interval: 'week',
          intervalValue: createdAt.week(),
          year: createdAt.year()
        })
        .onConflict((oc) =>
          oc
            .columns(['interval', 'intervalValue', 'year'])
            .doUpdateSet({ fileName, createdAt: createdAt.unix() })
        )
        .execute()

      await trx
        .insertInto('backup')
        .values({
          fileName,
          createdAt: createdAt.unix(),
          interval: 'month',
          intervalValue: createdAt.month(),
          year: createdAt.year()
        })
        .onConflict((oc) =>
          oc
            .columns(['interval', 'intervalValue', 'year'])
            .doUpdateSet({ fileName, createdAt: createdAt.unix() })
        )
        .execute()
    })
}

export async function findByIntervalToKeep(interval: string, keep: number) {
  return db()
    .query()
    .selectFrom('backup')
    .select(['id', 'fileName'])
    .where('interval', '=', interval)
    .orderBy('year', 'desc')
    .orderBy('intervalValue', 'desc')
    .limit(keep)
    .execute()
}

export async function findMostRecentToKeep(keep: number) {
  return db()
    .query()
    .selectFrom('backup')
    .select(['id', 'fileName'])
    .where('createdAt', 'in', (eb) =>
      eb
        .selectFrom('backup')
        .select('createdAt')
        .distinct()
        .orderBy('createdAt', 'desc')
        .limit(keep)
    )
    .execute()
}

export async function deleteByIdsToKeep(ids: number[]) {
  return db().query().deleteFrom('backup').where('id', 'not in', ids).execute()
}

export async function findBackupFileNameById(id: number) {
  return db()
    .query()
    .selectFrom('backup')
    .select(['fileName'])
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

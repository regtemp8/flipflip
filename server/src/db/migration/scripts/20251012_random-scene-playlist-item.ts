import { Kysely } from 'kysely'
import Logger from '../../../logging/Logger'
import { DB } from '../../types/generated'
import { toNumber } from '../../utils'

const logger = Logger.create('DB Migration - random-scene-playlist-item')
export async function up(db: Kysely<DB>): Promise<void> {
  return await db.transaction().execute(async (trx) => {
    logger.info(`+ Add random column to scenePlaylistItem table`)
    await trx.schema
      .alterTable('scenePlaylistItem')
      .addColumn('random', 'boolean', (col) =>
        col.defaultTo(toNumber(false)).notNull()
      )
      .execute()

    const rows = await trx
      .selectFrom('scenePlaylistItem')
      .select('id')
      .execute()

    for (const row of rows) {
      const id = row.id as number
      const count = await trx
        .selectFrom('scenePlaylistItemScene')
        .select((eb) => eb.fn.count<number>('id').as('count'))
        .where('scenePlaylistItemId', '=', id)
        .executeTakeFirst()

      if ((count?.count ?? 0) > 1) {
        logger.info(
          `+ Set 'random' value to 'true' for scene playlist item (id: ${id})`
        )
        const update = { random: toNumber(true) }
        await trx
          .updateTable('scenePlaylistItem')
          .set(update)
          .where('id', '=', id)
          .execute()
      }
    }
  })
}

export async function down(db: Kysely<DB>): Promise<void> {
  return await db.transaction().execute(async (trx) => {
    logger.info(`- Drop random column from scenePlaylistItem table`)
    await trx.schema
      .alterTable('scenePlaylistItem')
      .dropColumn('random')
      .execute()
  })
}

import { Kysely } from 'kysely'
import Logger from '../../../logging/Logger'
import { DB } from '../../types/generated'
import { toNumber } from '../../utils'

const logger = Logger.create('DB Migration - remove-twitter')
export async function up(db: Kysely<DB>): Promise<void> {
  return await db.transaction().execute(async (trx) => {
    logger.info(`- Drop twitterIncludeReplies column from contentSource table`)
    await trx.schema
      .alterTable('contentSource')
      .dropColumn('twitterIncludeReplies')
      .execute()

    logger.info(`- Drop twitterIncludeRetweets column from contentSource table`)
    await trx.schema
      .alterTable('contentSource')
      .dropColumn('twitterIncludeRetweets')
      .execute()

    logger.info(`- Drop twitterAccessTokenKey column from remoteSettings table`)
    await trx.schema
      .alterTable('remoteSettings')
      .dropColumn('twitterAccessTokenKey')
      .execute()

    logger.info(
      `- Drop twitterAccessTokenSecret column from remoteSettings table`
    )
    await trx.schema
      .alterTable('remoteSettings')
      .dropColumn('twitterAccessTokenSecret')
      .execute()

    logger.info(`- Drop twitterConsumerKey column from remoteSettings table`)
    await trx.schema
      .alterTable('remoteSettings')
      .dropColumn('twitterConsumerKey')
      .execute()

    logger.info(`- Drop twitterConsumerSecret column from remoteSettings table`)
    await trx.schema
      .alterTable('remoteSettings')
      .dropColumn('twitterConsumerSecret')
      .execute()
  })
}

export async function down(db: Kysely<DB>): Promise<void> {
  return await db.transaction().execute(async (trx) => {
    logger.info(`- Add twitterIncludeReplies column to contentSource table`)
    await trx.schema
      .alterTable('contentSource')
      .addColumn('twitterIncludeReplies', 'boolean', (col) =>
        col.defaultTo(toNumber(false)).notNull()
      )
      .execute()

    logger.info(`- Add twitterIncludeRetweets column to contentSource table`)
    await trx.schema
      .alterTable('contentSource')
      .addColumn('twitterIncludeRetweets', 'boolean', (col) =>
        col.defaultTo(toNumber(false)).notNull()
      )
      .execute()

    logger.info(`- Add twitterAccessTokenKey column to remoteSettings table`)
    await trx.schema
      .alterTable('remoteSettings')
      .addColumn('twitterAccessTokenKey', 'text', (col) =>
        col.defaultTo('').notNull()
      )
      .execute()

    logger.info(`- Add twitterAccessTokenSecret column to remoteSettings table`)
    await trx.schema
      .alterTable('remoteSettings')
      .addColumn('twitterAccessTokenSecret', 'text', (col) =>
        col.defaultTo('').notNull()
      )
      .execute()

    logger.info(`- Add twitterConsumerKey column to remoteSettings table`)
    await trx.schema
      .alterTable('remoteSettings')
      .addColumn('twitterConsumerKey', 'text', (col) =>
        col.defaultTo('').notNull()
      )
      .execute()

    logger.info(`- Add twitterConsumerSecret column to remoteSettings table`)
    await trx.schema
      .alterTable('remoteSettings')
      .addColumn('twitterConsumerSecret', 'text', (col) =>
        col.defaultTo('').notNull()
      )
      .execute()
  })
}

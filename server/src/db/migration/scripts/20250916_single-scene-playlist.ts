import { Kysely } from 'kysely'
import Logger from '../../../logging/Logger'
import { DB } from '../../types/generated'
import { toNumber } from '../../utils'
import { createScenePlaylistItem } from '../../PlaylistItemRepository'
import { createPlaylist } from '../../PlaylistRepository'
import { PLT } from 'flipflip-common'

const logger = Logger.create('DB Migration - visible-playlist')
export async function up(db: Kysely<DB>): Promise<void> {
  return await db.transaction().execute(async (trx) => {
    logger.info(`+ Add 'visible' column to playlist table`)
    await trx.schema
      .alterTable('playlist')
      .addColumn('visible', 'integer', (col) =>
        col.defaultTo(toNumber(true)).notNull()
      )
      .execute()

    logger.info(`+ Set 'visible' value for temporary playlists`)
    await trx
      .updateTable('playlist')
      .set('visible', toNumber(false))
      .where('temporary', '=', toNumber(true))
      .execute()

    const scenes = await trx
      .selectFrom('scene')
      .select(['id', 'name', 'userId'])
      .where('defaultScene', '=', toNumber(false))
      .execute()

    for (const scene of scenes) {
      logger.info(`+ Create playlist for scene '{name}' (id: ${scene.id})`, {
        name: scene.name
      })
      const playlist = await createPlaylist(
        PLT.singleScene,
        false,
        scene.userId,
        scene.name,
        trx
      )
      const item = {
        duration: Infinity,
        index: 0,
        playlistId: playlist.id as number,
        playAfterAllImages: toNumber(false),
        random: toNumber(false)
      }
      const scenes = [{ sceneId: scene.id, scenePlaylistItemId: 0 }]
      await createScenePlaylistItem(item, scenes, trx)
    }
  })
}

export async function down(db: Kysely<DB>): Promise<void> {
  return await db.transaction().execute(async (trx) => {
    logger.info(`: Get all single scene playlists`)
    const rows = await trx
      .selectFrom('playlist as p')
      .innerJoin('scenePlaylistItem as spi', 'spi.playlistId', 'p.id')
      .innerJoin(
        'scenePlaylistItemScene as spis',
        'spis.scenePlaylistItemId',
        'spi.id'
      )
      .select([
        'p.id as playlistId',
        'spi.id as playlistItemId',
        'spis.id as playlistItemSceneId'
      ])
      .where('p.type', '=', PLT.singleScene)
      .execute()

    for (const row of rows) {
      logger.info(
        `- Delete single scene playlist item scene (id: ${row.playlistItemSceneId})`
      )
      await trx
        .deleteFrom('scenePlaylistItemScene')
        .where('id', '=', row.playlistItemSceneId)
        .execute()

      logger.info(
        `- Delete single scene playlist item (id: ${row.playlistItemId})`
      )
      await trx
        .deleteFrom('scenePlaylistItem')
        .where('id', '=', row.playlistItemId)
        .execute()

      logger.info(
        `- Update display views that reference single scene playlist (id: ${row.playlistId})`
      )
      await trx
        .updateTable('displayView')
        .set({ playlistId: null })
        .where('playlistId', '=', row.playlistId)
        .execute()

      logger.info(`- Delete single scene playlist (id: ${row.playlistId})`)
      await trx
        .deleteFrom('playlist')
        .where('id', '=', row.playlistId)
        .execute()
    }

    logger.info(`- Drop 'visible' column from playlist table`)
    await trx.schema.alterTable('playlist').dropColumn('visible').execute()
  })
}

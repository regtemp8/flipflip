import { getRandomColor, MVF, PLT, RP } from 'flipflip-common'
import db from './database'
import { SceneGroupItemRow } from './types/SceneGroupItemRow'
import { SceneGroupRow } from './types/SceneGroupRow'
import { Display, DisplayUpdate } from './types/entities'
import { toNumber } from './utils'

export async function findDisplaysWithSceneGroup(): Promise<SceneGroupRow[]> {
  return await db()
    .query()
    .selectFrom('display as d')
    .innerJoin('sceneGroup as sg', 'sg.id', 'd.sceneGroupId')
    .select([
      'sg.id',
      'sg.name',
      'sg.type',
      'd.id as itemId',
      'd.name as itemName'
    ])
    .where('d.temporary', '=', toNumber(false))
    .execute()
}

export async function findDisplaysWithoutSceneGroup(): Promise<
  SceneGroupItemRow[]
> {
  return await db()
    .query()
    .selectFrom('display as d')
    .select(['d.id as itemId', 'd.name as itemName'])
    .where('d.sceneGroupId', 'is', null)
    .where('d.temporary', '=', toNumber(false))
    .execute()
}

export async function findDisplayById(
  id: number
): Promise<Display | undefined> {
  return await db()
    .query()
    .selectFrom('display')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
}

export async function updateDisplay(id: number, update: DisplayUpdate) {
  return await db()
    .query()
    .updateTable('display')
    .set(update)
    .where('id', '=', id)
    .execute()
}

export async function createTempDisplayForScene(
  sceneId: number,
  userId: number
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const playlist = await trx
        .insertInto('playlist')
        .values({
          userId,
          name: `Temp playlist for scene ${sceneId}`,
          type: PLT.scene,
          shuffle: toNumber(false),
          repeat: RP.none,
          temporary: toNumber(true)
        })
        .returning('id')
        .executeTakeFirstOrThrow()

      const playlistId = playlist.id as number
      const scenePlaylistItem = await trx
        .insertInto('scenePlaylistItem')
        .values({
          playlistId,
          index: 0,
          duration: Number.POSITIVE_INFINITY, // TODO special value for infinity, like -1
          playAfterAllImages: toNumber(false)
        })
        .returning('id')
        .executeTakeFirstOrThrow()

      const scenePlaylistItemId = scenePlaylistItem.id as number
      await trx
        .insertInto('scenePlaylistItemScene')
        .values({ scenePlaylistItemId, sceneId })
        .execute()

      const display = await trx
        .insertInto('display')
        .values({
          name: `Temp display for scene ${sceneId}`,
          temporary: toNumber(true),
          userId
        })
        .returning('id')
        .executeTakeFirstOrThrow()

      const displayId = display.id as number
      await trx
        .insertInto('displayView')
        .values({
          displayId,
          name: 'View',
          x: 0,
          y: 0,
          z: 0,
          width: 100,
          height: 100,
          color: '#000000',
          opacity: 100,
          visible: toNumber(true),
          playlistId,
          sync: toNumber(false),
          mirrorSyncedView: MVF.none,
          index: 0
        })
        .execute()

      return displayId
    })
}

export async function createTempDisplayForPlaylist(
  playlistId: number,
  userId: number
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const display = await trx
        .insertInto('display')
        .values({
          name: `Temp display for playlist ${playlistId}`,
          temporary: toNumber(true),
          userId
        })
        .returning('id')
        .executeTakeFirstOrThrow()

      const displayId = display.id as number
      await trx
        .insertInto('displayView')
        .values({
          displayId,
          name: 'View',
          x: 0,
          y: 0,
          z: 0,
          width: 100,
          height: 100,
          color: '#000000',
          opacity: 100,
          visible: toNumber(true),
          playlistId,
          sync: toNumber(false),
          mirrorSyncedView: MVF.none,
          index: 0
        })
        .execute()

      return displayId
    })
}

export async function deleteTemporaryDisplay(displayId: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const tempDisplay = await trx
        .selectFrom('display')
        .select((eb) => eb.lit(1).as('exists'))
        .where('temporary', '=', toNumber(true))
        .executeTakeFirst()

      if (tempDisplay == null) {
        return
      }

      const tempPlaylists = await trx
        .selectFrom('displayView as dv')
        .innerJoin('playlist as p', 'p.id', 'dv.playlistId')
        .select('p.id')
        .where('dv.displayId', '=', displayId)
        .where('p.temporary', '=', toNumber(true))
        .execute()

      await trx
        .deleteFrom('displayView')
        .where('displayId', '=', displayId)
        .execute()

      for (const playlist of tempPlaylists) {
        const playlistId = playlist.id as number
        const playlistItems = await trx
          .selectFrom('scenePlaylistItem')
          .select('id')
          .where('playlistId', '=', playlistId)
          .execute()

        for (const playlistItem of playlistItems) {
          const playlistItemId = playlistItem.id as number
          await trx
            .deleteFrom('scenePlaylistItemScene')
            .where('scenePlaylistItemId', '=', playlistItemId)
            .execute()
        }

        await trx
          .deleteFrom('scenePlaylistItem')
          .where('playlistId', '=', playlistId)
          .execute()

        await trx.deleteFrom('playlist').where('id', '=', playlistId).execute()
      }

      await trx.deleteFrom('display').where('id', '=', displayId).execute()
    })
}

export async function createDisplay(userId: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const { id } = await trx
        .insertInto('display')
        .values({
          userId,
          name: 'New display',
          temporary: toNumber(false)
        })
        .returning('id')
        .executeTakeFirstOrThrow()

      await trx
        .insertInto('displayView')
        .values({
          displayId: id as number,
          name: 'New view',
          x: 0,
          y: 0,
          z: 0,
          width: 10,
          height: 10,
          color: getRandomColor(),
          opacity: 100,
          visible: toNumber(true),
          sync: toNumber(false),
          mirrorSyncedView: MVF.none,
          index: 0,
          error: 'No playlist selected'
        })
        .execute()

      return id
    })
}

export async function deleteDisplay(id: number, userId: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const canDelete = await trx
        .selectFrom('display')
        .select((eb) => eb.lit(1).as('exists'))
        .where('id', '=', id)
        .where('userId', '=', userId)
        .executeTakeFirst()

      if (canDelete == null) {
        return
      }

      await trx.deleteFrom('displayView').where('displayId', '=', id).execute()
      await trx.deleteFrom('display').where('id', '=', id).execute()
    })
}

export async function cloneDisplay(id: number, userId: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const newDisplay = await trx
        .insertInto('display')
        .columns(['name', 'userId', 'sceneGroupId', 'temporary'])
        .expression((eb) =>
          eb
            .selectFrom('display')
            .select(['name', 'userId', 'sceneGroupId', 'temporary'])
            .where('id', '=', id)
            .where('userId', '=', userId)
        )
        .returning('id')
        .executeTakeFirstOrThrow()

      const newDisplayId = newDisplay.id as number
      await trx
        .insertInto('displayView')
        .columns([
          'displayId',
          'name',
          'x',
          'y',
          'z',
          'width',
          'height',
          'color',
          'opacity',
          'visible',
          'playlistId',
          'sync',
          'syncWithView',
          'mirrorSyncedView',
          'index',
          'error'
        ])
        .expression((eb) =>
          eb
            .selectFrom('displayView')
            .select([
              (eb) => eb.lit(newDisplayId).as('displayId'),
              'name',
              'x',
              'y',
              'z',
              'width',
              'height',
              'color',
              'opacity',
              'visible',
              'playlistId',
              'sync',
              'syncWithView',
              'mirrorSyncedView',
              'index',
              'error'
            ])
            .where('displayId', '=', id)
        )
        .execute()

      return newDisplayId
    })
}

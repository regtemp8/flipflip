import { PLT, RP } from 'flipflip-common'
import db from './database'
import { PlaylistGroupRow } from './types/PlaylistGroupRow'
import { PlaylistGroupItemRow } from './types/PlaylistGroupItemRow'
import { PlaylistUpdate, PlaylistInsert } from './types/entities'
import { DB } from './types/generated'
import { Kysely } from 'kysely'
import { toNumber } from './utils'

export async function findPlaylistsWithSceneGroup(): Promise<
  PlaylistGroupRow[]
> {
  return await db()
    .query()
    .selectFrom('playlist as p')
    .innerJoin('sceneGroup as sg', 'sg.id', 'p.sceneGroupId')
    .select([
      'sg.id',
      'sg.name',
      'sg.type',
      'p.id as itemId',
      'p.name as itemName',
      'p.type as itemType'
    ])
    .where('p.visible', '=', toNumber(true))
    .execute()
}

export async function findPlaylistsWithoutSceneGroup(): Promise<
  PlaylistGroupItemRow[]
> {
  return await db()
    .query()
    .selectFrom('playlist as p')
    .select(['p.id as itemId', 'p.name as itemName', 'p.type as itemType'])
    .where('p.visible', '=', toNumber(true))
    .where('p.sceneGroupId', 'is', null)
    .execute()
}

export async function findPlaylistOptionsByType(
  type: string
): Promise<PlaylistGroupItemRow[]> {
  return await db()
    .query()
    .selectFrom('playlist as p')
    .select(['p.id as itemId', 'p.name as itemName', 'p.type as itemType'])
    .where('p.temporary', '=', toNumber(false))
    .where('p.type', '=', type)
    .execute()
}

export async function findPlaylistIds(): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('playlist')
    .select('id')
    .where('visible', '=', toNumber(false))
    .execute()
    .then((value) => value.map((v) => v.id as number))
}

export async function findPlaylistById(id: number) {
  return await db()
    .query()
    .selectFrom('playlist')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
}

export async function updatePlaylist(id: number, update: PlaylistUpdate) {
  return await db()
    .query()
    .updateTable('playlist')
    .set(update)
    .where('id', '=', id)
    .execute()
}

export async function deletePlaylist(id: number) {
  return await db()
    .query()
    .deleteFrom('playlist')
    .where('id', '=', id)
    .execute()
}

export async function clonePlaylist(id: number, userId: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const newPlaylist = await trx
        .insertInto('playlist')
        .columns([
          'userId',
          'sceneGroupId',
          'name',
          'type',
          'shuffle',
          'repeat',
          'temporary',
          'visible'
        ])
        .expression((eb) =>
          eb
            .selectFrom('playlist')
            .select([
              'userId',
              'sceneGroupId',
              'name',
              'type',
              'shuffle',
              'repeat',
              'temporary',
              'visible'
            ])
            .where('id', '=', id)
            .where('userId', '=', userId)
        )
        .returning(['id', 'type'])
        .executeTakeFirstOrThrow()

      const newPlaylistId = newPlaylist.id as number
      switch (newPlaylist.type) {
        case PLT.audio: {
          await trx
            .insertInto('audioPlaylistItem')
            .columns(['playlistId', 'index', 'audioId'])
            .expression((eb) =>
              eb
                .selectFrom('audioPlaylistItem')
                .select([
                  (eb) => eb.lit(newPlaylistId).as('playlistId'),
                  'index',
                  'audioId'
                ])
                .where('playlistId', '=', id)
            )
            .execute()
          break
        }
        case PLT.script: {
          await trx
            .insertInto('captionScriptPlaylistItem')
            .columns(['playlistId', 'index', 'captionScriptId'])
            .expression((eb) =>
              eb
                .selectFrom('captionScriptPlaylistItem')
                .select([
                  (eb) => eb.lit(newPlaylistId).as('playlistId'),
                  'index',
                  'captionScriptId'
                ])
                .where('playlistId', '=', id)
            )
            .execute()
          break
        }
        case PLT.scene: {
          const items = await trx
            .selectFrom('scenePlaylistItem')
            .selectAll()
            .where('playlistId', '=', id)
            .execute()
          for (const item of items) {
            const { index, duration, playAfterAllImages } = item
            const newScenePlaylistItem = await trx
              .insertInto('scenePlaylistItem')
              .values({
                playlistId: newPlaylistId,
                index,
                duration,
                playAfterAllImages
              })
              .returning('id')
              .executeTakeFirst()

            await trx
              .insertInto('scenePlaylistItemScene')
              .columns(['sceneId', 'scenePlaylistItemId'])
              .expression((eb) =>
                eb
                  .selectFrom('scenePlaylistItemScene')
                  .select([
                    'sceneId',
                    (eb) =>
                      eb
                        .lit(newScenePlaylistItem?.id as number)
                        .as('scenePlaylistItemId')
                  ])
                  .where('scenePlaylistItemId', '=', item.id)
              )
              .execute()
          }
          break
        }
        default:
          throw new Error(
            `Cloning playlist of type '${newPlaylist.type}' not supported`
          )
      }

      return newPlaylist.id
    })
}

export async function findPlaylistByDisplayView(displayViewId: number) {
  return await db()
    .query()
    .selectFrom('displayView as dv')
    .innerJoin('playlist as p', 'p.id', 'dv.playlistId')
    .select(['p.id', 'p.repeat', 'p.shuffle'])
    .where('dv.id', '=', displayViewId)
    .where((eb) =>
      eb('p.type', '=', PLT.scene).or('p.type', '=', PLT.singleScene)
    )
    .executeTakeFirst()
}

export async function findPlaylistType(id: number, trx?: Kysely<DB>) {
  const conn = trx ?? db().query()
  return await conn
    .selectFrom('playlist')
    .select('type')
    .where('id', '=', id)
    .executeTakeFirst()
}

export async function createPlaylist(
  type: string,
  visible: boolean,
  userId: number,
  name = 'New playlist',
  trx?: Kysely<DB>
) {
  const values: PlaylistInsert = {
    userId,
    name,
    type,
    shuffle: toNumber(false),
    repeat: RP.all,
    temporary: toNumber(false),
    visible: toNumber(visible)
  }

  const query = trx ?? db().query()
  return await query
    .insertInto('playlist')
    .values(values)
    .returning('id')
    .executeTakeFirstOrThrow()
}

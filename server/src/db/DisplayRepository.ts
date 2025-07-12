import { Updateable } from 'kysely'
import {MVF, PLT, RP} from 'flipflip-common'
import db from './database'
import { SceneGroupItemRow } from './types/SceneGroupItemRow'
import { SceneGroupRow } from './types/SceneGroupRow'
import { Display } from './types/generated'
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

export async function findDisplayById(id: number): Promise<Display> {
  return await db()
    .query()
    .selectFrom('display')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

export type DisplayUpdate = Updateable<Display>
export async function updateDisplay(id: number, update: DisplayUpdate) {
  return await db()
    .query()
    .updateTable('display')
    .set(update)
    .where('id', '=', id)
    .execute()
}

export async function createTempDisplayForScene(sceneId: number, userId: number) {
  return await db().query().transaction().execute(async (trx) => {
    const playlists = await trx.insertInto('playlist').values({
      userId,
      name: `Temp playlist for scene ${sceneId}`,
      type: PLT.scene,
      shuffle: toNumber(false),
      repeat: RP.none
    }).returning('id').execute()

    const playlistId = playlists[0].id as number
    const scenePlaylistItems = await trx.insertInto('scenePlaylistItem').values({
      playlistId,
      index: 0,
      duration: Number.POSITIVE_INFINITY, // TODO special value for infinity, like -1
      playAfterAllImages: toNumber(false)
    }).returning('id').execute()

    const scenePlaylistItemId = scenePlaylistItems[0].id as number
    await trx.insertInto('scenePlaylistItemScene').values({scenePlaylistItemId, sceneId}).execute()

    const displays = await trx.insertInto('display')
    .values({
      name: `Temp display for scene ${sceneId}`,
      temporary: toNumber(true),
      userId
    }).returning('id').execute()

    const displayId = displays[0].id as number
    await trx.insertInto('displayView').values({
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
      mirrorSyncedView: MVF.none
    }).execute()

    return displayId
  })
}
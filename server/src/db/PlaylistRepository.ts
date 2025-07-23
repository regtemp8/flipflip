import { PlaylistType, PLT } from 'flipflip-common'
import db from './database'
import { PlaylistGroupRow } from './types/PlaylistGroupRow'
import { PlaylistGroupItemRow } from './types/PlaylistGroupItemRow'
import { Playlist } from './types/generated'
import { Updateable } from 'kysely'
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
    .where('p.temporary', '=', toNumber(false))
    .execute()
}

export async function findPlaylistsWithoutSceneGroup(): Promise<
  PlaylistGroupItemRow[]
> {
  return await db()
    .query()
    .selectFrom('playlist as p')
    .select(['p.id as itemId', 'p.name as itemName', 'p.type as itemType'])
    .where('p.temporary', '=', toNumber(false))
    .where('p.sceneGroupId', 'is', null)
    .execute()
}

export async function findPlaylistOptionsByType(
  type: PlaylistType
): Promise<PlaylistGroupItemRow[]> {
  return await db()
    .query()
    .selectFrom('playlist as p')
    .select(['p.id as itemId', 'p.name as itemName', 'p.type as itemType'])
    .where('p.type', '=', type)
    .execute()
}

export async function findPlaylistIds(): Promise<number[]> {
  // TODO exclude temporary playlists?
  return await db()
    .query()
    .selectFrom('playlist')
    .select('id')
    .execute()
    .then((value) => value.map((v) => v.id as number))
}

export async function findPlaylistById(id: number): Promise<Playlist> {
  return await db()
    .query()
    .selectFrom('playlist')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

export type PlaylistUpdate = Updateable<Playlist>
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

export async function clonePlaylist(id: number) {
  // TODO clone, also all child items
  return null
}

export async function findPlaylistByDisplayView(displayViewId: number) {
  return await db()
    .query()
    .selectFrom('displayView as dv')
    .innerJoin('playlist as p', 'p.id', 'dv.playlistId')
    .select(['p.id', 'p.repeat', 'p.shuffle'])
    .where('dv.id', '=', displayViewId)
    .where('p.type', '=', PLT.scene)
    .executeTakeFirst()
}

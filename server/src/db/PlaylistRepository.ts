import db from './database'
import { SceneGroupRow } from './types/SceneGroupRow'
import { SceneGroupItemRow } from './types/SceneGroupItemRow'

export async function findPlaylistsWithSceneGroup(): Promise<SceneGroupRow[]> {
  return await db()
    .query()
    .selectFrom('playlist as p')
    .innerJoin('sceneGroup as sg', 'sg.id', 'p.sceneGroupId')
    .select([
      'sg.id',
      'sg.name',
      'sg.type',
      'p.id as itemId',
      'p.name as itemName'
    ])
    .execute()
}

export async function findPlaylistsWithoutSceneGroup(): Promise<
  SceneGroupItemRow[]
> {
  return await db()
    .query()
    .selectFrom('playlist as p')
    .select(['p.id as itemId', 'p.name as itemName'])
    .where('p.sceneGroupId', 'is', null)
    .execute()
}

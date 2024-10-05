import db from './database'
import { SceneGroupRow } from './types/SceneGroupRow'
import { SceneGroupItemRow } from './types/SceneGroupItemRow'

export async function findScenesWithSceneGroup(): Promise<SceneGroupRow[]> {
  return await db()
    .query()
    .selectFrom('scene as s')
    .innerJoin('sceneGroup as sg', 'sg.id', 's.sceneGroupId')
    .leftJoin('weightGroup as w', 'w.sceneId', 's.id')
    .select([
      'sg.id',
      'sg.name',
      'sg.type',
      's.id as itemId',
      's.name as itemName'
    ])
    .where('w.sceneId', 'is', null)
    .execute()
}

export async function findScenesWithoutSceneGroup(): Promise<
  SceneGroupItemRow[]
> {
  return await db()
    .query()
    .selectFrom('scene as s')
    .leftJoin('weightGroup as w', 'w.sceneId', 's.id')
    .select(['s.id as itemId', 's.name as itemName'])
    .where('s.sceneGroupId', 'is', null)
    .where('w.sceneId', 'is', null)
    .execute()
}

export async function findGeneratorsWithSceneGroup(): Promise<SceneGroupRow[]> {
  return await db()
    .query()
    .selectFrom('weightGroup as w')
    .innerJoin('scene as s', 's.id', 'w.sceneId')
    .innerJoin('sceneGroup as sg', 'sg.id', 's.sceneGroupId')
    .select([
      'sg.id',
      'sg.name',
      'sg.type',
      's.id as itemId',
      's.name as itemName'
    ])
    .execute()
}

export async function findGeneratorsWithoutSceneGroup(): Promise<
  SceneGroupItemRow[]
> {
  return await db()
    .query()
    .selectFrom('weightGroup as w')
    .innerJoin('scene as s', 's.id', 'w.sceneId')
    .select(['s.id as itemId', 's.name as itemName'])
    .where('s.sceneGroupId', 'is', null)
    .execute()
}

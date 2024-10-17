import { Updateable } from 'kysely'
import db from './database'
import { SceneGroupItemRow } from './types/SceneGroupItemRow'
import { SceneGroupRow } from './types/SceneGroupRow'
import { Display } from './types/generated'

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

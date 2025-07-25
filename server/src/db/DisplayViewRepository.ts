import { getRandomColor, MVF } from 'flipflip-common'
import db from './database'
import { toNumber } from './utils'
import { DisplayView } from './types/generated'
import { Updateable } from 'kysely'

export async function findVisibleDisplayViewIds(displayId: number) {
  return await db()
    .query()
    .selectFrom('displayView')
    .select('id')
    .where('displayId', '=', displayId)
    .where('visible', '=', toNumber(true))
    .orderBy('index asc')
    .execute()
}

export async function findDisplayViewIds(displayId: number) {
  const rows = await db()
    .query()
    .selectFrom('displayView')
    .select('id')
    .where('displayId', '=', displayId)
    .orderBy('index asc')
    .execute()

  return rows.map((row) => row.id as number)
}

export async function findDisplayViewById(id: number) {
  return await db()
    .query()
    .selectFrom('displayView')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
}

export async function isSyncedDisplayView(id: number) {
  const rows = await db()
    .query()
    .selectFrom('displayView')
    .select((eb) => eb.lit(1).as('exists'))
    .where('id', '=', id)
    .where('sync', '=', toNumber(true))
    .execute()

  return rows.length === 1
}

export async function addDisplayView(displayId: number, userId: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const canAdd = await trx
        .selectFrom('display')
        .select((eb) => eb.lit(1).as('exists'))
        .where('id', '=', displayId)
        .where('userId', '=', userId)
        .executeTakeFirst()

      if (canAdd == null) {
        return
      }

      const { index } = await trx
        .selectFrom('displayView')
        .select((eb) => [eb.fn.countAll<number>().as('index')])
        .where('displayId', '=', displayId)
        .executeTakeFirstOrThrow()

      await trx
        .insertInto('displayView')
        .values({
          displayId,
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
          index
        })
        .execute()
    })
}

export async function deleteDisplayView(
  displayId: number,
  viewId: number,
  userId: number
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const canDelete = await trx
        .selectFrom('display')
        .select((eb) => eb.lit(1).as('exists'))
        .where('id', '=', displayId)
        .where('userId', '=', userId)
        .executeTakeFirst()

      if (canDelete == null) {
        return
      }

      const { index } = await trx
        .selectFrom('displayView')
        .select('index')
        .where('displayId', '=', displayId)
        .where('id', '=', viewId)
        .executeTakeFirstOrThrow()

      await trx
        .deleteFrom('displayView')
        .where('displayId', '=', displayId)
        .where('id', '=', viewId)
        .execute()

      await trx
        .updateTable('displayView')
        .set((eb) => ({ index: eb('index', '-', 1) }))
        .where('displayId', '=', displayId)
        .where('index', '>', index)
        .execute()
    })
}

export async function cloneDisplayView(
  displayId: number,
  viewId: number,
  userId: number
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const canClone = await trx
        .selectFrom('display')
        .select((eb) => eb.lit(1).as('exists'))
        .where('id', '=', displayId)
        .where('userId', '=', userId)
        .executeTakeFirst()

      if (canClone == null) {
        return
      }

      const { index } = await trx
        .selectFrom('displayView')
        .select((eb) => [eb.fn.countAll<number>().as('index')])
        .where('displayId', '=', displayId)
        .executeTakeFirstOrThrow()

      const {
        name,
        x,
        y,
        z,
        width,
        height,
        color,
        opacity,
        visible,
        playlistId,
        sync,
        syncWithView,
        mirrorSyncedView
      } = await trx
        .selectFrom('displayView')
        .selectAll()
        .where('displayId', '=', displayId)
        .where('id', '=', viewId)
        .executeTakeFirstOrThrow()

      let newName: string
      const names = name.split('#')
      if (names.length === 1) {
        newName = name + ' #1'
      } else {
        const number = Number(names[names.length - 1])
        if (!isNaN(number)) {
          names[names.length - 1] = (number + 1).toString()
          newName = names.join('#')
        } else {
          newName = name
        }
      }

      await trx
        .insertInto('displayView')
        .values({
          displayId,
          name: newName,
          x,
          y,
          z,
          width,
          height,
          color,
          opacity,
          visible,
          playlistId,
          sync,
          syncWithView,
          mirrorSyncedView,
          index
        })
        .execute()
    })
}

export type DisplayViewUpdate = Updateable<DisplayView>
export async function updateDisplayView(id: number, update: DisplayViewUpdate) {
  return await db()
    .query()
    .updateTable('displayView')
    .set(update)
    .where('id', '=', id)
    .execute()
}

export async function findDisplayViewSyncOptions(displayId: number): Promise<
  Record<string, string>
> {
  const rows = await db()
    .query()
    .selectFrom('displayView')
    .select(['id', 'name'])
    .where('displayId', '=', displayId)
    .where('sync', '=', toNumber(false))
    .orderBy('index asc')
    .execute()

  const options: Record<string, string> = {}
  rows.forEach(({ id, name }) => (options[(id as number).toString()] = name))
  return options
}

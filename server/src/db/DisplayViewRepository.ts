import db from './database'
import { toNumber } from './utils'

export async function findVisibleDisplayViewIds(displayId: number) {
  return await db()
    .query()
    .selectFrom('displayView')
    .select('id')
    .where('displayId', '=', displayId)
    .where('visible', '=', toNumber(true))
    .execute()
}

export async function findDisplayViewIds(displayId: number) {
  const rows = await db()
    .query()
    .selectFrom('displayView')
    .select('id')
    .where('displayId', '=', displayId)
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

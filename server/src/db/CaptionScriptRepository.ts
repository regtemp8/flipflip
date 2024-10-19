import { Updateable } from 'kysely'
import { CaptionScript, FontSettings } from './types/generated'
import db from './database'
import { FontSettingsType } from 'flipflip-common'

export async function findCaptionScriptIds(): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('captionScript')
    .select('id')
    .execute()
    .then((value) => value.map((v) => v.id as number))
}

export async function findCaptionScriptById(
  id: number
): Promise<CaptionScript> {
  return await db()
    .query()
    .selectFrom('captionScript')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

export type CaptionScriptUpdate = Updateable<CaptionScript>
export async function updateCaptionScript(
  id: number,
  update: CaptionScriptUpdate
) {
  return await db()
    .query()
    .updateTable('captionScript')
    .set(update)
    .where('id', '=', id)
    .execute()
}

export async function findFontSettingsByType(
  id: number,
  type: FontSettingsType
): Promise<FontSettings> {
  return await db()
    .query()
    .selectFrom('fontSettings')
    .selectAll()
    .where('id', '=', (eb) =>
      eb
        .selectFrom('captionScript')
        .select(`${type}FontId`)
        .where('id', '=', id)
    )
    .executeTakeFirstOrThrow()
}

export type FontSettingsUpdate = Updateable<FontSettings>
export async function updateFontSettings(
  id: number,
  type: FontSettingsType,
  update: FontSettingsUpdate
) {
  return await db()
    .query()
    .updateTable('fontSettings')
    .set(update)
    .where('id', '=', (eb) =>
      eb
        .selectFrom('captionScript')
        .select(`${type}FontId`)
        .where('id', '=', id)
    )
    .execute()
}

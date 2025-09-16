import { PLT, SCENE_NONE } from 'flipflip-common'
import db from './database'
import {
  AudioPlaylistItemUpdate,
  AudioPlaylistItemInsert,
  CaptionScriptPlaylistItemInsert,
  ScenePlaylistItemInsert,
  CaptionScriptPlaylistItemUpdate,
  ScenePlaylistItemUpdate,
  ScenePlaylistItemSceneInsert
} from './types/entities'
import { findPlaylistType } from './PlaylistRepository'
import { Kysely } from 'kysely'
import { DB } from './types/generated'

export async function isAudioPlaylistItem(
  audioId: number,
  playlistName: string
) {
  const rows = await db()
    .query()
    .selectFrom('audioPlaylistItem as pi')
    .innerJoin('playlist as p', 'p.id', 'pi.playlistId')
    .select((eb) => eb.lit(1).as('exists'))
    .where('p.type', '=', PLT.audio)
    .where('p.name', '=', playlistName)
    .where('pi.audioId', '=', audioId)
    .execute()

  return rows.length > 0
}

export async function createAudioPlaylistItem(item: AudioPlaylistItemInsert) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const { index } = await trx
        .selectFrom('audioPlaylistItem')
        .select((eb) => [eb.fn.countAll<number>().as('index')])
        .where('playlistId', '=', item.playlistId)
        .executeTakeFirstOrThrow()

      item.index = index
      await trx
        .insertInto('audioPlaylistItem')
        .values(item)
        .returning('id')
        .execute()
    })
}

export async function createCaptionScriptPlaylistItem(
  item: CaptionScriptPlaylistItemInsert
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const { index } = await trx
        .selectFrom('captionScriptPlaylistItem')
        .select((eb) => [eb.fn.countAll<number>().as('index')])
        .where('playlistId', '=', item.playlistId)
        .executeTakeFirstOrThrow()

      item.index = index
      await trx
        .insertInto('captionScriptPlaylistItem')
        .values(item)
        .returning('id')
        .execute()
    })
}

async function insertScenePlaylistItem(
  trx: Kysely<DB>,
  item: ScenePlaylistItemInsert
) {
  const { index } = await trx
    .selectFrom('scenePlaylistItem')
    .select((eb) => [eb.fn.countAll<number>().as('index')])
    .where('playlistId', '=', item.playlistId)
    .executeTakeFirstOrThrow()

  item.index = index
  const { id } = await trx
    .insertInto('scenePlaylistItem')
    .values(item)
    .returning('id')
    .executeTakeFirstOrThrow()

  return id as number
}

async function insertScenePlaylistItemScenes(
  trx: Kysely<DB>,
  scenePlaylistItemId: number,
  scenes?: ScenePlaylistItemSceneInsert[]
) {
  if (scenes == null) {
    return
  }

  scenes = scenes.map((scene) => ({
    ...scene,
    scenePlaylistItemId
  }))
  await trx.insertInto('scenePlaylistItemScene').values(scenes).execute()
}

export async function createScenePlaylistItem(
  item: ScenePlaylistItemInsert,
  scenes?: ScenePlaylistItemSceneInsert[],
  trx?: Kysely<DB>
) {
  if (trx != null) {
    const scenePlaylistItemId = await insertScenePlaylistItem(trx, item)
    await insertScenePlaylistItemScenes(trx, scenePlaylistItemId, scenes)
  } else {
    return await db()
      .query()
      .transaction()
      .execute(async (trx) => {
        const scenePlaylistItemId = await insertScenePlaylistItem(trx, item)
        await insertScenePlaylistItemScenes(trx, scenePlaylistItemId, scenes)
      })
  }
}

export async function updateAudioPlaylistItem(update: AudioPlaylistItemUpdate) {
  if (update.id == null) {
    return
  }

  return await db()
    .query()
    .updateTable('audioPlaylistItem')
    .set(update)
    .where('id', '=', update.id)
    .execute()
}

export async function updateCaptionScriptPlaylistItem(
  update: CaptionScriptPlaylistItemUpdate
) {
  if (update.id == null) {
    return
  }

  return await db()
    .query()
    .updateTable('captionScriptPlaylistItem')
    .set(update)
    .where('id', '=', update.id)
    .execute()
}

export async function updateScenePlaylistItem(
  update: ScenePlaylistItemUpdate,
  scenes?: ScenePlaylistItemSceneInsert[]
) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      if (update.id == null) {
        return
      }

      await trx
        .updateTable('scenePlaylistItem')
        .set(update)
        .where('id', '=', update.id)
        .execute()
      if (scenes == null) {
        return
      }

      await trx
        .deleteFrom('scenePlaylistItemScene')
        .where('scenePlaylistItemId', '=', update.id)
        .execute()
      if (scenes.length > 0) {
        await trx.insertInto('scenePlaylistItemScene').values(scenes).execute()
      }
    })
}

export async function findSingleScenePlaylistItemSceneId(playlistId: number) {
  const item = await db()
    .query()
    .selectFrom('playlist as p')
    .innerJoin('scenePlaylistItem as spi', 'spi.playlistId', 'p.id')
    .innerJoin(
      'scenePlaylistItemScene as spis',
      'spis.scenePlaylistItemId',
      'spi.id'
    )
    .select('spis.sceneId')
    .where('p.type', '=', PLT.singleScene)
    .where('p.id', '=', playlistId)
    .executeTakeFirstOrThrow()

  return item.sceneId as number
}

export async function deletePlaylistItem(playlistId: number, itemId: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const playlist = await findPlaylistType(playlistId, trx)
      switch (playlist?.type) {
        case PLT.audio: {
          const { index } = await trx
            .selectFrom('audioPlaylistItem')
            .select('index')
            .where('playlistId', '=', playlistId)
            .where('id', '=', itemId)
            .executeTakeFirstOrThrow()
          await trx
            .deleteFrom('audioPlaylistItem')
            .where('playlistId', '=', playlistId)
            .where('id', '=', itemId)
            .execute()
          await trx
            .updateTable('audioPlaylistItem')
            .set((eb) => ({ index: eb('index', '-', 1) }))
            .where('playlistId', '=', playlistId)
            .where('index', '>', index)
            .execute()
          break
        }
        case PLT.scene: {
          const { index } = await trx
            .selectFrom('scenePlaylistItem')
            .select('index')
            .where('playlistId', '=', playlistId)
            .where('id', '=', itemId)
            .executeTakeFirstOrThrow()
          await trx
            .deleteFrom('scenePlaylistItemScene')
            .where('scenePlaylistItemId', '=', itemId)
            .execute()
          await trx
            .deleteFrom('scenePlaylistItem')
            .where('playlistId', '=', playlistId)
            .where('id', '=', itemId)
            .execute()
          await trx
            .updateTable('scenePlaylistItem')
            .set((eb) => ({ index: eb('index', '-', 1) }))
            .where('playlistId', '=', playlistId)
            .where('index', '>', index)
            .execute()
          break
        }
        case PLT.script: {
          const { index } = await trx
            .selectFrom('captionScriptPlaylistItem')
            .select('index')
            .where('playlistId', '=', playlistId)
            .where('id', '=', itemId)
            .executeTakeFirstOrThrow()
          await trx
            .deleteFrom('captionScriptPlaylistItem')
            .where('playlistId', '=', playlistId)
            .where('id', '=', itemId)
            .execute()
          await trx
            .updateTable('captionScriptPlaylistItem')
            .set((eb) => ({ index: eb('index', '-', 1) }))
            .where('playlistId', '=', playlistId)
            .where('index', '>', index)
            .execute()
          break
        }
        default: {
          throw new Error(`Playlist type '${playlist?.type}' not supported`)
        }
      }
    })
}

export async function findScenePlaylistItemsByPlaylist(playlistId: number) {
  return await db()
    .query()
    .selectFrom('scenePlaylistItem as pi')
    .leftJoin('scenePlaylistItemScene as s', 's.scenePlaylistItemId', 'pi.id')
    .select(['pi.id', 'pi.duration', 's.sceneId'])
    .where('pi.playlistId', '=', playlistId)
    .orderBy('pi.index asc')
    .execute()
}

export async function findAudioPlaylistItem(
  playlistId: number,
  itemId: number
) {
  return await db()
    .query()
    .selectFrom('audioPlaylistItem')
    .selectAll()
    .where('playlistId', '=', playlistId)
    .where('id', '=', itemId)
    .executeTakeFirst()
}

export async function findScenePlaylistItem(
  playlistId: number,
  itemId: number
) {
  return await db()
    .query()
    .selectFrom('scenePlaylistItem')
    .selectAll()
    .where('playlistId', '=', playlistId)
    .where('id', '=', itemId)
    .executeTakeFirst()
}

export async function findScenePlaylistItemScenes(
  itemId: number
): Promise<number[]> {
  const rows = await db()
    .query()
    .selectFrom('scenePlaylistItemScene')
    .select('sceneId')
    .where('scenePlaylistItemId', '=', itemId)
    .execute()

  return rows.map((row) => row.sceneId ?? SCENE_NONE)
}

export async function findCaptionScriptPlaylistItem(
  playlistId: number,
  itemId: number
) {
  return await db()
    .query()
    .selectFrom('captionScriptPlaylistItem')
    .selectAll()
    .where('playlistId', '=', playlistId)
    .where('id', '=', itemId)
    .executeTakeFirst()
}

export async function findAudioPlaylistItemIds(
  playlistId: number
): Promise<number[]> {
  const rows = await db()
    .query()
    .selectFrom('audioPlaylistItem')
    .select('id')
    .where('playlistId', '=', playlistId)
    .orderBy('index asc')
    .execute()

  return rows.map((row) => row.id as number)
}

export async function findScenePlaylistItemIds(playlistId: number) {
  const rows = await db()
    .query()
    .selectFrom('scenePlaylistItem')
    .select('id')
    .where('playlistId', '=', playlistId)
    .orderBy('index asc')
    .execute()

  return rows.map((row) => row.id as number)
}

export async function findCaptionScriptPlaylistItemIds(playlistId: number) {
  const rows = await db()
    .query()
    .selectFrom('captionScriptPlaylistItem')
    .select('id')
    .where('playlistId', '=', playlistId)
    .orderBy('index asc')
    .execute()

  return rows.map((row) => row.id as number)
}

import { Updateable } from 'kysely'
import { ContentSource } from './types/generated'
import db from './database'

export async function findContentSourceById(
  id: number
): Promise<ContentSource> {
  return await db()
    .query()
    .selectFrom('contentSource')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

export async function findSceneContentSources(
  sceneId: number
): Promise<ContentSource[]> {
  return await db()
    .query()
    .selectFrom('contentSource as cs')
    .innerJoin('sceneContentSource as scs', 'scs.contentSourceId', 'cs.id')
    .select([
      'cs.id',
      'cs.userId',
      'cs.url',
      'cs.offline',
      'cs.marked',
      'cs.lastCheck',
      'cs.count',
      'cs.countComplete',
      'cs.weight',
      'cs.localDirOfSources',
      'cs.videoSubtitleFile',
      'cs.videoDuration',
      'cs.videoResolution',
      'cs.redditFunc',
      'cs.redditTime',
      'cs.twitterIncludeRetweets',
      'cs.twitterIncludeReplies'
    ])
    .where('scs.sceneId', '=', sceneId)
    .execute()
}

export type ContentSourceUpdate = Updateable<ContentSource>
export async function updateContentSource(
  id: number,
  update: ContentSourceUpdate
) {
  return await db()
    .query()
    .updateTable('contentSource')
    .set(update)
    .where('id', '=', id)
    .execute()
}

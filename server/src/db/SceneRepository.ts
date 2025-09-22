import db from './database'
import { SceneGroupRow } from './types/SceneGroupRow'
import { SceneGroupItemRow } from './types/SceneGroupItemRow'
import { Scene, SceneUpdate } from './types/entities'
import { toBoolean, toNumber } from './utils'
import { PLT } from 'flipflip-common'
import { sql } from 'kysely'

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
    .where('s.defaultScene', '=', toNumber(false))
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
    .where('s.defaultScene', '=', toNumber(false))
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
    .where('s.defaultScene', '=', toNumber(false))
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
    .where('s.defaultScene', '=', toNumber(false))
    .execute()
}

export async function findDefaultScene(): Promise<Scene> {
  return await db()
    .query()
    .selectFrom('scene as s')
    .selectAll()
    .where('s.defaultScene', '=', toNumber(true))
    .executeTakeFirstOrThrow()
}

export async function findSceneById(id: number): Promise<Scene | undefined> {
  return await db()
    .query()
    .selectFrom('scene as s')
    .selectAll()
    .where('s.id', '=', id)
    .executeTakeFirst()
}

export async function isDefaultScene(id: number): Promise<boolean> {
  return await db()
    .query()
    .selectFrom('scene')
    .select('defaultScene')
    .where('id', '=', id)
    .executeTakeFirst()
    .then((row) => toBoolean(row?.defaultScene))
}

export async function findSceneHasBpm(id: number): Promise<boolean> {
  const result = await db()
    .query()
    .selectFrom('scene as s')
    .innerJoin('scenePlaylist as sp', 'sp.sceneId', 's.id')
    .innerJoin('playlist as p', 'p.id', 'sp.playlistId')
    .innerJoin('audioPlaylistItem as api', 'api.playlistId', 'p.id')
    .innerJoin('audio as a', 'a.id', 'api.audioId')
    .select(sql.lit(1).as('hasBpm'))
    .where('s.id', '=', id)
    .where('p.type', '=', PLT.audio)
    .where('api.index', '=', 0)
    .where('a.bpm', 'is not', null)
    .executeTakeFirst()

  return result?.hasBpm != null
}

export async function createScene(userId: number) {
  return await db()
    .query()
    .insertInto('scene')
    .columns([
      'userId',
      'defaultScene',
      'name',
      'useWeights',
      'weightsValid',
      'timingFunction',
      'timingConstant',
      'timingMin',
      'timingMax',
      'timingSinRate',
      'timingBpmMulti',
      'backForth',
      'backForthTf',
      'backForthConstant',
      'backForthMin',
      'backForthMax',
      'backForthSinRate',
      'backForthBpmMulti',
      'imageType',
      'backgroundType',
      'backgroundColor',
      'backgroundColorSet',
      'backgroundBlur',
      'imageTypeFilter',
      'fullSource',
      'imageOrientation',
      'gifOption',
      'gifTimingConstant',
      'gifTimingMin',
      'gifTimingMax',
      'videoOrientation',
      'videoOption',
      'videoTimingConstant',
      'videoTimingMin',
      'videoTimingMax',
      'videoSpeed',
      'videoRandomSpeed',
      'videoSpeedMin',
      'videoSpeedMax',
      'videoSkip',
      'randomVideoStart',
      'continueVideo',
      'playVideoClips',
      'skipVideoStart',
      'skipVideoEnd',
      'videoVolume',
      'weightFunction',
      'sourceOrderFunction',
      'forceAllSource',
      'orderFunction',
      'forceAll',
      'zoom',
      'zoomRandom',
      'zoomStart',
      'zoomStartMin',
      'zoomStartMax',
      'zoomEnd',
      'zoomEndMin',
      'zoomEndMax',
      'horizTransType',
      'horizTransLevel',
      'horizTransLevelMin',
      'horizTransLevelMax',
      'horizTransRandom',
      'vertTransType',
      'vertTransLevel',
      'vertTransLevelMin',
      'vertTransLevelMax',
      'vertTransRandom',
      'transTf',
      'transDuration',
      'transDurationMin',
      'transDurationMax',
      'transSinRate',
      'transBpmMulti',
      'transEase',
      'transExp',
      'transAmp',
      'transPer',
      'transOv',
      'crossFade',
      'crossFadeAudio',
      'fadeTf',
      'fadeDuration',
      'fadeDurationMin',
      'fadeDurationMax',
      'fadeSinRate',
      'fadeBpmMulti',
      'fadeEase',
      'fadeExp',
      'fadeAmp',
      'fadePer',
      'fadeOv',
      'slide',
      'slideTf',
      'slideType',
      'slideDistance',
      'slideDuration',
      'slideDurationMin',
      'slideDurationMax',
      'slideSinRate',
      'slideBpmMulti',
      'slideEase',
      'slideExp',
      'slideAmp',
      'slidePer',
      'slideOv',
      'strobe',
      'strobePulse',
      'strobeLayer',
      'strobeOpacity',
      'strobeTf',
      'strobeTime',
      'strobeTimeMin',
      'strobeTimeMax',
      'strobeSinRate',
      'strobeBpmMulti',
      'strobeDelayTf',
      'strobeDelay',
      'strobeDelayMin',
      'strobeDelayMax',
      'strobeDelaySinRate',
      'strobeDelayBpmMulti',
      'strobeColorType',
      'strobeColor',
      'strobeColorSet',
      'strobeEase',
      'strobeExp',
      'strobeAmp',
      'strobePer',
      'strobeOv',
      'fadeInOut',
      'fadeIoPulse',
      'fadeIoTf',
      'fadeIoDuration',
      'fadeIoDurationMin',
      'fadeIoDurationMax',
      'fadeIoSinRate',
      'fadeIoBpmMulti',
      'fadeIoDelayTf',
      'fadeIoDelay',
      'fadeIoDelayMin',
      'fadeIoDelayMax',
      'fadeIoDelaySinRate',
      'fadeIoDelayBpmMulti',
      'fadeIoStartEase',
      'fadeIoStartExp',
      'fadeIoStartAmp',
      'fadeIoStartPer',
      'fadeIoStartOv',
      'fadeIoEndEase',
      'fadeIoEndExp',
      'fadeIoEndAmp',
      'fadeIoEndPer',
      'fadeIoEndOv',
      'panning',
      'panTf',
      'panDuration',
      'panDurationMin',
      'panDurationMax',
      'panSinRate',
      'panBpmMulti',
      'panHorizTransType',
      'panHorizTransImg',
      'panHorizTransLevel',
      'panHorizTransLevelMax',
      'panHorizTransLevelMin',
      'panHorizTransRandom',
      'panVertTransType',
      'panVertTransImg',
      'panVertTransLevel',
      'panVertTransLevelMax',
      'panVertTransLevelMin',
      'panVertTransRandom',
      'panStartEase',
      'panStartExp',
      'panStartAmp',
      'panStartPer',
      'panStartOv',
      'panEndEase',
      'panEndExp',
      'panEndAmp',
      'panEndPer',
      'panEndOv',
      'overrideIgnore',
      'scriptScene',
      'downloadScene',
      'generatorMax',
      'persistAudio',
      'persistText',
      'libraryId',
      'audioScene',
      'audioEnabled',
      'audioStartIndex',
      'textEnabled',
      'scriptStartIndex',
      'regenerate'
    ])
    .expression((eb) =>
      eb
        .selectFrom('scene')
        .select((eb) => [
          eb.lit(userId).as('userId'),
          eb.lit(toNumber(false)).as('defaultScene'),
          eb.val('New scene').as('name'),
          'useWeights',
          'weightsValid',
          'timingFunction',
          'timingConstant',
          'timingMin',
          'timingMax',
          'timingSinRate',
          'timingBpmMulti',
          'backForth',
          'backForthTf',
          'backForthConstant',
          'backForthMin',
          'backForthMax',
          'backForthSinRate',
          'backForthBpmMulti',
          'imageType',
          'backgroundType',
          'backgroundColor',
          'backgroundColorSet',
          'backgroundBlur',
          'imageTypeFilter',
          'fullSource',
          'imageOrientation',
          'gifOption',
          'gifTimingConstant',
          'gifTimingMin',
          'gifTimingMax',
          'videoOrientation',
          'videoOption',
          'videoTimingConstant',
          'videoTimingMin',
          'videoTimingMax',
          'videoSpeed',
          'videoRandomSpeed',
          'videoSpeedMin',
          'videoSpeedMax',
          'videoSkip',
          'randomVideoStart',
          'continueVideo',
          'playVideoClips',
          'skipVideoStart',
          'skipVideoEnd',
          'videoVolume',
          'weightFunction',
          'sourceOrderFunction',
          'forceAllSource',
          'orderFunction',
          'forceAll',
          'zoom',
          'zoomRandom',
          'zoomStart',
          'zoomStartMin',
          'zoomStartMax',
          'zoomEnd',
          'zoomEndMin',
          'zoomEndMax',
          'horizTransType',
          'horizTransLevel',
          'horizTransLevelMin',
          'horizTransLevelMax',
          'horizTransRandom',
          'vertTransType',
          'vertTransLevel',
          'vertTransLevelMin',
          'vertTransLevelMax',
          'vertTransRandom',
          'transTf',
          'transDuration',
          'transDurationMin',
          'transDurationMax',
          'transSinRate',
          'transBpmMulti',
          'transEase',
          'transExp',
          'transAmp',
          'transPer',
          'transOv',
          'crossFade',
          'crossFadeAudio',
          'fadeTf',
          'fadeDuration',
          'fadeDurationMin',
          'fadeDurationMax',
          'fadeSinRate',
          'fadeBpmMulti',
          'fadeEase',
          'fadeExp',
          'fadeAmp',
          'fadePer',
          'fadeOv',
          'slide',
          'slideTf',
          'slideType',
          'slideDistance',
          'slideDuration',
          'slideDurationMin',
          'slideDurationMax',
          'slideSinRate',
          'slideBpmMulti',
          'slideEase',
          'slideExp',
          'slideAmp',
          'slidePer',
          'slideOv',
          'strobe',
          'strobePulse',
          'strobeLayer',
          'strobeOpacity',
          'strobeTf',
          'strobeTime',
          'strobeTimeMin',
          'strobeTimeMax',
          'strobeSinRate',
          'strobeBpmMulti',
          'strobeDelayTf',
          'strobeDelay',
          'strobeDelayMin',
          'strobeDelayMax',
          'strobeDelaySinRate',
          'strobeDelayBpmMulti',
          'strobeColorType',
          'strobeColor',
          'strobeColorSet',
          'strobeEase',
          'strobeExp',
          'strobeAmp',
          'strobePer',
          'strobeOv',
          'fadeInOut',
          'fadeIoPulse',
          'fadeIoTf',
          'fadeIoDuration',
          'fadeIoDurationMin',
          'fadeIoDurationMax',
          'fadeIoSinRate',
          'fadeIoBpmMulti',
          'fadeIoDelayTf',
          'fadeIoDelay',
          'fadeIoDelayMin',
          'fadeIoDelayMax',
          'fadeIoDelaySinRate',
          'fadeIoDelayBpmMulti',
          'fadeIoStartEase',
          'fadeIoStartExp',
          'fadeIoStartAmp',
          'fadeIoStartPer',
          'fadeIoStartOv',
          'fadeIoEndEase',
          'fadeIoEndExp',
          'fadeIoEndAmp',
          'fadeIoEndPer',
          'fadeIoEndOv',
          'panning',
          'panTf',
          'panDuration',
          'panDurationMin',
          'panDurationMax',
          'panSinRate',
          'panBpmMulti',
          'panHorizTransType',
          'panHorizTransImg',
          'panHorizTransLevel',
          'panHorizTransLevelMax',
          'panHorizTransLevelMin',
          'panHorizTransRandom',
          'panVertTransType',
          'panVertTransImg',
          'panVertTransLevel',
          'panVertTransLevelMax',
          'panVertTransLevelMin',
          'panVertTransRandom',
          'panStartEase',
          'panStartExp',
          'panStartAmp',
          'panStartPer',
          'panStartOv',
          'panEndEase',
          'panEndExp',
          'panEndAmp',
          'panEndPer',
          'panEndOv',
          'overrideIgnore',
          'scriptScene',
          'downloadScene',
          'generatorMax',
          'persistAudio',
          'persistText',
          'libraryId',
          'audioScene',
          'audioEnabled',
          'audioStartIndex',
          'textEnabled',
          'scriptStartIndex',
          'regenerate'
        ])
        .where('defaultScene', '=', toNumber(true))
    )
    .returning('id')
    .executeTakeFirstOrThrow()
}

export async function updateScene(id: number, update: SceneUpdate) {
  return await db()
    .query()
    .updateTable('scene')
    .set(update)
    .where('id', '=', id)
    .execute()
}

export async function findSceneIds(): Promise<number[]> {
  return await db()
    .query()
    .selectFrom('scene')
    .select('id')
    .where('scene.defaultScene', '=', toNumber(false))
    .execute()
    .then((value) => value.map((v) => v.id as number))
}

export async function findSceneSelectOptions(): Promise<
  Record<string, string>
> {
  const scenesWithSources = await db()
    .query()
    .selectFrom('contentSource')
    .select('sceneId')
    .distinct()
    .execute()

  const scenesWithValidWeights = await db()
    .query()
    .selectFrom('scene')
    .select('id')
    .where('regenerate', '=', toNumber(true))
    .where('weightsValid', '=', toNumber(true))
    .execute()

  const ids = new Set<number>()
  scenesWithSources.forEach(({ sceneId }) => ids.add(sceneId))
  scenesWithValidWeights.forEach(({ id }) => ids.add(id as number))

  const rows = await db()
    .query()
    .selectFrom('scene')
    .select(['id', 'name'])
    .where('id', 'in', Array.from(ids))
    .where('name', '<>', 'library_scene_temp')
    .execute()

  const options: Record<string, string> = {}
  rows.forEach(({ id, name }) => (options[(id as number).toString()] = name))
  return options
}

export async function isSceneCreator(id: number, userId: number) {
  return await db()
    .query()
    .selectFrom('scene')
    .select((eb) => eb.lit(1).as('exists'))
    .where('id', '=', id)
    .where('userId', '=', userId)
    .executeTakeFirst()
}

export async function deleteScene(id: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      await trx.deleteFrom('contentSource').where('sceneId', '=', id).execute()
      await trx.deleteFrom('scenePlaylist').where('sceneId', '=', id).execute()
      await trx.deleteFrom('weightGroup').where('sceneId', '=', id).execute()

      const playlistItems = await trx
        .selectFrom('scenePlaylistItemScene')
        .select(({ fn }) => [
          'scenePlaylistItemId',
          fn.count<number>('id').as('count')
        ])
        .where('sceneId', '=', id)
        .groupBy('scenePlaylistItemId')
        .execute()

      const playlistItemsToDelete = playlistItems
        .filter((item) => item.count > 1)
        .map(({ scenePlaylistItemId }) => scenePlaylistItemId)
      await trx
        .deleteFrom('scenePlaylistItemScene')
        .where('sceneId', '=', id)
        .where('scenePlaylistItemId', 'in', playlistItemsToDelete)
        .execute()

      // Set playlist item scene to none
      const playlistItemsToUpdate = playlistItems
        .filter((item) => item.count == 1)
        .map(({ scenePlaylistItemId }) => scenePlaylistItemId)
      await trx
        .updateTable('scenePlaylistItemScene')
        .set({ sceneId: null })
        .where('sceneId', '=', id)
        .where('scenePlaylistItemId', 'in', playlistItemsToUpdate)
        .execute()

      return await trx.deleteFrom('scene').where('id', '=', id).execute()
    })
}

export async function cloneScene(originalId: number, userId: number) {
  return await db()
    .query()
    .transaction()
    .execute(async (trx) => {
      const newScene = await trx
        .insertInto('scene')
        .columns([
          'userId',
          'defaultScene',
          'name',
          'useWeights',
          'weightsValid',
          'timingFunction',
          'timingConstant',
          'timingMin',
          'timingMax',
          'timingSinRate',
          'timingBpmMulti',
          'backForth',
          'backForthTf',
          'backForthConstant',
          'backForthMin',
          'backForthMax',
          'backForthSinRate',
          'backForthBpmMulti',
          'imageType',
          'backgroundType',
          'backgroundColor',
          'backgroundColorSet',
          'backgroundBlur',
          'imageTypeFilter',
          'fullSource',
          'imageOrientation',
          'gifOption',
          'gifTimingConstant',
          'gifTimingMin',
          'gifTimingMax',
          'videoOrientation',
          'videoOption',
          'videoTimingConstant',
          'videoTimingMin',
          'videoTimingMax',
          'videoSpeed',
          'videoRandomSpeed',
          'videoSpeedMin',
          'videoSpeedMax',
          'videoSkip',
          'randomVideoStart',
          'continueVideo',
          'playVideoClips',
          'skipVideoStart',
          'skipVideoEnd',
          'videoVolume',
          'weightFunction',
          'sourceOrderFunction',
          'forceAllSource',
          'orderFunction',
          'forceAll',
          'zoom',
          'zoomRandom',
          'zoomStart',
          'zoomStartMin',
          'zoomStartMax',
          'zoomEnd',
          'zoomEndMin',
          'zoomEndMax',
          'horizTransType',
          'horizTransLevel',
          'horizTransLevelMin',
          'horizTransLevelMax',
          'horizTransRandom',
          'vertTransType',
          'vertTransLevel',
          'vertTransLevelMin',
          'vertTransLevelMax',
          'vertTransRandom',
          'transTf',
          'transDuration',
          'transDurationMin',
          'transDurationMax',
          'transSinRate',
          'transBpmMulti',
          'transEase',
          'transExp',
          'transAmp',
          'transPer',
          'transOv',
          'crossFade',
          'crossFadeAudio',
          'fadeTf',
          'fadeDuration',
          'fadeDurationMin',
          'fadeDurationMax',
          'fadeSinRate',
          'fadeBpmMulti',
          'fadeEase',
          'fadeExp',
          'fadeAmp',
          'fadePer',
          'fadeOv',
          'slide',
          'slideTf',
          'slideType',
          'slideDistance',
          'slideDuration',
          'slideDurationMin',
          'slideDurationMax',
          'slideSinRate',
          'slideBpmMulti',
          'slideEase',
          'slideExp',
          'slideAmp',
          'slidePer',
          'slideOv',
          'strobe',
          'strobePulse',
          'strobeLayer',
          'strobeOpacity',
          'strobeTf',
          'strobeTime',
          'strobeTimeMin',
          'strobeTimeMax',
          'strobeSinRate',
          'strobeBpmMulti',
          'strobeDelayTf',
          'strobeDelay',
          'strobeDelayMin',
          'strobeDelayMax',
          'strobeDelaySinRate',
          'strobeDelayBpmMulti',
          'strobeColorType',
          'strobeColor',
          'strobeColorSet',
          'strobeEase',
          'strobeExp',
          'strobeAmp',
          'strobePer',
          'strobeOv',
          'fadeInOut',
          'fadeIoPulse',
          'fadeIoTf',
          'fadeIoDuration',
          'fadeIoDurationMin',
          'fadeIoDurationMax',
          'fadeIoSinRate',
          'fadeIoBpmMulti',
          'fadeIoDelayTf',
          'fadeIoDelay',
          'fadeIoDelayMin',
          'fadeIoDelayMax',
          'fadeIoDelaySinRate',
          'fadeIoDelayBpmMulti',
          'fadeIoStartEase',
          'fadeIoStartExp',
          'fadeIoStartAmp',
          'fadeIoStartPer',
          'fadeIoStartOv',
          'fadeIoEndEase',
          'fadeIoEndExp',
          'fadeIoEndAmp',
          'fadeIoEndPer',
          'fadeIoEndOv',
          'panning',
          'panTf',
          'panDuration',
          'panDurationMin',
          'panDurationMax',
          'panSinRate',
          'panBpmMulti',
          'panHorizTransType',
          'panHorizTransImg',
          'panHorizTransLevel',
          'panHorizTransLevelMax',
          'panHorizTransLevelMin',
          'panHorizTransRandom',
          'panVertTransType',
          'panVertTransImg',
          'panVertTransLevel',
          'panVertTransLevelMax',
          'panVertTransLevelMin',
          'panVertTransRandom',
          'panStartEase',
          'panStartExp',
          'panStartAmp',
          'panStartPer',
          'panStartOv',
          'panEndEase',
          'panEndExp',
          'panEndAmp',
          'panEndPer',
          'panEndOv',
          'overrideIgnore',
          'scriptScene',
          'downloadScene',
          'generatorMax',
          'persistAudio',
          'persistText',
          'libraryId',
          'audioScene',
          'audioEnabled',
          'audioStartIndex',
          'textEnabled',
          'scriptStartIndex',
          'regenerate'
        ])
        .expression((eb) =>
          eb
            .selectFrom('scene')
            .select([
              'userId',
              'defaultScene',
              'name',
              'useWeights',
              'weightsValid',
              'timingFunction',
              'timingConstant',
              'timingMin',
              'timingMax',
              'timingSinRate',
              'timingBpmMulti',
              'backForth',
              'backForthTf',
              'backForthConstant',
              'backForthMin',
              'backForthMax',
              'backForthSinRate',
              'backForthBpmMulti',
              'imageType',
              'backgroundType',
              'backgroundColor',
              'backgroundColorSet',
              'backgroundBlur',
              'imageTypeFilter',
              'fullSource',
              'imageOrientation',
              'gifOption',
              'gifTimingConstant',
              'gifTimingMin',
              'gifTimingMax',
              'videoOrientation',
              'videoOption',
              'videoTimingConstant',
              'videoTimingMin',
              'videoTimingMax',
              'videoSpeed',
              'videoRandomSpeed',
              'videoSpeedMin',
              'videoSpeedMax',
              'videoSkip',
              'randomVideoStart',
              'continueVideo',
              'playVideoClips',
              'skipVideoStart',
              'skipVideoEnd',
              'videoVolume',
              'weightFunction',
              'sourceOrderFunction',
              'forceAllSource',
              'orderFunction',
              'forceAll',
              'zoom',
              'zoomRandom',
              'zoomStart',
              'zoomStartMin',
              'zoomStartMax',
              'zoomEnd',
              'zoomEndMin',
              'zoomEndMax',
              'horizTransType',
              'horizTransLevel',
              'horizTransLevelMin',
              'horizTransLevelMax',
              'horizTransRandom',
              'vertTransType',
              'vertTransLevel',
              'vertTransLevelMin',
              'vertTransLevelMax',
              'vertTransRandom',
              'transTf',
              'transDuration',
              'transDurationMin',
              'transDurationMax',
              'transSinRate',
              'transBpmMulti',
              'transEase',
              'transExp',
              'transAmp',
              'transPer',
              'transOv',
              'crossFade',
              'crossFadeAudio',
              'fadeTf',
              'fadeDuration',
              'fadeDurationMin',
              'fadeDurationMax',
              'fadeSinRate',
              'fadeBpmMulti',
              'fadeEase',
              'fadeExp',
              'fadeAmp',
              'fadePer',
              'fadeOv',
              'slide',
              'slideTf',
              'slideType',
              'slideDistance',
              'slideDuration',
              'slideDurationMin',
              'slideDurationMax',
              'slideSinRate',
              'slideBpmMulti',
              'slideEase',
              'slideExp',
              'slideAmp',
              'slidePer',
              'slideOv',
              'strobe',
              'strobePulse',
              'strobeLayer',
              'strobeOpacity',
              'strobeTf',
              'strobeTime',
              'strobeTimeMin',
              'strobeTimeMax',
              'strobeSinRate',
              'strobeBpmMulti',
              'strobeDelayTf',
              'strobeDelay',
              'strobeDelayMin',
              'strobeDelayMax',
              'strobeDelaySinRate',
              'strobeDelayBpmMulti',
              'strobeColorType',
              'strobeColor',
              'strobeColorSet',
              'strobeEase',
              'strobeExp',
              'strobeAmp',
              'strobePer',
              'strobeOv',
              'fadeInOut',
              'fadeIoPulse',
              'fadeIoTf',
              'fadeIoDuration',
              'fadeIoDurationMin',
              'fadeIoDurationMax',
              'fadeIoSinRate',
              'fadeIoBpmMulti',
              'fadeIoDelayTf',
              'fadeIoDelay',
              'fadeIoDelayMin',
              'fadeIoDelayMax',
              'fadeIoDelaySinRate',
              'fadeIoDelayBpmMulti',
              'fadeIoStartEase',
              'fadeIoStartExp',
              'fadeIoStartAmp',
              'fadeIoStartPer',
              'fadeIoStartOv',
              'fadeIoEndEase',
              'fadeIoEndExp',
              'fadeIoEndAmp',
              'fadeIoEndPer',
              'fadeIoEndOv',
              'panning',
              'panTf',
              'panDuration',
              'panDurationMin',
              'panDurationMax',
              'panSinRate',
              'panBpmMulti',
              'panHorizTransType',
              'panHorizTransImg',
              'panHorizTransLevel',
              'panHorizTransLevelMax',
              'panHorizTransLevelMin',
              'panHorizTransRandom',
              'panVertTransType',
              'panVertTransImg',
              'panVertTransLevel',
              'panVertTransLevelMax',
              'panVertTransLevelMin',
              'panVertTransRandom',
              'panStartEase',
              'panStartExp',
              'panStartAmp',
              'panStartPer',
              'panStartOv',
              'panEndEase',
              'panEndExp',
              'panEndAmp',
              'panEndPer',
              'panEndOv',
              'overrideIgnore',
              'scriptScene',
              'downloadScene',
              'generatorMax',
              'persistAudio',
              'persistText',
              'libraryId',
              'audioScene',
              'audioEnabled',
              'audioStartIndex',
              'textEnabled',
              'scriptStartIndex',
              'regenerate'
            ])
            .where('id', '=', originalId)
            .where('userId', '=', userId)
            .where('defaultScene', '=', toNumber(false))
        )
        .returning('id')
        .executeTakeFirstOrThrow()

      const contentSources = await trx
        .selectFrom('contentSource')
        .select([
          'id',
          'url',
          'type',
          'offline',
          'marked',
          'lastCheck',
          'count',
          'countComplete',
          'weight',
          'localDirOfSources',
          'videoSubtitleFile',
          'videoDuration',
          'videoResolution',
          'redditFunc',
          'redditTime',
          'createdAt',
          'index'
        ])
        .where('sceneId', '=', originalId)
        .where('userId', '=', userId)
        .execute()

      for (const contentSource of contentSources) {
        const {
          url,
          type,
          offline,
          marked,
          lastCheck,
          count,
          countComplete,
          weight,
          localDirOfSources,
          videoSubtitleFile,
          videoDuration,
          videoResolution,
          redditFunc,
          redditTime,
          createdAt,
          index
        } = contentSource

        const newContentSource = await trx
          .insertInto('contentSource')
          .values({
            userId,
            sceneId: newScene.id as number,
            url,
            type,
            offline,
            marked,
            lastCheck,
            count,
            countComplete,
            weight,
            localDirOfSources,
            videoSubtitleFile,
            videoDuration,
            videoResolution,
            redditFunc,
            redditTime,
            createdAt,
            index
          })
          .returning('id')
          .executeTakeFirst()

        const contentSourceId = contentSource.id as number
        const newContentSourceId = newContentSource?.id as number
        await trx
          .insertInto('contentSourceTag')
          .columns(['userId', 'tagId', 'contentSourceId'])
          .expression((eb) =>
            eb
              .selectFrom('contentSourceTag')
              .select([
                'userId',
                'tagId',
                (eb) => eb.lit(newContentSourceId).as('contentSourceId')
              ])
              .where('contentSourceId', '=', contentSourceId)
              .where('userId', '=', userId)
          )
          .execute()

        await trx
          .insertInto('clip')
          .columns([
            'userId',
            'contentSourceId',
            'disabled',
            'start',
            'end',
            'volume'
          ])
          .expression((eb) =>
            eb
              .selectFrom('clip')
              .select([
                'userId',
                (eb) => eb.lit(newContentSourceId).as('contentSourceId'),
                'disabled',
                'start',
                'end',
                'volume'
              ])
              .where('contentSourceId', '=', contentSourceId)
              .where('userId', '=', userId)
          )
          .execute()

        await trx
          .insertInto('contentSourceBlacklistItem')
          .columns(['contentSourceId', 'url'])
          .expression((eb) =>
            eb
              .selectFrom('contentSourceBlacklistItem')
              .select([
                (eb) => eb.lit(newContentSourceId).as('contentSourceId'),
                'url'
              ])
              .where('contentSourceId', '=', contentSourceId)
          )
          .execute()
      }

      await trx
        .insertInto('scenePlaylist')
        .columns(['sceneId', 'playlistId'])
        .expression((eb) =>
          eb
            .selectFrom('scenePlaylist')
            .select([
              (eb) => eb.lit(newScene.id as number).as('sceneId'),
              'playlistId'
            ])
            .where('sceneId', '=', originalId)
        )
        .execute()

      // TODO clone weightGroup table rows for generators
      return newScene.id as number
    })
}

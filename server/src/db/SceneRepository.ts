import db from './database'
import { SceneGroupRow } from './types/SceneGroupRow'
import { SceneGroupItemRow } from './types/SceneGroupItemRow'
import { Scene } from './types/generated'
import { toBoolean, toNumber } from './utils'
import { PLT } from 'flipflip-common'
import { Updateable, sql } from 'kysely'

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
          'name',
          'useWeights',
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
    .returningAll()
    .executeTakeFirstOrThrow()
}

export type SceneUpdate = Updateable<Scene>
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

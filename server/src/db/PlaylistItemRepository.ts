import {PLT} from 'flipflip-common'
import db from "./database";

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

export async function findScenePlaylistItemsByPlaylist(playlistId: number) {
    return await db()
        .query()
        .selectFrom('scenePlaylistItem as pi')
        .leftJoin('scenePlaylistItemScene as s', 's.scenePlaylistItemId', 'pi.id')
        .select(['pi.id', 'pi.duration', 's.sceneId'])
        .where('pi.playlistId', '=', playlistId)
        .execute()
}
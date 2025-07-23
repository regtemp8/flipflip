import { randomizeList, RP } from "flipflip-common"
import { findSceneIds } from "../db/SceneRepository"
import { getRandomListItem } from "../utils"
import { findPlaylistByDisplayView } from "../db/PlaylistRepository"
import { Playlist } from "../db/types/generated"
import { findScenePlaylistItemsByPlaylist } from "../db/PlaylistItemRepository"
import { toBoolean } from "../db/utils"

export interface ScenePlaylistItem {
    sceneId: number
    duration: number
}

interface ScenePlaylistPlayerItem {
    sceneIds?: number[]
    duration: number
}

export default class ScenePlaylistPlayer {

    private readonly allSceneIds: number[]
    private repeatCount: number;
    private shuffle: boolean;
    private items: ScenePlaylistPlayerItem[]
    private itemIndex: number
    private done: boolean

    private constructor(
        allSceneIds: number[],
        repeat: string,
        shuffle: boolean,
        items: ScenePlaylistPlayerItem[]
    ) {
        this.allSceneIds = allSceneIds;
        this.repeatCount = this.calcRepeats(repeat);
        this.shuffle = shuffle;
        this.items = items;
        this.itemIndex = -1
        this.done = false
    }

    private calcRepeats(repeat: string) {
        switch (repeat) {
            case RP.all:
                return -1
            case RP.one:
                return 2
            default:
                return 1
        }
    }

    public next(): ScenePlaylistItem | undefined {
        if(this.done) {
            return undefined
        }

        this.itemIndex = (this.itemIndex + 1) % this.items.length
        if(this.itemIndex === 0) {
            this.repeatCount--
            if(this.repeatCount === -1) {
                this.done = true
                return undefined
            }
            if(this.shuffle) {
                randomizeList(this.items)
            }
        }

        const item = this.items[this.itemIndex]
        const sceneIds = item.sceneIds ?? this.allSceneIds
        const sceneId = sceneIds.length === 1 ? sceneIds[0] : getRandomListItem(sceneIds)
        return {sceneId, duration: item.duration}
    }

    public static async create(viewId: number): Promise<ScenePlaylistPlayer> {
        const allSceneIds = await findSceneIds()
        const {id, repeat, shuffle} = await findPlaylistByDisplayView(viewId) as Playlist
        const playlistItems = await findScenePlaylistItemsByPlaylist(id as number)
        const itemsMap = new Map<number, ScenePlaylistPlayerItem>()
        for(const playlistItem of playlistItems) {
            const id = playlistItem.id as number
            let item = itemsMap.get(id)
            if(item == null) {
                item = {
                    duration: playlistItem.duration as number, 
                    sceneIds: playlistItem.sceneId != null ? [playlistItem.sceneId] : undefined
                }
            } else {
                item.sceneIds?.push(playlistItem.sceneId as number)
            }

            itemsMap.set(id, item)
        }


        return new ScenePlaylistPlayer(allSceneIds, repeat, toBoolean(shuffle), Array.from(itemsMap.values()))
    }
}
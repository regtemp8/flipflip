import { randomUUID } from "crypto"
import Player from "./Player"
import sourceScrapers from "../scraper/SourceScraperService"
import { User } from "../db/types/generated"

class PlayerService {
  private static instance: PlayerService

  private readonly players: Map<string, Player>

  private constructor() {
    this.players = new Map()
  }

  public static getInstance(): PlayerService {
    if (PlayerService.instance == null) {
      PlayerService.instance = new PlayerService()
    }

    return PlayerService.instance
  }

  public start(displayId: number, user: User): string {
    const id = randomUUID()
    const player = new Player()
    player.start(displayId, user)
    this.players.set(id, player)
    return id
  }

  public stop(playerId: string) {
    const player = this.players.get(playerId)
    if(player == null) {
        return
    }

    player.stop()
    this.players.delete(playerId)
    if(this.players.size === 0) {
      sourceScrapers().clear()
    }
  }

  public get(playerId: string) {
    return this.players.get(playerId)
  }
}

export default function players() {
  return PlayerService.getInstance()
}
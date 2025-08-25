import { randomUUID } from 'crypto'
import Player from './Player'
import sourceScrapers from '../scraper/SourceScraperService'
import { User } from '../db/types/entities'
import Logger from '../logging/Logger'

const logger = Logger.create('PlayerService')
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
    logger.info('Starting player for display (id: {id})', { id: displayId })
    const id = randomUUID()
    const player = new Player()
    player.start(displayId, user)
    this.players.set(id, player)
    logger.info('Started player (id: {id})', { id })
    return id
  }

  public stop(playerId: string) {
    logger.info('Stopping player (id: {id})', { id: playerId })
    const player = this.players.get(playerId)
    if (player == null) {
      logger.warn("Unable to stop player, '{id}' not found", { id: playerId })
      return
    }

    player.stop()
    this.players.delete(playerId)
    if (this.players.size === 0) {
      sourceScrapers().clear()
    }

    logger.info('Stopped player (id: {id})', { id: playerId })
  }

  public get(playerId: string) {
    return this.players.get(playerId)
  }
}

export default function players() {
  return PlayerService.getInstance()
}

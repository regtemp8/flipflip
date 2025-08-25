import { randomUUID } from 'crypto'
import ViewPlayer from './ViewPlayer'
import { User, DisplayView as DisplayViewRow } from '../db/types/entities'
import { findDisplayViewById } from '../db/DisplayViewRepository'
import { toBoolean } from '../db/utils'

class ViewPlayerService {
  private static instance: ViewPlayerService

  private readonly viewPlayers: Map<string, ViewPlayer>
  private readonly syncedViews: Map<string, number>

  private constructor() {
    this.viewPlayers = new Map<string, ViewPlayer>()
    this.syncedViews = new Map<string, number>()
  }

  public static getInstance(): ViewPlayerService {
    if (ViewPlayerService.instance == null) {
      ViewPlayerService.instance = new ViewPlayerService()
    }

    return ViewPlayerService.instance
  }

  public async start(viewId: number, user: User): Promise<string> {
    const id = randomUUID()
    const view = (await findDisplayViewById(viewId)) as DisplayViewRow
    if (toBoolean(view.sync)) {
      this.syncedViews.set(id, viewId)
    } else {
      const viewPlayer = await ViewPlayer.create(viewId, user)
      viewPlayer.start()
      this.viewPlayers.set(id, viewPlayer)
    }
    return id
  }

  public stop(viewPlayerId: string) {
    const viewPlayer = this.viewPlayers.get(viewPlayerId)
    if (viewPlayer == null) {
      this.syncedViews.delete(viewPlayerId)
      return
    }

    viewPlayer.stop()
    this.viewPlayers.delete(viewPlayerId)
  }

  public get(viewPlayerId: string) {
    return this.viewPlayers.get(viewPlayerId)
  }

  public getViewId(viewPlayerId: string) {
    const viewPlayer = this.viewPlayers.get(viewPlayerId)
    if (viewPlayer != null) {
      return viewPlayer.getViewId()
    } else {
      return this.syncedViews.get(viewPlayerId)
    }
  }

  public getViewPlayerId(viewId: number) {
    let viewPlayerId: string | undefined = undefined
    for (const [key, value] of this.viewPlayers.entries()) {
      if (value.getViewId() === viewId) {
        viewPlayerId = key
        break
      }
    }

    if (viewPlayerId == null) {
      throw new Error(`Failed to get view player id for view: ${viewId}`)
    }

    return viewPlayerId
  }
}

export default function viewPlayers() {
  return ViewPlayerService.getInstance()
}

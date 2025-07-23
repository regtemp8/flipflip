import { randomUUID } from 'crypto'
import ViewPlayer from './ViewPlayer'
import { User } from '../db/types/generated'

class ViewPlayerService {
  private static instance: ViewPlayerService

  private readonly views: Map<string, ViewPlayer>

  private constructor() {
    this.views = new Map()
  }

  public static getInstance(): ViewPlayerService {
    if (ViewPlayerService.instance == null) {
      ViewPlayerService.instance = new ViewPlayerService()
    }

    return ViewPlayerService.instance
  }

  public async start(viewId: number, user: User): Promise<string> {
    const view = await ViewPlayer.create(viewId, user)
    view.start()
    const id = randomUUID()
    this.views.set(id, view)
    return id
  }

  public stop(viewId: string) {
    const view = this.views.get(viewId)
    if (view == null) {
      return
    }

    view.stop()
    this.views.delete(viewId)
  }

  public get(viewId: string) {
    return this.views.get(viewId)
  }
}

export default function viewPlayers() {
  return ViewPlayerService.getInstance()
}

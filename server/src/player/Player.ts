import { deleteTemporaryDisplay } from '../db/DisplayRepository'
import { User } from '../db/types/entities'
import viewPlayers from './ViewPlayerService'

export default class Player {
  private displayId?: number
  private readonly viewPlayerRefs: string[]

  constructor() {
    this.viewPlayerRefs = []
  }

  public async start(displayId: number, viewIds: number[], user: User) {
    this.displayId = displayId
    for (const id of viewIds) {
      const ref = await viewPlayers().start(id as number, user)
      this.viewPlayerRefs.push(ref)
    }
  }

  public async stop() {
    this.viewPlayerRefs
      .splice(0, this.viewPlayerRefs.length)
      .forEach((ref) => viewPlayers().stop(ref))

    await deleteTemporaryDisplay(this.displayId as number)
  }

  public getDisplayId(): number {
    return this.displayId as number
  }

  public getViewPlayerRefs(): string[] {
    return this.viewPlayerRefs
  }
}

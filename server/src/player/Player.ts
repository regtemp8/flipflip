import { findVisibleDisplayViewIds } from "../db/DisplayViewRepository"
import { User } from "../db/types/generated"
import viewPlayers from "./ViewPlayerService"

export default class Player {

  private readonly viewPlayerRefs: string[]

  constructor() {
    this.viewPlayerRefs = []
  }

  public async start(displayId: number, user: User) {
    const viewIds = await findVisibleDisplayViewIds(displayId)
    for(const {id} of viewIds) {
      const ref = await viewPlayers().start(id as number, user)
      this.viewPlayerRefs.push(ref)
    }
  }

  public stop() {
    this.viewPlayerRefs
      .splice(0, this.viewPlayerRefs.length)
      .forEach((ref) => viewPlayers().stop(ref))
  }

  public getViewPlayerRefs(): string[] {
    return this.viewPlayerRefs
  }
}
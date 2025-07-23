import { findDisplayViewById } from '../db/DisplayViewRepository'
import { toDisplayView } from '../db/mappers'

class DisplayViewService {
  private static instance: DisplayViewService

  private constructor() {}

  public static getInstance(): DisplayViewService {
    if (DisplayViewService.instance == null) {
      DisplayViewService.instance = new DisplayViewService()
    }

    return DisplayViewService.instance
  }

  public async getById(id: number) {
    const displayView = await findDisplayViewById(id)
    return displayView != null ? toDisplayView(displayView) : undefined
  }
}

export default function displayViews() {
  return DisplayViewService.getInstance()
}

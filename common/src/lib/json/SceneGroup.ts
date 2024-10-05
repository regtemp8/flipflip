import { SceneGroupItem } from "./SceneGroupItem"

export type SceneGroup = {
    id: number
    type: string
    name: string
    items: SceneGroupItem[]
  }
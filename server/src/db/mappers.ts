import { SceneGroup } from 'flipflip-common'
import { SceneGroupItemRow } from './types/SceneGroupItemRow'
import { SceneGroupRow } from './types/SceneGroupRow'

export function toSceneGroups(rows: SceneGroupRow[], type: string) {
  const groups: Record<number, SceneGroup> = {}
  for (const row of rows) {
    let group = groups[row.id as number]
    if (group == null) {
      group = {
        id: row.id as number,
        name: row.name,
        type,
        items: []
      }

      groups[row.id as number] = group
    }

    group.items.push(toSceneGroupItem(row))
  }

  return groups
}

export function toSceneGroupItems(rows: SceneGroupItemRow[]) {
  return rows.map((row) => toSceneGroupItem(row))
}

export function toSceneGroupItem(row: SceneGroupItemRow) {
  return { id: row.itemId as number, name: row.itemName }
}

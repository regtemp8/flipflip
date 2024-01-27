import { newSceneGridCell, type SceneGridCell } from './SceneGridCell';

export type SceneGrid = {
  id: number;
  name?: string;
  grid: SceneGridCell[][];
};

export const initialSceneGrid: SceneGrid = {
  id: 0,
  grid: [[newSceneGridCell()]],
};

export function newSceneGrid(init?: Partial<SceneGrid>) {
  return {
    id: init?.id ?? initialSceneGrid.id,
    name: init?.name,
    grid: mapGrid(init?.grid) ?? initialSceneGrid.grid,
  };
}

function mapGrid(
  grid?: SceneGridCell[][] | number[][] | string[][]
): SceneGridCell[][] | undefined {
  if (grid == null) {
    return undefined;
  }

  return grid.map((r) =>
    r.map((c) => {
      const partial = c as Partial<SceneGridCell>;
      if (partial.sceneID == null) {
        const sceneID = Number.isNaN(c) ? parseInt(c as string) : (c as number);
        return newSceneGridCell({ sceneID });
      } else {
        return newSceneGridCell(partial);
      }
    })
  );
}

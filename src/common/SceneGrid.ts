import SceneGridCell from "./SceneGridCell";

export default class SceneGrid {
  id: number = 0;
  name: string;
  grid: Array<Array<SceneGridCell>> = [[new SceneGridCell()]];

  constructor(init?: Partial<SceneGrid>) {
    Object.assign(this, init);

    this.grid = this.grid.map((r) =>
      r.map((c) =>
        c.sceneID
          ? c
          : new SceneGridCell({ sceneID: Number.parseInt(c as any) }),
      ),
    );
  }
}

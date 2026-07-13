import Tag from "./Tag";

export default class Clip {
  id: number = 0;
  start: number | null = null;
  end: number | null = null;
  volume: number | null = null;
  tags: Array<Tag> = [];

  constructor(init?: Partial<Clip>) {
    Object.assign(this, init);
  }
}

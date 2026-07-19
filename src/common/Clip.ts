import Tag from "./Tag";

export default class Clip {
  id: number = 0;
  start: number = 0;
  end: number = 0;
  volume: number | null = null;
  tags: Array<Tag> = [];

  constructor(init?: Partial<Clip>) {
    Object.assign(this, init);
  }
}

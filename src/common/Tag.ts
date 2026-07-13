export default class Tag {
  id: number = 0;
  name: string | null = null;
  phraseString: string | null = null;

  constructor(init?: Partial<Tag>) {
    Object.assign(this, init);
  }
}

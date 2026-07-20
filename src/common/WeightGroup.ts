export default class WeightGroup {
  percent: number = 0;
  type: string | null = null;
  search: string = "";
  max: number | null = null;
  chosen: number | null = null;
  rules: Array<WeightGroup> = [];

  constructor(init?: Partial<WeightGroup>) {
    Object.assign(this, init);
  }
}

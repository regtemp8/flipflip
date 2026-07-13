export default class WeightGroup {
  percent: number | null = null;
  type: string | null = null;
  search: string | null = null;
  max: number | null = null;
  chosen: number | null = null;
  rules: Array<WeightGroup> | null = null;

  constructor(init?: Partial<WeightGroup>) {
    Object.assign(this, init);
  }
}

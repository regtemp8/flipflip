export type WeightGroupTag = {
  name?: string;
  typeTag?: boolean;
};

export type WeightGroup = {
  percent?: number;
  type: string;
  search?: string;
  max?: number;
  chosen?: number;
  rules?: WeightGroup[];

  // unused; migration only
  tag?: WeightGroupTag;
};

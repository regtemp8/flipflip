export type Clip = {
  id: number;
  disabled: boolean;
  start?: number;
  end?: number;
  volume?: number;
  tags: number[]; // Array of Tag IDs
};

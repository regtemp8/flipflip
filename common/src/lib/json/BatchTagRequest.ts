export type BatchTagOperation = 'add' | 'overwrite' | 'remove';

export type BatchTagRequest = {
  operation: BatchTagOperation;
  ids: number[];
  tags: string[];
};

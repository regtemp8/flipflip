export type ScraperHelpers = {
  next:
    | string
    | number
    | number[]
    | Array<string | number | undefined>
    | undefined;
  count: number;
  retries: number;
  uuid: string;
};

import * as slice from './slice'

export const setDisplayName = (id: number) => (value: string) =>
  slice.setDisplayName({ id, value })

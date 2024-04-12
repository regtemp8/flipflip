import { copy } from 'flipflip-common'
import { EntryState, Identifiable } from '../store/EntryState'

export function incrementIDsList<T extends Identifiable>(
  list: number[],
  slice: EntryState<T>,
  increment: number
) {
  return list.filter((s) => slice.entries[s]).map((s) => s + increment)
}

export function incrementIDValue<T extends Identifiable>(
  value: number,
  slice: EntryState<T>,
  increment: number,
  defaultValue: number
) {
  return slice.entries[value] ? value + increment : defaultValue
}

export function incrementSliceIDs<T extends Identifiable>(
  slice: EntryState<T>,
  increment: number
) {
  const newSlice: EntryState<T> = { name: '', entries: {}, nextID: 0 }
  newSlice.nextID += increment
  const keys = Object.keys(slice.entries).map((k) => Number(k))
  for (const key of keys) {
    const newEntry = copy<T>(slice.entries[key])
    newEntry.id += increment
    newSlice.entries[newEntry.id] = newEntry
  }

  return newSlice
}

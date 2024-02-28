export interface Identifiable {
  id: number
}

export interface EntryState<T extends Identifiable> {
  name: string
  nextID: number
  entries: Record<number, T>
}

export interface EntryUpdate<T> {
  id: number
  value: T
}

export function isEntry<T extends Identifiable>(
  state: EntryState<T>,
  id: number
) {
  return state.entries[id] != null
}

export function setNextID<T extends Identifiable>(
  state: EntryState<T>,
  entry: T
) {
  if (state.nextID <= entry.id) {
    state.nextID = entry.id + 1
  }
}

export function getEntry<T extends Identifiable>(
  state: EntryState<T>,
  id: number
): T {
  return state.entries[id]
}

export function setEntry<T extends Identifiable>(
  state: EntryState<T>,
  entry: T
) {
  state.entries[entry.id] = entry
  setNextID(state, entry)
}

export function createEntry<T extends Identifiable>(
  state: EntryState<T>,
  entry: T
) {
  if (!isEntry(state, entry.id)) {
    state.entries[entry.id] = entry
    setNextID(state, entry)
  } else {
    throw new Error(
      `${state.name}: Create failed. Entry with ID ${entry.id} already exists.`
    )
  }
}

export function createEntries<T extends Identifiable>(
  state: EntryState<T>,
  entries: T[]
) {
  for (const entry of entries) {
    if (isEntry(state, entry.id)) {
      throw new Error(
        `${state.name}: Create failed. Entry with ID ${entry.id} already exists.`
      )
    }
  }

  entries.forEach((s) => (state.entries[s.id] = s))
  const maxID = Math.max(...entries.map((s) => s.id))
  setNextID(state, { id: maxID })
}

export function updateEntry<T extends Identifiable>(
  state: EntryState<T>,
  entry: T
) {
  if (isEntry(state, entry.id)) {
    state.entries[entry.id] = entry
  } else {
    throw new Error(
      `${state.name}: Update failed. Entry with ID ${entry.id} doesn't exist.`
    )
  }
}

export function deleteEntry<T extends Identifiable>(
  state: EntryState<T>,
  id: number
) {
  if (isEntry(state, id)) {
    delete state.entries[id]
  } else {
    throw new Error(
      `${state.name}: Delete failed. Entry with ID ${id} doesn't exist.`
    )
  }
}

export const toNumber = (value?: boolean) => (value === true ? 1 : 0)
export const toNumberOpt = (value?: boolean | string) => {
  if (value == null) {
    return undefined
  } else if (value === true) {
    return 1
  } else if (value === false) {
    return 0
  } else {
    return Number(value)
  }
}
export const toBoolean = (value?: number) => value === 1

export const toStringArray = (value?: string) =>
  value != null ? (JSON.parse(value) as string[]) : []

export const toText = (value: unknown) => JSON.stringify(value)

export const toTextOpt = (value?: unknown) =>
  value != null ? JSON.stringify(value) : undefined

export const sortNumber = (a: number, b: number, ascending: boolean) => {
  if (a === 0 && b !== 0) {
    return 1
  } else if (a !== 0 && b === 0) {
    return -1
  } else {
    let compare = a - b
    if (!ascending) {
      compare *= -1
    }

    return compare
  }
}

export const sortString = (
  a: string,
  b: string,
  ascending: boolean,
  options?: Intl.CollatorOptions
) => {
  if (a === '' && b !== '') {
    return 1
  }

  let compare = a.localeCompare(b, 'en', options)
  if (!ascending) {
    compare *= -1
  }

  return compare
}

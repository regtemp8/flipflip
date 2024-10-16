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

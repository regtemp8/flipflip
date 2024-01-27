/**
 * A Route represents the data needed to display a specific screen.
 *
 * 'Kind' indicates the screen you want to show ('scene', 'play', etc).
 * 'Value' is what specific thing of that kind should be shown (e.g. scene ID).
 */
export default interface Route {
  kind?: string
  value?: any
}

export function newRoute (init?: Partial<Route>) {
  return Object.assign({}, init)
}

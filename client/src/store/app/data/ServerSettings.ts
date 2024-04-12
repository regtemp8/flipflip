export default interface ServerSettings {
  [key: string]: string | number | boolean

  host: string
  port: number
  changed: boolean
  onBlur: boolean
}

export const initialServerSettings: ServerSettings = {
  host: '0.0.0.0',
  port: 59779,
  changed: false,
  onBlur: false
}

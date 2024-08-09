export type FontSettingsType = 'blink' | 'caption' | 'captionBig' | 'count'

export default interface FontSettings {
  [key: string]: string | number | boolean

  color: string
  fontSize: number
  fontFamily: string
  border: boolean
  borderpx: number
  borderColor: string
}

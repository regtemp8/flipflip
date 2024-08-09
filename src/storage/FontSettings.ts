export type FontSettingsType = 'blink' | 'caption' | 'captionBig' | 'count'

export default interface FontSettings {
  color: string
  fontSize: number
  fontFamily: string
  border: boolean
  borderpx: number
  borderColor: string
}

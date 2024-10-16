declare module 'system-font-families' {
  export default class SystemFonts {
    constructor()
    getFonts(): Promise<string[]>
  }
}

export default interface CacheSettings {
  [key: string]: string | number | boolean

  enabled: boolean
  directory: string
  maxSize: number // Size in MB
}

export const initialCacheSettings: CacheSettings = {
  enabled: true,
  directory: '',
  maxSize: 500
}

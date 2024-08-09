import type CaptionScript from './CaptionScript'

export default interface ScriptPlaylist {
  scripts: CaptionScript[]
  shuffle: boolean
  repeat: string
}

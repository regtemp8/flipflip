import { copy, RP } from 'flipflip-common'

import { type CaptionScript } from './CaptionScript'

export type ScriptPlaylist = {
  scripts: CaptionScript[]
  shuffle: boolean
  repeat: string
  name?: string
}

export const initialScriptPlaylist: ScriptPlaylist = {
  scripts: [],
  shuffle: false,
  repeat: RP.all
}

export function newScriptPlaylist(init?: Partial<ScriptPlaylist>) {
  return Object.assign(copy<ScriptPlaylist>(initialScriptPlaylist), init)
}

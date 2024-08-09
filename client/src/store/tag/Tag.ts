import { copy } from 'flipflip-common'

export default interface Tag {
  id: number
  name?: string
  phraseString?: string
}

export const initialTag: Tag = {
  id: 0
}

export function newTag(init?: Partial<Tag>): Tag {
  return Object.assign(copy<Tag>(initialTag), init)
}

import { type AppDispatch, type RootState } from '../store'
import { setCaptionScriptMarked, setCaptionScriptTags } from './slice'

export function setCaptionScriptsTags (
  scriptIDs: number[],
  selectedTags: string[]
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const tags = state.app.tags
      .map((id) => state.tag.entries[id])
      .filter((t) => selectedTags.includes(t.name))
      .map((t) => t.id)

    scriptIDs.forEach((id) =>
      dispatch(setCaptionScriptTags({ id, value: tags }))
    )
  }
}

export function setCaptionScriptsAddTags (
  scriptIDs: number[],
  selectedTags: string[]
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const tags = state.app.tags
      .map((id) => state.tag.entries[id])
      .filter((t) => selectedTags.includes(t.name))
      .map((t) => t.id)

    scriptIDs.forEach((id) => {
      const script = state.captionScript.entries[id]
      const newTags = new Set([...script.tags, ...tags])
      dispatch(setCaptionScriptTags({ id, value: [...newTags] }))
    })
  }
}

export function setCaptionScriptsRemoveTags (
  scriptIDs: number[],
  selectedTags: string[]
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const tags = state.app.tags
      .map((id) => state.tag.entries[id])
      .filter((t) => selectedTags.includes(t.name))
      .map((t) => t.id)

    scriptIDs.forEach((id) => {
      const newTags = state.captionScript.entries[id].tags.filter(
        (id) => !tags.includes(id)
      )
      dispatch(setCaptionScriptTags({ id, value: newTags }))
    })
  }
}

export function setCaptionScriptsToggleMarked (scriptIDs: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const value =
      state.app.scripts
        .map((id) => state.captionScript.entries[id])
        .find((s) => s.marked) == null
    if (!value) {
      scriptIDs = state.app.scripts
    }

    scriptIDs.forEach((id) => dispatch(setCaptionScriptMarked({ id, value })))
  }
}

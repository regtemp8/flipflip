import { getSourceType, VCT, ST } from 'flipflip-common'
import { type RootState, type AppDispatch } from '../store'
import { setVideoClipperState } from './slice'
import { clipVideo, doneTutorial } from '../app/thunks'
import { newClip } from '../clip/Clip'
import { setClip, setClipStartEnd, setClipTags } from '../clip/slice'
import { setLibrarySourceAddClip } from '../librarySource/slice'
import { setVideoClipperSceneVideoVolume } from '../scene/thunks'

export function onVideoClipperAddClip(duration: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    if (state.app.tutorial === VCT.clips) {
      dispatch(doneTutorial(VCT.clips))
    }

    const nextClipID = state.clip.nextID
    const { sourceID, editingValue } = state.videoClipper
    const tags = state.librarySource.entries[sourceID].tags
    dispatch(
      setClip(
        newClip({
          id: nextClipID,
          start: editingValue[0],
          end: editingValue[1],
          tags
        })
      )
    )
    dispatch(setVideoClipperState({ id: nextClipID, start: 0, end: duration }))
  }
}

export function onVideoClipperEditClip(clipID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const clip = state.clip.entries[clipID]
    if (clip.volume != null) {
      dispatch(setVideoClipperSceneVideoVolume(clip.volume))
    }

    const id = clip.id
    const start = clip.start as number
    const end = clip.end as number
    dispatch(setVideoClipperState({ id, start, end }))
  }
}

export function onSaveVideoClip() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    if (state.app.tutorial === VCT.clip) {
      dispatch(doneTutorial(VCT.clip))
    }

    const { sourceID, editingValue } = state.videoClipper
    const editingClipID = state.videoClipper.editingClipID as number
    dispatch(setClipStartEnd({ id: editingClipID, value: editingValue }))
    if (!state.librarySource.entries[sourceID].clips.includes(editingClipID)) {
      dispatch(setLibrarySourceAddClip({ id: sourceID, value: editingClipID }))
    }
  }
}

export function onVideoClipperPrevClip() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(onSaveVideoClip())
    const state = getState()
    const sourceID = state.videoClipper.sourceID
    const editingClipID = state.videoClipper.editingClipID as number
    const clips = state.librarySource.entries[sourceID].clips
    let indexOf = clips.indexOf(editingClipID) - 1
    if (indexOf < 0) {
      indexOf = clips.length - 1
    }

    dispatch(onVideoClipperEditClip(clips[indexOf]))
  }
}

export function onVideoClipperNextClip() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(onSaveVideoClip())
    const state = getState()
    const sourceID = state.videoClipper.sourceID
    const editingClipID = state.videoClipper.editingClipID as number
    const clips = state.librarySource.entries[sourceID].clips
    let indexOf = clips.indexOf(editingClipID) + 1
    if (indexOf >= clips.length) {
      indexOf = 0
    }

    dispatch(onVideoClipperEditClip(clips[indexOf]))
  }
}

export function navigateClipping(offset: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const displayed = state.app.displayedSources
    let newIndexOf = displayed.indexOf(state.videoClipper.sourceID)
    let newSource
    do {
      newIndexOf = newIndexOf + offset
      if (newIndexOf < 0) {
        newIndexOf = displayed.length - 1
      } else if (newIndexOf >= displayed.length) {
        newIndexOf = 0
      }
      newSource = state.librarySource.entries[displayed[newIndexOf]]
    } while (getSourceType(newSource.url) !== ST.video)

    dispatch(clipVideo(displayed[newIndexOf], displayed))
  }
}

export function onVideoClipperInheritTags() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const sourceID = state.videoClipper.sourceID
    const editingClipID = state.videoClipper.editingClipID as number
    const tags = state.librarySource.entries[sourceID].tags
    dispatch(setClipTags({ id: editingClipID, value: tags }))
  }
}

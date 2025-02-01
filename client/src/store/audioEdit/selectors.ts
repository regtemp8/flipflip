import { createSelector } from '@reduxjs/toolkit'
import { type RootState } from '../store'

export const selectAudioEdit = () => {
  return (state: RootState) => state.audioEdit.editing
}

export const selectAudioEditIDs = () => {
  return (state: RootState) => state.audioEdit.ids
}

export const selectAudioEditThumb = () => createSelector(
  [(state: RootState) => state.audioEdit.editing?.thumb],
  (thumb) => ({data: thumb})
)

export const selectAudioEditName = () => createSelector(
  [(state: RootState) => state.audioEdit.editing?.name ?? ''],
  (name) => ({data: name})
)

export const selectAudioEditArtist = () => createSelector(
  [(state: RootState) => state.audioEdit.editing?.artist ?? ''],
  (artist) => ({data: artist})
)

export const selectAudioEditAlbum = () => createSelector(
  [(state: RootState) => state.audioEdit.editing?.album ?? ''],
  (album) => ({data: album})
)

export const selectAudioEditComment = () => createSelector(
  [(state: RootState) => state.audioEdit.editing?.comment ?? ''],
  (comment) => ({data: comment})
)

export const selectAudioEditTrackNum = () => createSelector(
  [(state: RootState) => state.audioEdit.editing?.trackNum ?? 0],
  (trackNum) => ({data: trackNum})
)
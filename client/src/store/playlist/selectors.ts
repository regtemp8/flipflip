import { RootState } from '../store'

export const selectPlaylistEditingName = () => (state: RootState) =>
  state.playlist.editingName

export const selectScenePlaylistItemEditDialog = () => (state: RootState) =>
  state.playlist.scenePlaylistItemEditDialog

import { RootState } from '../store'

export const selectPlaylistEditingName = () => (state: RootState) =>
  state.playlist.editingName

import { RootState } from "../store"

export const selectSourceLibraryEditing = () => {
  return (state: RootState) => state.sourceLibrary.editing
}
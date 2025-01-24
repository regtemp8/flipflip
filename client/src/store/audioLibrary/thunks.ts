import { AppDispatch, RootState } from '../store'
import { setAudioLibraryYOffset } from './slice'

export function saveAudioLibraryYOffset() {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const sortableList = document.getElementById('sortable-list')
    if (sortableList) {
      const scrollElement = sortableList.firstElementChild
      dispatch(setAudioLibraryYOffset(scrollElement?.scrollTop ?? 0))
    }
  }
}

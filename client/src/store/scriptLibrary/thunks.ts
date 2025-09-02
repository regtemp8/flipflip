import { AppDispatch } from '../store'
import { setScriptLibraryYOffset } from './slice'

export function saveScriptLibraryYOffset() {
  return (dispatch: AppDispatch): void => {
    const sortableList = document.getElementById('sortable-list')
    if (sortableList) {
      const scrollElement = sortableList.firstElementChild
      dispatch(setScriptLibraryYOffset(scrollElement?.scrollTop ?? 0))
    }
  }
}

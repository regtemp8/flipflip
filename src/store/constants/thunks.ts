import { type AppDispatch, type RootState } from '../store'
import type SystemConstants from './SystemConstants'
import { setConstants } from './slice'

export function fetchConstants () {
  return async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    const initialState: SystemConstants = await window.flipflip.api.getContext()
    dispatch(setConstants(initialState))
  }
}

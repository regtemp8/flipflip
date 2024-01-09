import { type AppDispatch, type RootState } from '../store'
import { type SystemConstants } from 'flipflip-common'
import { setConstants } from './slice'
import FlipFlipService from '../../FlipFlipService'

export function fetchConstants() {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    const flipflip = FlipFlipService.getInstance()
    const initialState: SystemConstants = await flipflip.api.getContext()
    dispatch(setConstants(initialState))
  }
}

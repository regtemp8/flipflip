import { type RootState } from '../store'

export const selectVideoClipperState = () => {
  return (state: RootState) => state.videoClipper
}

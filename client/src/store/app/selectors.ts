import { type RootState } from '../store'

export const selectSpecialMode = () => {
  return (state: RootState) => state.app.specialMode
}

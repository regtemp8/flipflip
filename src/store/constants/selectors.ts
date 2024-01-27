import { type RootState } from '../store'

export const selectConstants = () => (state: RootState) => state.constants

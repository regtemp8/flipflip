import { type RootState } from '../store'

export const selectAuthenticated = () => {
  return (state: RootState) => state.auth.authenticated
}
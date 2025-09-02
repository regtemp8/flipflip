import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router'
import { LinearProgress } from '@mui/material'
import { useIsAuthenticatedQuery } from '../../store/api/slice'

export default function PrivateRoute({ children }: PropsWithChildren) {
  const { isSuccess, isError, isFetching } = useIsAuthenticatedQuery()
  if (isFetching) {
    return <LinearProgress />
  } else if (isSuccess) {
    return children
  } else if (isError) {
    return <Navigate to="/login" />
  }
}

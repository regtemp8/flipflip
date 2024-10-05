import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { CircularProgress } from '@mui/material'
import { useIsAuthenticatedQuery } from '../../store/api'

export default function PrivateRoute({ children }: PropsWithChildren) {
  const { isSuccess, isError, isFetching } = useIsAuthenticatedQuery()
  if (isFetching) {
    return <CircularProgress />
  } else if (isSuccess) {
    return children
  } else if (isError) {
    return <Navigate to="/login" />
  }
}

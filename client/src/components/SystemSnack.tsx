import { Alert, type AlertColor, Slide, Snackbar } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectAppSystemSnack } from '../store/app/selectors'
import { closeSystemSnack } from '../store/app/slice'

function TransitionUp(props: any) {
  return <Slide {...props} direction="up" />
}

export default function SystemSnack() {
  const dispatch = useAppDispatch()
  const systemSnack = useAppSelector(selectAppSystemSnack())
  const message = systemSnack.message ?? ''
  const severity =
    systemSnack.severity != null
      ? (systemSnack.severity as AlertColor)
      : undefined

  return (
    <Snackbar
      open={systemSnack.open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={2000}
      key={message + new Date()}
      onClose={() => dispatch(closeSystemSnack())}
      TransitionComponent={TransitionUp}
    >
      <Alert onClose={() => dispatch(closeSystemSnack())} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  )
}

import { Alert, type AlertColor, Slide, Snackbar } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectAppSystemSnack } from '../../store/app/selectors'
import { closeMessage } from '../../store/app/slice'

function TransitionUp(props: any) {
  return <Slide {...props} direction="up" />
}

export default function SystemSnack() {
  const dispatch = useAppDispatch()
  const systemSnack = useAppSelector(selectAppSystemSnack())

  return (
    <Snackbar
      open={systemSnack.open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={2000}
      key={systemSnack.message + new Date()}
      onClose={() => dispatch(closeMessage())}
      TransitionComponent={TransitionUp}
    >
      <Alert
        onClose={() => dispatch(closeMessage())}
        severity={systemSnack.severity as AlertColor}
      >
        {systemSnack.message}
      </Alert>
    </Snackbar>
  )
}

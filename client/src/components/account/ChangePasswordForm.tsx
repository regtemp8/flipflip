import { useState, FormEvent } from 'react'
import { Alert, AlertColor, Button, Grid2, TextField } from '@mui/material'
import { AccountChange, Message } from 'flipflip-common'
import { useChangePasswordMutation } from '../../store/api/slice'
import snackbar from '../../data/Snackbar'

function ChangePasswordForm() {
  const [changePassword] = useChangePasswordMutation()
  const [message, setMessage] = useState({
    severity: 'info',
    message: 'Change your password.'
  })
  const [form, setForm] = useState<AccountChange>({
    current: '',
    new: '',
    confirm: ''
  })

  const updateForm = (value: Partial<AccountChange>) => {
    return setForm((prev) => {
      return { ...prev, ...value }
    })
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const { data, error } = await changePassword(form)
      if (data != null) {
        snackbar().showMessage(data)
      } else if (error != null && 'data' in error) {
        const message = (error.data as Message).error as string
        setMessage({ severity: 'error', message })
      }
    } catch (error) {
      // TODO is this necessary?
      console.error('A problem occurred with your fetch operation: ', error)
    } finally {
      setForm({ current: '', new: '', confirm: '' })
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ alignSelf: 'stretch' }}>
      <Grid2 container spacing={2}>
        <Grid2 size={12}>
          <Alert severity={message.severity as AlertColor}>
            {message.message}
          </Alert>
        </Grid2>
        <Grid2 size={12}>
          <TextField
            fullWidth
            type="password"
            id="current-password"
            name="current-password"
            label="Current Password"
            autoComplete="current-password"
            value={form.current}
            onChange={(e) => updateForm({ current: e.target.value })}
          />
        </Grid2>
        <Grid2 size={12}>
          <TextField
            fullWidth
            type="password"
            id="new-password"
            name="new-password"
            label="New Password"
            value={form.new}
            onChange={(e) => updateForm({ new: e.target.value })}
          />
        </Grid2>
        <Grid2 size={12}>
          <TextField
            fullWidth
            type="password"
            id="confirm-password"
            name="confirm-password"
            label="Confirm Password"
            value={form.confirm}
            onChange={(e) => updateForm({ confirm: e.target.value })}
          />
        </Grid2>
        <Grid2 size={12}>
          <Button variant="contained" size="large" fullWidth type="submit">
            Apply password change
          </Button>
        </Grid2>
      </Grid2>
    </form>
  )
}

;(ChangePasswordForm as any).displayName = 'ChangePasswordForm'
export default ChangePasswordForm

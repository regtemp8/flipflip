import { useState, FormEvent } from 'react'
import { Alert, AlertColor, Button, Grid2, TextField } from '@mui/material'
import { AccountChange, Message } from 'flipflip-common'
import { useChangeUsernameMutation } from '../../store/api'
import { useAppDispatch } from '../../store/hooks'
import { showSystemSnack } from '../../store/systemSnack/store'

function ChangeUsernameForm() {
  const dispatch = useAppDispatch()
  const [changeUsername] = useChangeUsernameMutation()
  const [message, setMessage] = useState({
    severity: 'info',
    message: 'Change your username.'
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
      const { data, error } = await changeUsername(form)
      if (data != null) {
        dispatch(showSystemSnack(data))
      } else if (error != null && 'data' in error) {
        const message = (error.data as Message).error as string
        setMessage({ severity: 'error', message })
      }
    } catch (error) {
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
            id="current-username"
            name="current-username"
            label="Current Username"
            autoComplete="username"
            value={form.current}
            onChange={(e) => updateForm({ current: e.target.value })}
          />
        </Grid2>
        <Grid2 size={12}>
          <TextField
            fullWidth
            id="new-username"
            name="new-username"
            label="New Username"
            value={form.new}
            onChange={(e) => updateForm({ new: e.target.value })}
          />
        </Grid2>
        <Grid2 size={12}>
          <TextField
            fullWidth
            id="confirm-username"
            name="confirm-username"
            label="Confirm Username"
            value={form.confirm}
            onChange={(e) => updateForm({ confirm: e.target.value })}
          />
        </Grid2>
        <Grid2 size={12}>
          <Button variant="contained" size="large" fullWidth type="submit">
            Apply username change
          </Button>
        </Grid2>
      </Grid2>
    </form>
  )
}

;(ChangeUsernameForm as any).displayName = 'ChangeUsernameForm'
export default ChangeUsernameForm

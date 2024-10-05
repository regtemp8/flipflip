import { Button, Grid2, TextField } from '@mui/material'
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Credentials } from '../../types/credentials'
import { usePasswordLoginMutation } from '../../store/api'

export default function PasswordForm() {
  const navigate = useNavigate()
  const [passwordLogin] = usePasswordLoginMutation()

  const [form, setForm] = useState<Credentials>({
    username: '',
    password: ''
  })

  const updateForm = (value: Partial<Credentials>) => {
    return setForm((prev) => {
      return { ...prev, ...value }
    })
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const { data } = await passwordLogin(form)
      if (data) {
        navigate('/')
      }
    } catch (error) {
      console.error('A problem occurred with your fetch operation: ', error)
    } finally {
      setForm({ username: '', password: '' })
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ alignSelf: 'stretch' }}>
      <Grid2 container spacing={2}>
        <Grid2 size={12}>
          <TextField
            fullWidth
            id="username"
            name="username"
            label="Username"
            autoComplete="username"
            value={form.username}
            onChange={(e) => updateForm({ username: e.target.value })}
          />
        </Grid2>
        <Grid2 size={12}>
          <TextField
            fullWidth
            type="password"
            name="password"
            id="password"
            label="Password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => updateForm({ password: e.target.value })}
          />
        </Grid2>
        <Grid2 size={12}>
          <Button variant="contained" size="large" fullWidth type="submit">
            Login
          </Button>
        </Grid2>
      </Grid2>
    </form>
  )
}

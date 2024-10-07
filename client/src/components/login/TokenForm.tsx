import { Button, Grid2, TextField } from '@mui/material'
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTokenLoginMutation } from '../../store/api'

export default function TokenForm() {
  const navigate = useNavigate()
  const [tokenLogin] = useTokenLoginMutation()

  const [token, setToken] = useState<string>('')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const { data } = await tokenLogin(token)
      if (data) {
        navigate('/scenes')
      }
    } catch (error) {
      console.error('A problem occurred with your fetch operation: ', error)
    } finally {
      setToken('')
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ alignSelf: 'stretch' }}>
      <Grid2 container spacing={2}>
        <Grid2 size={12}>
          <TextField
            fullWidth
            id="token"
            name="token"
            label="Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
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

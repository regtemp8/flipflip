import {
  Avatar,
  Card,
  Container,
  CardContent,
  Button,
  Typography
} from '@mui/material'
import { CenteredBox } from '../common/CenteredBox'
import PasswordForm from './PasswordForm'
import { useState } from 'react'
import TokenForm from './TokenForm'

export default function Login() {
  const [tokenLogin, setTokenLogin] = useState(false)
  return (
    <Container component="main" maxWidth="sm">
      <Card sx={{ p: 1, mt: 3 }}>
        <CardContent>
          <CenteredBox>
            <Avatar
              src="/img/flipflip_logo.png"
              sx={{ height: 72, width: 72, my: 'auto' }}
            />
            <Typography
              variant="h3"
              component="div"
              marginTop={4}
              marginBottom={2}
            >
              Login
            </Typography>
            {tokenLogin ? <TokenForm /> : <PasswordForm />}
            <Button sx={{ mt: 2 }} onClick={() => setTokenLogin(!tokenLogin)}>
              {tokenLogin
                ? 'Sign in with username and password'
                : 'Sign in with a one-time token'}
            </Button>
          </CenteredBox>
        </CardContent>
      </Card>
    </Container>
  )
}

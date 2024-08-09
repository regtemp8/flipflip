import React, { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  Card,
  Container,
  InputAdornment,
  TextField,
  Typography,
  Button,
  CssBaseline,
  createTheme,
  IconButton,
  ThemeOptions
} from '@mui/material'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import FaceIcon from '@mui/icons-material/Face'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

export default function Login() {
  const [theme, setTheme] = useState<ThemeOptions>()
  const [passwordVisible, setPasswordVisible] = useState(false)

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await fetch('/login-theme')
        const json = await response.json()
        setTheme(json)
      } catch (err) {
        setTheme({})
      }
    }

    fetchTheme()
  }, [])

  return theme != null ? (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={createTheme(theme)}>
        <CssBaseline />
        <Container component="main" maxWidth="xs">
          <Card sx={{ p: 3, mt: 3 }}>
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Avatar
                src="img/flipflip_logo.png"
                sx={{ height: 72, width: 72, mb: 1 }}
              />
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>
              <Box
                component="form"
                action="/login"
                method="post"
                noValidate
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaceIcon />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="start">
                        <IconButton
                          onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                          {passwordVisible ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign In
                </Button>
              </Box>
            </Box>
          </Card>
        </Container>
      </ThemeProvider>
    </StyledEngineProvider>
  ) : (
    <></>
  )
}

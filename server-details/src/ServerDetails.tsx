/// <reference path="./global.d.ts" />
import React, { useEffect, useState } from 'react'
import {
  Avatar,
  Card,
  Container,
  CssBaseline,
  createTheme,
  ThemeOptions,
  CardContent,
  CircularProgress
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { CacheProvider } from '@emotion/react'
import { CenteredBox } from './CenteredBox'
import { NetworkURLTable } from './NetworkURLTable'
import { createEmotionCache } from './server/renderer'

export interface ServerDetailsProps {
  theme?: ThemeOptions
  nonce?: string
}

export default function ServerDetails(props: ServerDetailsProps) {
  const [networkURLs, setNetworkURLs] = useState<
    Array<{ name: string; url: string }>
  >([])

  useEffect(() => {
    window.flipflip?.ipc
      .getNetworkURLs()
      .then((urls: Array<{ name: string; url: string }>) =>
        setNetworkURLs(urls)
      )
  }, [])

  return (
    <CacheProvider value={createEmotionCache(props.nonce)}>
      <ThemeProvider theme={createTheme(props.theme ?? {})}>
        <CssBaseline />
        <Container component="main" maxWidth="sm">
          <Card sx={{ p: 1, mt: 3 }}>
            <CardContent>
              <CenteredBox>
                <Avatar
                  src="img/flipflip_logo.png"
                  sx={{ height: 72, width: 72, mb: 1, my: 'auto' }}
                />
              </CenteredBox>
              {networkURLs.length > 0 ? (
                <NetworkURLTable networkURLs={networkURLs} />
              ) : (
                <CenteredBox sx={{ mt: 3 }}>
                  <CircularProgress />
                </CenteredBox>
              )}
            </CardContent>
          </Card>
        </Container>
      </ThemeProvider>
    </CacheProvider>
  )
}

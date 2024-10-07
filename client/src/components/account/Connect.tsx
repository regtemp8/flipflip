import {
  Card,
  Container,
  Grid2,
  CardContent,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material'
import { CenteredBox } from '../common/CenteredBox'
import { QRCodeSVG } from 'qrcode.react'
import { useGetConnectTokenQuery } from '../../store/api'

function Connect() {
  const { data } = useGetConnectTokenQuery()

  return (
    <Container component="main">
      <Card sx={{ p: 1, mt: 3 }}>
        <CardContent>
          <CenteredBox>
            <Typography
              variant="h3"
              component="div"
              marginTop={4}
              marginBottom={4}
            >
              Connect Devices
            </Typography>
            {data != null ? (
              <Grid2 container spacing={2} alignSelf="stretch">
                <Grid2 size={6}>
                  <CenteredBox>
                    <Typography variant="h6" component="div">
                      Point the camera on your phone or tablet at this code.
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, backgroundColor: 'white' }}
                    >
                      <QRCodeSVG
                        value={`http://localhost:5050/login/token?token=${data}`}
                        size={256}
                      />
                    </Paper>
                  </CenteredBox>
                </Grid2>
                <Grid2 size={6}>
                  <CenteredBox>
                    <Typography variant="h6" component="div">
                      Sign in with a one-time token on another device.
                    </Typography>
                    <Typography
                      component="div"
                      marginBottom={2}
                      sx={{
                        mb: 2,
                        letterSpacing: '0.25em',
                        fontWeight: 'bold',
                        fontSize: {
                          xs: '2.25rem',
                          sm: '3.75rem'
                        }
                      }}
                    >
                      {data}
                    </Typography>
                  </CenteredBox>
                </Grid2>
              </Grid2>
            ) : (
              <CircularProgress />
            )}
          </CenteredBox>
        </CardContent>
      </Card>
    </Container>
  )
}

;(Connect as any).displayName = 'Connect'
export default Connect

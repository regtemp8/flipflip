import { makeStyles } from 'tss-react/mui'
import {
  Card,
  Grid2,
  CardContent,
  Typography,
  Paper,
  useMediaQuery
} from '@mui/material'
import { CenteredBox } from '../common/CenteredBox'
import { QRCodeSVG } from 'qrcode.react'
import { useGetConnectTokenQuery } from '../../store/api/slice'

const useStyles = makeStyles()(() => ({
  overflow: {
    overflow: 'inherit'
  }
}))

function Connect() {
  const { data } = useGetConnectTokenQuery()
  const { classes, theme } = useStyles()
  const bigQR = useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, md: 6, lg: 5 }}>
        <Card classes={{ root: classes.overflow }}>
          <CardContent>
            <CenteredBox>
              <Typography variant="h6" component="div" align="center">
                Point the camera on your phone or tablet at this code.
              </Typography>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: 'white' }}>
                <QRCodeSVG
                  value={`http://localhost:5050/login/token?token=${data}`}
                  size={bigQR ? 256 : 196}
                />
              </Paper>
            </CenteredBox>
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6, lg: 5 }} offset={{ xs: 0, lg: 2 }}>
        <Card classes={{ root: classes.overflow }} sx={{ height: '100%' }}>
          <CardContent>
            <CenteredBox>
              <Typography variant="h6" component="div" align="center">
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
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  )
}

;(Connect as any).displayName = 'Connect'
export default Connect

import {
  Container,
  Card,
  CardContent,
  Grid2,
  Typography,
} from '@mui/material'
import { CenteredBox } from '../common/CenteredBox'
import ChangePasswordForm from './ChangePasswordForm'
import ChangeUsernameForm from './ChangeUsernameForm'

function ManageAccount() {
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
              Manage Account
            </Typography>
            <Grid2 container spacing={2} alignSelf="stretch">
              <Grid2 size={5}>
                <CenteredBox>
                  <ChangeUsernameForm />
                </CenteredBox>
              </Grid2>
              <Grid2 offset={2} size={5}>
                <CenteredBox>
                  <ChangePasswordForm />
                </CenteredBox>
              </Grid2>
            </Grid2>
          </CenteredBox>
        </CardContent>
      </Card>
    </Container>
  )
}

;(ManageAccount as any).displayName = 'ManageAccount'
export default ManageAccount

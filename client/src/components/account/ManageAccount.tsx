import { makeStyles } from 'tss-react/mui'
import { Card, CardContent, Grid2 } from '@mui/material'
import { CenteredBox } from '../common/CenteredBox'
import ChangePasswordForm from './ChangePasswordForm'
import ChangeUsernameForm from './ChangeUsernameForm'

const useStyles = makeStyles()(() => ({
  overflow: {
    overflow: 'inherit'
  }
}))

function ManageAccount() {
  const { classes } = useStyles()
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, md: 6, lg: 5 }}>
        <Card classes={{ root: classes.overflow }}>
          <CardContent>
            <CenteredBox>
              <ChangePasswordForm />
            </CenteredBox>
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6, lg: 5 }} offset={{ xs: 0, lg: 2 }}>
        <Card classes={{ root: classes.overflow }} sx={{ height: '100%' }}>
          <CardContent>
            <CenteredBox>
              <ChangeUsernameForm />
            </CenteredBox>
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  )
}

;(ManageAccount as any).displayName = 'ManageAccount'
export default ManageAccount

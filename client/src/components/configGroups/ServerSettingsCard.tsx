import * as React from 'react'
import { Grid, type Theme, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import BaseTextField from '../common/text/BaseTextField'
import {
  setConfigServerSettingsHost,
  setConfigServerSettingsOnBlur,
  setConfigServerSettingsPort
} from '../../store/app/slice'
import {
  selectAppConfigServerSettingsHost,
  selectAppConfigServerSettingsPort
} from '../../store/app/selectors'
import { useAppDispatch } from '../../store/hooks'

const useStyles = makeStyles()((theme: Theme) => ({
  title: {
    paddingBottom: theme.spacing(1)
  }
}))

function ServerSettingsCard() {
  const dispatch = useAppDispatch()
  const { classes } = useStyles()
  return (
    <>
      <Typography align="center" className={classes.title}>
        Server Settings
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6}>
          <BaseTextField
            variant="standard"
            fullWidth
            label="Host"
            tooltip="The IP Address the server listens on. Listens on all network interfaces (0.0.0.0) by default. To limit access to just this device use localhost (127.0.0.1)."
            selector={selectAppConfigServerSettingsHost()}
            action={setConfigServerSettingsHost}
            onBlur={() => dispatch(setConfigServerSettingsOnBlur(true))}
          />
        </Grid>
        <Grid item xs={6}>
          <BaseTextField
            variant="standard"
            fullWidth
            label="Port"
            tooltip="The port the server listens on. To listen on a random port use 0."
            selector={selectAppConfigServerSettingsPort()}
            action={setConfigServerSettingsPort}
            onBlur={() => dispatch(setConfigServerSettingsOnBlur(true))}
            inputProps={{
              min: 0,
              max: 65535,
              type: 'number'
            }}
          />
        </Grid>
      </Grid>
    </>
  )
}

;(ServerSettingsCard as any).displayName = 'ServerSettingsCard'
export default ServerSettingsCard

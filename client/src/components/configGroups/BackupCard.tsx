import React, { useState } from 'react'
import { cx } from '@emotion/css'

import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid2,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  type Theme,
  Tooltip
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import DeleteIcon from '@mui/icons-material/Delete'
import RestoreIcon from '@mui/icons-material/Restore'
import SaveIcon from '@mui/icons-material/Save'

import { convertFromEpoch, formatBackup } from '../../utils'
import { Backup, GeneralSettings, MO } from 'flipflip-common'
import BaseSwitch from '../common/BaseSwitch'
import {
  setConfigGeneralSettingsAutoBackup,
  setConfigGeneralSettingsAutoCleanBackup,
  setConfigGeneralSettingsAutoBackupDays,
  setConfigGeneralSettingsAutoCleanBackupDays,
  setConfigGeneralSettingsAutoCleanBackupWeeks,
  setConfigGeneralSettingsAutoCleanBackupMonths,
  setConfigGeneralSettingsCleanRetain
} from '../../store/api/thunks'
import {
  useGetGeneralSettingsAutoBackupQuery,
  useGetGeneralSettingsAutoCleanBackupQuery,
  useGetGeneralSettingsAutoBackupDaysQuery,
  useGetGeneralSettingsAutoCleanBackupDaysQuery,
  useGetGeneralSettingsAutoCleanBackupWeeksQuery,
  useGetGeneralSettingsAutoCleanBackupMonthsQuery,
  useGetGeneralSettingsCleanRetainQuery
} from '../../store/api/selectors'
import { useAppDispatch } from '../../store/hooks'
import BaseTextField from '../common/text/BaseTextField'
import {
  useCleanBackupsMutation,
  useCreateBackupMutation,
  useGetBackupsQuery,
  useGetGeneralSettingsQuery,
  useRestoreBackupMutation
} from '../../store/api/slice'
import { showSystemSnack } from '../../store/systemSnack/store'

const useStyles = makeStyles()((theme: Theme) => ({
  buttonGrid: {
    textAlign: 'center'
  },
  chipGrid: {
    paddingTop: theme.spacing(1)
  },
  hideXS: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  showXS: {
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    }
  },
  snackbarIcon: {
    fontSize: 20,
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  snackbarMessage: {
    display: 'flex',
    alignItems: 'center'
  },
  backupDays: {
    width: theme.spacing(16)
  }
}))

function BackupCard() {
  const dispatch = useAppDispatch()

  const [createBackup] = useCreateBackupMutation()
  const [restoreBackup] = useRestoreBackupMutation()
  const [cleanBackups] = useCleanBackupsMutation()
  const { data: backups } = useGetBackupsQuery()
  const { data: generalSettings } = useGetGeneralSettingsQuery()

  const [backup, setBackup] = useState<Backup>()
  const [openMenu, setOpenMenu] = useState<string>()

  const onChangeBackup = (e: SelectChangeEvent) => {
    setBackup(backups?.find((b) => b.id === Number(e.target.value)))
  }

  const onBackup = async () => {
    const { data } = await createBackup()
    if (data != null) {
      dispatch(showSystemSnack(data))
    }
  }

  const onClean = () => {
    setOpenMenu(MO.deleteAlert)
  }

  const onFinishClean = async () => {
    onCloseDialog()
    const {
      cleanRetain,
      autoCleanBackup,
      autoCleanBackupDays,
      autoCleanBackupWeeks,
      autoCleanBackupMonths
    } = generalSettings as GeneralSettings
    const request = autoCleanBackup
      ? { autoCleanBackupDays, autoCleanBackupWeeks, autoCleanBackupMonths }
      : { cleanRetain }
    const { data } = await cleanBackups(request)
    if (data != null) {
      dispatch(showSystemSnack(data))
    }
  }

  const onRestore = () => {
    setBackup((backups as Backup[])[0])
    setOpenMenu(MO.restore)
  }

  const onFinishRestore = async () => {
    onCloseDialog()
    const { data } = await restoreBackup((backup as Backup).id)
    if (data != null) {
      dispatch(showSystemSnack(data))
    }
  }

  const onCloseDialog = () => {
    setOpenMenu(undefined)
  }

  const { classes } = useStyles()
  const hasBackup = backups && backups.length > 0
  return (
    <React.Fragment>
      <Grid2
        container
        spacing={2}
        alignItems="center"
        justifyContent="center"
        className={classes.chipGrid}
      >
        <Grid2 size={'auto'} className={classes.buttonGrid}>
          <BaseSwitch
            label="Auto Backup"
            selector={useGetGeneralSettingsAutoBackupQuery}
            action={setConfigGeneralSettingsAutoBackup}
          />
        </Grid2>
        <Grid2 size={'auto'} className={classes.buttonGrid}>
          <BaseTextField
            className={classes.backupDays}
            disabled={!generalSettings?.autoBackup}
            variant="outlined"
            label="Every"
            margin="dense"
            selector={useGetGeneralSettingsAutoBackupDaysQuery}
            action={setConfigGeneralSettingsAutoBackupDays}
            InputProps={{
              endAdornment: <InputAdornment position="end">Days</InputAdornment>
            }}
            inputProps={{
              min: 1,
              type: 'number'
            }}
          />
        </Grid2>
      </Grid2>
      <Grid2
        container
        spacing={2}
        alignItems="center"
        justifyContent="center"
        className={classes.chipGrid}
      >
        <Tooltip
          disableInteractive
          title="If enabled, backups will be automatically cleaned up. This algorithm will keep the configured amount of backups for each period."
        >
          <Grid2 size={'auto'} className={classes.buttonGrid}>
            <BaseSwitch
              label="Auto Clean"
              selector={useGetGeneralSettingsAutoCleanBackupQuery}
              action={setConfigGeneralSettingsAutoCleanBackup}
            />
          </Grid2>
        </Tooltip>
        <Grid2 size={'auto'} className={classes.buttonGrid}>
          <BaseTextField
            className={classes.backupDays}
            disabled={!generalSettings?.autoCleanBackup}
            variant="outlined"
            label="Keep Last"
            margin="dense"
            selector={useGetGeneralSettingsAutoCleanBackupDaysQuery}
            action={setConfigGeneralSettingsAutoCleanBackupDays}
            InputProps={{
              endAdornment: <InputAdornment position="end">Days</InputAdornment>
            }}
            inputProps={{
              min: 1,
              type: 'number'
            }}
          />
        </Grid2>
        <Grid2 size={'auto'} className={classes.buttonGrid}>
          <BaseTextField
            className={classes.backupDays}
            disabled={!generalSettings?.autoCleanBackup}
            variant="outlined"
            label="Keep Last"
            margin="dense"
            selector={useGetGeneralSettingsAutoCleanBackupWeeksQuery}
            action={setConfigGeneralSettingsAutoCleanBackupWeeks}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">Weeks</InputAdornment>
              )
            }}
            inputProps={{
              min: 1,
              type: 'number'
            }}
          />
        </Grid2>
        <Grid2 size={'auto'} className={classes.buttonGrid}>
          <BaseTextField
            className={classes.backupDays}
            disabled={!generalSettings?.autoCleanBackup}
            variant="outlined"
            label="Keep Last"
            margin="dense"
            selector={useGetGeneralSettingsAutoCleanBackupMonthsQuery}
            action={setConfigGeneralSettingsAutoCleanBackupMonths}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">Months</InputAdornment>
              )
            }}
            inputProps={{
              min: 1,
              type: 'number'
            }}
          />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={2} alignItems="center" justifyContent="center">
        <Grid2 size={'auto'} className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onBackup}
            startIcon={<SaveIcon />}
          >
            Backup Data
          </Button>
        </Grid2>
        <Grid2 size={'auto'} className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            disabled={!hasBackup}
            onClick={onRestore}
            startIcon={<RestoreIcon />}
          >
            Restore Backup
          </Button>
        </Grid2>
        <Grid2 size={'auto'} className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="inherit"
            size="large"
            disabled={backups == null || backups.length <= 1}
            onClick={onClean}
            startIcon={<DeleteIcon />}
          >
            Clean Backups
          </Button>
        </Grid2>
      </Grid2>
      <Grid2
        container
        spacing={2}
        alignItems="center"
        justifyContent="center"
        className={classes.chipGrid}
      >
        <Grid2 size={'auto'} className={classes.buttonGrid}>
          <Chip
            label={`Backups: ${hasBackup ? backups.length : '--'}`}
            color="primary"
            variant="outlined"
          />
        </Grid2>
        <Grid2 size={'auto'} className={cx(classes.buttonGrid, classes.hideXS)}>
          <Chip
            label={`Latest: ${hasBackup ? formatBackup(backups[0]) : '--'}`}
            color="secondary"
            variant="outlined"
          />
        </Grid2>
        <Grid2 size={'auto'} className={cx(classes.buttonGrid, classes.showXS)}>
          <Chip
            label={`Latest: ${
              hasBackup ? convertFromEpoch(backups[0].createdAt) : '--'
            }`}
            color="secondary"
            variant="outlined"
          />
        </Grid2>
      </Grid2>
      <Dialog
        open={openMenu === MO.deleteAlert}
        onClose={onCloseDialog}
        aria-labelledby="remove-all-title"
        aria-describedby="remove-all-description"
      >
        <DialogTitle id="remove-all-title">Clean backups</DialogTitle>
        <DialogContent>
          {generalSettings?.autoCleanBackup && (
            <DialogContentText id="remove-all-description">
              You are about to clean your backups. Backups will be retained
              according to your Auto Clean configuration. The last{' '}
              {generalSettings?.autoCleanBackupDays} daily, last{' '}
              {generalSettings?.autoCleanBackupWeeks} weekly and last{' '}
              {generalSettings?.autoCleanBackupMonths} monthly backups will be
              kept.
            </DialogContentText>
          )}
          {!generalSettings?.autoCleanBackup && (
            <React.Fragment>
              <DialogContentText id="remove-all-description">
                You are about to clean your backups. How many of the most recent
                backups would you like to retain?
              </DialogContentText>
              {generalSettings?.cleanRetain != null && (
                <BaseTextField
                  variant="outlined"
                  label="Keep Last"
                  margin="dense"
                  selector={useGetGeneralSettingsCleanRetainQuery}
                  action={setConfigGeneralSettingsCleanRetain}
                  inputProps={{
                    min: 1,
                    type: 'number'
                  }}
                />
              )}
            </React.Fragment>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={onFinishClean} color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openMenu === MO.restore}
        onClose={onCloseDialog}
        aria-labelledby="restore-title"
        aria-describedby="restore-description"
      >
        <DialogTitle id="restore-title">Restore Backup</DialogTitle>
        <DialogContent>
          <DialogContentText id="restore-description">
            Choose a backup to restore from:
          </DialogContentText>
          {backup && (
            <FormControl variant="standard">
              <InputLabel>Backups</InputLabel>
              <Select
                variant="standard"
                value={backup.id.toString()}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300
                    }
                  }
                }}
                onChange={onChangeBackup}
              >
                {backups?.map((b) => (
                  <MenuItem value={b.id} key={b.id}>
                    {formatBackup(b)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={onFinishRestore} color="primary">
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}

;(BackupCard as any).displayName = 'BackupCard'
export default BackupCard

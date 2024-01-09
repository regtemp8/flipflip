import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slide,
  Snackbar,
  type Theme,
  Tooltip
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import DeleteIcon from '@mui/icons-material/Delete'
import RestoreIcon from '@mui/icons-material/Restore'
import SaveIcon from '@mui/icons-material/Save'

import { convertFromEpoch } from '../../data/utils'
import { MO, SS } from 'flipflip-common'
import BaseSwitch from '../common/BaseSwitch'
import { selectConstants } from '../../store/constants/selectors'
import {
  setConfigGeneralSettingsAutoBackup,
  setConfigGeneralSettingsAutoCleanBackup,
  setConfigGeneralSettingsAutoBackupDays,
  setConfigGeneralSettingsAutoCleanBackupDays,
  setConfigGeneralSettingsAutoCleanBackupWeeks,
  setConfigGeneralSettingsAutoCleanBackupMonths,
  setConfigGeneralSettingsCleanRetain
} from '../../store/app/slice'
import {
  selectAppConfigGeneralSettingsAutoBackup,
  selectAppConfigGeneralSettingsAutoCleanBackup,
  selectAppConfigGeneralSettingsAutoBackupDays,
  selectAppConfigGeneralSettingsAutoCleanBackupDays,
  selectAppConfigGeneralSettingsAutoCleanBackupWeeks,
  selectAppConfigGeneralSettingsAutoCleanBackupMonths,
  selectAppConfigGeneralSettingsCleanRetain
} from '../../store/app/selectors'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  cleanBackups,
  restoreAppStorageFromBackup
} from '../../store/app/thunks'
import BaseTextField from '../common/text/BaseTextField'
import FlipFlipService from '../../FlipFlipService'

const styles = (theme: Theme) =>
  createStyles({
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
  })

function TransitionUp(props: any) {
  return <Slide {...props} direction="up" />
}

function BackupCard(props: WithStyles<typeof styles>) {
  const flipflip = FlipFlipService.getInstance()
  const dispatch = useAppDispatch()
  const { saveDir, pathSep } = useAppSelector(selectConstants())
  const autoBackup = useAppSelector(selectAppConfigGeneralSettingsAutoBackup())
  const autoCleanBackup = useAppSelector(
    selectAppConfigGeneralSettingsAutoCleanBackup()
  )
  const autoCleanBackupDays = useAppSelector(
    selectAppConfigGeneralSettingsAutoCleanBackupDays()
  )
  const autoCleanBackupWeeks = useAppSelector(
    selectAppConfigGeneralSettingsAutoCleanBackupWeeks()
  )
  const autoCleanBackupMonths = useAppSelector(
    selectAppConfigGeneralSettingsAutoCleanBackupMonths()
  )
  const cleanRetain = useAppSelector(
    selectAppConfigGeneralSettingsCleanRetain()
  )

  const [backups, setBackups] = useState<Array<{ url: string; size: number }>>(
    []
  )
  const [backup, setBackup] = useState<{ url: string; size: number }>()
  const [openMenu, setOpenMenu] = useState<string>()
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<string>()
  const [snackbarSeverity, setSnackbarSeverity] = useState<string>()

  useEffect(() => {
    refreshBackups()
  }, [])

  const refreshBackups = () => {
    flipflip.api.getBackups().then((backups) => {
      setBackups(backups)
    })
  }

  const onChangeBackup = (e: SelectChangeEvent) => {
    setBackup(backups.find((b) => b.url === e.target.value))
  }

  const onBackup = async () => {
    try {
      await flipflip.api.backupAppStorage()
      setSnackbarOpen(true)
      setSnackbar('Backup success!')
      setSnackbarSeverity(SS.success)
    } catch (e) {
      // TODO is error ever thrown? need other error handling logic?
      console.error(e)
      setSnackbarOpen(true)
      setSnackbar('Error: ' + e)
      setSnackbarSeverity(SS.error)
    }
    refreshBackups()
  }

  const onClean = () => {
    setBackup(backups[0])
    setOpenMenu(MO.deleteAlert)
  }

  const onFinishClean = async () => {
    onCloseDialog()
    try {
      dispatch(cleanBackups())
      setSnackbarOpen(true)
      setSnackbar('Backup success!')
      setSnackbarSeverity(SS.success)
    } catch (e) {
      // TODO is error ever thrown? need other error handling logic?
      console.error(e)
      setSnackbarOpen(true)
      setSnackbar('Error: ' + e)
      setSnackbarSeverity(SS.error)
    }
    refreshBackups()
  }

  const onRestore = () => {
    setBackup(backups[0])
    setOpenMenu(MO.restore)
  }

  const onFinishRestore = () => {
    onCloseDialog()
    try {
      dispatch(restoreAppStorageFromBackup(saveDir + pathSep + backup?.url))
      setSnackbarOpen(true)
      setSnackbar('Restore success!')
      setSnackbarSeverity(SS.success)
    } catch (e) {
      // TODO is error ever thrown? need other error handling logic?
      console.error(e)
      setSnackbarOpen(true)
      setSnackbar('Error: ' + e)
      setSnackbarSeverity(SS.error)
    }
  }

  const onCloseDialog = () => {
    setOpenMenu(undefined)
    setSnackbarOpen(false)
  }

  const classes = props.classes
  const hasBackup = backups && backups.length > 0
  return (
    <React.Fragment>
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="center"
        className={classes.chipGrid}
      >
        <Grid item xs={'auto'} className={classes.buttonGrid}>
          <BaseSwitch
            label="Auto Backup"
            selector={selectAppConfigGeneralSettingsAutoBackup()}
            action={setConfigGeneralSettingsAutoBackup}
          />
        </Grid>
        <Grid item xs={'auto'} className={classes.buttonGrid}>
          <BaseTextField
            className={classes.backupDays}
            disabled={!autoBackup}
            variant="outlined"
            label="Every"
            margin="dense"
            selector={selectAppConfigGeneralSettingsAutoBackupDays()}
            action={setConfigGeneralSettingsAutoBackupDays}
            InputProps={{
              endAdornment: <InputAdornment position="end">Days</InputAdornment>
            }}
            inputProps={{
              min: 1,
              type: 'number'
            }}
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="center"
        className={classes.chipGrid}
      >
        <Tooltip
          disableInteractive
          title="If enabled, backups will be automatically cleaned up. This algorithm will keep 1 backup for
          each of the configured periods."
        >
          <Grid item xs={'auto'} className={classes.buttonGrid}>
            <BaseSwitch
              label="Auto Clean"
              selector={selectAppConfigGeneralSettingsAutoCleanBackup()}
              action={setConfigGeneralSettingsAutoCleanBackup}
            />
          </Grid>
        </Tooltip>
        <Grid item xs={'auto'} className={classes.buttonGrid}>
          <BaseTextField
            className={classes.backupDays}
            disabled={!autoCleanBackup}
            variant="outlined"
            label="Keep Last"
            margin="dense"
            selector={selectAppConfigGeneralSettingsAutoCleanBackupDays()}
            action={setConfigGeneralSettingsAutoCleanBackupDays}
            InputProps={{
              endAdornment: <InputAdornment position="end">Days</InputAdornment>
            }}
            inputProps={{
              min: 1,
              type: 'number'
            }}
          />
        </Grid>
        <Grid item xs={'auto'} className={classes.buttonGrid}>
          <BaseTextField
            className={classes.backupDays}
            disabled={!autoCleanBackup}
            variant="outlined"
            label="Keep Last"
            margin="dense"
            selector={selectAppConfigGeneralSettingsAutoCleanBackupWeeks()}
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
        </Grid>
        <Grid item xs={'auto'} className={classes.buttonGrid}>
          <BaseTextField
            className={classes.backupDays}
            disabled={!autoCleanBackup}
            variant="outlined"
            label="Keep Last"
            margin="dense"
            selector={selectAppConfigGeneralSettingsAutoCleanBackupMonths()}
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
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={'auto'} className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onBackup}
            startIcon={<SaveIcon />}
          >
            Backup Data
          </Button>
        </Grid>
        <Grid item xs={'auto'} className={classes.buttonGrid}>
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
        </Grid>
        <Grid item xs={'auto'} className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="inherit"
            size="large"
            disabled={backups.length <= 1}
            onClick={onClean}
            startIcon={<DeleteIcon />}
          >
            Clean Backups
          </Button>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="center"
        className={classes.chipGrid}
      >
        <Grid item xs={'auto'} className={classes.buttonGrid}>
          <Chip
            label={`Backups: ${hasBackup ? backups.length : '--'}`}
            color="primary"
            variant="outlined"
          />
        </Grid>
        <Grid
          item
          xs={'auto'}
          className={clsx(classes.buttonGrid, classes.hideXS)}
        >
          <Chip
            label={`Latest: ${
              hasBackup
                ? convertFromEpoch(backups[0].url) +
                  ' (' +
                  Math.round(backups[0].size / 1000) +
                  ' KB)'
                : '--'
            }`}
            color="secondary"
            variant="outlined"
          />
        </Grid>
        <Grid
          item
          xs={'auto'}
          className={clsx(classes.buttonGrid, classes.showXS)}
        >
          <Chip
            label={`Latest: ${
              hasBackup ? convertFromEpoch(backups[0].url) : '--'
            }`}
            color="secondary"
            variant="outlined"
          />
        </Grid>
      </Grid>
      <Dialog
        open={openMenu === MO.deleteAlert}
        onClose={onCloseDialog}
        aria-labelledby="remove-all-title"
        aria-describedby="remove-all-description"
      >
        <DialogTitle id="remove-all-title">Clean backups</DialogTitle>
        <DialogContent>
          {autoCleanBackup && (
            <DialogContentText id="remove-all-description">
              You are about to clean your backups. Backups will be retained
              according to your Auto Clean configuration. A record will be kept
              for each of the last: {autoCleanBackupDays} Days,{' '}
              {autoCleanBackupWeeks} Weeks, {autoCleanBackupMonths} Months.
            </DialogContentText>
          )}
          {!autoCleanBackup && (
            <React.Fragment>
              <DialogContentText id="remove-all-description">
                You are about to clean your backups. How many of the most recent
                backups would you like to retain?
              </DialogContentText>
              {cleanRetain != null && (
                <BaseTextField
                  variant="outlined"
                  label="Keep Last"
                  margin="dense"
                  selector={selectAppConfigGeneralSettingsCleanRetain()}
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
                value={backup.url}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300
                    }
                  }
                }}
                onChange={onChangeBackup}
              >
                {backups.map((b) => (
                  <MenuItem value={b.url} key={b.url}>
                    {convertFromEpoch(b.url)} ({Math.round(b.size / 1000)} KB)
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
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={5000}
        onClose={onCloseDialog}
        TransitionComponent={TransitionUp}
      >
        <Alert onClose={onCloseDialog} severity={snackbarSeverity as any}>
          {snackbar}
        </Alert>
      </Snackbar>
    </React.Fragment>
  )
}

;(BackupCard as any).displayName = 'BackupCard'
export default withStyles(styles)(BackupCard as any)

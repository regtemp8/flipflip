import React, { useEffect, useRef, useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import RestoreIcon from '@mui/icons-material/Restore'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Link,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent
} from '@mui/material'

import { formatBackup } from '../../utils'
import { Backup } from 'flipflip-common'
import { useLocation, useNavigate } from 'react-router'
import {
  useGetBackupsQuery,
  useGetVersionQuery,
  useRestoreBackupMutation,
  useResetDataMutation
} from '../../store/api/slice'

export interface ErrorCardProps {
  error: Error
  info: React.ErrorInfo
  onClearError: () => void
}

export default function ErrorCard(props: ErrorCardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const versionResult = useGetVersionQuery()
  const backupsResult = useGetBackupsQuery()
  const [restoreBackup] = useRestoreBackupMutation()
  const [resetData] = useResetDataMutation()

  const [resetCheck, setResetCheck] = useState(false)
  const [backupCheck, setBackupCheck] = useState(false)
  const [backup, setBackup] = useState<Backup>()
  const [backups, setBackups] = useState<Backup[]>([])

  const _pathname = useRef<string>()

  // clear error when going back
  useEffect(() => {
    if (_pathname.current == null) {
      _pathname.current = location.pathname
    }
    if (_pathname.current !== location.pathname) {
      clearError()
    }
  }, [location.pathname])

  const onSubmitIssue = () => {
    const version = versionResult.data
    const componentStack = (props.info.componentStack ?? '')
      .trim()
      .replace(/\s*in (ForwardRef|div)/g, '')
    let title = props.error.name + ': ' + props.error.message
    const body =
      '[[Please describe the bug and how to reproduce it]]%0D%0A%0D%0A%0D%0AFlipFlip Version: ' +
      version +
      '%0D%0A```%0D%0A' +
      props.error.name +
      ': ' +
      props.error.message +
      '%0D%0A' +
      componentStack.replace(/(\r\n|\r|\n)/g, '%0D%0A') +
      '%0D%0A```'
    const errorComponent = /^\s*in (\w*)/.exec(componentStack)
    if (errorComponent != null) {
      title = errorComponent[1] + ' - ' + title
    }

    const link = `https://github.com/regtemp8/flipflip/issues/new?title=${title}&body=${body}`
    window.open(link, '_blank')?.focus()
  }

  const reset = async () => {
    await resetData()
    window.location.reload()
  }

  const clearError = () => {
    props.onClearError()
    _pathname.current = undefined
    setResetCheck(false)
    setBackupCheck(false)
    setBackup(undefined)
    setBackups([])
  }

  const goBack = () => {
    navigate(-1)
  }

  const onCloseDialog = () => {
    setResetCheck(false)
    setBackupCheck(false)
  }

  const getBackups = async () => {
    const backups = backupsResult.data ?? []
    setBackupCheck(true)
    setBackups(backups)
    setBackup(backups.length > 0 ? backups[0] : undefined)
  }

  const onChangeBackup = (e: SelectChangeEvent<string>) => {
    setBackup(backups.find((b) => b.id === Number(e.target.value)))
  }

  const onFinishRestore = async () => {
    onCloseDialog()
    try {
      const { id } = backup as Backup
      await restoreBackup(id)
      clearError()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Box
      style={{
        overflow: 'auto',
        padding: 8,
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      }}
      className="Error"
    >
      <Typography component={'h2'} variant={'h2'}>
        Mistakes were made ಥ﹏ಥ
      </Typography>
      <Divider />
      <Typography
        style={{ margin: 10 }}
        component={'h5'}
        variant={'h5'}
        color={'error'}
      >
        {props.error.name}: {props.error.message}
      </Typography>
      <Typography
        style={{ whiteSpace: 'pre', marginBottom: 20 }}
        component={'div'}
        variant={'body2'}
        color={'error'}
      >
        {(props.info.componentStack ?? '')
          .trim()
          .replace(/\s*in (ForwardRef|div)/g, '')}
      </Typography>
      <Typography component={'h6'} variant={'h6'}>
        Please consider reporting this bug to our{' '}
        <Link href="#" onClick={onSubmitIssue} underline="hover">
          GitHub
        </Link>
      </Typography>
      <Button
        style={{ margin: 10 }}
        variant={'contained'}
        size={'large'}
        color={'primary'}
        onClick={goBack}
        startIcon={<ArrowBackIcon />}
      >
        Go Back
      </Button>
      <Button
        style={{ margin: 10 }}
        variant={'contained'}
        size={'large'}
        color={'secondary'}
        onClick={getBackups}
        startIcon={<RestoreIcon />}
      >
        Restore Backup
      </Button>
      <Button
        style={{ margin: 10 }}
        variant={'contained'}
        size={'large'}
        onClick={() => {
          setResetCheck(true)
        }}
        startIcon={<HighlightOffIcon />}
      >
        Reset
      </Button>

      {resetCheck && (
        <Dialog open={resetCheck} onClose={onCloseDialog}>
          <DialogTitle>Confirm FlipFlip Reset</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to{' '}
              <u>
                <b>completely reset FlipFlip</b>
              </u>
              ? This will delete your current data (backups/cache will{' '}
              <b>not</b> be effected).
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={reset} color="primary">
              Reset FlipFlip
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {backupCheck && (
        <Dialog
          open={backupCheck}
          onClose={onCloseDialog}
          aria-labelledby="restore-title"
          aria-describedby="restore-description"
        >
          <DialogTitle id="restore-title">Restore Backup</DialogTitle>
          {backups.length > 0 && (
            <React.Fragment>
              <DialogContent>
                <DialogContentText id="restore-description">
                  Choose a backup to restore from:
                </DialogContentText>
                {backup && (
                  <FormControl variant="standard">
                    <InputLabel>Backups</InputLabel>
                    <Select
                      variant="standard"
                      value={`${backup.id}`}
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
            </React.Fragment>
          )}
          {backups.length === 0 && (
            <React.Fragment>
              <DialogContent>
                <DialogContentText id="restore-description">
                  You don't have any backups available
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={onCloseDialog} color="secondary">
                  Cancel
                </Button>
              </DialogActions>
            </React.Fragment>
          )}
        </Dialog>
      )}
    </Box>
  )
}

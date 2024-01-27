import { type MouseEvent, useEffect, useState } from 'react'
import clsx from 'clsx'

import {
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  type Theme,
  Tooltip
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import ClearIcon from '@mui/icons-material/Clear'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'

import { getCachePath, urlToPath } from '../../data/utils'
import BaseSwitch from '../common/BaseSwitch'
import BaseTextField from '../common/text/BaseTextField'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { selectConstants } from '../../../store/constants/selectors'
import {
  setConfigCachingEnabled,
  setConfigCachingDirectory,
  setConfigCachingMaxSize
} from '../../../store/app/slice'
import {
  selectAppConfigCachingEnabled,
  selectAppConfigCachingDirectory,
  selectAppConfigCachingMaxSize
} from '../../../store/app/selectors'

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: '100%'
    },
    paddingLeft: {
      [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(1)
      }
    }
  })

function CacheCard(props: WithStyles<typeof styles>) {
  const dispatch = useAppDispatch()
  const { isWin32 } = useAppSelector(selectConstants())
  const maxSize = useAppSelector(selectAppConfigCachingMaxSize())
  const enabled = useAppSelector(selectAppConfigCachingEnabled())
  const directory = useAppSelector(selectAppConfigCachingDirectory())

  const [cachePath, setCachePath] = useState('')
  const [cacheSize, setCacheSize] = useState('--')
  const [clearCacheAlert, setClearCacheAlert] = useState(false)

  useEffect(() => {
    calculateCacheSize()
  }, [maxSize, directory])

  const calculateCacheSize = async () => {
    const cachePath = (await getCachePath(directory)) as string
    if (maxSize !== 0) {
      if (await window.flipflip.api.pathExists(cachePath)) {
        const size = await window.flipflip.api.getFolderSize(cachePath)
        const mbSize = size / 1024 / 1024
        setCacheSize(mbSize.toFixed(2))
      }
    }

    setCachePath(cachePath)
  }

  const onCloseClear = () => {
    setClearCacheAlert(false)
  }

  const onClearCache = () => {
    setClearCacheAlert(true)
  }

  const onFinishClearCache = async () => {
    await window.flipflip.api.rimrafSync(cachePath)
    setCacheSize('--')
    await calculateCacheSize()
  }

  const onResetCacheDir = (e: MouseEvent) => {
    e.preventDefault()
    dispatch(setConfigCachingDirectory(''))
  }

  const openDirectory = () => {
    if (isWin32) {
      openExternalURL(cachePath)
    } else {
      openExternalURL(urlToPath(cachePath, isWin32))
    }
  }

  const openExternalURL = (url: string) => {
    window.flipflip.api.openExternal(url)
  }

  const classes = props.classes
  return (
    <Grid container spacing={enabled ? 2 : 0} alignItems="center">
      <Grid item xs={12}>
        <Grid container alignItems="center">
          <Grid item xs>
            <BaseSwitch
              label="Caching"
              tooltip="When enabled, FlipFlip will store downloaded images in a local directory to improve future performance and reduce the need re-download files."
              selector={selectAppConfigCachingEnabled()}
              action={setConfigCachingEnabled}
            />
          </Grid>
          <Grid item>
            <Collapse
              in={enabled}
              className={clsx(classes.fullWidth, classes.paddingLeft)}
            >
              <Tooltip disableInteractive title="Clear Cache">
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={onClearCache}
                  size="large"
                >
                  <DeleteSweepIcon color="error" />
                </IconButton>
              </Tooltip>
            </Collapse>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={enabled} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={enabled} className={classes.fullWidth}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <BaseTextField
                variant="standard"
                fullWidth
                label="Caching Directory"
                placeholder={cachePath}
                selector={selectAppConfigCachingDirectory()}
                action={setConfigCachingDirectory}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item>
              <Tooltip disableInteractive title="Reset Cache Directory">
                <IconButton onClick={onResetCacheDir} size="large">
                  <ClearIcon color="error" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <BaseTextField
                variant="standard"
                label="Max Cache Size"
                margin="dense"
                tooltip="The maximum size of the caching directory. After the max is reached, new images won't be kept. Set this to 0 to ignore size."
                selector={selectAppConfigCachingMaxSize()}
                action={setConfigCachingMaxSize}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">MB</InputAdornment>
                  )
                }}
                inputProps={{
                  min: 0,
                  type: 'number'
                }}
              />
            </Grid>
            <Grid item>
              <Chip
                label={`Current: ${cacheSize} MB`}
                color="primary"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
      <Dialog
        open={clearCacheAlert}
        onClose={onCloseClear}
        aria-describedby="clean-cache-description"
      >
        <DialogContent>
          <DialogContentText id="clean-cache-description">
            Are you SURE you want to delete the contents of{' '}
            <Link href="#" onClick={openDirectory} underline="hover">
              {cachePath}
            </Link>{' '}
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseClear} color="secondary">
            Cancel
          </Button>
          <Button onClick={onFinishClearCache} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

;(CacheCard as any).displayName = 'CacheCard'
export default withStyles(styles)(CacheCard as any)

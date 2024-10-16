import { type MouseEvent, useCallback, useEffect, useState } from 'react'
import { cx } from '@emotion/css'

import {
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  Grid2,
  IconButton,
  InputAdornment,
  Link,
  type Theme,
  Tooltip
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import ClearIcon from '@mui/icons-material/Clear'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'

import { urlToPath } from 'flipflip-common'
import BaseSwitch from '../common/BaseSwitch'
import BaseTextField from '../common/text/BaseTextField'
import { useAppDispatch } from '../../store/hooks'
import {
  setConfigCachingEnabled,
  setConfigCachingDirectory,
  setConfigCachingMaxSize
} from '../../store/api/thunks'
import { useGetCacheSettingsQuery } from '../../store/api/slice'
import {
  useGetCachingDirectoryQuery,
  useGetCachingEnabledQuery,
  useGetCachingMaxSizeQuery
} from '../../store/api/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    width: '100%'
  },
  paddingLeft: {
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(1)
    }
  }
}))

function CacheCard() {
  const dispatch = useAppDispatch()
  // const { isWin32 } = useAppSelector(selectConstants())
  const { data } = useGetCacheSettingsQuery()

  const [cachePath, setCachePath] = useState('')
  const [cacheSize, setCacheSize] = useState('--')
  const [clearCacheAlert, setClearCacheAlert] = useState(false)

  // TODO calculate cache size
  // const calculateCacheSize = useCallback(async () => {
  //   const cachePath = (await getCachePath(directory)) as string
  //   if (maxSize !== 0) {
  //     if (await flipflip().api.pathExists(cachePath)) {
  //       const size = await flipflip().api.getFolderSize(cachePath)
  //       const mbSize = size / 1024 / 1024
  //       setCacheSize(mbSize.toFixed(2))
  //     }
  //   }

  //   setCachePath(cachePath)
  // }, [maxSize, directory])

  // useEffect(() => {
  //   calculateCacheSize()
  // }, [calculateCacheSize])

  const onCloseClear = () => {
    setClearCacheAlert(false)
  }

  const onClearCache = () => {
    setClearCacheAlert(true)
  }

  const onFinishClearCache = async () => {
    // TODO clear cache
    // await flipflip().api.rimrafSync(cachePath)
    // setCacheSize('--')
    // await calculateCacheSize()
  }

  const onResetCacheDir = (e: MouseEvent) => {
    e.preventDefault()
    dispatch(setConfigCachingDirectory(''))
  }

  const openDirectory = () => {
    // TODO create directory picker
    // if (isWin32) {
    //   openExternalURL(cachePath)
    // } else {
    //   openExternalURL(urlToPath(cachePath, isWin32))
    // }
  }

  const openExternalURL = (url: string) => {
    window.open(url, '_blank')?.focus()
  }

  const { classes } = useStyles()
  return (
    <Grid2 container spacing={data?.enabled ? 2 : 0} alignItems="center">
      <Grid2 size={12}>
        <Grid2 container alignItems="center">
          <Grid2 size={'grow'}>
            <BaseSwitch
              label="Caching"
              tooltip="When enabled, FlipFlip will store downloaded images in a local directory to improve future performance and reduce the need re-download files."
              selector={useGetCachingEnabledQuery}
              action={setConfigCachingEnabled}
            />
          </Grid2>
          <Grid2>
            <Collapse
              in={data?.enabled}
              className={cx(classes.fullWidth, classes.paddingLeft)}
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
          </Grid2>
        </Grid2>
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={data?.enabled} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={data?.enabled} className={classes.fullWidth}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size="grow">
              <BaseTextField
                variant="standard"
                fullWidth
                label="Caching Directory"
                placeholder={cachePath}
                selector={useGetCachingDirectoryQuery}
                action={setConfigCachingDirectory}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid2>
            <Grid2>
              <Tooltip disableInteractive title="Reset Cache Directory">
                <IconButton onClick={onResetCacheDir} size="large">
                  <ClearIcon color="error" />
                </IconButton>
              </Tooltip>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size="grow">
              <BaseTextField
                variant="standard"
                label="Max Cache Size"
                margin="dense"
                tooltip="The maximum size of the caching directory. After the max is reached, new images won't be kept. Set this to 0 to ignore size."
                selector={useGetCachingMaxSizeQuery}
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
            </Grid2>
            <Grid2>
              <Chip
                label={`Current: ${cacheSize} MB`}
                color="primary"
                variant="outlined"
              />
            </Grid2>
          </Grid2>
        </Collapse>
      </Grid2>
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
    </Grid2>
  )
}

;(CacheCard as any).displayName = 'CacheCard'
export default CacheCard

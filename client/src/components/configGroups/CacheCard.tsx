import { useState } from 'react'
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
  type Theme,
  Tooltip,
  TextField
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import ClearIcon from '@mui/icons-material/Clear'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'

import BaseSwitch from '../common/BaseSwitch'
import BaseTextField from '../common/text/BaseTextField'
import { useAppDispatch } from '../../store/hooks'
import {
  setConfigCachingEnabled,
  setConfigCachingDirectory,
  setConfigCachingMaxSize
} from '../../store/api/thunks'
import {
  useClearCacheMutation,
  useGetCacheSettingsQuery,
  useGetCacheSizeQuery
} from '../../store/api/slice'
import {
  useGetCachingEnabledQuery,
  useGetCachingMaxSizeQuery
} from '../../store/api/selectors'
import FilePicker from '../common/FilePicker'

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
  const { data } = useGetCacheSettingsQuery()
  const { data: cacheSize } = useGetCacheSizeQuery()
  const [clearCache] = useClearCacheMutation()

  const [showFilePicker, setShowFilePicker] = useState(false)
  const [clearCacheAlert, setClearCacheAlert] = useState(false)

  const onCloseClear = () => {
    setClearCacheAlert(false)
  }

  const onClearCache = () => {
    setClearCacheAlert(true)
  }

  const onFinishClearCache = async () => {
    onCloseClear()
    await clearCache()
  }

  const onResetCacheDir = () => {
    dispatch(setConfigCachingDirectory(''))
  }

  const { classes } = useStyles()
  return (
    <Grid2 container spacing={data?.enabled ? 2 : 0} alignItems="center">
      <Grid2 size={12}>
        <Grid2 container alignItems="center">
          <Grid2 size={'grow'}>
            <BaseSwitch
              label="Caching"
              tooltip="When enabled, FlipFlip will store downloaded images in a local directory to improve future performance and reduce the need to re-download files."
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
              <TextField
                variant="standard"
                fullWidth
                label="Caching Directory"
                value={data?.directory ?? ''}
                placeholder={data?.directory || data?.defaultDirectory || ''}
                slotProps={{
                  input: {
                    readOnly: true
                  }
                }}
                onClick={() => setShowFilePicker(true)}
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
                label={`Current: ${(cacheSize?.size ?? 0) > 0 ? cacheSize?.size.toFixed(2) : '--'} MB`}
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
            Are you SURE you want to delete the contents of {data?.directory}?
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
      <FilePicker
        open={showFilePicker}
        type="dir"
        path={data?.directory || data?.defaultDirectory || ''}
        onClose={async (chosenFile?: string) => {
          setShowFilePicker(false)
          if (chosenFile != null) {
            dispatch(setConfigCachingDirectory(chosenFile))
          }
        }}
      />
    </Grid2>
  )
}

;(CacheCard as any).displayName = 'CacheCard'
export default CacheCard

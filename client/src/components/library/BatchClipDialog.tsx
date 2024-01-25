import React, { ChangeEvent, FocusEvent, useState } from 'react'

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  InputAdornment,
  TextField,
  type Theme
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import { getSourceType, ST } from 'flipflip-common'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clipLibrarySource } from '../../store/app/thunks'
import { selectLibrarySourceURLs } from '../../store/librarySource/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
  noScroll: {
    overflow: 'visible'
  },
  progress: {
    position: 'absolute',
    right: 20
  }
}))

export interface BatchClipDialogProps {
  open: boolean
  selected: number[]
  onCloseDialog: () => void
}

function BatchClipDialog(props: BatchClipDialogProps) {
  const dispatch = useAppDispatch()
  const sourceURLs = useAppSelector(selectLibrarySourceURLs(props.selected))
  const [clipOffset, setClipOffset] = useState([0, 0])
  const [creatingClips, setCreatingClips] = useState(false)

  const blurClipOffset = (index: number, e: FocusEvent<HTMLInputElement>) => {
    const min = (e.currentTarget as any).min
      ? (e.currentTarget as any).min
      : null
    const max = (e.currentTarget as any).max
      ? (e.currentTarget as any).max
      : null
    if (min && clipOffset[index] < min) {
      changeClipOffset(index, min)
    } else if (max && clipOffset[index] > max) {
      changeClipOffset(index, max)
    }
  }

  const onClipOffset = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    changeClipOffset(index, e.target.value)
  }

  const changeClipOffset = (index: number, intString: string) => {
    const newClipOffset = Array.from(clipOffset)
    newClipOffset[index] = intString === '' ? 0 : Number(intString)
    setClipOffset(newClipOffset)
  }

  const batchClipFinish = () => {
    let index = -1
    const errorCallback = (msg: string) => {
      console.error(msg)
      createBatchClips()
    }
    const successCallback = (video: HTMLVideoElement, sourceURL: string) => {
      dispatch(clipLibrarySource(sourceURL, video.duration, clipOffset))
      createBatchClips()
    }
    const createBatchClips = () => {
      index++
      if (index === sourceURLs.length) {
        onCloseDialog()
        return
      }

      const sourceURL = sourceURLs[index]
      const type = getSourceType(sourceURL)
      if (type === ST.video) {
        const video = document.createElement('video')
        video.onloadeddata = () => {
          successCallback(video, sourceURL)
        }
        video.onerror = video.onabort = () => {
          errorCallback('Unable to load video: ' + sourceURL)
        }

        video.src = sourceURL
        video.preload = 'auto'
      } else {
        createBatchClips()
      }
    }

    setCreatingClips(true)
    createBatchClips()
  }

  const onCloseDialog = () => {
    setClipOffset([0, 0])
    setCreatingClips(false)
    props.onCloseDialog()
  }

  const { classes } = useStyles()
  return (
    <Dialog
      open={props.open}
      classes={{ paper: classes.noScroll }}
      onClose={onCloseDialog}
      aria-labelledby="batch-clip-title"
      aria-describedby="batch-clip-description"
    >
      <DialogTitle id="batch-clip-title">Batch Clip</DialogTitle>
      <DialogContent className={classes.noScroll}>
        <DialogContentText id="batch-clip-description">
          Choose offsets for new clips
        </DialogContentText>
        {props.open && (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                label="Skip First"
                margin="dense"
                value={clipOffset[0]}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onClipOffset(0, e)
                }
                onBlur={(e: FocusEvent<HTMLInputElement>) =>
                  blurClipOffset(0, e)
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">ms</InputAdornment>
                  )
                }}
                inputProps={{
                  step: 100,
                  min: 0,
                  type: 'number'
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                label="Skip Last"
                margin="dense"
                value={clipOffset[1]}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onClipOffset(1, e)
                }
                onBlur={(e: FocusEvent<HTMLInputElement>) =>
                  blurClipOffset(1, e)
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">ms</InputAdornment>
                  )
                }}
                inputProps={{
                  step: 100,
                  min: 0,
                  type: 'number'
                }}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        {creatingClips && (
          <CircularProgress size={34} className={classes.progress} />
        )}
        <Button onClick={batchClipFinish} color="primary">
          Create Batch Clips
        </Button>
      </DialogActions>
    </Dialog>
  )
}

;(BatchClipDialog as any).displayName = 'BatchClipDialog'
export default BatchClipDialog

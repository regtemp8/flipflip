import React, { MouseEvent, useState } from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  Grid2,
  IconButton,
  type Theme,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import DeleteIcon from '@mui/icons-material/Delete'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setAudioEditAlbum, setAudioEditArtist, setAudioEditComment, setAudioEditEditing, setAudioEditName, setAudioEditThumb, setAudioEditTrackNum, updateAudioEditEditing } from '../../store/audioEdit/slice'
import { selectAudioEditAlbum, selectAudioEditArtist, selectAudioEditComment, selectAudioEditIDs, selectAudioEditName, selectAudioEditThumb, selectAudioEditTrackNum } from '../../store/audioEdit/selectors'
import BaseTextField from '../common/text/BaseTextField'
import { AppDispatch } from '../../store/store'
import { saveAudioEdit } from '../../store/audioEdit/thunks'
import FilePicker from '../common/FilePicker'
import { useLazyGetAudioMetadataQuery, useUploadAudioThumbMutation } from '../../store/api/slice'

const useStyles = makeStyles()((theme: Theme) => ({
  input: {
    width: '100%',
    maxWidth: 365,
    marginRight: theme.spacing(4)
  },
  inputShort: {
    width: 75
  },
  inputFull: {
    width: '100%',
    maxWidth: 530
  },
  pointer: {
    cursor: 'pointer'
  },
  trackThumb: {
    height: 140,
    width: 140,
    overflow: 'hidden',
    display: 'inline-flex',
    justifyContent: 'center',
    position: 'absolute'
  },
  thumbImage: {
    height: '100%'
  },
  deleteThumbButton: {
    backgroundColor: theme.palette.error.main,
    position: 'absolute',
    bottom: '3%',
    right: '6%'
  },
  deleteIcon: {
    color: theme.palette.error.contrastText
  },
  audioIcon: {
    height: '100%',
    width: '100%'
  },
  actions: {
    marginRight: theme.spacing(3)
  }
}))

function AudioEdit() {
  const dispatch = useAppDispatch()
  const [getAudioMetadata] = useLazyGetAudioMetadataQuery()
  const [uploadAudioThumb] = useUploadAudioThumbMutation()
  const ids = useAppSelector(selectAudioEditIDs())
  const { data: name } = useAppSelector(selectAudioEditName())
  const { data: thumb } = useAppSelector(selectAudioEditThumb())

  const [showThumbPicker, setShowThumbPicker] = useState(false)

  const onRemoveThumb = (e: MouseEvent) => {
    dispatch(setAudioEditThumb(undefined))
  }

  const onPickThumb = async (chosenFiles?: string[]) => {
    setShowThumbPicker(false)
    if (chosenFiles?.length === 1) {
      try {
        const {thumb} = await uploadAudioThumb({thumb: chosenFiles[0]}).unwrap()
        dispatch(setAudioEditThumb(thumb))
      } catch(error) {
        console.error('Failed to upload audio thumb', error)
      }
    }
  }

  const loadThumb = async () => {
    setShowThumbPicker(thumb == null)
  }

  const loadSuggestions = async () => {
    if(ids?.length !== 1) {
      return
    }

    const id = ids[0]
    try {
      const metadata = await getAudioMetadata(id).unwrap()
      dispatch(updateAudioEditEditing(metadata))
    } catch(error) {
      console.error('Error getting metadata', error)
    }
  }

  const onCancel = () => {
    dispatch(setAudioEditEditing(undefined))
  }

  const { classes } = useStyles()
  const isBatch = (ids?.length ?? 0) > 1
  const title = `${isBatch ? 'Batch e' : 'E'}dit song info`
  return ids != null && (
    <>
    <Dialog
      open={true}
      onClose={onCancel}
      aria-describedby="edit-description"
    >
      <DialogContent>
        <Typography variant="h6">{title}</Typography>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12 }}>
            <Grid2 container spacing={2}>
              <Grid2 size='grow'>
                <Grid2 container spacing={2}>
                  <Grid2 size={{xs: 12}}>
                    <BaseTextField
                      variant="standard"
                      fullWidth
                      margin="normal"
                      label="Name"
                      selector={() => useAppSelector(selectAudioEditName())}
                      action={(name: string) => (dispatch: AppDispatch) => dispatch(setAudioEditName(name))}
                    />
                  </Grid2>
                  <Grid2 size={{xs: 12}}>
                    <BaseTextField
                      variant="standard"
                      fullWidth
                      margin="normal"
                      label="Artist"
                      selector={() => useAppSelector(selectAudioEditArtist())}
                      action={(artist: string) => (dispatch: AppDispatch) => dispatch(setAudioEditArtist(artist))}
                    />
                  </Grid2>
                </Grid2>
              </Grid2>
              <Grid2 size='auto'>
                <FormControl
                  margin='normal'
                  sx={{width: '140px', height: '140px', cursor: thumb == null ? 'pointer' : 'default'}}
                  onClick={loadThumb}
                >
                  {thumb != null && (
                    <React.Fragment>
                      <IconButton
                        onClick={onRemoveThumb}
                        className={classes.deleteThumbButton}
                        edge="end"
                        size="small"
                        aria-label="delete"
                      >
                        <DeleteIcon className={classes.deleteIcon} color="inherit" />
                      </IconButton>
                      <img
                        className={classes.thumbImage}
                        src={thumb}
                        alt={name}
                      />
                    </React.Fragment>
                  )}
                  {thumb == null && (
                    <AudiotrackIcon className={classes.audioIcon} />
                  )}
                </FormControl>
              </Grid2>
            </Grid2>
          </Grid2>
          <Grid2 size={{xs: 12}}>
            <Grid2 container spacing={2}>
              <Grid2 size='grow'>
                <BaseTextField
                  variant="standard"
                  fullWidth
                  margin="normal"
                  label="Album"
                  selector={() => useAppSelector(selectAudioEditAlbum())}
                  action={(album: string) => (dispatch: AppDispatch) => dispatch(setAudioEditAlbum(album))}
                />
              </Grid2>
              <Grid2 size='auto'>
                <Box sx={{width: '140px'}}>
                <BaseTextField
                  variant="standard"
                  margin="normal"
                  label="Track #"
                  inputProps={{
                    min: 0,
                    type: 'number'
                  }}
                  selector={() => useAppSelector(selectAudioEditTrackNum())}
                  action={(trackNum: number) => (dispatch: AppDispatch) => dispatch(setAudioEditTrackNum(trackNum))}
                />
                </Box>
              </Grid2>
            </Grid2>
          </Grid2>
        </Grid2>


        <BaseTextField
          variant="standard"
          fullWidth
          margin="normal"
          label="Comment"
          multiline
          selector={() => useAppSelector(selectAudioEditComment())}
          action={(comment: string) => (dispatch: AppDispatch) => dispatch(setAudioEditComment(comment))}
        />
      </DialogContent>
      <DialogActions className={classes.actions}>
        {!isBatch && (
          <Button onClick={loadSuggestions}>Use Suggestions</Button>
        )}
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={() => dispatch(saveAudioEdit())} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
    <FilePicker
      open={showThumbPicker}
      type="img"
      path=''
      onClose={onPickThumb}
    />
    </>
  )
}

; (AudioEdit as any).displayName = 'AudioEdit'
export default AudioEdit

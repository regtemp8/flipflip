import React, { ChangeEvent, MouseEvent, useState } from 'react'
import { cx } from '@emotion/css'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
  type Theme,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import DeleteIcon from '@mui/icons-material/Delete'

import { extractMusicMetadata } from '../../data/utils'
import type Audio from '../../store/audio/Audio'
import { newAudio } from '../../store/audio/Audio'
import flipflip from '../../FlipFlipService'

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

export interface AudioEditProps {
  audio: Audio
  cachePath: string
  title: string
  allowSuggestion?: boolean
  onCancel: () => void
  onFinishEdit: (common: Audio) => void
}

function AudioEdit(props: AudioEditProps) {
  const [audio, setAudio] = useState(props.audio)

  const nop = () => {}

  const onEditInt = (key: string, e: ChangeEvent<HTMLInputElement>) => {
    const audioCopy = newAudio(audio)
    audioCopy[key] = parseInt(e.target.value)
    setAudio(audioCopy)
  }

  const onEdit = (key: string, e: ChangeEvent<HTMLInputElement>) => {
    const audioCopy = newAudio(audio)
    audioCopy[key] = e.target.value
    setAudio(audioCopy)
  }

  const onRemoveThumb = (e: MouseEvent) => {
    e.preventDefault()
    const audioCopy = newAudio(audio)
    audioCopy.thumb = undefined
    setAudio(audioCopy)
  }

  const loadThumb = async () => {
    const thumb = await flipflip().api.loadThumb(props.cachePath)
    if (thumb) {
      const audioCopy = newAudio(audio)
      audioCopy.thumb = thumb
      setAudio(audioCopy)
    }
  }

  const loadSuggestions = () => {
    const url = audio.url as string
    flipflip()
      .api.parseMusicMetadataFile(url, props.cachePath)
      .then(async (metadata: any) => {
        return await extractMusicMetadata(newAudio(audio), newAudio(metadata))
      })
      .then((newAudio: Audio) => {
        setAudio(newAudio)
      })
      .catch((err: any) => {
        console.error('Error reading metadata:', err.message)
      })
  }

  const { classes } = useStyles()
  return (
    <Dialog
      open={true}
      onClose={props.onCancel}
      aria-describedby="edit-description"
    >
      <DialogContent>
        <Typography variant="h6">{props.title}</Typography>
        <TextField
          variant="standard"
          className={classes.input}
          value={audio.name == null ? '' : audio.name}
          margin="normal"
          label="Name"
          onChange={(e: ChangeEvent<HTMLInputElement>) => onEdit('name', e)}
        />
        <div
          className={cx(
            classes.trackThumb,
            audio.thumb == null && classes.pointer
          )}
          onClick={audio.thumb == null ? loadThumb : nop}
        >
          {audio.thumb != null && (
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
              <img className={classes.thumbImage} src={audio.thumb} />
            </React.Fragment>
          )}
          {audio.thumb == null && (
            <AudiotrackIcon className={classes.audioIcon} />
          )}
        </div>
        <TextField
          variant="standard"
          className={classes.input}
          value={audio.artist == null ? '' : audio.artist}
          margin="normal"
          label="Artist"
          onChange={(e: ChangeEvent<HTMLInputElement>) => onEdit('artist', e)}
        />
        <TextField
          variant="standard"
          className={classes.input}
          value={audio.album == null ? '' : audio.album}
          margin="normal"
          label="Album"
          onChange={(e: ChangeEvent<HTMLInputElement>) => onEdit('album', e)}
        />
        <TextField
          variant="standard"
          className={classes.inputShort}
          value={audio.trackNum == null ? '' : audio.trackNum}
          margin="normal"
          label="Track #"
          inputProps={{
            min: 0,
            type: 'number'
          }}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onEditInt('trackNum', e)
          }
        />
        <TextField
          variant="standard"
          className={classes.inputFull}
          value={audio.comment == null ? '' : audio.comment}
          margin="normal"
          label="Comment"
          multiline
          onChange={(e: ChangeEvent<HTMLInputElement>) => onEdit('comment', e)}
        />
      </DialogContent>
      <DialogActions className={classes.actions}>
        {props.allowSuggestion && (
          <Button onClick={loadSuggestions}>Use Suggestions</Button>
        )}
        <Button onClick={props.onCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={() => props.onFinishEdit(audio)} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

;(AudioEdit as any).displayName = 'AudioEdit'
export default AudioEdit

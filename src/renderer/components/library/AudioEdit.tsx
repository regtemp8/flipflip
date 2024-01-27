import React, { useState } from 'react'
import clsx from 'clsx'

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

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import DeleteIcon from '@mui/icons-material/Delete'

import { extractMusicMetadata } from '../../data/utils'
import type Audio from '../../../store/audio/Audio'
import { newAudio } from '../../../store/audio/Audio'

const styles = (theme: Theme) =>
  createStyles({
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
  })

export interface AudioEditProps extends WithStyles<typeof styles> {
  audio: Audio
  cachePath: string
  title: string
  allowSuggestion?: boolean
  onCancel: () => void
  onFinishEdit: (common: Audio) => void
}

function AudioEdit (props: AudioEditProps) {
  const [audio, setAudio] = useState(props.audio)

  const nop = () => {}

  const onEditInt = (key: string, e: MouseEvent) => {
    const input = e.target as HTMLInputElement
    const audioCopy = newAudio(audio)
    audioCopy[key] = parseInt(input.value)
    setAudio(audioCopy)
  }

  const onEdit = (key: string, e: MouseEvent) => {
    const input = e.target as HTMLInputElement
    const audioCopy = newAudio(audio)
    audioCopy[key] = input.value
    setAudio(audioCopy)
  }

  const onRemoveThumb = (e: MouseEvent) => {
    e.preventDefault()
    const audioCopy = newAudio(audio)
    audioCopy.thumb = undefined
    setAudio(audioCopy)
  }

  const loadThumb = async () => {
    const thumb = await window.flipflip.api.loadThumb(props.cachePath)
    if (thumb) {
      const audioCopy = newAudio(audio)
      audioCopy.thumb = thumb
      setAudio(audioCopy)
    }
  }

  const loadSuggestions = () => {
    const url = audio.url as string
    window.flipflip.api
      .parseMusicMetadataFile(url, props.cachePath)
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

  const classes = props.classes
  return (
    <Dialog
      open={true}
      onClose={props.onCancel.bind(this)}
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
          onChange={onEdit.bind(this, 'name')}
        />
        <div
          className={clsx(
            classes.trackThumb,
            audio.thumb == null && classes.pointer
          )}
          onClick={audio.thumb == null ? loadThumb.bind(this) : nop}
        >
          {audio.thumb != null && (
            <React.Fragment>
              <IconButton
                onClick={onRemoveThumb.bind(this)}
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
          onChange={onEdit.bind(this, 'artist')}
        />
        <TextField
          variant="standard"
          className={classes.input}
          value={audio.album == null ? '' : audio.album}
          margin="normal"
          label="Album"
          onChange={onEdit.bind(this, 'album')}
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
          onChange={onEditInt.bind(this, 'trackNum')}
        />
        <TextField
          variant="standard"
          className={classes.inputFull}
          value={audio.comment == null ? '' : audio.comment}
          margin="normal"
          label="Comment"
          multiline
          onChange={onEdit.bind(this, 'comment')}
        />
      </DialogContent>
      <DialogActions className={classes.actions}>
        {props.allowSuggestion && (
          <Button onClick={loadSuggestions.bind(this)}>Use Suggestions</Button>
        )}
        <Button onClick={props.onCancel.bind(this)} color="secondary">
          Cancel
        </Button>
        <Button onClick={props.onFinishEdit.bind(this, audio)} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

;(AudioEdit as any).displayName = 'AudioEdit'
export default withStyles(styles)(AudioEdit as any)

import React, { ChangeEvent, MouseEvent } from 'react'
import { cx } from '@emotion/css'

import {
  Badge,
  Checkbox,
  Chip,
  Fab,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import BuildIcon from '@mui/icons-material/Build'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

import { getTimestamp } from '../../data/utils'
import { grey } from '@mui/material/colors'
import SourceIcon from './SourceIcon'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { systemMessage } from '../../store/app/slice'
import { playAudio } from '../../store/scene/thunks'
import TagChip from './TagChip'
import flipflip from '../../FlipFlipService'
import {
  selectAudioAlbum,
  selectAudioArtist,
  selectAudioComment,
  selectAudioDuration,
  selectAudioMarked,
  selectAudioName,
  selectAudioTags,
  selectAudioThumb,
  selectAudioTrackNum,
  selectAudioUrl,
  selectAudioPlayedCount
} from '../../store/audio/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex'
  },
  oddChild: {
    backgroundColor:
      theme.palette.mode === 'light'
        ? (theme.palette.primary as any)['100']
        : grey[900],
    '&:hover': {
      backgroundColor:
        theme.palette.mode === 'light'
          ? (theme.palette.primary as any)['200']
          : '#080808'
    }
  },
  evenChild: {
    backgroundColor:
      theme.palette.mode === 'light'
        ? (theme.palette.primary as any)['50']
        : theme.palette.background.default,
    '&:hover': {
      backgroundColor:
        theme.palette.mode === 'light'
          ? (theme.palette.primary as any)['200']
          : '#080808'
    }
  },
  lastSelected: {
    backgroundColor:
      theme.palette.mode === 'light'
        ? (theme.palette.primary as any)['200']
        : '#0F0F0F'
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'none'
  },
  listAvatar: {
    width: 56
  },
  markedSource: {
    backgroundColor: theme.palette.secondary.main
  },
  sourceIcon: {
    color: theme.palette.primary.contrastText
  },
  sourceMarkedIcon: {
    color: theme.palette.secondary.contrastText
  },
  deleteButton: {
    backgroundColor: theme.palette.error.main
  },
  deleteIcon: {
    color: theme.palette.error.contrastText
  },
  errorIcon: {
    color: theme.palette.error.main,
    backgroundColor: theme.palette.error.contrastText,
    borderRadius: '50%'
  },
  actionButton: {
    marginLeft: theme.spacing(1)
  },
  urlField: {
    width: '100%',
    margin: 0
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid'
  },
  disable: {
    pointerEvents: 'none'
  },
  trackThumb: {
    height: 40,
    width: 40,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none'
  },
  thumbImage: {
    height: '100%'
  },
  trackName: {
    maxWidth: 500,
    minWidth: 250,
    width: '100%',
    userSelect: 'none'
  },
  trackDuration: {
    width: 75,
    textAign: 'end',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(3),
    userSelect: 'none'
  },
  artistContainer: {
    minWidth: 225
  },
  trackArtist: {
    display: 'inline-block',
    userSelect: 'none',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  albumContainer: {
    minWidth: 225
  },
  trackAlbum: {
    userSelect: 'none',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    },
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  bigTooltip: {
    fontSize: 'medium',
    maxWidth: 500
  },
  tagChips: {
    textAlign: 'center'
  },
  listItem: {
    paddingRight: 110
  },
  preLine: {
    whiteSpace: 'pre-line'
  }
}))

export interface AudioSourceListItemProps {
  checked: boolean
  index: number
  isSelect: boolean
  lastSelected: boolean
  audioID: number
  audios: number[]
  style: any
  onClickAlbum: (album: string) => void
  onClickArtist: (artist: string) => void
  onDelete: (audioID: number) => void
  onEditSource: (audioID: number) => void
  onRemove: (audioID: number) => void
  onSourceOptions: (audioID: number) => void
  onToggleSelect: (e: ChangeEvent<HTMLInputElement>, checked: boolean) => void
  savePosition: () => void
}

function AudioSourceListItem(props: AudioSourceListItemProps) {
  const dispatch = useAppDispatch()
  const url = useAppSelector(selectAudioUrl(props.audioID))
  const marked = useAppSelector(selectAudioMarked(props.audioID))
  const trackNum = useAppSelector(selectAudioTrackNum(props.audioID))
  const comment = useAppSelector(selectAudioComment(props.audioID))
  const tags = useAppSelector(selectAudioTags(props.audioID))
  const thumb = useAppSelector(selectAudioThumb(props.audioID))
  const name = useAppSelector(selectAudioName(props.audioID))
  const duration = useAppSelector(selectAudioDuration(props.audioID))
  const album = useAppSelector(selectAudioAlbum(props.audioID))
  const artist = useAppSelector(selectAudioArtist(props.audioID))
  const playedCount = useAppSelector(selectAudioPlayedCount(props.audioID))

  const onSourceIconClick = (e: MouseEvent<HTMLDivElement>) => {
    const sourceURL = url as string
    if (e.shiftKey && e.ctrlKey && e.altKey) {
      props.onDelete(props.audioID)
    } else if (e.shiftKey && !e.ctrlKey) {
      openExternalURL(sourceURL)
    } else if (!e.shiftKey && e.ctrlKey) {
      flipflip().api.showItemInFolder(sourceURL)
    } else if (!e.shiftKey && !e.ctrlKey) {
      props.savePosition()
      try {
        dispatch(playAudio(props.audioID, props.audios))
      } catch (e) {
        dispatch(
          systemMessage('The source ' + sourceURL + " isn't in your Library")
        )
      }
    }
  }

  const openExternalURL = (url: string) => {
    window.open(url, '_blank')?.focus()
  }

  const { classes } = useStyles()
  return (
    <div
      style={props.style}
      className={cx(
        props.index % 2 === 0 ? classes.evenChild : classes.oddChild,
        props.lastSelected && classes.lastSelected
      )}
    >
      <ListItem classes={{ root: classes.listItem }}>
        {props.isSelect && (
          <Checkbox
            value={props.audioID}
            onChange={props.onToggleSelect}
            checked={props.checked}
          />
        )}
        <Badge
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          variant={'dot'}
          invisible={!marked}
          overlap="rectangular"
          color="secondary"
        >
          <ListItemAvatar className={classes.listAvatar}>
            <Badge
              invisible={!trackNum}
              max={999}
              overlap="rectangular"
              color="primary"
              badgeContent={trackNum}
            >
              <Tooltip
                disableInteractive
                placement={comment ? 'right' : 'bottom'}
                classes={comment ? { tooltip: classes.bigTooltip } : undefined}
                arrow={!!comment || tags.length > 0}
                title={
                  comment || tags.length > 0 ? (
                    <div className={classes.preLine}>
                      {comment}
                      {comment && tags.length > 0 && <br />}
                      <div className={classes.tagChips}>
                        {tags &&
                          tags.map((tagID: number) => (
                            <React.Fragment key={tagID}>
                              <TagChip tagID={tagID} />
                            </React.Fragment>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click:
                      Library Tagging
                      <br />
                      Shift+Click: Open Source
                      <br />
                      &nbsp;&nbsp;Ctrl+Click: Reveal File
                    </div>
                  )
                }
              >
                <div onClick={onSourceIconClick} className={classes.trackThumb}>
                  {thumb != null && (
                    <img
                      className={classes.thumbImage}
                      src={thumb}
                      alt={name}
                    />
                  )}
                  {thumb == null && (
                    <Fab
                      size="small"
                      className={cx(
                        classes.avatar,
                        marked && classes.markedSource
                      )}
                    >
                      <SourceIcon
                        url={url}
                        className={cx(
                          classes.sourceIcon,
                          marked && classes.sourceMarkedIcon
                        )}
                      />
                    </Fab>
                  )}
                </div>
              </Tooltip>
            </Badge>
          </ListItemAvatar>
        </Badge>

        <ListItemText classes={{ primary: classes.root }}>
          <Typography noWrap className={classes.trackName}>
            {name}
          </Typography>
          <Typography className={classes.trackDuration}>
            {getTimestamp(duration as number)}
          </Typography>
          {artist && (
            <div
              className={classes.artistContainer}
              onClick={() => props.onClickArtist(artist)}
            >
              <Typography noWrap className={classes.trackArtist}>
                {artist}
              </Typography>
            </div>
          )}
          {album && (
            <div
              className={classes.albumContainer}
              onClick={() => props.onClickAlbum(album)}
            >
              <Typography className={classes.trackAlbum}>{album}</Typography>
            </div>
          )}
        </ListItemText>

        {props.audioID && (
          <ListItemSecondaryAction>
            {playedCount > 0 && (
              <Chip label={playedCount} color="primary" size="small" />
            )}
            <IconButton
              onClick={() => props.onEditSource(props.audioID)}
              className={classes.actionButton}
              edge="end"
              size="small"
              aria-label="edit"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => props.onSourceOptions(props.audioID)}
              className={classes.actionButton}
              edge="end"
              size="small"
              aria-label="options"
            >
              <BuildIcon />
            </IconButton>
            <IconButton
              onClick={() => props.onRemove(props.audioID)}
              className={cx(classes.deleteButton, classes.actionButton)}
              edge="end"
              size="small"
              aria-label="delete"
            >
              <DeleteIcon className={classes.deleteIcon} color="inherit" />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    </div>
  )
}

;(AudioSourceListItem as any).displayName = 'AudioSourceListItem'
export default AudioSourceListItem

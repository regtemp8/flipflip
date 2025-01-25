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
  ListItemText,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import BuildIcon from '@mui/icons-material/Build'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

import { getTimestamp } from '../../utils'
import { grey } from '@mui/material/colors'
import SourceIcon from './SourceIcon'
import TagChip from './TagChip'
import { useGetAudioQuery } from '../../store/api/slice'
import { ST } from 'flipflip-common'

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
  },
  textRight: {
    textAlign: 'right'
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
  // const dispatch = useAppDispatch()
  const { data: audio } = useGetAudioQuery(props.audioID)

  const onSourceIconClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.shiftKey && !e.ctrlKey) {
      window
        .open(audio?.fileUrl, '_blank')
        ?.focus()
    } else if (!e.shiftKey && !e.ctrlKey) {
      // TODO get playAudio to work
      // props.savePosition()
      // try {
      //   dispatch(playAudio(props.audioID, props.audios))
      // } catch (e) {
      //   dispatch(
      //     systemMessage('The source ' + sourceURL + " isn't in your Library")
      //   )
      // }
    }
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
      <ListItem
        classes={{ root: classes.listItem }}
        secondaryAction={
          props.audioID && (
            <>
              {(audio?.playedCount ?? 0) > 0 && (
                <Chip label={audio?.playedCount} color="primary" size="small" />
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
            </>
          )
        }
      >
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
          invisible={!audio?.marked}
          overlap="rectangular"
          color="secondary"
        >
          <ListItemAvatar className={classes.listAvatar}>
            <Badge
              invisible={!audio?.trackNum}
              max={999}
              overlap="rectangular"
              color="primary"
              badgeContent={audio?.trackNum}
            >
              <Tooltip
                disableInteractive
                placement={audio?.comment ? 'right' : 'bottom'}
                classes={
                  audio?.comment ? { tooltip: classes.bigTooltip } : undefined
                }
                arrow={!!audio?.comment || (audio?.tags.length ?? 0) > 0}
                title={
                  audio?.comment || (audio?.tags.length ?? 0) > 0 ? (
                    <div className={classes.preLine}>
                      {audio?.comment}
                      {audio?.comment && audio?.tags.length > 0 && <br />}
                      <div className={classes.tagChips}>
                        {audio?.tags?.map((tagID: number) => (
                          <React.Fragment key={tagID}>
                            <TagChip tagID={tagID} />
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <table>
                      <tr>
                        <td className={classes.textRight}>Click:</td>
                        <td>Play Audio</td>
                      </tr>
                      <tr>
                        <td className={classes.textRight}>Shift+Click:</td>
                        <td>Open Source</td>
                      </tr>
                    </table>
                  )
                }
              >
                <div onClick={onSourceIconClick} className={classes.trackThumb}>
                  {audio?.thumb != null && (
                    <img
                      className={classes.thumbImage}
                      src={audio?.thumb}
                      alt={audio?.name}
                    />
                  )}
                  {audio?.thumb == null && (
                    <Fab
                      size="small"
                      className={cx(
                        classes.avatar,
                        audio?.marked && classes.markedSource
                      )}
                    >
                      <SourceIcon
                        type={audio?.type ?? ''}
                        className={cx(
                          classes.sourceIcon,
                          audio?.marked && classes.sourceMarkedIcon
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
            {audio?.name}
          </Typography>
          <Typography className={classes.trackDuration}>
            {getTimestamp(audio?.duration as number)}
          </Typography>
          {audio?.artist && (
            <div
              className={classes.artistContainer}
              onClick={() => props.onClickArtist(audio?.artist as string)}
            >
              <Typography noWrap className={classes.trackArtist}>
                {audio?.artist}
              </Typography>
            </div>
          )}
          {audio?.album && (
            <div
              className={classes.albumContainer}
              onClick={() => props.onClickAlbum(audio?.album as string)}
            >
              <Typography className={classes.trackAlbum}>
                {audio?.album}
              </Typography>
            </div>
          )}
        </ListItemText>
      </ListItem>
    </div>
  )
}

;(AudioSourceListItem as any).displayName = 'AudioSourceListItem'
export default AudioSourceListItem

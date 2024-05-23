/// <reference path="../../react-sortablejs.d.ts" />
import React, { MouseEvent, useState } from 'react'
import Sortable from 'react-sortablejs'

import {
  Badge,
  Chip,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  type Theme,
  Tooltip
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AddIcon from '@mui/icons-material/Add'
import BuildIcon from '@mui/icons-material/Build'
import DeleteIcon from '@mui/icons-material/Delete'
import RepeatIcon from '@mui/icons-material/Repeat'
import RepeatOneIcon from '@mui/icons-material/RepeatOne'
import ShuffleIcon from '@mui/icons-material/Shuffle'

import { getTimestamp } from '../../data/utils'
import { RP } from 'flipflip-common'
import SourceIcon from '../library/SourceIcon'
import { addTracks } from '../../store/app/slice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import TagChip from '../library/TagChip'
import {
  selectAudioTrackNum,
  selectAudioComment,
  selectAudioTags,
  selectAudioThumb,
  selectAudioName,
  selectAudioUrl,
  selectAudioDuration
} from '../../store/audio/selectors'
import flipflip from '../../FlipFlipService'
import {
  setPlaylistChangeRepeat,
  setPlaylistRemoveItem,
  setPlaylistSortItems,
  setPlaylistToggleShuffle
} from '../../store/playlist/slice'
import { selectPlaylist } from '../../store/playlist/selectors'
import AudioOptions from '../library/AudioOptions'

const useStyles = makeStyles()((theme: Theme) => ({
  audioList: {
    paddingLeft: 0
  },
  mediaIcon: {
    width: '100%',
    height: 'auto'
  },
  thumb: {
    width: theme.spacing(6),
    height: theme.spacing(6)
  },
  playlistAction: {
    textAlign: 'center'
  },
  left: {
    float: 'left',
    paddingLeft: theme.spacing(2)
  },
  right: {
    float: 'right',
    paddingRight: theme.spacing(2)
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
  listAvatar: {
    width: 56
  },
  bigTooltip: {
    fontSize: 'medium',
    maxWidth: 500
  },
  tagChips: {
    textAlign: 'center'
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'none'
  },
  sourceIcon: {
    color: theme.palette.primary.contrastText
  }
}))

interface PlaylistItemProps {
  audioID: number
  audios: number[]
  removeTrack: (index: number) => void
  onSourceOptions: (audioID: number) => void
}

function PlaylistItem(props: PlaylistItemProps) {
  // const dispatch = useAppDispatch()
  const trackNum = useAppSelector(selectAudioTrackNum(props.audioID))
  const comment = useAppSelector(selectAudioComment(props.audioID))
  const tags = useAppSelector(selectAudioTags(props.audioID))
  const thumb = useAppSelector(selectAudioThumb(props.audioID))
  const name = useAppSelector(selectAudioName(props.audioID))
  const url = useAppSelector(selectAudioUrl(props.audioID))
  const duration = useAppSelector(selectAudioDuration(props.audioID))

  const onSourceIconClick = (e: MouseEvent<HTMLDivElement>) => {
    const sourceURL = url as string
    if (e.shiftKey && !e.ctrlKey) {
      flipflip()
        .api.getFileUrl(sourceURL)
        .then((fileURL) => window.open(fileURL, '_blank')?.focus())
    } else if (!e.shiftKey && e.ctrlKey) {
      flipflip().api.showItemInFolder(sourceURL)
    } else if (!e.shiftKey && !e.ctrlKey) {
      // TODO get playAudio to work
      // dispatch(playAudio(props.audioID, props.audios))
    }
  }

  const { classes } = useStyles()
  return (
    <ListItem>
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
            arrow={!!comment || (tags && tags.length > 0)}
            title={
              comment || (tags && tags.length > 0) ? (
                <div>
                  {comment}
                  {comment && tags && tags.length > 0 && <br />}
                  <div className={classes.tagChips}>
                    {tags &&
                      tags.map((tagID) => (
                        <React.Fragment key={tagID}>
                          <TagChip tagID={tagID} />
                        </React.Fragment>
                      ))}
                  </div>
                </div>
              ) : (
                <div>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click:
                  Play Audio
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
                <img className={classes.thumbImage} src={thumb} alt={name} />
              )}
              {thumb == null && (
                <Fab size="small" className={classes.avatar}>
                  <SourceIcon url={url} className={classes.sourceIcon} />
                </Fab>
              )}
            </div>
          </Tooltip>
        </Badge>
      </ListItemAvatar>
      <ListItemText primary={name} />
      <ListItemSecondaryAction>
        <Chip
          label={duration && getTimestamp(duration)}
          color="default"
          size="small"
          variant="outlined"
        />
        <IconButton
          edge="end"
          onClick={() => props.onSourceOptions(props.audioID)}
          size="large"
        >
          <BuildIcon />
        </IconButton>
        <IconButton
          edge="end"
          onClick={() => props.removeTrack(props.audios.indexOf(props.audioID))}
          size="large"
        >
          <DeleteIcon color={'error'} />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export interface AudioPlaylistProps {
  playlistID: number
}

function AudioPlaylist(props: AudioPlaylistProps) {
  const sceneID = 0
  // const [sceneID, setSceneID] = useState<number>(0)
  const [sourceOptions, setSourceOptions] = useState<number>()

  const onSourceOptionsDone = () => {
    setSourceOptions(undefined)
  }
  const onSourceOptions = (audioID: number) => {
    setSourceOptions(audioID)
  }

  const dispatch = useAppDispatch()
  const playlist = useAppSelector(selectPlaylist(props.playlistID))

  const toggleShuffle = () => {
    dispatch(setPlaylistToggleShuffle(props.playlistID))
  }

  const changeRepeat = () => {
    dispatch(setPlaylistChangeRepeat(props.playlistID))
  }

  const removeTrack = (index: number) => {
    dispatch(setPlaylistRemoveItem({ id: props.playlistID, value: index }))
  }

  const { classes } = useStyles()
  return (
    <>
      <List disablePadding>
        <Sortable
          className={classes.audioList}
          options={{
            animation: 150,
            easing: 'cubic-bezier(1, 0, 0, 1)'
          }}
          onChange={(order: any, sortable: any, evt: any) => {
            const { oldIndex, newIndex } = evt
            dispatch(
              setPlaylistSortItems({
                id: props.playlistID,
                value: { oldIndex, newIndex }
              })
            )
          }}
        >
          {playlist.items.map((audioID: number, index: number) => (
            <PlaylistItem
              key={index}
              audioID={audioID}
              audios={playlist.items}
              onSourceOptions={onSourceOptions}
              removeTrack={removeTrack}
            />
          ))}
        </Sortable>
        <div className={classes.playlistAction}>
          <div className={classes.left}>
            <Tooltip
              disableInteractive
              title={'Shuffle ' + (playlist.shuffle ? '(On)' : '(Off)')}
            >
              <IconButton onClick={toggleShuffle} size="large">
                <ShuffleIcon color={playlist.shuffle ? 'primary' : undefined} />
              </IconButton>
            </Tooltip>
            <Tooltip
              disableInteractive
              title={
                'Repeat ' +
                (playlist.repeat === RP.none
                  ? '(Off)'
                  : playlist.repeat === RP.all
                    ? '(All)'
                    : '(One)')
              }
            >
              <IconButton onClick={changeRepeat} size="large">
                {playlist.repeat === RP.none && <RepeatIcon />}
                {playlist.repeat === RP.all && <RepeatIcon color={'primary'} />}
                {playlist.repeat === RP.one && (
                  <RepeatOneIcon color={'primary'} />
                )}
              </IconButton>
            </Tooltip>
          </div>
          <Tooltip disableInteractive title="Add Tracks">
            <IconButton
              onClick={() => dispatch(addTracks(props.playlistID))}
              size="large"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </div>
      </List>
      {sourceOptions != null && (
        <AudioOptions
          sceneID={sceneID}
          audioID={sourceOptions}
          onDone={onSourceOptionsDone}
        />
      )}
    </>
  )
}

;(AudioPlaylist as any).displayName = 'AudioPlaylist'
export default AudioPlaylist

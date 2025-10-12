/// <reference path="../../react-sortablejs.d.ts" />
import { MouseEvent } from 'react'
import Sortable from 'react-sortablejs'

import {
  Badge,
  Chip,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
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

import { getTimestamp /*, isPrimaryModifierKey*/ } from '../../utils'
import { RP } from 'flipflip-common'
import SourceIcon from '../library/SourceIcon'
import TagChip from '../library/TagChip'
import { useGetAudioQuery, useGetPlaylistItemIdsQuery, useGetPlaylistQuery } from '../../store/api/slice'
import { useAppDispatch } from '../../store/hooks'
import { editAudioOptions } from '../../store/audioOptions/thunks'
import { movePlaylistItem, setPlaylistRepeat, setPlaylistShuffle } from '../../store/api/thunks'
import { arrayMove } from 'react-sortable-hoc'

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
  },
  textRight: {
    textAlign: 'right'
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
  const { data: audio } = useGetAudioQuery(props.audioID)

  const onSourceIconClick = (_e: MouseEvent<HTMLDivElement>) => {
    // const sourceURL = url as string
    // if (e.shiftKey && !isPrimaryModifierKey(e)) {
    //   flipflip()
    //     .api.getFileUrl(sourceURL)
    //     .then((fileURL) => window.open(fileURL, '_blank')?.focus())
    // } else if (!e.shiftKey && isPrimaryModifierKey(e)) {
    //   flipflip().api.showItemInFolder(sourceURL)
    // } else if (!e.shiftKey && !isPrimaryModifierKey(e)) {
    //   // TODO get playAudio to work
    //   // dispatch(playAudio(props.audioID, props.audios))
    // }
  }

  const { classes } = useStyles()
  return (
    <ListItem
      secondaryAction={
        <>
          <Chip
            label={audio?.duration && getTimestamp(audio?.duration)}
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
            onClick={() =>
              props.removeTrack(props.audios.indexOf(props.audioID))
            }
            size="large"
          >
            <DeleteIcon color={'error'} />
          </IconButton>
        </>
      }
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
            arrow={!!audio?.comment || (audio?.tags?.length ?? 0) > 0}
            title={
              audio?.comment || (audio?.tags?.length ?? 0) > 0 ? (
                <div>
                  {audio?.comment}
                  {audio?.comment && (audio?.tags?.length ?? 0) > 0 && <br />}
                  <div className={classes.tagChips}>
                    {audio?.tags &&
                      audio?.tags.map((tagID) => (
                        <TagChip key={tagID} tagID={tagID} />
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
                  <tr>
                    <td className={classes.textRight}>Ctrl+Click:</td>
                    <td>Reveal File</td>
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
                <Fab size="small" className={classes.avatar}>
                  <SourceIcon
                    type={audio?.type ?? ''}
                    className={classes.sourceIcon}
                  />
                </Fab>
              )}
            </div>
          </Tooltip>
        </Badge>
      </ListItemAvatar>
      <ListItemText primary={audio?.name} />
    </ListItem>
  )
}

export interface AudioPlaylistProps {
  playlistID: number
}

function AudioPlaylist(props: AudioPlaylistProps) {
  const dispatch = useAppDispatch()
  const { playlistID } = props
  const { data: playlist } = useGetPlaylistQuery(playlistID)
  const { data: itemIDs } = useGetPlaylistItemIdsQuery(playlistID)

  const onSourceOptions = (audioID: number) => {
    dispatch(editAudioOptions(audioID))
  }

  const toggleShuffle = () => {
    dispatch(setPlaylistShuffle(playlistID, !playlist?.shuffle))
  }

  const changeRepeat = () => {
    switch (playlist?.repeat) {
      case RP.all:
        dispatch(setPlaylistRepeat(playlistID, RP.one))
        break
      case RP.one:
        dispatch(setPlaylistRepeat(playlistID, RP.none))
        break
      case RP.none:
        dispatch(setPlaylistRepeat(playlistID, RP.all))
        break
    }
  }

  const removeTrack = (_index: number) => {
    // dispatch(setPlaylistRemoveItem({ id: props.playlistID, value: index }))
  }

  const { classes } = useStyles()
  return (
    <>
      <List disablePadding>
        <Sortable
          id="audio-playlist-items"
          className={classes.audioList}
          options={{
            animation: 150,
            easing: 'cubic-bezier(1, 0, 0, 1)'
          }}
          onChange={(_order: any, _sortable: any, evt: any) => {
            const newItemIDs = arrayMove(
              itemIDs as number[],
              evt.oldIndex,
              evt.newIndex
            )
            dispatch(movePlaylistItem(playlistID, newItemIDs))
          }}
        >
          {playlist?.items.map((audioID: number, index: number) => (
            <PlaylistItem
              key={index}
              audioID={audioID}
              audios={playlist?.items}
              onSourceOptions={onSourceOptions}
              removeTrack={removeTrack}
            />
          ))}
        </Sortable>
        <div className={classes.playlistAction}>
          <div className={classes.left}>
            <Tooltip
              disableInteractive
              title={'Shuffle ' + (playlist?.shuffle ? '(On)' : '(Off)')}
            >
              <IconButton onClick={toggleShuffle} size="large">
                <ShuffleIcon
                  color={playlist?.shuffle ? 'primary' : undefined}
                />
              </IconButton>
            </Tooltip>
            <Tooltip
              disableInteractive
              title={
                'Repeat ' +
                (playlist?.repeat === RP.none
                  ? '(Off)'
                  : playlist?.repeat === RP.all
                    ? '(All)'
                    : '(One)')
              }
            >
              <IconButton onClick={changeRepeat} size="large">
                {playlist?.repeat === RP.none && <RepeatIcon />}
                {playlist?.repeat === RP.all && (
                  <RepeatIcon color={'primary'} />
                )}
                {playlist?.repeat === RP.one && (
                  <RepeatOneIcon color={'primary'} />
                )}
              </IconButton>
            </Tooltip>
          </div>
          <Tooltip disableInteractive title="Add Tracks">
            <IconButton
              onClick={() => { } /*dispatch(addTracks(props.playlistID))*/}
              size="large"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </div>
      </List>
    </>
  )
}

; (AudioPlaylist as any).displayName = 'AudioPlaylist'
export default AudioPlaylist

import React, { MouseEvent, useEffect, useState } from 'react'
import Sortable from 'react-sortablejs'

import {
  Avatar,
  Badge,
  Chip,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  type Theme,
  Tooltip
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AddIcon from '@mui/icons-material/Add'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import BuildIcon from '@mui/icons-material/Build'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import RepeatIcon from '@mui/icons-material/Repeat'
import RepeatOneIcon from '@mui/icons-material/RepeatOne'
import ShuffleIcon from '@mui/icons-material/Shuffle'

import { arrayMove, getTimestamp, randomizeList } from '../../data/utils'
import { RP } from 'flipflip-common'
import AudioControl from './AudioControl'
import SourceIcon from '../library/SourceIcon'
import { setAudioVolume } from '../../store/audio/actions'
import { addTracks } from '../../store/app/slice'
import {
  setSceneAudioPlaylistToggleShuffle,
  setSceneAudioPlaylistChangeRepeat,
  setSceneRemoveAudioPlaylist,
  setSceneAudioPlaylistRemoveAudio,
  setSceneAudioPlaylistSwapAudios
} from '../../store/scene/slice'
import { playAudio } from '../../store/scene/thunks'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { orderAudioTags } from '../../store/tag/thunks'
import TagChip from '../library/TagChip'
import {
  selectSceneIsAudioScene,
  selectSceneAudioEnabled,
  selectSceneAudioStartIndex,
  selectSceneAudioPlaylistDuration
} from '../../store/scene/selectors'
import {
  selectAudioTrackNum,
  selectAudioComment,
  selectAudioTags,
  selectAudioThumb,
  selectAudioName,
  selectAudioUrl,
  selectAudioDuration
} from '../../store/audio/selectors'
import { default as AudioPlaylistData } from '../../store/scene/AudioPlaylist'
import flipflip from '../../FlipFlipService'

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

interface AudioListItemProps {
  audioID: number
}

function AudioListItem(props: AudioListItemProps) {
  const name = useAppSelector(selectAudioName(props.audioID))
  const thumb = useAppSelector(selectAudioThumb(props.audioID))

  return (
    <ListItem disableGutters>
      <ListItemIcon>
        <Avatar alt={name} src={thumb} className={props.classes.thumb}>
          {thumb == null && (
            <AudiotrackIcon className={props.classes.mediaIcon} />
          )}
        </Avatar>
      </ListItemIcon>
      <ListItemText primary={name} />
    </ListItem>
  )
}

interface PlaylistItemProps {
  audioID: number
  audios: number[]
  removeTrack: (audioID: number) => void
  onSourceOptions: (audioID: number) => void
}

function PlaylistItem(props: PlaylistItemProps) {
  const dispatch = useAppDispatch()
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
      window.open(url, '_blank')?.focus()
    } else if (!e.shiftKey && e.ctrlKey) {
      flipflip().api.showItemInFolder(sourceURL)
    } else if (!e.shiftKey && !e.ctrlKey) {
      dispatch(playAudio(props.audioID, props.audios))
    }
  }

  const {classes} = useStyles()
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
                <img className={classes.thumbImage} src={thumb} />
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
          onClick={() => props.removeTrack(props.audioID)}
          size="large"
        >
          <DeleteIcon color={'error'} />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export interface AudioPlaylistProps {
  sceneID: number
  playlistIndex: number
  playlist: AudioPlaylistData
  startPlaying: boolean
  onAddTracks: (playlistIndex: number) => void
  onSourceOptions: (audioID: number) => void
  persist?: boolean
  shorterSeek?: boolean
  showMsTimestamp?: boolean
  scenePaths?: any[]
  goBack?: () => void
  onPlaying?: (position: number, duration: number) => void
  setCurrentAudio?: (audioID: number) => void
}

function AudioPlaylist(props: AudioPlaylistProps) {
  const dispatch = useAppDispatch()
  const isAudioScene = useAppSelector(selectSceneIsAudioScene(props.sceneID))
  const audioEnabled = useAppSelector(selectSceneAudioEnabled(props.sceneID))
  const audioStartIndex = useAppSelector(
    selectSceneAudioStartIndex(props.sceneID)
  )
  const audioPlaylistDuration = useAppSelector(
    selectSceneAudioPlaylistDuration(props.sceneID, props.playlistIndex)
  )

  const [currentIndex, setCurrentIndex] = useState(
    props.playlistIndex === 0 ? audioStartIndex : 0
  )
  const [playingAudios, setPlayingAudios] = useState<number[]>([])

  useEffect(() => {
    if (props.playlistIndex === 0 && isAudioScene) {
      window.addEventListener('keydown', onKeyDown, false)
    }
    restart()

    return () => {
      if (props.playlistIndex === 0 && isAudioScene) {
        window.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [])

  useEffect(() => {
    if (!props.persist) {
      restart()
    }
  }, [props.persist, props.sceneID])

  const restart = () => {
    let audios = props.playlist.audios
    if (props.startPlaying) {
      if (props.playlist.shuffle) {
        audios = randomizeList(Array.from(audios))
      }
      setPlayingAudios(audios)
    }
    if (props.setCurrentAudio) {
      let audio = audios[currentIndex]
      if (!audio) audio = props.playlist.audios[currentIndex]
      props.setCurrentAudio(audio)
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case '[':
        e.preventDefault()
        dispatch(orderAudioTags(props.playlist.audios[currentIndex]))
        prevTrack()
        break
      case ']':
        e.preventDefault()
        dispatch(orderAudioTags(props.playlist.audios[currentIndex]))
        nextTrack()
        break
    }
  }

  const prevTrack = () => {
    let prevTrack = currentIndex - 1
    if (prevTrack < 0) {
      prevTrack = playingAudios.length - 1
    }
    if (props.setCurrentAudio) {
      props.setCurrentAudio(playingAudios[prevTrack])
    }
    setCurrentIndex(prevTrack)
  }

  const nextTrack = () => {
    let nextTrack = currentIndex + 1
    if (nextTrack >= playingAudios.length) {
      nextTrack = 0
    }
    if (props.setCurrentAudio) {
      props.setCurrentAudio(playingAudios[nextTrack])
    }
    setCurrentIndex(nextTrack)
  }

  const toggleShuffle = () => {
    dispatch(
      setSceneAudioPlaylistToggleShuffle({
        id: props.sceneID,
        value: props.playlistIndex
      })
    )
  }

  const changeRepeat = () => {
    dispatch(
      setSceneAudioPlaylistChangeRepeat({
        id: props.sceneID,
        value: props.playlistIndex
      })
    )
  }

  const removePlaylist = () => {
    dispatch(
      setSceneRemoveAudioPlaylist({
        id: props.sceneID,
        value: props.playlistIndex
      })
    )
  }

  const removeTrack = (audioID: number) => {
    const audioIndex = props.playlist.audios.indexOf(audioID)
    dispatch(
      setSceneAudioPlaylistRemoveAudio({
        id: props.sceneID,
        value: { playlistIndex: props.playlistIndex, audioIndex }
      })
    )
  }

  const {classes} = useStyles()
  if (props.startPlaying) {
    let audioID = playingAudios[currentIndex]
    if (!audioID) audioID = props.playlist.audios[currentIndex]
    if (!audioID) return <div />
    return (
      <React.Fragment>
        <AudioListItem audioID={audioID} classes={classes} />
        <AudioControl
          sceneID={props.sceneID}
          audioID={audioID}
          audioEnabled={audioEnabled || props.persist}
          singleTrack={playingAudios.length === 1}
          lastTrack={currentIndex === playingAudios.length - 1}
          repeat={props.playlist.repeat}
          scenePaths={props.scenePaths}
          shorterSeek={props.shorterSeek}
          showMsTimestamp={props.showMsTimestamp}
          startPlaying={props.startPlaying}
          nextTrack={nextTrack}
          prevTrack={prevTrack}
          onPlaying={props.onPlaying}
          audioVolumeAction={setAudioVolume(playingAudios[currentIndex])}
          goBack={props.goBack}
        />
        <div className={classes.playlistAction}>
          <Tooltip
            disableInteractive
            title={'Shuffle ' + (props.playlist.shuffle ? '(On)' : '(Off)')}
          >
            <IconButton onClick={toggleShuffle} size="large">
              <ShuffleIcon
                color={props.playlist.shuffle ? 'primary' : undefined}
              />
            </IconButton>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={
              'Repeat ' +
              (props.playlist.repeat === RP.none
                ? '(Off)'
                : props.playlist.repeat === RP.all
                  ? '(All)'
                  : '(One)')
            }
          >
            <IconButton onClick={changeRepeat} size="large">
              {props.playlist.repeat === RP.none && <RepeatIcon />}
              {props.playlist.repeat === RP.all && (
                <RepeatIcon color={'primary'} />
              )}
              {props.playlist.repeat === RP.one && (
                <RepeatOneIcon color={'primary'} />
              )}
            </IconButton>
          </Tooltip>
        </div>
      </React.Fragment>
    )
  } else {
    return (
      <List disablePadding>
        <Sortable
          className={classes.audioList}
          options={{
            animation: 150,
            easing: 'cubic-bezier(1, 0, 0, 1)'
          }}
          onChange={(order: any, sortable: any, evt: any) => {
            const newAudios = Array.from(props.playlist.audios)
            arrayMove(newAudios, evt.oldIndex, evt.newIndex)
            dispatch(
              setSceneAudioPlaylistSwapAudios({
                id: props.sceneID,
                value: {
                  playlistIndex: props.playlistIndex,
                  oldIndex: evt.oldIndex,
                  newIndex: evt.newIndex
                }
              })
            )
          }}
        >
          {props.playlist &&
            props.playlist.audios &&
            props.playlist.audios.map((audioID: number, index: number) => (
              <PlaylistItem
                key={index}
                audioID={audioID}
                audios={props.playlist.audios}
                onSourceOptions={props.onSourceOptions}
                removeTrack={removeTrack}
                classes={classes}
              />
            ))}
        </Sortable>
        <div className={classes.playlistAction}>
          <div className={classes.left}>
            <Tooltip
              disableInteractive
              title={'Shuffle ' + (props.playlist.shuffle ? '(On)' : '(Off)')}
            >
              <IconButton onClick={toggleShuffle} size="large">
                <ShuffleIcon
                  color={props.playlist.shuffle ? 'primary' : undefined}
                />
              </IconButton>
            </Tooltip>
            <Tooltip
              disableInteractive
              title={
                'Repeat ' +
                (props.playlist.repeat === RP.none
                  ? '(Off)'
                  : props.playlist.repeat === RP.all
                    ? '(All)'
                    : '(One)')
              }
            >
              <IconButton onClick={changeRepeat} size="large">
                {props.playlist.repeat === RP.none && <RepeatIcon />}
                {props.playlist.repeat === RP.all && (
                  <RepeatIcon color={'primary'} />
                )}
                {props.playlist.repeat === RP.one && (
                  <RepeatOneIcon color={'primary'} />
                )}
              </IconButton>
            </Tooltip>
          </div>
          <Tooltip disableInteractive title="Add Tracks">
            <IconButton
              onClick={() => dispatch(addTracks(props.playlistIndex))}
              size="large"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <div className={classes.right}>
            <Chip
              label={getTimestamp(audioPlaylistDuration)}
              color="default"
              size="small"
              variant="outlined"
            />
            <Tooltip disableInteractive title="Remove Playlist">
              <IconButton onClick={removePlaylist} size="large">
                <ClearIcon color={'error'} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </List>
    )
  }
}

;(AudioPlaylist as any).displayName = 'AudioPlaylist'
export default AudioPlaylist

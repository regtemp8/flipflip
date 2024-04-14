/// <reference path="../../react-sortablejs.d.ts" />
import React, { MouseEvent, useState } from 'react'
import Sortable from 'react-sortablejs'

import {
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

import { RP } from 'flipflip-common'
import SourceIcon from '../library/SourceIcon'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addScript } from '../../store/app/slice'
import { selectCaptionScriptUrl } from '../../store/captionScript/selectors'
import flipflip from '../../FlipFlipService'
import { selectPlaylist } from '../../store/playlist/selectors'
import {
  setPlaylistChangeRepeat,
  setPlaylistRemoveItem,
  setPlaylistSortItems,
  setPlaylistToggleShuffle
} from '../../store/playlist/slice'
import ScriptOptions from '../library/ScriptOptions'

const useStyles = makeStyles()((theme: Theme) => ({
  scriptList: {
    paddingLeft: 0
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
  scriptThumb: {
    height: 40,
    width: 40,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none'
  },
  listAvatar: {
    width: 56
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'none'
  },
  sourceIcon: {
    color: theme.palette.primary.contrastText
  }
}))

export interface ScriptPlaylistItemProps {
  playlistID: number
  scriptID: number
  index: number
  sceneID: number
  scripts: number[]
  onSourceOptions: (id: number) => void
}

export function ScriptPlaylistItem(props: ScriptPlaylistItemProps) {
  const { playlistID, index } = props
  const dispatch = useAppDispatch()
  const url = useAppSelector(selectCaptionScriptUrl(props.scriptID))

  const onSourceIconClick = (e: MouseEvent<HTMLDivElement>) => {
    const sourceURL = url as string
    if (e.shiftKey && !e.ctrlKey) {
      flipflip()
        .api.getFileUrl(sourceURL)
        .then((fileURL) => window.open(fileURL, '_blank')?.focus())
    } else if (!e.shiftKey && e.ctrlKey) {
      flipflip().api.showItemInFolder(sourceURL)
    } else if (!e.shiftKey && !e.ctrlKey) {
      // TODO make playScript work
      // dispatch(playScript(props.scriptID, props.sceneID, props.scripts))
    }
  }

  const removeScript = () => {
    dispatch(
      setPlaylistRemoveItem({
        id: playlistID,
        value: index
      })
    )
  }

  const { classes } = useStyles()
  return (
    <ListItem>
      <ListItemAvatar className={classes.listAvatar}>
        <Tooltip
          disableInteractive
          placement={'bottom'}
          title={
            <div>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click:
              Play Script
              <br />
              Shift+Click: Open Source
              <br />
              &nbsp;&nbsp;Ctrl+Click: Reveal File
            </div>
          }
        >
          <div onClick={onSourceIconClick} className={classes.scriptThumb}>
            <Fab size="small" className={classes.avatar}>
              <SourceIcon url={url} className={classes.sourceIcon} />
            </Fab>
          </div>
        </Tooltip>
      </ListItemAvatar>
      <ListItemText primary={url} />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          onClick={() => props.onSourceOptions(props.scriptID)}
          size="large"
        >
          <BuildIcon />
        </IconButton>
        <IconButton edge="end" onClick={removeScript} size="large">
          <DeleteIcon color={'error'} />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export interface ScriptPlaylistProps {
  playlistID: number
}

function ScriptPlaylist(props: ScriptPlaylistProps) {
  const { playlistID } = props
  const dispatch = useAppDispatch()
  const playlist = useAppSelector(selectPlaylist(playlistID))

  const [sourceOptions, setSourceOptions] = useState<number>()
  const sceneID = 0
  // const [sceneID, setSceneID] = useState<number>(0)

  const onCloseSourceOptions = () => {
    setSourceOptions(undefined)
  }
  const onSourceOptions = (scriptID: number) => {
    setSourceOptions(scriptID)
  }

  const toggleShuffle = () => {
    dispatch(setPlaylistToggleShuffle(playlistID))
  }

  const changeRepeat = () => {
    dispatch(setPlaylistChangeRepeat(playlistID))
  }

  const { classes } = useStyles()
  return (
    <>
      <List disablePadding>
        <Sortable
          className={classes.scriptList}
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
          {playlist.items.map((id, index) => (
            <ScriptPlaylistItem
              playlistID={playlistID}
              scriptID={id}
              key={index}
              index={index}
              sceneID={sceneID}
              scripts={playlist.items}
              onSourceOptions={onSourceOptions}
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
              onClick={() => dispatch(addScript(props.playlistID))}
              size="large"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </div>
      </List>
      {sourceOptions != null && (
        <ScriptOptions scriptID={sourceOptions} onDone={onCloseSourceOptions} />
      )}
    </>
  )
}

;(ScriptPlaylist as any).displayName = 'ScriptPlaylist'
export default ScriptPlaylist

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

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import AddIcon from '@mui/icons-material/Add'
import BuildIcon from '@mui/icons-material/Build'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import RepeatIcon from '@mui/icons-material/Repeat'
import RepeatOneIcon from '@mui/icons-material/RepeatOne'
import ShuffleIcon from '@mui/icons-material/Shuffle'

import { RP } from '../../data/const'
import SourceIcon from '../library/SourceIcon'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { addScript } from '../../../store/app/slice'
import {
  setSceneScriptPlaylistToggleShuffle,
  setSceneScriptPlaylistChangeRepeat,
  setSceneRemoveScriptPlaylist,
  setSceneScriptPlaylistRemoveScript,
  setSceneScriptPlaylistSortScripts
} from '../../../store/scene/slice'
import { playScript } from '../../../store/scene/thunks'
import { selectSceneScriptPlaylist } from '../../../store/scene/selectors'
import { selectCaptionScriptUrl } from '../../../store/captionScript/selectors'

const styles = (theme: Theme) =>
  createStyles({
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
  })

export interface ScriptPlaylistItemProps extends WithStyles<typeof styles> {
  sceneID: number
  scriptID: number
  scripts: number[]
  onSourceOptions: (scriptID: number) => void
  removeScript: (scriptID: number) => void
}

export function ScriptPlaylistItem (props: ScriptPlaylistItemProps) {
  const dispatch = useAppDispatch()
  const url = useAppSelector(selectCaptionScriptUrl(props.scriptID))

  const onSourceIconClick = (e: MouseEvent) => {
    const sourceURL = url as string
    if (e.shiftKey && !e.ctrlKey) {
      window.flipflip.api.openExternal(sourceURL)
    } else if (!e.shiftKey && e.ctrlKey) {
      window.flipflip.api.showItemInFolder(sourceURL)
    } else if (!e.shiftKey && !e.ctrlKey) {
      dispatch(playScript(props.scriptID, props.sceneID, props.scripts))
    }
  }

  const classes = props.classes
  return (
    <ListItem>
      <ListItemAvatar className={classes.listAvatar}>
        <Tooltip
          disableInteractive
          placement={'bottom'}
          title={
            <div>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click:
              Library Tagging
              <br />
              Shift+Click: Open Source
              <br />
              &nbsp;&nbsp;Ctrl+Click: Reveal File
            </div>
          }
        >
          <div
            onClick={onSourceIconClick.bind(this)}
            className={classes.scriptThumb}
          >
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
          onClick={props.onSourceOptions.bind(this, props.scriptID)}
          size="large"
        >
          <BuildIcon />
        </IconButton>
        <IconButton
          edge="end"
          onClick={props.removeScript.bind(this, props.scriptID)}
          size="large"
        >
          <DeleteIcon color={'error'} />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export interface ScriptPlaylistProps extends WithStyles<typeof styles> {
  sceneID: number
  playlistIndex: number
  onSourceOptions: (scriptID: number) => void
}

function ScriptPlaylist (props: ScriptPlaylistProps) {
  const dispatch = useAppDispatch()
  const playlist = useAppSelector(
    selectSceneScriptPlaylist(props.sceneID, props.playlistIndex)
  )

  const toggleShuffle = () => {
    dispatch(
      setSceneScriptPlaylistToggleShuffle({
        id: props.sceneID,
        value: props.playlistIndex
      })
    )
  }

  const changeRepeat = () => {
    dispatch(
      setSceneScriptPlaylistChangeRepeat({
        id: props.sceneID,
        value: props.playlistIndex
      })
    )
  }

  const removePlaylist = () => {
    dispatch(
      setSceneRemoveScriptPlaylist({
        id: props.sceneID,
        value: props.playlistIndex
      })
    )
  }

  const removeScript = (scriptID: number) => {
    const scriptIndex = playlist.scripts.indexOf(scriptID)
    dispatch(
      setSceneScriptPlaylistRemoveScript({
        id: props.sceneID,
        value: { playlistIndex: props.playlistIndex, scriptIndex }
      })
    )
  }

  const classes = props.classes
  return (
    <List disablePadding>
      <Sortable
        className={classes.scriptList}
        options={{
          animation: 150,
          easing: 'cubic-bezier(1, 0, 0, 1)'
        }}
        onChange={(order: any, sortable: any, evt: any) => {
          dispatch(
            setSceneScriptPlaylistSortScripts({
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
        {playlist.scripts.map((s, i) => (
          <ScriptPlaylistItem
            sceneID={props.sceneID}
            scripts={playlist.scripts}
            scriptID={s}
            key={i}
            classes={props.classes}
            onSourceOptions={props.onSourceOptions}
            removeScript={removeScript}
          />
        ))}
      </Sortable>
      <div className={classes.playlistAction}>
        <div className={classes.left}>
          <Tooltip
            disableInteractive
            title={'Shuffle ' + (playlist.shuffle ? '(On)' : '(Off)')}
          >
            <IconButton onClick={toggleShuffle.bind(this)} size="large">
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
            <IconButton onClick={changeRepeat.bind(this)} size="large">
              {playlist.repeat === RP.none && <RepeatIcon />}
              {playlist.repeat === RP.all && <RepeatIcon color={'primary'} />}
              {playlist.repeat === RP.one && <RepeatOneIcon color={'primary'} />}
            </IconButton>
          </Tooltip>
        </div>
        <Tooltip disableInteractive title="Add Tracks">
          <IconButton
            onClick={() => dispatch(addScript(props.playlistIndex))}
            size="large"
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
        <div className={classes.right}>
          <Tooltip disableInteractive title="Remove Playlist">
            <IconButton onClick={removePlaylist.bind(this)} size="large">
              <ClearIcon color={'error'} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </List>
  )
}

;(ScriptPlaylist as any).displayName = 'ScriptPlaylist'
export default withStyles(styles)(ScriptPlaylist as any)

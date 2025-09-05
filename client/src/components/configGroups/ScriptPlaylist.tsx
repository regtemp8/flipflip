/// <reference path="../../react-sortablejs.d.ts" />
import { MouseEvent } from 'react'
import Sortable from 'react-sortablejs'

import {
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

import { RP } from 'flipflip-common'
import SourceIcon from '../library/SourceIcon'
import { useNavigate } from 'react-router'
import { useAppDispatch } from '../../store/hooks'
import {
  useGetPlaylistItemIdsQuery,
  useGetPlaylistQuery
} from '../../store/api/slice'
import { setPlaylistRepeat, setPlaylistShuffle } from '../../store/api/thunks'
// import { isPrimaryModifierKey } from '../../utils'

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
  },
  textRight: {
    textAlign: 'right'
  }
}))

export interface ScriptPlaylistItemProps {
  playlistID: number
  scriptID: number
  index: number
  sceneID: number
  scripts: number[]
}

export function ScriptPlaylistItem(props: ScriptPlaylistItemProps) {
  // const { playlistID, index } = props
  const navigate = useNavigate()
  // const dispatch = useAppDispatch()
  const url = '' //useAppSelector(selectCaptionScriptUrl(props.scriptID))
  const type = '' //useAppSelector(selectCaptionScriptType(props.scriptID))

  const onSourceIconClick = (_e: MouseEvent<HTMLDivElement>) => {
    // const sourceURL = url as string
    // if (e.shiftKey && !isPrimaryModifierKey(e)) {
    //   flipflip()
    //     .api.getFileUrl(sourceURL)
    //     .then((fileURL) => window.open(fileURL, '_blank')?.focus())
    // } else if (!e.shiftKey && isPrimaryModifierKey(e)) {
    //   flipflip().api.showItemInFolder(sourceURL)
    // } else if (!e.shiftKey && !isPrimaryModifierKey(e)) {
    //   // TODO make playScript work
    //   // dispatch(playScript(props.scriptID, props.sceneID, props.scripts))
    // }
  }

  const removeScript = () => {
    // dispatch(
    //   setPlaylistRemoveItem({
    //     id: playlistID,
    //     value: index
    //   })
    // )
  }

  const { classes } = useStyles()
  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton
            edge="end"
            onClick={() => navigate(`/scripts/${props.scriptID}/options`)}
            size="large"
          >
            <BuildIcon />
          </IconButton>
          <IconButton edge="end" onClick={removeScript} size="large">
            <DeleteIcon color={'error'} />
          </IconButton>
        </>
      }
    >
      <ListItemAvatar className={classes.listAvatar}>
        <Tooltip
          disableInteractive
          placement={'bottom'}
          title={
            <table>
              <tr>
                <td className={classes.textRight}>Click:</td>
                <td>Play Script</td>
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
          }
        >
          <div onClick={onSourceIconClick} className={classes.scriptThumb}>
            <Fab size="small" className={classes.avatar}>
              <SourceIcon type={type} className={classes.sourceIcon} />
            </Fab>
          </div>
        </Tooltip>
      </ListItemAvatar>
      <ListItemText primary={url} />
    </ListItem>
  )
}

export interface ScriptPlaylistProps {
  playlistID: number
}

function ScriptPlaylist(props: ScriptPlaylistProps) {
  const { playlistID } = props
  const dispatch = useAppDispatch()
  const { data: playlist } = useGetPlaylistQuery(playlistID)
  const { data: itemIDs } = useGetPlaylistItemIdsQuery(playlistID)

  const sceneID = 0
  // const [sceneID, setSceneID] = useState<number>(0)

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
          onChange={(_order: any, _sortable: any, _evt: any) => {
            // const { oldIndex, newIndex } = evt
            // dispatch(
            //   setPlaylistSortItems({
            //     id: props.playlistID,
            //     value: { oldIndex, newIndex }
            //   })
            // )
          }}
        >
          {itemIDs?.map((id, index) => (
            <ScriptPlaylistItem
              key={index}
              playlistID={playlistID}
              scriptID={id}
              index={index}
              sceneID={sceneID}
              scripts={itemIDs ?? []}
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
              // onClick={() => dispatch(addScript(props.playlistID))}
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

;(ScriptPlaylist as any).displayName = 'ScriptPlaylist'
export default ScriptPlaylist

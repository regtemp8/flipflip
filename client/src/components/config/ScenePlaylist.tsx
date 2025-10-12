import {
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Theme,
  Tooltip
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import AddIcon from '@mui/icons-material/Add'
import BuildIcon from '@mui/icons-material/Build'
import DeleteIcon from '@mui/icons-material/Delete'
import MovieIcon from '@mui/icons-material/Movie'
import RepeatIcon from '@mui/icons-material/Repeat'
import RepeatOneIcon from '@mui/icons-material/RepeatOne'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import Sortable from 'react-sortablejs'
import {
  RP,
  SCENE_NONE,
  SCENE_RANDOM,
  ScenePlaylistItem
} from 'flipflip-common'
import {
  useGetPlaylistQuery,
  useGetPlaylistItemQuery,
  useDeletePlaylistItemMutation,
  useGetPlaylistItemIdsQuery,
  useGetSceneSelectOptionsQuery
} from '../../store/api/slice'
import { useNavigate } from 'react-router'
import { useAppDispatch } from '../../store/hooks'
import {
  setPlaylistRepeat,
  setPlaylistShuffle,
  movePlaylistItem
} from '../../store/api/thunks'
import { arrayMove } from 'react-sortable-hoc'
import ScenePlaylistItemEditDialog from './ScenePlaylistItemEditDialog'
import { showScenePlaylistItemEditDialog } from '../../store/playlist/thunks'

const useStyles = makeStyles()((theme: Theme) => ({
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
  scriptList: {
    paddingLeft: 0
  },
  playlistAction: {
    textAlign: 'center'
  },
  left: {
    float: 'left',
    paddingLeft: theme.spacing(2)
  }
}))

interface ScenePlaylistRowProps {
  playlistID: number
  itemID: number
  index: number
  onEdit: (item: ScenePlaylistItem) => void
}

function ScenePlaylistRow(props: ScenePlaylistRowProps) {
  const { playlistID, itemID } = props
  const navigate = useNavigate()
  const [deletePlaylistItem] = useDeletePlaylistItemMutation()
  const { data: item } = useGetPlaylistItemQuery({ playlistID, itemID })
  const { data: options } = useGetSceneSelectOptionsQuery({
    includeExtra: true
  })

  const { sceneID } =
    item != null ? (item as ScenePlaylistItem) : { sceneID: SCENE_NONE }

  const onOpenScene = () => {
    navigate(`/scenes/${sceneID}`)
  }

  const editItem = () => {
    if (item != null) {
      props.onEdit(item as ScenePlaylistItem)
    }
  }
  const removeItem = async () => {
    await deletePlaylistItem({ playlistID, itemID })
  }

  const { classes } = useStyles()
  const sceneIDText = sceneID.toString()
  const sceneOption = options?.find((option) => option.value === sceneIDText)
  const sceneLabel = sceneOption?.label ?? ''
  return (
    <>
      <ListItem
        secondaryAction={
          <>
            <IconButton edge="end" onClick={editItem} size="large">
              <BuildIcon />
            </IconButton>
            <IconButton edge="end" onClick={removeItem} size="large">
              <DeleteIcon color={'error'} />
            </IconButton>
          </>
        }
      >
        <ListItemAvatar className={classes.listAvatar}>
          <Tooltip disableInteractive placement={'bottom'} title="Open Scene">
            <span>
              <IconButton
                size="small"
                className={classes.avatar}
                onClick={onOpenScene}
                disabled={sceneID === SCENE_RANDOM || sceneID === SCENE_NONE}
              >
                <MovieIcon className={classes.sourceIcon} />
              </IconButton>
            </span>
          </Tooltip>
        </ListItemAvatar>
        <ListItemText primary={sceneLabel} />
      </ListItem>
    </>
  )
}

export interface ScenePlaylistProps {
  playlistID: number
}

function ScenePlaylist(props: ScenePlaylistProps) {
  const { playlistID } = props
  const dispatch = useAppDispatch()
  const { data: playlist } = useGetPlaylistQuery(playlistID)
  const { data: itemIDs } = useGetPlaylistItemIdsQuery(playlistID)

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

  const addPlaylistItem = async () => {
    dispatch(showScenePlaylistItemEditDialog(playlistID))
  }

  const onShowEditDialog = (item?: ScenePlaylistItem) => {
    dispatch(showScenePlaylistItemEditDialog(playlistID, item))
  }

  const { classes } = useStyles()
  return (
    <>
      <List>
        <Sortable
          id="scene-playlist-items"
          className={classes.scriptList}
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
          {itemIDs?.map((id, index) => (
            <ScenePlaylistRow
              key={index}
              playlistID={playlistID}
              itemID={id}
              index={index}
              onEdit={onShowEditDialog}
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
          <Tooltip disableInteractive title="Add Scenes">
            <IconButton onClick={addPlaylistItem} size="large">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </div>
      </List>
      <ScenePlaylistItemEditDialog />
    </>
  )
}

;(ScenePlaylist as any).displayName = 'ScenePlaylist'
export default ScenePlaylist

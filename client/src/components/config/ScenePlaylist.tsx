import { ChangeEvent, useEffect, useState } from 'react'
import { cx } from '@emotion/css'
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid2,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Switch,
  TextField,
  Theme,
  Tooltip,
  Typography
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import AddIcon from '@mui/icons-material/Add'
import BuildIcon from '@mui/icons-material/Build'
import DeleteIcon from '@mui/icons-material/Delete'
import MovieIcon from '@mui/icons-material/Movie'
import RepeatIcon from '@mui/icons-material/Repeat'
import RepeatOneIcon from '@mui/icons-material/RepeatOne'
import SelectAllIcon from '@mui/icons-material/SelectAll'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import Sortable from 'react-sortablejs'
import { PLT, RP, SCENE_NONE, SCENE_RANDOM, ScenePlaylistItem } from 'flipflip-common'
import SceneSelect from '../configGroups/SceneSelect'
import {
  useGetPlaylistQuery,
  useGetScenesQuery,
  useUpdatePlaylistMutation,
  useCreatePlaylistItemMutation,
  useGetPlaylistItemQuery,
  useDeletePlaylistItemMutation,
  useGetPlaylistItemIdsQuery,
  useUpdatePlaylistItemMutation
} from '../../store/api/slice'
import MultiSceneSelect from '../configGroups/MultiSceneSelect'
import { useNavigate } from 'react-router'

const useStyles = makeStyles()((theme: Theme) => ({
  randomSceneDialog: {
    minWidth: 400,
    overflow: 'visible'
  },
  noScroll: {
    overflow: 'visible'
  },
  selectTop: {
    zIndex: 3
  },
  multiSelectTop: {
    zIndex: 2
  },
  selectText: {
    color: theme.palette.text.secondary
  },
  noTopPadding: {
    paddingTop: '0 !important'
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

interface ScenePlaylistItemEditDialogProps {
  playlistID: number
  item?: ScenePlaylistItem
  open: boolean
  onClose: () => void
}

function ScenePlaylistItemEditDialog(props: ScenePlaylistItemEditDialogProps) {
  const { playlistID, item, open, onClose } = props
  const [createPlaylistItem] = useCreatePlaylistItemMutation()
  const [updatePlaylistItem] = useUpdatePlaylistItemMutation()
  const { data: allScenes } = useGetScenesQuery()

  const [unsavedSceneID, setUnsavedSceneID] = useState<number>()
  const [unsavedRandomScenes, setUnsavedRandomScenes] = useState<number[]>()
  const [unsavedDuration, setUnsavedDuration] = useState<number>()
  const [unsavedPlayAfterAllImages, setUnsavedPlayAfterAllImages] =
    useState<boolean>()

  useEffect(() => {
    if (!open) {
      setUnsavedSceneID(undefined)
      setUnsavedRandomScenes(undefined)
      setUnsavedDuration(undefined)
      setUnsavedPlayAfterAllImages(undefined)
    }
  }, [open])

  const onSceneChange = (sceneID: number) => {
    setUnsavedSceneID(sceneID)
  }

  const changeRandomScenes = (sceneIDs: number[]) => {
    setUnsavedRandomScenes(sceneIDs)
  }

  const onRandomSelectAll = () => {
    setUnsavedRandomScenes(allScenes)
  }

  const onChangeDuration = (event: ChangeEvent<HTMLInputElement>) => {
    const duration = Number(event.currentTarget.value)
    setUnsavedDuration(duration)
  }

  const onChangePlayAfterAllImages = (
    _event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setUnsavedPlayAfterAllImages(checked)
  }

  const onSave = async () => {
    if(item == null) {
      await createPlaylistItem({
        id: playlistID, 
        type: PLT.scene,
        index: 0,
        sceneName: '', // TODO remove or split up, only used for getting data
        sceneID: unsavedSceneID ?? SCENE_NONE,
        randomScenes: unsavedRandomScenes ?? [],
        duration: unsavedDuration ?? 0,
        playAfterAllImages: unsavedPlayAfterAllImages ?? false
      })
    } else {
      await updatePlaylistItem({
        playlistID, 
        itemID: item.id,
        sceneID: unsavedSceneID,
        randomScenes: unsavedRandomScenes,
        duration: unsavedDuration,
        playAfterAllImages: unsavedPlayAfterAllImages
      })
    }

    onClose()
  }

  const { classes } = useStyles()
  const currentSceneID = unsavedSceneID ?? item?.sceneID ?? SCENE_NONE
  const currentRandomScenes = unsavedRandomScenes ?? item?.randomScenes
  const currentDuration = unsavedDuration ?? item?.duration
  const currentPlayAfterAllImages =
    unsavedPlayAfterAllImages ?? item?.playAfterAllImages
  return (
    <Dialog
      classes={{ paper: classes.randomSceneDialog }}
      open={open}
      onClose={onClose}
    >
      <DialogContent classes={{ root: classes.noScroll }}>
        <Grid2 container spacing={2} alignItems="center">
          <Grid2 size={12} className={classes.selectTop}>
            <Typography className={classes.selectText} variant="caption">
              Scene
            </Typography>
            <SceneSelect
              value={currentSceneID}
              onChange={onSceneChange}
              includeExtra
            />
          </Grid2>
          <Grid2 size={12}>
            <Collapse in={currentSceneID === -1}>
              <Grid2 container spacing={1} alignItems="center">
                <Grid2 size={12}>
                  <Typography className={classes.selectText} variant="caption">
                    Select which scenes to include
                  </Typography>
                </Grid2>
                <Grid2
                  size="grow"
                  className={cx(classes.noTopPadding, classes.multiSelectTop)}
                >
                  <MultiSceneSelect
                    values={currentRandomScenes}
                    onChange={changeRandomScenes}
                  />
                </Grid2>
                <Grid2 size="auto" className={classes.noTopPadding}>
                  <Tooltip disableInteractive title="Select All">
                    <IconButton onClick={onRandomSelectAll}>
                      <SelectAllIcon />
                    </IconButton>
                  </Tooltip>
                </Grid2>
              </Grid2>
            </Collapse>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 'grow' }}>
            <Collapse in={currentSceneID !== 0 && !currentPlayAfterAllImages}>
              <TextField
                fullWidth
                label="Play after"
                variant="outlined"
                margin="dense"
                value={currentDuration}
                onChange={onChangeDuration}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">ms</InputAdornment>
                    )
                  },
                  htmlInput: {
                    min: 0,
                    step: 100,
                    type: 'number'
                  }
                }}
              />
            </Collapse>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 'auto' }}>
            <Collapse in={currentSceneID !== 0}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentPlayAfterAllImages}
                    onChange={onChangePlayAfterAllImages}
                  />
                }
                label="Play After All Images"
              />
            </Collapse>
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

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
  const {data} = useGetPlaylistItemQuery({playlistID, itemID})

  const {sceneID, sceneName} = data != null ? data as ScenePlaylistItem : {sceneID: 0, sceneName: '' }
  const onOpenScene = () => {
    navigate(`/scenes/${sceneID}`)
  }

  const editItem = () => {
    if(data != null) {
      props.onEdit(data as ScenePlaylistItem)
    }
  }
  const removeItem = async() => {
    await deletePlaylistItem({playlistID, itemID})
  }

  const { classes } = useStyles()
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
        <ListItemText primary={sceneName} />
      </ListItem>
    </>
  )
}

export interface ScenePlaylistProps {
  playlistID: number
}

function ScenePlaylist(props: ScenePlaylistProps) {
  const { playlistID } = props
  const { data: playlist } = useGetPlaylistQuery(playlistID)
  const { data: itemIDs } = useGetPlaylistItemIdsQuery(playlistID)
  const [updatePlaylist] = useUpdatePlaylistMutation()

  const [editingItem, setEditingItem] = useState<ScenePlaylistItem>()
  const [editing, setEditing] = useState(false)

  const toggleShuffle = async () => {
    await updatePlaylist({ id: playlistID, shuffle: !playlist?.shuffle })
  }

  const addPlaylistItem = async () => {
    setEditing(true)
  }

  const changeRepeat = async () => {
    let repeat
    switch (playlist?.repeat) {
      case RP.all:
        repeat = RP.one
        break
      case RP.one:
        repeat = RP.none
        break
      case RP.none:
        repeat = RP.all
        break
    }

    await updatePlaylist({ id: playlistID, repeat })
  }

  const onShowEditDialog = (item?: ScenePlaylistItem) => {
    setEditing(true)
    setEditingItem(item)
  }

  const onCloseEditDialog = () => {
    setEditing(false)
    setEditingItem(undefined)
  }

  const { classes } = useStyles()
  return (<>
    <List>
      <Sortable
        className={classes.scriptList}
        options={{
          animation: 150,
          easing: 'cubic-bezier(1, 0, 0, 1)'
        }}
        onChange={(order: any, sortable: any, evt: any) => {
          // dispatch(
          //   setPlaylistSortItems({
          //     id: playlistID,
          //     value: {
          //       oldIndex: evt.oldIndex,
          //       newIndex: evt.newIndex
          //     }
          //   })
          // )
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
              <ShuffleIcon color={playlist?.shuffle ? 'primary' : undefined} />
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
              {playlist?.repeat === RP.all && <RepeatIcon color={'primary'} />}
              {playlist?.repeat === RP.one && (
                <RepeatOneIcon color={'primary'} />
              )}
            </IconButton>
          </Tooltip>
        </div>
        <Tooltip disableInteractive title="Add Scenes">
          <IconButton
            onClick={addPlaylistItem}
            size="large"
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </div>
    </List>
    <ScenePlaylistItemEditDialog
        playlistID={playlistID}
        item={editingItem}
        open={editing}
        onClose={onCloseEditDialog}
      />
    </>
  )
}

;(ScenePlaylist as any).displayName = 'ScenePlaylist'
export default ScenePlaylist

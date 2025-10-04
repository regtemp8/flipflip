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
import {
  PLT,
  RP,
  SCENE_DURATION,
  SCENE_NONE,
  SCENE_RANDOM,
  ScenePlaylistItem
} from 'flipflip-common'
import SceneSelect from '../configGroups/SceneSelect'
import {
  useGetPlaylistQuery,
  useGetScenesQuery,
  useCreatePlaylistItemMutation,
  useGetPlaylistItemQuery,
  useDeletePlaylistItemMutation,
  useGetPlaylistItemIdsQuery,
  useGetSceneSelectOptionsQuery
} from '../../store/api/slice'
import MultiSceneSelect from '../configGroups/MultiSceneSelect'
import { useNavigate } from 'react-router'
import { useAppDispatch } from '../../store/hooks'
import {
  setPlaylistRepeat,
  setPlaylistShuffle,
  updatePlaylistItem
} from '../../store/api/thunks'

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
  const dispatch = useAppDispatch()
  const [createPlaylistItem] = useCreatePlaylistItemMutation()
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
    if (item == null) {
      await createPlaylistItem({
        id: playlistID,
        type: PLT.scene,
        index: 0,
        sceneID: unsavedSceneID ?? SCENE_NONE,
        randomScenes: unsavedRandomScenes ?? [],
        duration: unsavedDuration ?? SCENE_DURATION,
        playAfterAllImages: unsavedPlayAfterAllImages ?? false
      })
    } else {
      let sceneID = SCENE_NONE
      let randomScenes: number[] = []
      if (unsavedSceneID === SCENE_RANDOM) {
        sceneID = SCENE_RANDOM
        randomScenes = unsavedRandomScenes ?? item.randomScenes
      } else if (unsavedSceneID != null) {
        sceneID = unsavedSceneID
      } else {
        sceneID = item.sceneID
        if (item.sceneID === SCENE_RANDOM) {
          randomScenes = item.randomScenes
        }
      }

      dispatch(
        updatePlaylistItem({
          playlistID,
          itemID: item.id,
          sceneID,
          randomScenes,
          duration: unsavedDuration ?? item.duration,
          playAfterAllImages:
            unsavedPlayAfterAllImages ?? item.playAfterAllImages
        })
      )
    }

    onClose()
  }

  const { classes } = useStyles()
  const currentSceneID = unsavedSceneID ?? item?.sceneID ?? SCENE_NONE
  const currentRandomScenes = unsavedRandomScenes ?? item?.randomScenes
  const currentDuration = unsavedDuration ?? item?.duration ?? SCENE_DURATION
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
              id="scene-playlist-item-scene-select"
              value={currentSceneID}
              onChange={onSceneChange}
              includeExtra
            />
          </Grid2>
          <Grid2 size={12}>
            <Collapse in={currentSceneID === SCENE_RANDOM}>
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
            <Collapse
              in={currentSceneID !== SCENE_NONE && !currentPlayAfterAllImages}
            >
              <TextField
                fullWidth
                label="Play for"
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
            <Collapse in={currentSceneID !== SCENE_NONE}>
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
        <ListItemText
          primary={options != null ? options[sceneID.toString()] : ''}
        />
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

  const [editingItem, setEditingItem] = useState<ScenePlaylistItem>()
  const [editing, setEditing] = useState(false)

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
    setEditing(true)
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
  return (
    <>
      <List>
        <Sortable
          className={classes.scriptList}
          options={{
            animation: 150,
            easing: 'cubic-bezier(1, 0, 0, 1)'
          }}
          onChange={(_order: any, _sortable: any, _evt: any) => {
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

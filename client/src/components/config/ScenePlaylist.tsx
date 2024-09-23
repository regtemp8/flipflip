import React, { ChangeEvent, useEffect, useState } from 'react'
import { cx } from '@emotion/css'
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  TextField,
  Theme,
  Tooltip,
  Typography
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
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
import { RP } from 'flipflip-common'
import { addRoutes } from '../../store/app/slice'
import SceneSelect from '../configGroups/SceneSelect'
import { addToPlaylist } from '../../store/scenePlaylistItem/thunks'
import MultiSceneSelect from '../configGroups/MultiSceneSelect'
import { selectAppScenes } from '../../store/app/selectors'
import { RootState } from '../../store/store'
import { selectSceneName } from '../../store/scene/selectors'
import {
  setPlaylistChangeRepeat,
  setPlaylistRemoveItem,
  setPlaylistSortItems,
  setPlaylistToggleShuffle
} from '../../store/playlist/slice'
import { selectPlaylist } from '../../store/playlist/selectors'
import {
  selectScenePlaylistItem,
  selectScenePlaylistItemSceneID
} from '../../store/scenePlaylistItem/selectors'
import { setScenePlaylistItem } from '../../store/scenePlaylistItem/slice'

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
  itemID: number
  open: boolean
  onClose: () => void
}

function ScenePlaylistItemEditDialog(props: ScenePlaylistItemEditDialogProps) {
  const { itemID, open, onClose } = props
  const dispatch = useAppDispatch()
  const allScenes = useAppSelector(selectAppScenes())
  const { sceneID, randomScenes, duration, playAfterAllImages } =
    useAppSelector(selectScenePlaylistItem(itemID))

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
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setUnsavedPlayAfterAllImages(checked)
  }

  const onSave = () => {
    const item = {
      id: itemID,
      sceneID: unsavedSceneID ?? sceneID,
      randomScenes: unsavedRandomScenes ?? randomScenes,
      duration: unsavedDuration ?? duration,
      playAfterAllImages: unsavedPlayAfterAllImages ?? playAfterAllImages
    }

    dispatch(setScenePlaylistItem(item))
    onClose()
  }

  const { classes } = useStyles()
  const currentSceneID = unsavedSceneID ?? sceneID
  const currentRandomScenes = unsavedRandomScenes ?? randomScenes
  const currentDuration = unsavedDuration ?? duration
  const currentPlayAfterAllImages =
    unsavedPlayAfterAllImages ?? playAfterAllImages
  return (
    <Dialog
      classes={{ paper: classes.randomSceneDialog }}
      open={open}
      onClose={onClose}
    >
      <DialogContent classes={{ root: classes.noScroll }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} className={classes.selectTop}>
            <Typography className={classes.selectText} variant="caption">
              Scene
            </Typography>
            <SceneSelect
              value={currentSceneID}
              onChange={onSceneChange}
              includeExtra
            />
          </Grid>
          <Grid item xs={12}>
            <Collapse in={currentSceneID === -1}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12}>
                  <Typography className={classes.selectText} variant="caption">
                    Select which scenes to include
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs
                  className={cx(classes.noTopPadding, classes.multiSelectTop)}
                >
                  <MultiSceneSelect
                    values={currentRandomScenes}
                    onChange={changeRandomScenes}
                  />
                </Grid>
                <Grid item xs="auto" className={classes.noTopPadding}>
                  <Tooltip disableInteractive title="Select All">
                    <IconButton onClick={onRandomSelectAll}>
                      <SelectAllIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm>
            <Collapse in={currentSceneID !== 0 && !currentPlayAfterAllImages}>
              <TextField
                fullWidth
                label="Play after"
                variant="outlined"
                margin="dense"
                value={currentDuration}
                onChange={onChangeDuration}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">ms</InputAdornment>
                  )
                }}
                inputProps={{
                  min: 0,
                  step: 100,
                  type: 'number'
                }}
              />
            </Collapse>
          </Grid>
          <Grid item xs={12} sm="auto">
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
          </Grid>
        </Grid>
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

interface ScenePlaylistItemProps {
  playlistID: number
  itemID: number
  index: number
}

function ScenePlaylistItem(props: ScenePlaylistItemProps) {
  const { playlistID, itemID, index } = props
  const dispatch = useAppDispatch()
  const sceneID = useAppSelector(selectScenePlaylistItemSceneID(itemID))
  const sceneNameSelector =
    sceneID === 0
      ? (state: RootState) => 'None'
      : sceneID === -1
        ? (state: RootState) => 'Random'
        : selectSceneName(sceneID)
  const sceneName = useAppSelector(sceneNameSelector)
  const [editing, setEditing] = useState<boolean>(false)

  const onOpenScene = () => {
    dispatch(addRoutes([{ kind: 'scene', value: sceneID }]))
  }

  const removeItem = () => {
    dispatch(
      setPlaylistRemoveItem({
        id: playlistID,
        value: index
      })
    )
  }

  const openEdit = () => setEditing(true)
  const closeEdit = () => setEditing(false)

  const { classes } = useStyles()
  return (
    <>
      <ListItem>
        <ListItemAvatar className={classes.listAvatar}>
          <Tooltip disableInteractive placement={'bottom'} title="Open Scene">
            <span>
              <IconButton
                size="small"
                className={classes.avatar}
                onClick={onOpenScene}
                disabled={sceneID === -1 || sceneID === 0}
              >
                <MovieIcon className={classes.sourceIcon} />
              </IconButton>
            </span>
          </Tooltip>
        </ListItemAvatar>
        <ListItemText primary={sceneName} />
        <ListItemSecondaryAction>
          <IconButton edge="end" onClick={openEdit} size="large">
            <BuildIcon />
          </IconButton>
          <IconButton edge="end" onClick={removeItem} size="large">
            <DeleteIcon color={'error'} />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <ScenePlaylistItemEditDialog
        itemID={itemID}
        open={editing}
        onClose={closeEdit}
      />
    </>
  )
}

export interface ScenePlaylistProps {
  playlistID: number
}

function ScenePlaylist(props: ScenePlaylistProps) {
  const { playlistID } = props
  const dispatch = useAppDispatch()
  const playlist = useAppSelector(selectPlaylist(playlistID))

  const toggleShuffle = () => {
    dispatch(setPlaylistToggleShuffle(playlistID))
  }

  const changeRepeat = () => {
    dispatch(setPlaylistChangeRepeat(playlistID))
  }

  const { classes } = useStyles()
  return (
    <List>
      <Sortable
        className={classes.scriptList}
        options={{
          animation: 150,
          easing: 'cubic-bezier(1, 0, 0, 1)'
        }}
        onChange={(order: any, sortable: any, evt: any) => {
          dispatch(
            setPlaylistSortItems({
              id: playlistID,
              value: {
                oldIndex: evt.oldIndex,
                newIndex: evt.newIndex
              }
            })
          )
        }}
      >
        {playlist.items.map((id, index) => (
          <ScenePlaylistItem
            key={index}
            playlistID={playlistID}
            itemID={id}
            index={index}
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
        <Tooltip disableInteractive title="Add Scenes">
          <IconButton
            onClick={() => dispatch(addToPlaylist(playlistID))}
            size="large"
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </div>
    </List>
  )
}

;(ScenePlaylist as any).displayName = 'ScenePlaylist'
export default ScenePlaylist

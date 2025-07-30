import { ChangeEvent, useEffect, useState } from 'react'
import { cx } from '@emotion/css'
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  Grid2,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Theme,
  Tooltip,
  Typography
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import AddIcon from '@mui/icons-material/Add'
import BuildIcon from '@mui/icons-material/Build'
import DeleteIcon from '@mui/icons-material/Delete'
import TvIcon from '@mui/icons-material/Tv'
import RepeatIcon from '@mui/icons-material/Repeat'
import RepeatOneIcon from '@mui/icons-material/RepeatOne'
import SelectAllIcon from '@mui/icons-material/SelectAll'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import Sortable from 'react-sortablejs'
import { RP } from 'flipflip-common'
import DisplaySelect from '../configGroups/DisplaySelect'
import MultiDisplaySelect from '../configGroups/MultiDisplaySelect'
// import { useNavigate } from 'react-router'
import {
  // useGetDisplayPlaylistItemQuery,
  // useGetDisplaysQuery,
  useGetPlaylistQuery,
  useUpdatePlaylistMutation
} from '../../store/api/slice'

const useStyles = makeStyles()((theme: Theme) => ({
  randomDisplayDialog: {
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

interface DisplayPlaylistItemEditDialogProps {
  itemID: number
  open: boolean
  onClose: () => void
}

function DisplayPlaylistItemEditDialog(
  props: DisplayPlaylistItemEditDialogProps
) {
  const { open, onClose } = props
  // const { data: allDisplays } = useGetDisplaysQuery()
  // const { data: item } = useGetDisplayPlaylistItemQuery(itemID)
  const item: any = undefined

  const [unsavedDisplayID, setUnsavedDisplayID] = useState<number>()
  const [unsavedRandomDisplays, setUnsavedRandomDisplays] = useState<number[]>()
  const [unsavedDuration, setUnsavedDuration] = useState<number>()

  useEffect(() => {
    if (!open) {
      setUnsavedDisplayID(undefined)
      setUnsavedRandomDisplays(undefined)
      setUnsavedDuration(undefined)
    }
  }, [open])

  const onDisplayChange = (displayID: number) => {
    setUnsavedDisplayID(displayID)
  }

  const changeRandomDisplays = (displayIDs: number[]) => {
    setUnsavedRandomDisplays(displayIDs)
  }

  const onRandomSelectAll = () => {
    // setUnsavedRandomDisplays(allDisplays)
  }

  const onChangeDuration = (event: ChangeEvent<HTMLInputElement>) => {
    const duration = Number(event.currentTarget.value)
    setUnsavedDuration(duration)
  }

  const onSave = () => {
    // const newItem = {
    //   id: itemID,
    //   displayID: unsavedDisplayID ?? item?.displayID,
    //   randomDisplays: unsavedRandomDisplays ?? item?.randomDisplays,
    //   duration: unsavedDuration ?? item?.duration
    // }

    // dispatch(setDisplayPlaylistItem(newItem))
    onClose()
  }

  const { classes } = useStyles()
  const currentDisplayID = unsavedDisplayID ?? item?.displayID ?? 0
  const currentRandomDisplays = unsavedRandomDisplays ?? item?.randomDisplays
  const currentDuration = unsavedDuration ?? item?.duration
  return (
    <Dialog
      classes={{ paper: classes.randomDisplayDialog }}
      open={open}
      onClose={onClose}
    >
      <DialogContent classes={{ root: classes.noScroll }}>
        <Grid2 container spacing={2} alignItems="center">
          <Grid2 size={12} className={classes.selectTop}>
            <Typography className={classes.selectText} variant="caption">
              Display
            </Typography>
            <DisplaySelect
              value={currentDisplayID}
              onChange={onDisplayChange}
              includeExtra
            />
          </Grid2>
          <Grid2 size={12}>
            <Collapse in={currentDisplayID === -1}>
              <Grid2 container spacing={1}>
                <Grid2 size={12}>
                  <Typography className={classes.selectText} variant="caption">
                    Select which displays to include
                  </Typography>
                </Grid2>
                <Grid2
                  size="grow"
                  className={cx(classes.noTopPadding, classes.multiSelectTop)}
                >
                  <MultiDisplaySelect
                    values={currentRandomDisplays}
                    onChange={changeRandomDisplays}
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
            <Collapse in={currentDisplayID !== 0}>
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

interface DisplayPlaylistItemProps {
  playlistID: number
  index: number
  itemID: number
}

function DisplayPlaylistItem(props: DisplayPlaylistItemProps) {
  // const navigate = useNavigate()
  const { /*playlistID, index,*/ itemID } = props
  // const displayID = useAppSelector(selectDisplayPlaylistItemDisplayID(itemID))
  // const displayNameSelector =
  //   displayID === 0
  //     ? (state: RootState) => 'None'
  //     : displayID === -1
  //       ? (state: RootState) => 'Random'
  //       : selectDisplayName(displayID)
  // const displayName = useAppSelector(displayNameSelector)

  // TODO include displayName in playlist item JSON?
  const displayID: number = 0
  const displayName = 'None'
  const [editing, setEditing] = useState<boolean>(false)

  const onOpenDisplay = () => {
    // navigate(`/displays/${displayID}`)
  }

  const removeItem = () => {
    // dispatch(
    //   setPlaylistRemoveItem({
    //     id: playlistID,
    //     value: index
    //   })
    // )
  }

  const openEdit = () => setEditing(true)
  const closeEdit = () => setEditing(false)

  const { classes } = useStyles()
  return (
    <>
      <ListItem
        secondaryAction={
          <>
            <IconButton edge="end" onClick={openEdit} size="large">
              <BuildIcon />
            </IconButton>
            <IconButton edge="end" onClick={removeItem} size="large">
              <DeleteIcon color={'error'} />
            </IconButton>
          </>
        }
      >
        <ListItemAvatar className={classes.listAvatar}>
          <Tooltip disableInteractive placement={'bottom'} title="Open Display">
            <span>
              <IconButton
                size="small"
                className={classes.avatar}
                onClick={onOpenDisplay}
                disabled={displayID === -1 || displayID === 0}
              >
                <TvIcon className={classes.sourceIcon} />
              </IconButton>
            </span>
          </Tooltip>
        </ListItemAvatar>
        <ListItemText primary={displayName} />
      </ListItem>
      <DisplayPlaylistItemEditDialog
        itemID={itemID}
        open={editing}
        onClose={closeEdit}
      />
    </>
  )
}

export interface DisplayPlaylistProps {
  playlistID: number
}

function DisplayPlaylist(props: DisplayPlaylistProps) {
  const { playlistID } = props
  const { data: playlist } = useGetPlaylistQuery(playlistID)
  const [updatePlaylist] = useUpdatePlaylistMutation()

  const toggleShuffle = async () => {
    await updatePlaylist({ id: playlistID, shuffle: !playlist?.shuffle })
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

  const { classes } = useStyles()
  return (
    <List>
      <Sortable
        className={classes.scriptList}
        options={{
          animation: 150,
          easing: 'cubic-bezier(1, 0, 0, 1)'
        }}
        // onChange={(order: any, sortable: any, evt: any) => {
        //   dispatch(
        //     setPlaylistSortItems({
        //       id: playlistID,
        //       value: {
        //         oldIndex: evt.oldIndex,
        //         newIndex: evt.newIndex
        //       }
        //     })
        //   )
        // }}
      >
        {playlist?.items.map((id, index) => (
          <DisplayPlaylistItem
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
        <Tooltip disableInteractive title="Add Displays">
          <IconButton
            onClick={() => {} /*dispatch(addToPlaylist(playlistID))*/}
            size="large"
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </div>
    </List>
  )
}

;(DisplayPlaylist as any).displayName = 'DisplayPlaylist'
export default DisplayPlaylist

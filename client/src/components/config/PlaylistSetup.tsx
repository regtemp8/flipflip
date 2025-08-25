import { ChangeEvent, FormEvent, useState } from 'react'
import { cx } from '@emotion/css'

import {
  AppBar,
  Button,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Fab,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  type Theme,
  Toolbar,
  Tooltip,
  Typography,
  Box,
  Grid2,
  Card,
  CardContent
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import MenuIcon from '@mui/icons-material/Menu'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PublishIcon from '@mui/icons-material/Publish'

import { MO, PLT } from 'flipflip-common'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
// import {
//   selectAppSpecialMode
// } from '../../store/app/selectors'
import { setPlaylistName } from '../../store/api/thunks'
import AudioPlaylist from '../player/AudioPlaylist'
import ScriptPlaylist from '../configGroups/ScriptPlaylist'
import ScenePlaylist from './ScenePlaylist'
import DisplayPlaylist from './DisplayPlaylist'
import SceneSelect from '../configGroups/SceneSelect'
import {
  useClonePlaylistMutation,
  useDeletePlaylistMutation,
  useGetPlaylistItemIdsQuery,
  useGetPlaylistQuery,
  usePlayPlaylistMutation
} from '../../store/api/slice'
import { useNavigate, useParams } from 'react-router'
import { useGetDisplaySettingsFullScreenQuery } from '../../store/api/selectors'
import { setFullScreen } from '../../data/fullscreen'
import { setPlaylistEditingName } from '../../store/playlist/slice'
import { selectPlaylistEditingName } from '../../store/playlist/selectors'

const drawerWidth = 240

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  appBarSpacerWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0,
    minHeight: 64
  },
  appBarSpacerCollapse: {
    width: '100%'
  },
  appBarSpacer: {
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    minHeight: 64
  },
  title: {
    textAlign: 'center'
  },
  titleField: {
    width: '100%',
    margin: 0
  },
  titleInput: {
    color: theme.palette.primary.contrastText,
    textAlign: 'center',
    fontSize: theme.typography.h4.fontSize
  },
  noTitle: {
    width: '33%',
    height: theme.spacing(7)
  },
  drawer: {
    position: 'absolute'
  },
  drawerSpacer: {
    minWidth: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      minWidth: theme.spacing(9)
    }
  },
  drawerButton: {
    backgroundColor: theme.palette.primary.main,
    minHeight: theme.spacing(6),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0
    }
  },
  drawerIcon: {
    color: theme.palette.primary.contrastText
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    height: '100vh',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9)
    }
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default
  },
  container: {
    height: '100%',
    padding: theme.spacing(0),
    overflowY: 'auto'
  },
  fill: {
    flexGrow: 1
  },
  backdropTop: {
    zIndex: `${theme.zIndex.modal + 1} !important` as any
  },
  playButton: {
    boxShadow: 'none'
  },
  tabPanel: {
    display: 'flex',
    height: '100%'
  },
  sceneSelect: {
    minWidth: 200,
    maxWidth: `calc(100% - ${theme.spacing(7)})`,
    maxHeight: theme.mixins.toolbar.minHeight,
    marginRight: theme.spacing(2)
  }
}))

function PlaylistSetup() {
  const { id } = useParams()
  const playlistID = Number(id)
  const navigate = useNavigate()

  const dispatch = useAppDispatch()
  // TODO add playlist tutorials
  const [deletePlaylist] = useDeletePlaylistMutation()
  const [clonePlaylist] = useClonePlaylistMutation()
  const [playPlaylist] = usePlayPlaylistMutation()
  const { data: playlist } = useGetPlaylistQuery(playlistID)
  const { data: items } = useGetPlaylistItemIdsQuery(playlistID)
  const { data: fullScreen } = useGetDisplaySettingsFullScreenQuery()
  const editingName = useAppSelector(selectPlaylistEditingName())

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string>()
  const [sceneID, setSceneID] = useState<number>(-1)

  const onPlayPlaylist = async () => {
    const { data } = await playPlaylist(playlistID)
    if (data != null) {
      setFullScreen(fullScreen === true)
      navigate(`/player/${data.value}`)
    }
  }

  const onToggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const beginEditingName = () => {
    if (playlist != null) {
      dispatch(setPlaylistEditingName(playlist.name))
    }
  }

  const endEditingName = (e: FormEvent) => {
    e.preventDefault()
    dispatch(setPlaylistName(playlistID, editingName as string))
    dispatch(setPlaylistEditingName(undefined))
  }

  const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(setPlaylistEditingName(e.currentTarget.value))
  }

  const onCloseDialog = () => {
    setOpenMenu(undefined)
  }

  const onDeletePlaylist = () => {
    setOpenMenu(MO.deleteAlert)
  }

  const onFinishDeletePlaylist = async () => {
    await deletePlaylist(playlistID)
    setOpenMenu(undefined)
  }

  const onClonePlaylist = async () => {
    const { data } = await clonePlaylist(playlistID)
    if (data != null) {
      await navigate(`/playlists/${data.value}`)
    }
  }

  const { classes } = useStyles()
  const open = drawerOpen
  return (
    <div className={classes.root}>
      <AppBar enableColorOnDark position="absolute" className={classes.appBar}>
        <Toolbar>
          <Tooltip disableInteractive title="Back" placement="right-end">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Back"
              onClick={() => {
                navigate(-1)
              }}
              size="large"
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          {editingName != null && (
            <form onSubmit={endEditingName} className={classes.titleField}>
              <TextField
                variant="standard"
                autoFocus
                fullWidth
                id="title"
                value={editingName}
                margin="none"
                slotProps={{ htmlInput: { className: classes.titleInput } }}
                onBlur={endEditingName}
                onChange={onChangeName}
              />
            </form>
          )}
          {editingName == null && (
            <>
              <div className={classes.fill} />
              <Typography
                component="h1"
                variant="h4"
                color="inherit"
                noWrap
                className={cx(
                  classes.title,
                  playlist?.name.length === 0 && classes.noTitle
                )}
                onClick={beginEditingName}
              >
                {playlist?.name}
              </Typography>
              <div className={classes.fill} />
            </>
          )}

          {(playlist?.type === PLT.audio || playlist?.type === PLT.script) && (
            <Box className={classes.sceneSelect}>
              <SceneSelect
                value={sceneID}
                onChange={setSceneID}
                includeRandom
              />
            </Box>
          )}
          <Fab
            className={classes.playButton}
            disabled={(items?.length ?? 0) === 0}
            color="secondary"
            aria-label="Play"
            onClick={onPlayPlaylist}
          >
            <PlayCircleOutlineIcon fontSize="large" />
          </Fab>
        </Toolbar>
      </AppBar>

      <Drawer
        className={cx(classes.drawer, drawerOpen && classes.backdropTop)}
        variant="permanent"
        classes={{
          paper: cx(classes.drawerPaper, !open && classes.drawerPaperClose)
        }}
        open={drawerOpen}
      >
        <div className={cx(!open && classes.appBarSpacerWrapper)}>
          <Collapse in={!open} className={classes.appBarSpacerCollapse}>
            <div className={classes.appBarSpacer} />
          </Collapse>
        </div>

        <ListItem className={classes.drawerButton}>
          <IconButton onClick={onToggleDrawer} size="large">
            <MenuIcon className={classes.drawerIcon} />
          </IconButton>
        </ListItem>

        <Divider />

        <div className={classes.fill} />
        <div>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Clone Playlist'}
          >
            <ListItemButton
              onClick={onClonePlaylist}
            >
              <ListItemIcon>
                <FileCopyIcon />
              </ListItemIcon>
              <ListItemText primary="Clone Playlist" />
            </ListItemButton>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Export Playlist'}
          >
            <ListItemButton
              onClick={() => {
                // TODO export subset of AppStorage
                // dispatch(exportPlaylist(playlistID))
              }}
            >
              <ListItemIcon>
                <PublishIcon />
              </ListItemIcon>
              <ListItemText primary="Export Playlist" />
            </ListItemButton>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Delete Playlist'}
          >
            <ListItemButton onClick={onDeletePlaylist}>
              <ListItemIcon>
                <DeleteForeverIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Delete Playlist" />
            </ListItemButton>
          </Tooltip>
          <Dialog
            open={openMenu === MO.deleteAlert}
            onClose={onCloseDialog}
            aria-labelledby="delete-title"
            aria-describedby="delete-description"
          >
            <DialogTitle id="Delete-title">
              Delete '{playlist?.name}'
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-description">
                Are you sure you want to delete {playlist?.name}? It will be
                automatically removed from all scenes/displays.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={onCloseDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={onFinishDeletePlaylist} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </Drawer>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth={false} className={classes.container}>
          <Typography component="div">
            <div className={classes.tabPanel}>
              <div className={classes.drawerSpacer} />
              <Box p={2} className={classes.fill}>
                <Grid2 container spacing={2} justifyContent="center">
                  <Grid2 size={{ xs: 12, sm: 10, md: 8, lg: 6 }}>
                    <Card>
                      <CardContent>
                        {playlist?.type === PLT.audio && (
                          <AudioPlaylist playlistID={playlistID} />
                        )}
                        {playlist?.type === PLT.display && (
                          <DisplayPlaylist playlistID={playlistID} />
                        )}
                        {playlist?.type === PLT.scene && (
                          <ScenePlaylist playlistID={playlistID} />
                        )}
                        {playlist?.type === PLT.script && (
                          <ScriptPlaylist playlistID={playlistID} />
                        )}
                      </CardContent>
                    </Card>
                  </Grid2>
                </Grid2>
              </Box>
            </div>
          </Typography>
        </Container>
      </main>
    </div>
  )
}

;(PlaylistSetup as any).displayName = 'PlaylistSetup'
export default PlaylistSetup

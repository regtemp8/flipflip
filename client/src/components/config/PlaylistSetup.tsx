import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
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
  Grid,
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

import { MO, PLT, SP } from 'flipflip-common'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { removePlaylist, setRouteGoBack } from '../../store/app/thunks'
import {
  selectAppConfigDisplaySettingsFullScreen,
  selectAppSpecialMode
} from '../../store/app/selectors'
import {
  selectPlaylistIsEmpty,
  selectPlaylistName,
  selectPlaylistType
} from '../../store/playlist/selectors'
import { setPlaylistName } from '../../store/playlist/slice'
import { clonePlaylist } from '../../store/playlist/thunks'
import AudioPlaylist from '../player/AudioPlaylist'
import ScriptPlaylist from '../configGroups/ScriptPlaylist'
import ScenePlaylist from './ScenePlaylist'
import DisplayPlaylist from './DisplayPlaylist'
import SceneSelect from '../configGroups/SceneSelect'
import {
  playAudioPlaylist,
  playDisplayPlaylist,
  playScenePlaylist,
  playScriptPlaylist
} from '../../store/player/thunks'
import { setFullScreen } from '../../data/actions'

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

export interface PlaylistSetupProps {
  playlistID: number
}

function PlaylistSetup(props: PlaylistSetupProps) {
  const { playlistID } = props
  const dispatch = useAppDispatch()
  // TODO add playlist tutorials
  const name = useAppSelector(selectPlaylistName(playlistID))
  const type = useAppSelector(selectPlaylistType(playlistID))
  const isEmpty = useAppSelector(selectPlaylistIsEmpty(playlistID))
  const autoEdit = useAppSelector(selectAppSpecialMode()) === SP.autoEdit
  const fullScreen = useAppSelector(selectAppConfigDisplaySettingsFullScreen())

  const [isEditingName, setIsEditingName] = useState<string>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string>()
  const [sceneID, setSceneID] = useState<number>(-1)

  useEffect(() => {
    if (autoEdit) {
      setIsEditingName(name)
    }
  }, [autoEdit, name])

  const onPlayPlaylist = () => {
    if (type === PLT.audio) {
      dispatch(playAudioPlaylist(playlistID, sceneID))
    } else if (type === PLT.display) {
      dispatch(playDisplayPlaylist(playlistID))
    } else if (type === PLT.scene) {
      dispatch(playScenePlaylist(playlistID))
    } else if (type === PLT.script) {
      dispatch(playScriptPlaylist(playlistID, sceneID))
    }

    setFullScreen(fullScreen)
  }

  const onToggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const beginEditingName = () => {
    setIsEditingName(name)
  }

  const endEditingName = (e: FormEvent) => {
    e.preventDefault()
    dispatch(
      setPlaylistName({ id: playlistID, value: isEditingName as string })
    )
    setIsEditingName(undefined)
  }

  const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setIsEditingName(e.currentTarget.value)
  }

  const onCloseDialog = () => {
    setOpenMenu(undefined)
  }

  const onDeletePlaylist = () => {
    setOpenMenu(MO.deleteAlert)
  }

  const onFinishDeletePlaylist = () => {
    dispatch(removePlaylist(props.playlistID))
    setOpenMenu(undefined)
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
                dispatch(setRouteGoBack())
              }}
              size="large"
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          {isEditingName != null && (
            <form onSubmit={endEditingName} className={classes.titleField}>
              <TextField
                variant="standard"
                autoFocus
                fullWidth
                id="title"
                value={isEditingName}
                margin="none"
                inputProps={{ className: classes.titleInput }}
                onBlur={endEditingName}
                onChange={onChangeName}
              />
            </form>
          )}
          {isEditingName == null && (
            <React.Fragment>
              <div className={classes.fill} />
              <Typography
                component="h1"
                variant="h4"
                color="inherit"
                noWrap
                className={cx(
                  classes.title,
                  name.length === 0 && classes.noTitle
                )}
                onClick={beginEditingName}
              >
                {name}
              </Typography>
              <div className={classes.fill} />
            </React.Fragment>
          )}

          {(type === PLT.audio || type === PLT.script) && (
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
            disabled={isEmpty}
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
              onClick={() => {
                dispatch(clonePlaylist(playlistID))
              }}
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
            <DialogTitle id="Delete-title">Delete '{name}'</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-description">
                Are you sure you want to delete {name}? It will be automatically
                removed from all scenes/displays.
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
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={10} md={8} lg={6}>
                    <Card>
                      <CardContent>
                        {type === PLT.audio && (
                          <AudioPlaylist playlistID={playlistID} />
                        )}
                        {type === PLT.display && (
                          <DisplayPlaylist playlistID={playlistID} />
                        )}
                        {type === PLT.scene && (
                          <ScenePlaylist playlistID={playlistID} />
                        )}
                        {type === PLT.script && (
                          <ScriptPlaylist playlistID={playlistID} />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
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

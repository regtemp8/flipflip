/// <reference path="../../react-sortablejs.d.ts" />
import { useState } from 'react'
import {
  Link as RouterLink,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router'
import { cx } from '@emotion/css'

import {
  AppBar,
  Badge,
  Button,
  Chip,
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
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Tab,
  Tabs,
  type Theme,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AddIcon from '@mui/icons-material/Add'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CodeIcon from '@mui/icons-material/Code'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import DeleteIcon from '@mui/icons-material/Delete'
import GetAppIcon from '@mui/icons-material/GetApp'
import TvIcon from '@mui/icons-material/Tv'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import DescriptionIcon from '@mui/icons-material/Description'
import HelpIcon from '@mui/icons-material/Help'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'
import MenuIcon from '@mui/icons-material/Menu'
import MovieIcon from '@mui/icons-material/Movie'
import MovieFilterIcon from '@mui/icons-material/MovieFilter'
import SettingsIcon from '@mui/icons-material/Settings'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import SortIcon from '@mui/icons-material/Sort'
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate'
import CasinoIcon from '@mui/icons-material/Casino'

import { en, MO, PLT, SF, SPT } from 'flipflip-common'
import VSpin from '../animations/VSpin'
// import SceneSearch from './SceneSearch'
import DisplaysTab from './DisplaysTab'
import GeneratorsTab from './GeneratorsTab'
import PlaylistsTab from './PlaylistsTab'
import ScenesTab from './ScenesTab'
import {
  useCreateDisplayMutation,
  useCreatePlaylistMutation,
  useCreateSceneMutation,
  useGetLatestVersionQuery,
  useGetScenesQuery,
  useGetVersionQuery
} from '../../store/api/slice'

const drawerWidth = 240

const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      display: 'flex'
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth})`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    logo: {
      marginLeft: 24,
      width: theme.spacing(6),
      height: theme.spacing(6),
      marginRight: 5,
      background: 'url("img/flipflip_logo.png") no-repeat',
      backgroundSize: theme.spacing(6),
      transition: theme.transitions.create(['opacity', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    drawerLogo: {
      marginLeft: 0
    },
    title: {
      transition: theme.transitions.create(['opacity', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    version: {
      marginTop: 35,
      marginLeft: -11,
      transition: theme.transitions.create(['opacity', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    updateIcon: {
      float: 'right'
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
    drawerToolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      color: theme.palette.primary.contrastText,
      padding: '0 8px',
      paddingLeft: 23,
      backgroundColor: theme.palette.primary.main,
      minHeight: 64
    },
    drawerBottom: {
      width: drawerWidth,
      padding: 8,
      paddingLeft: 16,
      transition: theme.transitions.create(['opacity'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    drawerBottomClose: {
      opacity: 0,
      transition: theme.transitions.create(['opacity'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    chip: {
      transition: theme.transitions.create(['opacity'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    chipClose: {
      opacity: 0,
      transition: theme.transitions.create(['opacity'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    appBarSpacer: {
      backgroundColor: theme.palette.primary.main,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      minHeight: 64
    },
    content: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: theme.palette.background.default
    },
    container: {
      padding: theme.spacing(0),
      overflowY: 'auto'
    },
    sceneList: {
      padding: theme.spacing(1),
      display: 'flex',
      flexWrap: 'wrap'
    },
    scene: {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    deleteScene: {
      backgroundColor: theme.palette.error.main
    },
    addMenuButton: {
      backgroundColor: theme.palette.primary.dark,
      margin: 0,
      top: 'auto',
      right: 20,
      bottom: 20,
      left: 'auto',
      position: 'fixed'
    },
    sortMenuButton: {
      backgroundColor: theme.palette.secondary.dark,
      margin: 0,
      top: 'auto',
      right: 80,
      bottom: 20,
      left: 'auto',
      position: 'fixed'
    },
    randomButton: {
      backgroundColor: theme.palette.secondary.light,
      margin: 0,
      top: 'auto',
      right: 132,
      bottom: 20,
      left: 'auto',
      position: 'fixed'
    },
    generateTooltip: {
      top: 'auto',
      right: 28,
      bottom: 195,
      left: 'auto',
      position: 'fixed',
      borderRadius: '50%',
      width: theme.spacing(5),
      height: theme.spacing(5)
    },
    displayTooltip: {
      top: 'auto',
      right: 28,
      bottom: 140,
      left: 'auto',
      position: 'fixed',
      borderRadius: '50%',
      width: theme.spacing(5),
      height: theme.spacing(5)
    },
    playlistTooltip: {
      top: 'auto',
      right: 28,
      bottom: 85,
      left: 'auto',
      position: 'fixed',
      borderRadius: '50%',
      width: theme.spacing(5),
      height: theme.spacing(5)
    },
    addButton: {
      backgroundColor: theme.palette.primary.main,
      margin: 0,
      top: 'auto',
      right: 28,
      bottom: 25,
      left: 'auto',
      position: 'fixed',
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    addPlaylistButton: {
      marginBottom: 60
    },
    addDisplayButton: {
      marginBottom: 115
    },
    addGeneratorButton: {
      marginBottom: 170
    },
    addSceneButton: {
      marginBottom: 225
    },
    importSceneButton: {
      marginBottom: 280
    },
    deleteScenesButton: {
      marginBottom: 335,
      backgroundColor: theme.palette.error.main
    },
    addButtonClose: {
      marginBottom: 0,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    icon: {
      color: theme.palette.primary.contrastText
    },
    sortMenu: {
      width: 200
    },
    tabs: {
      borderRight: `1px solid ${theme.palette.divider}`
    },
    tab: {
      width: drawerWidth,
      height: theme.spacing(10),
      transition: theme.transitions.create(
        ['width', 'margin', 'background', 'opacity'],
        {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        }
      ),
      '&:hover': {
        background: 'rgba(0, 0, 0, 0.1)',
        opacity: 1,
        transition: theme.transitions.create(['background', 'opacity'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        })
      }
    },
    tabClose: {
      minWidth: 0,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9)
      }
    },
    sceneTab: {
      ariaControls: 'vertical-tabpanel-0'
    },
    generatorTab: {
      ariaControls: 'vertical-tabpanel-1'
    },
    displayTab: {
      ariaControls: 'vertical-tabpanel-2'
    },
    playlistTab: {
      ariaControls: 'vertical-tabpanel-3'
    },
    fill: {
      flexGrow: 1
    },
    backdropTop: {
      zIndex: theme.zIndex.modal + 1
    },
    highlight: {
      borderWidth: 2,
      borderColor: theme.palette.secondary.main,
      borderStyle: 'solid'
    },
    disable: {
      pointerEvents: 'none'
    },
    groupTitle: {
      lineHeight: '45px',
      minWidth: '20px',
      color: theme.palette.text.primary
    },
    titleInput: {
      color: theme.palette.text.primary,
      fontSize: theme.typography.h6.fontSize
    },
    groupHandle: {
      margin: theme.spacing(1),
      cursor: 'move'
    }
  }
})

const tabRoutes = ['/scenes', '/generators', '/displays', '/playlists']
const getOpenTab = (pathname: string) => {
  const index = tabRoutes.findIndex((tab) => tab === pathname)
  return index === -1 ? 0 : index
}

function FlipFlipUpdateNotification() {
  const { data } = useGetLatestVersionQuery()
  const { classes } = useStyles()

  return data != null ? (
    <Tooltip disableInteractive title={`Download ${data.version}`}>
      <IconButton
        color="inherit"
        className={classes.updateIcon}
        onClick={() => window.open(data.url, '_blank')?.focus()}
        size="large"
      >
        <Badge variant="dot" color="secondary">
          <SystemUpdateIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  ) : null
}

function ScenePicker() {
  const tutorial = ''
  const { classes } = useStyles()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [createScene] = useCreateSceneMutation()
  const [createPlaylist] = useCreatePlaylistMutation()
  const [createDisplay] = useCreateDisplayMutation()
  const { data: version } = useGetVersionQuery()
  const generatorCount = 0
  const displayCount = 0
  const playlistCount = 0
  const libraryCount = 1
  const audioLibraryCount = 1
  const scriptLibraryCount = 1
  const scenesToDelete = null
  const { data: scenes } = useGetScenesQuery()
  const importTitle = 'TODO import title'
  const canGenerate = false

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuAnchorEl, _setMenuAnchorEl] = useState<HTMLButtonElement>()
  const [openMenu, setOpenMenu] = useState<string>()
  const [createPlaylistType, setCreatePlaylistType] = useState<string>()

  const onToggleDrawer = () => setDrawerOpen(!drawerOpen)

  const openLink = (url: string) => {
    window.open(url, '_blank')?.focus()
  }

  const onDeleteScenes = () => {}
  const importAction = () => {}
  const onAddScene = async () => {
    const { data } = await createScene()
    if (data != null) {
      navigate(`/scenes/${data.value}`)
    }
  }
  const onAddGenerator = () => {}
  const onAddDisplay = async () => {
    const { data } = await createDisplay()
    if (data != null) {
      navigate(`/displays/${data.value}`)
    }
  }

  const onAddPlaylist = () => {
    setOpenMenu(MO.createPlaylist)
  }

  const onFinishCreatePlaylist = async () => {
    const { data } = await createPlaylist(createPlaylistType as string)
    setCreatePlaylistType(undefined)
    setOpenMenu(undefined)
    if (data != null) {
      navigate(`/playlists/${data.value}`)
    }
  }

  const onAddGroup = () => {}
  const onRandomScene = () => {}

  const onToggleNewMenu = () => {
    if (openMenu === MO.new) {
      setOpenMenu(undefined)
    } else {
      setOpenMenu(MO.new)
    }
  }

  const onOpenSortMenu = () => {}
  const onCloseDialog = () => setOpenMenu(undefined)
  const sortScenes = (_sortBy: string, _asc: boolean) => {}

  const sceneCount = scenes?.length ?? 0
  const openTab = getOpenTab(pathname)
  return (
    <div className={classes.root}>
      <AppBar
        enableColorOnDark
        position="absolute"
        className={cx(
          classes.appBar,
          drawerOpen && classes.appBarShift,
          tutorial === SPT.scenePicker && classes.backdropTop
        )}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Toggle Drawer"
            className={cx(tutorial === SPT.scenePicker && classes.highlight)}
            onClick={onToggleDrawer}
            size="large"
          >
            <MenuIcon />
          </IconButton>
          <VSpin>
            <div className={classes.logo} />
          </VSpin>
          <Typography
            component="h1"
            variant="h4"
            color="inherit"
            noWrap
            className={classes.title}
          >
            FlipFlip
          </Typography>
          <Typography
            variant="caption"
            color="inherit"
            noWrap
            className={classes.version}
          >
            {version?.value != null ? `v${version.value}` : ''}
          </Typography>
          <div className={classes.fill} />
          <FlipFlipUpdateNotification />
          {/* <SceneSearch id="scene-picker-search" placeholder={'Search ...'} /> */}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        className={
          tutorial === SPT.drawer
            ? cx(classes.backdropTop, classes.disable, classes.highlight)
            : ''
        }
        classes={{
          paper: cx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          )
        }}
        open={drawerOpen}
      >
        <div className={classes.drawerToolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Toggle Drawer"
            onClick={onToggleDrawer}
            size="large"
          >
            <MenuIcon />
          </IconButton>
          <VSpin>
            <div className={cx(classes.logo, classes.drawerLogo)} />
          </VSpin>
          <Typography component="h1" variant="h6" color="inherit" noWrap>
            FlipFlip
          </Typography>
        </div>

        <Divider />

        <div>
          <Tabs
            orientation="vertical"
            value={openTab}
            aria-label="scene picker tabs"
            className={classes.tabs}
          >
            <Tab
              id="vertical-tab-0"
              aria-controls="vertical-tabpanel-0"
              icon={<MovieIcon />}
              label={drawerOpen ? `Scenes (${sceneCount})` : ''}
              className={cx(
                classes.tab,
                classes.sceneTab,
                !drawerOpen && classes.tabClose
              )}
              tabIndex={0}
              component={(props) => <RouterLink {...props} to={tabRoutes[0]} />}
            />
            <Tab
              id="vertical-tab-1"
              aria-controls="vertical-tabpanel-1"
              icon={<MovieFilterIcon />}
              label={drawerOpen ? `Scene Generators (${generatorCount})` : ''}
              className={cx(
                classes.tab,
                classes.generatorTab,
                !drawerOpen && classes.tabClose
              )}
              tabIndex={1}
              component={(props) => <RouterLink {...props} to={tabRoutes[1]} />}
            />
            <Tab
              id="vertical-tab-3"
              aria-controls="vertical-tabpanel-3"
              icon={<TvIcon />}
              label={drawerOpen ? `Displays (${displayCount})` : ''}
              className={cx(
                classes.tab,
                classes.displayTab,
                !drawerOpen && classes.tabClose
              )}
              tabIndex={2}
              component={(props) => <RouterLink {...props} to={tabRoutes[2]} />}
            />
            <Tab
              id="vertical-tab-4"
              aria-controls="vertical-tabpanel-4"
              icon={<PlaylistPlayIcon />}
              label={drawerOpen ? `Playlists (${playlistCount})` : ''}
              className={cx(
                classes.tab,
                classes.playlistTab,
                !drawerOpen && classes.tabClose
              )}
              tabIndex={3}
              component={(props) => <RouterLink {...props} to={tabRoutes[3]} />}
            />
          </Tabs>
        </div>

        <Divider />

        <div>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Library'}>
            <ListItemButton onClick={() => navigate('/content-library')}>
              <ListItemIcon>
                <LocalLibraryIcon />
              </ListItemIcon>
              <ListItemText primary="Library" />
              {libraryCount > 0 && (
                <Chip
                  className={cx(classes.chip, !open && classes.chipClose)}
                  label={libraryCount}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </ListItemButton>
          </Tooltip>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Audio Library'}>
            <ListItemButton onClick={() => navigate('/audio-library')}>
              <ListItemIcon>
                <LibraryMusicIcon />
              </ListItemIcon>
              <ListItemText primary="Audio Library" />
              {audioLibraryCount > 0 && (
                <Chip
                  className={cx(classes.chip, !open && classes.chipClose)}
                  label={audioLibraryCount}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </ListItemButton>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Script Library'}
          >
            <ListItemButton onClick={() => navigate('/script-library')}>
              <ListItemIcon>
                <LibraryBooksIcon />
              </ListItemIcon>
              <ListItemText primary="Script Library" />
              {scriptLibraryCount > 0 && (
                <Chip
                  className={cx(classes.chip, !open && classes.chipClose)}
                  label={scriptLibraryCount}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </ListItemButton>
          </Tooltip>
        </div>

        <Divider />

        <div>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Caption Scriptor'}
          >
            <ListItemButton onClick={() => navigate('/scriptor')}>
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText primary="Caption Scriptor" />
            </ListItemButton>
          </Tooltip>
        </div>

        <Divider />

        <div>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Settings'}>
            <ListItemButton onClick={() => navigate('/settings')}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </Tooltip>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'User Manual'}>
            <ListItemButton
              onClick={() =>
                openLink('https://regtemp8.github.io/flipflip/#/v4/')
              }
            >
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="User Manual" />
            </ListItemButton>
          </Tooltip>
        </div>

        <div className={classes.fill} />
        <div
          className={cx(
            classes.drawerBottom,
            !drawerOpen && classes.drawerBottomClose
          )}
        >
          <Typography variant="body2" color="inherit">
            Questions? Suggestions?
            <br />
            Visit us on{' '}
            <Link href="https://github.com/regtemp8/flipflip" underline="hover">
              GitHub
            </Link>{' '}
            or{' '}
            <Link href="https://www.reddit.com/r/flipflip" underline="hover">
              Reddit
            </Link>
          </Typography>
        </div>
      </Drawer>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth={false} className={classes.container}>
          <Routes>
            <Route path="/displays" element={<DisplaysTab />} />
            <Route path="/generators" element={<GeneratorsTab />} />
            <Route path="/playlists" element={<PlaylistsTab />} />
            <Route path="*" element={<ScenesTab />} />
          </Routes>
        </Container>
      </main>

      {scenesToDelete == null && (
        <>
          {sceneCount > 0 && (
            <Tooltip disableInteractive title="Delete Scenes" placement="left">
              <Fab
                className={cx(
                  classes.addButton,
                  classes.deleteScenesButton,
                  openMenu !== MO.new && classes.addButtonClose
                )}
                onClick={onDeleteScenes}
                size="small"
              >
                <DeleteIcon className={classes.icon} />
              </Fab>
            </Tooltip>
          )}
          <Tooltip disableInteractive title={importTitle} placement="left">
            <Fab
              className={cx(
                classes.addButton,
                classes.importSceneButton,
                openMenu !== MO.new && classes.addButtonClose
              )}
              onClick={importAction}
              size="small"
            >
              <GetAppIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip disableInteractive title="Add Scene" placement="left">
            <Fab
              className={cx(
                classes.addButton,
                classes.addSceneButton,
                openMenu !== MO.new && classes.addButtonClose,
                tutorial === SPT.add2 &&
                  cx(classes.backdropTop, classes.highlight)
              )}
              onClick={onAddScene}
              size="small"
            >
              <MovieIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip
            disableInteractive
            title="Add Scene Generator"
            placement="left"
          >
            <span
              className={classes.generateTooltip}
              style={!canGenerate ? { pointerEvents: 'none' } : {}}
            >
              <Fab
                className={cx(
                  classes.addButton,
                  classes.addGeneratorButton,
                  openMenu !== MO.new && classes.addButtonClose
                )}
                onClick={onAddGenerator}
                disabled={!canGenerate}
                size="small"
              >
                <MovieFilterIcon className={classes.icon} />
              </Fab>
            </span>
          </Tooltip>
          <Tooltip disableInteractive title="Add Display" placement="left">
            <span className={classes.displayTooltip}>
              <Fab
                className={cx(
                  classes.addButton,
                  classes.addDisplayButton,
                  openMenu !== MO.new && classes.addButtonClose
                )}
                onClick={onAddDisplay}
                size="small"
              >
                <TvIcon className={classes.icon} />
              </Fab>
            </span>
          </Tooltip>
          <Tooltip disableInteractive title="Add Playlist" placement="left">
            <span className={classes.playlistTooltip}>
              <Fab
                className={cx(
                  classes.addButton,
                  classes.addPlaylistButton,
                  openMenu !== MO.new && classes.addButtonClose
                )}
                onClick={onAddPlaylist}
                size="small"
              >
                <PlaylistPlayIcon className={classes.icon} />
              </Fab>
            </span>
          </Tooltip>
          <Tooltip disableInteractive title="Add Group" placement="left">
            <Fab
              className={cx(
                classes.addButton,
                classes.addPlaylistButton,
                openMenu === MO.new && classes.addButtonClose
              )}
              onClick={onAddGroup}
              size="small"
            >
              <CreateNewFolderIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Fab
            className={cx(
              classes.addMenuButton,
              (tutorial === SPT.add1 || tutorial === SPT.add2) &&
                classes.backdropTop,
              tutorial === SPT.add1 && classes.highlight
            )}
            onClick={onToggleNewMenu}
            size="large"
          >
            <AddIcon className={classes.icon} />
          </Fab>

          {sceneCount >= 2 && (
            <>
              <Fab
                className={classes.sortMenuButton}
                aria-haspopup="true"
                aria-controls="sort-menu"
                aria-label="Sort Scenes"
                onClick={onOpenSortMenu}
                size="medium"
              >
                <SortIcon className={classes.icon} />
              </Fab>
              <Menu
                id="sort-menu"
                elevation={1}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center'
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                anchorEl={menuAnchorEl}
                keepMounted
                classes={{ paper: classes.sortMenu }}
                open={openMenu === MO.sort}
                onClose={onCloseDialog}
              >
                {[SF.alpha, SF.date, SF.count].map((sf) => (
                  <ListItem
                    key={sf}
                    secondaryAction={
                      <>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            sortScenes(sf, true)
                          }}
                          size="large"
                        >
                          <ArrowUpwardIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            sortScenes(sf, false)
                          }}
                          size="large"
                        >
                          <ArrowDownwardIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText primary={en.get(sf)} />
                  </ListItem>
                ))}
                <ListItem
                  key={SF.random}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => {
                        sortScenes(SF.random, true)
                      }}
                      size="large"
                    >
                      <ShuffleIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={en.get(SF.random)} />
                </ListItem>
              </Menu>
            </>
          )}
          <Tooltip disableInteractive title="Random Scene">
            <Fab
              className={classes.randomButton}
              onClick={onRandomScene}
              size="small"
            >
              <CasinoIcon className={classes.icon} />
            </Fab>
          </Tooltip>
        </>
      )}
      <Dialog
        open={openMenu === MO.createPlaylist}
        onClose={onCloseDialog}
        aria-labelledby="create-playlist-title"
        aria-describedby="create-playlist-description"
      >
        <DialogTitle id="create-playlist-title">Create Playlist</DialogTitle>
        <DialogContent>
          <DialogContentText id="create-playlist-description">
            Choose the type of playlist you want to create.
          </DialogContentText>
          <List>
            <ListItemButton
              onClick={() => setCreatePlaylistType(PLT.audio)}
              selected={createPlaylistType === PLT.audio}
            >
              <ListItemIcon>
                <AudiotrackIcon />
              </ListItemIcon>
              <ListItemText primary="Audio Playlist" />
            </ListItemButton>
            <ListItemButton
              onClick={() => setCreatePlaylistType(PLT.scene)}
              selected={createPlaylistType === PLT.scene}
            >
              <ListItemIcon>
                <MovieIcon />
              </ListItemIcon>
              <ListItemText primary="Scene Playlist" />
            </ListItemButton>
            <ListItemButton
              onClick={() => setCreatePlaylistType(PLT.script)}
              selected={createPlaylistType === PLT.script}
            >
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary="Script Playlist" />
            </ListItemButton>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog}>Cancel</Button>
          <Button
            color="primary"
            disabled={createPlaylistType == null}
            onClick={() => onFinishCreatePlaylist()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

;(ScenePicker as any).displayName = 'ScenePicker'
export default ScenePicker

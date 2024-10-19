/// <reference path="../../react-sortablejs.d.ts" />
import React, { useState, SyntheticEvent } from 'react'
import {
  Link as RouterLink,
  Route,
  Routes,
  useLocation,
  Navigate,
  useNavigate
} from 'react-router-dom'
import { cx } from '@emotion/css'

import {
  AppBar,
  Badge,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  Link,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  type Theme,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import CodeIcon from '@mui/icons-material/Code'
import TvIcon from '@mui/icons-material/Tv'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import HelpIcon from '@mui/icons-material/Help'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'
import MenuIcon from '@mui/icons-material/Menu'
import MovieIcon from '@mui/icons-material/Movie'
import MovieFilterIcon from '@mui/icons-material/MovieFilter'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate'
import { SPT } from 'flipflip-common'
import VSpin from '../animations/VSpin'
// import SceneSearch from './SceneSearch'
import DisplaysTab from './DisplaysTab'
import GeneratorsTab from './GeneratorsTab'
import PlaylistsTab from './PlaylistsTab'
import ScenesTab from './ScenesTab'
import { useGetVersionQuery } from '../../store/api/slice'

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
    deleteButton: {
      backgroundColor: theme.palette.error.main,
      margin: 0,
      top: 'auto',
      right: 20,
      bottom: 20,
      left: 'auto',
      position: 'fixed'
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
    extraWindowRandomButton: {
      right: 28,
      bottom: 25
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

function ScenePicker() {
  const tutorial = ''
  const { classes } = useStyles()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const { data: version } = useGetVersionQuery()
  const sceneCount = 0
  const generatorCount = 0
  const displayCount = 0
  const playlistCount = 0
  const libraryCount = 1
  const audioLibraryCount = 1
  const scriptLibraryCount = 1

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newVersion, setNewVersion] = useState('')

  const onToggleDrawer = () => setDrawerOpen(!drawerOpen)
  const openGitRelease = () => {}

  const openLink = (url: string) => {
    window.open(url, '_blank')?.focus()
  }

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
            {version?.success != null ? `v${version.success}` : ''}
          </Typography>
          <div className={classes.fill} />
          {newVersion !== '' && (
            <Tooltip disableInteractive title={`Download ${newVersion}`}>
              <IconButton
                color="inherit"
                className={classes.updateIcon}
                onClick={openGitRelease}
                size="large"
              >
                <Badge variant="dot" color="secondary">
                  <SystemUpdateIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          {/* <SceneSearch placeholder={'Search ...'} /> */}
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
            title={drawerOpen ? '' : 'Caption Scripter'}
          >
            <ListItemButton onClick={() => navigate('/scripter')}>
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText primary="Caption Scripter" />
            </ListItemButton>
          </Tooltip>
        </div>

        <Divider />

        <div>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Account'}>
            <ListItemButton onClick={() => navigate('/account')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Account" />
            </ListItemButton>
          </Tooltip>
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
              onClick={() => openLink('https://regtemp8.github.io/flipflip/#/')}
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
    </div>
  )
}

;(ScenePicker as any).displayName = 'ScenePicker'
export default ScenePicker

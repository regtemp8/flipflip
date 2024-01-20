import React, { useState } from 'react'
import { cx } from '@emotion/css'

import {
  AppBar,
  Box,
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
  IconButton,
  ListItem,
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

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BuildIcon from '@mui/icons-material/Build'
import LiveHelpIcon from '@mui/icons-material/LiveHelp'
import MenuIcon from '@mui/icons-material/Menu'
import PhotoFilterIcon from '@mui/icons-material/PhotoFilter'
import RestoreIcon from '@mui/icons-material/Restore'
import SettingsIcon from '@mui/icons-material/Settings'

import GeneralConfig from './GeneralConfig'
import SceneOptions from '../sceneDetail/SceneOptions'
import SceneEffects from '../sceneDetail/SceneEffects'

import { MO } from 'flipflip-common'
import { setDefaultConfig, setResetAllTutorials } from '../../store/app/slice'
import { setRouteGoBack } from '../../store/app/thunks'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectAppConfigTutorials } from '../../store/app/selectors'

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
  drawer: {
    position: 'absolute'
  },
  drawerSpacer: {
    minWidth: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      minWidth: theme.spacing(9)
    }
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    height: '100vh',
    width: drawerWidth,
    zIndex: theme.zIndex.drawer + 2,
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
    zIndex: theme.zIndex.drawer,
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9)
    }
  },
  drawerButton: {
    backgroundColor: theme.palette.primary.main,
    minHeight: theme.spacing(6),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0
    }
  },
  drawerIcon: {
    color: theme.palette.primary.contrastText
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`
  },
  tab: {
    width: drawerWidth,
    height: theme.spacing(12),
    transition: theme.transitions.create(
      ['width', 'margin', 'background', 'opacity'],
      {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      }
    ),
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
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
  optionsTab: {
    ariaControls: 'vertical-tabpanel-0'
  },
  effectsTab: {
    ariaControls: 'vertical-tabpanel-1'
  },
  sourcesTab: {
    ariaControls: 'vertical-tabpanel-2'
  },
  tabPanel: {
    display: 'flex',
    height: '100%'
  },
  deleteItem: {
    color: theme.palette.error.main
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
  }
}))

function ConfigForm() {
  const dispatch = useAppDispatch()
  const tutorials = useAppSelector(selectAppConfigTutorials())

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string>()
  const [openTab, setOpenTab] = useState(2)

  const onToggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }
  const onChangeTab = (e: any, newTab: number) => {
    setOpenTab(newTab)
  }
  const onRestoreDefaults = () => {
    setOpenMenu(MO.deleteAlert)
  }
  const onFinishRestoreDefaults = () => dispatch(setDefaultConfig())

  const onCloseDialog = () => {
    setOpenMenu(undefined)
    setDrawerOpen(false)
  }

  const { classes } = useStyles()
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

          <div className={classes.fill} />
          <Typography
            component="h1"
            variant="h4"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Settings
          </Typography>
          <div className={classes.fill} />
        </Toolbar>
      </AppBar>

      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: cx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          )
        }}
        open={drawerOpen}
      >
        <div className={cx(!drawerOpen && classes.appBarSpacerWrapper)}>
          <Collapse in={!drawerOpen} className={classes.appBarSpacerCollapse}>
            <div className={classes.appBarSpacer} />
          </Collapse>
        </div>

        <ListItem className={classes.drawerButton}>
          <IconButton onClick={onToggleDrawer} size="large">
            <MenuIcon className={classes.drawerIcon} />
          </IconButton>
        </ListItem>

        <Divider />

        <div>
          <Tabs
            orientation="vertical"
            value={openTab}
            onChange={onChangeTab}
            aria-label="scene detail tabs"
            className={classes.tabs}
          >
            <Tab
              id="vertical-tab-0"
              aria-controls="vertical-tabpanel-0"
              icon={<BuildIcon />}
              label={drawerOpen ? 'Default Options' : ''}
              className={cx(
                classes.tab,
                classes.optionsTab,
                !drawerOpen && classes.tabClose
              )}
            />
            <Tab
              id="vertical-tab-1"
              aria-controls="vertical-tabpanel-1"
              icon={<PhotoFilterIcon />}
              label={drawerOpen ? 'Default Effects' : ''}
              className={cx(
                classes.tab,
                classes.effectsTab,
                !drawerOpen && classes.tabClose
              )}
            />
            <Tab
              id="vertical-tab-2"
              aria-controls="vertical-tabpanel-2"
              icon={<SettingsIcon />}
              label={drawerOpen ? 'General Settings' : ''}
              className={cx(
                classes.tab,
                classes.sourcesTab,
                !drawerOpen && classes.tabClose
              )}
            />
          </Tabs>
        </div>
        <div className={classes.fill} />

        <div>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Reset Tutorials'}
          >
            <ListItemButton
              disabled={
                tutorials.scenePicker == null &&
                tutorials.sceneDetail == null &&
                tutorials.player == null &&
                tutorials.library == null &&
                tutorials.audios == null &&
                tutorials.scripts == null &&
                tutorials.scriptor == null &&
                tutorials.sceneGenerator == null &&
                tutorials.sceneGrid == null &&
                tutorials.videoClipper == null
              }
              onClick={() => dispatch(setResetAllTutorials())}
              className={classes.deleteItem}
            >
              <ListItemIcon>
                <LiveHelpIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Reset Tutorials" />
            </ListItemButton>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Restore Defaults'}
          >
            <ListItemButton
              onClick={onRestoreDefaults}
              className={classes.deleteItem}
            >
              <ListItemIcon>
                <RestoreIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Restore Defaults" />
            </ListItemButton>
          </Tooltip>
          <Dialog
            open={openMenu === MO.deleteAlert}
            onClose={onCloseDialog}
            aria-labelledby="delete-title"
            aria-describedby="delete-description"
          >
            <DialogTitle id="Delete-title">Restore Defaults</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-description">
                Are you sure you want to restore all settings to their defaults?
                This will also reset any configured APIs.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={onCloseDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={onFinishRestoreDefaults} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </Drawer>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth={false} className={classes.container}>
          {openTab === 0 && (
            <Typography component="div">
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box p={2} className={classes.fill}>
                  <SceneOptions />
                </Box>
              </div>
            </Typography>
          )}

          {openTab === 1 && (
            <Typography component="div">
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box p={2} className={classes.fill}>
                  <SceneEffects />
                </Box>
              </div>
            </Typography>
          )}

          {openTab === 2 && (
            <Typography component="div">
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box p={2} className={classes.fill}>
                  <GeneralConfig />
                </Box>
              </div>
            </Typography>
          )}
        </Container>
      </main>
    </div>
  )
}

;(ConfigForm as any).displayName = 'ConfigForm'
export default ConfigForm

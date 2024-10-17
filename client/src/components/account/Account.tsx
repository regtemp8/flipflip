/// <reference path="../../react-sortablejs.d.ts" />
import React, { useState, SyntheticEvent } from 'react'
import {
  Link as RouterLink,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom'
import { cx } from '@emotion/css'

import {
  AppBar,
  Container,
  Divider,
  Drawer,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  type Theme,
  Toolbar,
  Tooltip,
  Typography,
  Collapse,
  ListItem,
  Box,
  Fab
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import Connect from './Connect'
import ManageAccount from './ManageAccount'
import { useLogoutMutation } from '../../store/api/slice'
import { useAppDispatch } from '../../store/hooks'
import { refreshConnectToken } from '../../store/api/thunks'

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
  },
  playButton: {
    boxShadow: 'none'
  }
}))

const tabRoutes = ['/account/connect', '/account/manage']
const tabTitles = ['Connect Devices', 'Manage Account']
const getOpenTab = (pathname: string) => {
  const index = tabRoutes.findIndex((tab) => tab === pathname)
  return pathname.startsWith('/account') && index === -1 ? 0 : index
}

function Account() {
  const dispatch = useAppDispatch()
  const { classes } = useStyles()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [logout] = useLogoutMutation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const onToggleDrawer = () => setDrawerOpen(!drawerOpen)

  const openTab = getOpenTab(pathname)
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
                navigate('/')
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
            {tabTitles[openTab]}
          </Typography>
          <div className={classes.fill} />
          {openTab == 0 && (
            <Fab
              className={classes.playButton}
              color="secondary"
              aria-label="Refresh token"
              onClick={() => dispatch(refreshConnectToken())}
            >
              <RefreshOutlinedIcon fontSize="large" />
            </Fab>
          )}
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
            aria-label="account tabs"
            className={classes.tabs}
          >
            <Tab
              id="vertical-tab-0"
              aria-controls="vertical-tabpanel-0"
              icon={<QrCode2Icon />}
              label={drawerOpen ? `Connect` : ''}
              className={cx(
                classes.tab,
                classes.optionsTab,
                !drawerOpen && classes.tabClose
              )}
              tabIndex={0}
              component={(props) => <RouterLink to={tabRoutes[0]} {...props} />}
            />
            <Tab
              id="vertical-tab-1"
              aria-controls="vertical-tabpanel-1"
              icon={<ManageAccountsIcon />}
              label={drawerOpen ? `Manage Account` : ''}
              className={cx(
                classes.tab,
                classes.effectsTab,
                !drawerOpen && classes.tabClose
              )}
              tabIndex={1}
              component={(props) => <RouterLink to={tabRoutes[1]} {...props} />}
            />
          </Tabs>
        </div>
        <div className={classes.fill} />

        <div>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Logout'}>
            <ListItemButton
              onClick={async () => {
                await logout()
              }}
              className={classes.deleteItem}
            >
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </Tooltip>
        </div>
      </Drawer>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth={false} className={classes.container}>
          <Typography component="div">
            <div className={classes.tabPanel}>
              <div className={classes.drawerSpacer} />
              <Box p={2} className={classes.fill}>
                <Routes>
                  <Route path="*" element={<Connect />} />
                  <Route path="/manage" element={<ManageAccount />} />
                </Routes>
              </Box>
            </div>
          </Typography>
        </Container>
      </main>
    </div>
  )
}

;(Account as any).displayName = 'Account'
export default Account

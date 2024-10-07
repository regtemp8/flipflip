/// <reference path="../../react-sortablejs.d.ts" />
import React, { useState, SyntheticEvent } from 'react'
import {
  Link as RouterLink,
  Route,
  Routes,
  useLocation
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
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { SPT } from 'flipflip-common'
import VSpin from '../animations/VSpin'
import Connect from './Connect'
import ManageAccount from './ManageAccount'
import { useGetVersionQuery, useLogoutMutation } from '../../store/api'

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
    icon: {
      color: theme.palette.primary.contrastText
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
  }
})

const tabRoutes = ['/account/connect', '/account/manage']
const getOpenTab = (pathname: string) => {
  return tabRoutes.findIndex((tab) => tab === pathname)
}

function Account() {
  const tutorial = ''
  const { classes } = useStyles()
  const { pathname } = useLocation()

  const [logout] = useLogoutMutation()
  const {data: version} = useGetVersionQuery()

  const [openTab, setOpenTab] = useState(getOpenTab(pathname))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const onChangeTab = (e: SyntheticEvent, tab: number) => {
    if (openTab !== tab) {
      setOpenTab(tab)
    }
  }

  const onToggleDrawer = () => setDrawerOpen(!drawerOpen)

  return (
    <div className={classes.root}>
      <AppBar
        enableColorOnDark
        position="absolute"
        className={cx(classes.appBar, drawerOpen && classes.appBarShift)}
      >
        <Toolbar>
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
            onChange={onChangeTab}
            aria-label="scene picker tabs"
            className={classes.tabs}
          >
            <Tab
              id="vertical-tab-0"
              aria-controls="vertical-tabpanel-0"
              icon={<QrCode2Icon />}
              label={drawerOpen ? `Connect` : ''}
              className={cx(
                classes.tab,
                classes.sceneTab,
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
                classes.generatorTab,
                !drawerOpen && classes.tabClose
              )}
              tabIndex={1}
              component={(props) => <RouterLink to={tabRoutes[1]} {...props} />}
            />
          </Tabs>
        </div>

        <Divider />

        <div>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Logout'}>
            <ListItemButton
              onClick={async () => {
                await logout()
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </Tooltip>
        </div>
      </Drawer>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth={false} className={classes.container}>
          <Routes>
            <Route index path="/connect" element={<Connect />} />
            <Route path="/manage" element={<ManageAccount />} />
          </Routes>
        </Container>
      </main>
    </div>
  )
}

;(Account as any).displayName = 'Account'
export default Account

import React, { useState, useRef, type ChangeEvent } from 'react'
import clsx from 'clsx'
import { v4 as uuidv4 } from 'uuid'
import wretch from 'wretch'
import FormUrlAddon from 'wretch/addons/formUrl'
import AbortAddon from 'wretch/addons/abort'

import {
  Alert,
  Avatar,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slide,
  Snackbar,
  TextField,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import { IG, MO, SS, ST } from '../../data/const'
import en from '../../data/en'
import SourceIcon from '../library/SourceIcon'
import BaseSwitch from '../common/BaseSwitch'
import {
  setConfigRemoteSettingsSilenceTumblrAlert,
  setConfigRemoteSettingsTumblrKey,
  setConfigRemoteSettingsTumblrSecret,
  setConfigRemoteSettingsTumblrOAuthToken,
  setConfigRemoteSettingsTumblrOAuthTokenSecret,
  setConfigRemoteSettingsRedditDeviceID,
  setConfigRemoteSettingsRedditRefreshToken,
  setConfigRemoteSettingsTwitterAccessTokenKey,
  setConfigRemoteSettingsTwitterAccessTokenSecret,
  setConfigRemoteSettingsInstagramUsername,
  setConfigRemoteSettingsInstagramPassword,
  setConfigRemoteSettingsHydrusProtocol,
  setConfigRemoteSettingsHydrusDomain,
  setConfigRemoteSettingsHydrusPort,
  setConfigRemoteSettingsHydrusAPIKey,
  setConfigRemoteSettingsPiwigoProtocol,
  setConfigRemoteSettingsPiwigoHost,
  setConfigRemoteSettingsPiwigoUsername,
  setConfigRemoteSettingsPiwigoPassword
} from '../../../store/app/slice'
import {
  selectAppConfigRemoteSettingsSilenceTumblrAlert,
  selectAppConfigRemoteSettingsTumblrAuthorized,
  selectAppConfigRemoteSettingsTumblrKeys,
  selectAppConfigRemoteSettingsTumblrKey,
  selectAppConfigRemoteSettingsTumblrSecrets,
  selectAppConfigRemoteSettingsTumblrSecret,
  selectAppConfigRemoteSettingsRedditAuthorized,
  selectAppConfigRemoteSettingsRedditClientID,
  selectAppConfigRemoteSettingsRedditUserAgent,
  selectAppConfigRemoteSettingsRedditDeviceID,
  selectAppConfigRemoteSettingsTwitterAuthorized,
  selectAppConfigRemoteSettingsTwitterConsumerKey,
  selectAppConfigRemoteSettingsTwitterConsumerSecret,
  selectAppConfigRemoteSettingsInstagramConfigured,
  selectAppConfigRemoteSettingsInstagramUsername,
  selectAppConfigRemoteSettingsInstagramPassword,
  selectAppConfigRemoteSettingsHydrusConfigured,
  selectAppConfigRemoteSettingsHydrusProtocol,
  selectAppConfigRemoteSettingsHydrusDomain,
  selectAppConfigRemoteSettingsHydrusPort,
  selectAppConfigRemoteSettingsHydrusAPIKey,
  selectAppConfigRemoteSettingsPiwigoConfigured,
  selectAppConfigRemoteSettingsPiwigoProtocol,
  selectAppConfigRemoteSettingsPiwigoHost,
  selectAppConfigRemoteSettingsPiwigoUsername,
  selectAppConfigRemoteSettingsPiwigoPassword
} from '../../../store/app/selectors'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    fab: {
      boxShadow: 'none'
    },
    authorized: {
      backgroundColor: theme.palette.primary.main
    },
    noAuth: {
      backgroundColor: theme.palette.error.main
    },
    icon: {
      color: theme.palette.primary.contrastText
    },
    iconAvatar: {
      float: 'right',
      backgroundColor: theme.palette.primary.light
    },
    title: {
      paddingBottom: theme.spacing(1)
    },
    tumblrFields: {
      paddingTop: theme.spacing(2)
    },
    center: {
      textAlign: 'center'
    },
    middleInput: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1)
    }
  })

function TransitionUp(props: any) {
  return <Slide {...props} direction="up" />
}

function APICard(props: WithStyles<typeof styles>) {
  const dispatch = useAppDispatch()
  const tumblrAuthorized = useAppSelector(
    selectAppConfigRemoteSettingsTumblrAuthorized()
  )
  const tumblrKeys = useAppSelector(selectAppConfigRemoteSettingsTumblrKeys())
  const tumblrKey = useAppSelector(selectAppConfigRemoteSettingsTumblrKey())
  const tumblrSecrets = useAppSelector(
    selectAppConfigRemoteSettingsTumblrSecrets()
  )
  const tumblrSecret = useAppSelector(
    selectAppConfigRemoteSettingsTumblrSecret()
  )
  const redditAuthorized = useAppSelector(
    selectAppConfigRemoteSettingsRedditAuthorized()
  )
  const redditClientID = useAppSelector(
    selectAppConfigRemoteSettingsRedditClientID()
  )
  const redditUserAgent = useAppSelector(
    selectAppConfigRemoteSettingsRedditUserAgent()
  )
  const redditDeviceID = useAppSelector(
    selectAppConfigRemoteSettingsRedditDeviceID()
  )
  const twitterAuthorized = useAppSelector(
    selectAppConfigRemoteSettingsTwitterAuthorized()
  )
  const twitterConsumerKey = useAppSelector(
    selectAppConfigRemoteSettingsTwitterConsumerKey()
  )
  const twitterConsumerSecret = useAppSelector(
    selectAppConfigRemoteSettingsTwitterConsumerSecret()
  )
  const instagramConfigured = useAppSelector(
    selectAppConfigRemoteSettingsInstagramConfigured()
  )
  const instagramUsername = useAppSelector(
    selectAppConfigRemoteSettingsInstagramUsername()
  )
  const instagramPassword = useAppSelector(
    selectAppConfigRemoteSettingsInstagramPassword()
  )
  const hydrusConfigured = useAppSelector(
    selectAppConfigRemoteSettingsHydrusConfigured()
  )
  const hydrusProtocol = useAppSelector(
    selectAppConfigRemoteSettingsHydrusProtocol()
  )
  const hydrusDomain = useAppSelector(
    selectAppConfigRemoteSettingsHydrusDomain()
  )
  const hydrusPort = useAppSelector(selectAppConfigRemoteSettingsHydrusPort())
  const hydrusAPIKey = useAppSelector(
    selectAppConfigRemoteSettingsHydrusAPIKey()
  )
  const piwigoConfigured = useAppSelector(
    selectAppConfigRemoteSettingsPiwigoConfigured()
  )
  const piwigoProtocol = useAppSelector(
    selectAppConfigRemoteSettingsPiwigoProtocol()
  )
  const piwigoHost = useAppSelector(selectAppConfigRemoteSettingsPiwigoHost())
  const piwigoUsername = useAppSelector(
    selectAppConfigRemoteSettingsPiwigoUsername()
  )
  const piwigoPassword = useAppSelector(
    selectAppConfigRemoteSettingsPiwigoPassword()
  )

  const [openMenu, setOpenMenu] = useState<string>()
  const [menuType, setMenuType] = useState<string>()
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<string>()
  const [snackbarSeverity, setSnackbarSeverity] = useState<string>()
  const [server, setServer] = useState<any>()
  const [instagramMode, setInstagramMode] = useState<string>()
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')
  const [input3, setInput3] = useState('')
  const [input4, setInput4] = useState('')

  const _tfa = useRef<any>()

  const showError = (error: string) => {
    setSnackbarOpen(true)
    setSnackbar('Error: ' + error)
    setSnackbarSeverity(SS.error)
  }

  const showSuccess = (message: string) => {
    setSnackbarOpen(true)
    setSnackbar(message)
    setSnackbarSeverity(SS.success)
  }

  const onClearTumblr = () => {
    setOpenMenu(MO.signOut)
    setMenuType(ST.tumblr)
  }

  const onFinishClearTumblr = () => {
    dispatch(setConfigRemoteSettingsTumblrOAuthToken(''))
    dispatch(setConfigRemoteSettingsTumblrOAuthTokenSecret(''))
    onCloseDialog()
  }

  const onClearReddit = () => {
    setOpenMenu(MO.signOut)
    setMenuType(ST.reddit)
  }

  const onFinishClearReddit = () => {
    dispatch(setConfigRemoteSettingsRedditRefreshToken(''))
    onCloseDialog()
  }

  const onClearTwitter = () => {
    setOpenMenu(MO.signOut)
    setMenuType(ST.twitter)
  }

  const onFinishClearTwitter = () => {
    dispatch(setConfigRemoteSettingsTwitterAccessTokenKey(''))
    dispatch(setConfigRemoteSettingsTwitterAccessTokenSecret(''))
    onCloseDialog()
  }

  const onClearInstagram = () => {
    setOpenMenu(MO.signOut)
    setMenuType(ST.instagram)
  }

  const onFinishClearInstagram = () => {
    dispatch(setConfigRemoteSettingsInstagramPassword(''))
    onCloseDialog()
  }

  const onClearHydrus = () => {
    setOpenMenu(MO.signOut)
    setMenuType(ST.hydrus)
  }

  const onFinishClearHydrus = () => {
    dispatch(setConfigRemoteSettingsHydrusProtocol('http'))
    dispatch(setConfigRemoteSettingsHydrusDomain('localhost'))
    dispatch(setConfigRemoteSettingsHydrusPort('45869'))
    dispatch(setConfigRemoteSettingsHydrusAPIKey(''))
    onCloseDialog()
  }

  const onClearPiwigo = () => {
    setOpenMenu(MO.signOut)
    setMenuType(ST.piwigo)
  }

  const onFinishClearPiwigo = () => {
    dispatch(setConfigRemoteSettingsPiwigoProtocol('http'))
    dispatch(setConfigRemoteSettingsPiwigoHost(''))
    dispatch(setConfigRemoteSettingsPiwigoUsername(''))
    dispatch(setConfigRemoteSettingsPiwigoPassword(''))
    onCloseDialog()
  }

  const onAuthTumblr = () => {
    setOpenMenu(MO.new)
    setMenuType(ST.tumblr)
    setInput1(tumblrKey)
    setInput2(tumblrSecret)
  }

  const onContinueAuthTumblr = () => {
    dispatch(setConfigRemoteSettingsTumblrKey(input1))
    dispatch(setConfigRemoteSettingsTumblrSecret(input2))
    setOpenMenu(MO.signIn)
    setMenuType(ST.tumblr)
  }

  const onTumblrKeyInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value === 0) {
      dispatch(setConfigRemoteSettingsTumblrKey(''))
      dispatch(setConfigRemoteSettingsTumblrSecret(''))
      setInput1('')
      setInput2('')
    } else {
      const indexOf = value - 1
      dispatch(setConfigRemoteSettingsTumblrKey(tumblrKeys[indexOf]))
      dispatch(setConfigRemoteSettingsTumblrSecret(tumblrSecrets[indexOf]))
      setInput1(tumblrKeys[indexOf])
      setInput2(tumblrSecrets[indexOf])
    }
  }

  const onAuthReddit = () => {
    setOpenMenu(MO.signIn)
    setMenuType(ST.reddit)
  }

  const onAuthTwitter = () => {
    setOpenMenu(MO.signIn)
    setMenuType(ST.twitter)
  }

  const onAuthInstagram = () => {
    setOpenMenu(MO.signIn)
    setMenuType(ST.instagram)
    setInput1(instagramUsername)
    setInput2(instagramPassword)
  }

  const onAuthHydrus = () => {
    setOpenMenu(MO.signIn)
    setMenuType(ST.hydrus)
    setInput1(hydrusProtocol)
    setInput2(hydrusDomain)
    setInput3(hydrusPort)
    setInput4(hydrusAPIKey)
  }

  const onAuthPiwigo = () => {
    setOpenMenu(MO.signIn)
    setMenuType(ST.piwigo)
    setInput1(piwigoProtocol)
    setInput2(piwigoHost)
    setInput3(piwigoUsername)
    setInput4(piwigoPassword)
  }

  const onCloseDialog = () => {
    setOpenMenu(undefined)
    setMenuType(undefined)
    setInput1('')
    setInput2('')
    setInput3('')
    setInput4('')
    setInstagramMode(undefined)
  }

  const openLink = (url: string) => {
    window.flipflip.api.openExternal(url)
  }

  const onCloseSnack = () => {
    setSnackbarOpen(false)
  }

  const onInput1 = (e: ChangeEvent<HTMLInputElement>) => {
    setInput1(e.target.value)
  }

  const onInput2 = (e: ChangeEvent<HTMLInputElement>) => {
    setInput2(e.target.value)
  }

  const onInput3 = (e: ChangeEvent<HTMLInputElement>) => {
    setInput3(e.target.value)
  }

  const onInput4 = (e: ChangeEvent<HTMLInputElement>) => {
    setInput4(e.target.value)
  }

  const onFinishAuthTumblr = async () => {
    onCloseDialog()
    // Tumblr endpoints
    const authorizeUrl = 'https://www.tumblr.com/oauth/authorize'
    const requestTokenUrl = 'https://www.tumblr.com/oauth/request_token'
    const accessTokenUrl = 'https://www.tumblr.com/oauth/access_token'

    // Tumblr oauth
    let data: any | undefined
    try {
      data = await window.flipflip.api.tumblrOAuth(
        requestTokenUrl,
        accessTokenUrl,
        tumblrKey,
        tumblrSecret,
        authorizeUrl
      )
    } catch (err) {
      console.error(err.statusCode + ' - ' + err.data)
      showError(err.statusCode + ' - ' + err.data)
    }

    if (data) {
      dispatch(setConfigRemoteSettingsTumblrOAuthToken(data.token))
      dispatch(setConfigRemoteSettingsTumblrOAuthTokenSecret(data.secret))
      showSuccess('Tumblr is now activated')
      window.flipflip.api.showCurrentWindow()
    }
  }

  const onFinishAuthReddit = async () => {
    onCloseDialog()
    const deviceID = redditDeviceID === '' ? uuidv4() : redditDeviceID

    // Make initial request and open authorization form in browser
    wretch(
      'https://www.reddit.com/api/v1/authorize?client_id=' +
        redditClientID +
        '&response_type=code&state=' +
        deviceID +
        '&redirect_uri=http://localhost:65010&duration=permanent&scope=read,mysubreddits,history'
    )
      .post()
      .res((res) => {
        openLink(res.url)
      })
      .catch((e) => {
        console.error(e)
        showError(e.message)
      })

    let data: any | undefined
    try {
      data = await window.flipflip.api.redditOAuth(
        deviceID,
        redditUserAgent,
        redditClientID
      )
    } catch (err) {
      console.error(err)
      showError(err.message)
    }

    if (data) {
      dispatch(setConfigRemoteSettingsRedditDeviceID(deviceID))
      dispatch(setConfigRemoteSettingsRedditRefreshToken(data.refresh_token))

      showSuccess('Reddit is now activated')
      window.flipflip.api.showCurrentWindow()
    }
  }

  const onFinishAuthTwitter = async () => {
    onCloseDialog()

    // Twitter endpoints
    const authorizeUrl = 'https://api.twitter.com/oauth/authorize'
    const requestTokenUrl = 'https://api.twitter.com/oauth/request_token'
    const accessTokenUrl = 'https://api.twitter.com/oauth/access_token'

    // Twitter OAuth
    let data: any | undefined
    try {
      data = await window.flipflip.api.twitterOAuth(
        requestTokenUrl,
        accessTokenUrl,
        twitterConsumerKey,
        twitterConsumerSecret,
        authorizeUrl
      )
    } catch (err) {
      const message = err.statusCode + ' - ' + err.data
      console.error(message)
      showError(message)
    }

    if (data) {
      dispatch(setConfigRemoteSettingsTwitterAccessTokenKey(data.token))
      dispatch(setConfigRemoteSettingsTwitterAccessTokenSecret(data.secret))

      showSuccess('Twitter is now activated')
      window.flipflip.api.showCurrentWindow()
    }
  }

  const onFinishAuthInstagram = async () => {
    try {
      await window.flipflip.api.igLogin(input1, input2)
      dispatch(setConfigRemoteSettingsInstagramUsername(input1))
      dispatch(setConfigRemoteSettingsInstagramPassword(input2))
      showSuccess('Instagram is activated')
      onCloseDialog()
    } catch (e) {
      if (e.name === 'IgLoginTwoFactorRequiredError') {
        setInstagramMode(IG.tfa)
        _tfa.current = e.response.body.two_factor_info.two_factor_identifier
      } else if (e.name === 'IgCheckpointError') {
        await window.flipflip.api.igChallenge()
        setInstagramMode(IG.checkpoint)
      } else {
        onCloseDialog()
        console.error(e)
        showError(e.message)
      }
    }
  }

  const onTFAInstagram = async () => {
    try {
      await window.flipflip.api.igTwoFactorLogin(
        _tfa.current,
        instagramUsername,
        input3
      )
      dispatch(setConfigRemoteSettingsInstagramUsername(input1))
      dispatch(setConfigRemoteSettingsInstagramPassword(input2))
      showSuccess('Instagram is activated')
      onCloseDialog()
      _tfa.current = null
    } catch (e) {
      onCloseDialog()
      console.error(e)
      showError(e.message)
      _tfa.current = null
    }
  }

  const onCheckpointInstagram = async () => {
    try {
      await window.flipflip.api.igSendSecurityCode(input3)
      dispatch(setConfigRemoteSettingsInstagramUsername(input1))
      dispatch(setConfigRemoteSettingsInstagramPassword(input2))
      showSuccess('Instagram is activated')
      onCloseDialog()
    } catch (e) {
      onCloseDialog()
      console.error(e)
      showError(e.message)
    }
  }

  const onFinishAuthHydrus = () => {
    wretch(input1 + '://' + input2 + ':' + input3 + '/session_key')
      .addon(AbortAddon())
      .headers({ 'Hydrus-Client-API-Access-Key': input4 })
      .get()
      .setTimeout(5000)
      .notFound((e) => {
        console.error(e)
        showError(e.message)
      })
      .internalError((e) => {
        console.error(e)
        showError(e.message)
      })
      .json((json) => {
        if (json.session_key) {
          dispatch(setConfigRemoteSettingsHydrusProtocol(input1))
          dispatch(setConfigRemoteSettingsHydrusDomain(input2))
          dispatch(setConfigRemoteSettingsHydrusPort(input3))
          dispatch(setConfigRemoteSettingsHydrusAPIKey(input4))
          showSuccess('Hydrus is configured')
          onCloseDialog()
        } else {
          console.error('Invalid response from Hydrus server')
          showError('Invalid response from Hydrus server')
        }
      })
      .catch((e) => {
        console.error(e)
        showError(e.message)
      })
  }

  const onFinishAuthPiwigo = () => {
    let reqURL =
      input1 +
      '://' +
      input2 +
      (input2.endsWith('/') ? '' : '/') +
      'ws.php?format=json'

    if (!input3) {
      reqURL += '&method=reflection.getMethodList'
    }

    let req = wretch(reqURL).addon(FormUrlAddon).addon(AbortAddon())
    if (input3) {
      req = req.formUrl({
        method: 'pwg.session.login',
        username: input3,
        password: input4
      })
    }

    req
      .post()
      .setTimeout(5000)
      .notFound((e) => {
        console.error(e)
        showError(e.message)
      })
      .internalError((e) => {
        console.error(e)
        showError(e.message)
      })
      .json((json) => {
        if (json.stat === 'ok') {
          dispatch(setConfigRemoteSettingsPiwigoProtocol(input1))
          dispatch(setConfigRemoteSettingsPiwigoHost(input2))
          dispatch(setConfigRemoteSettingsPiwigoUsername(input3))
          dispatch(setConfigRemoteSettingsPiwigoPassword(input4))
          showSuccess('Piwigo is configured')
          onCloseDialog()
        } else {
          console.error('Invalid response from Piwigo server')
          showError('Invalid response from Piwigo server')
        }
      })
      .catch((e) => {
        console.error(e)
        showError(e.message)
      })
  }

  const getMenuTypeSignOut = () => {
    switch (menuType) {
      case ST.tumblr:
        return onFinishClearTumblr
      case ST.reddit:
        return onFinishClearReddit
      case ST.twitter:
        return onFinishClearTwitter
      case ST.instagram:
        return onFinishClearInstagram
      case ST.hydrus:
        return onFinishClearHydrus
      case ST.piwigo:
        return onFinishClearPiwigo
    }
  }

  const getMenuTypeText = (menuType: string | undefined) => {
    const text = menuType && en.get(menuType)
    return text ? text[0].toUpperCase() + text.slice(1) : ''
  }

  const classes = props.classes
  const menuTypeText = getMenuTypeText(menuType)
  const menuTypeSignOut = getMenuTypeSignOut()

  return (
    <React.Fragment>
      <Typography align="center" className={classes.title}>
        API Sign In
      </Typography>

      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item>
          <Tooltip
            disableInteractive
            title={
              tumblrAuthorized
                ? 'Authorized: Click to Sign Out of Tumblr'
                : 'Unauthorized: Click to Authorize Tumblr'
            }
            placement="top-end"
          >
            <Fab
              className={clsx(
                classes.fab,
                tumblrAuthorized ? classes.authorized : classes.noAuth
              )}
              onClick={tumblrAuthorized ? onClearTumblr : onAuthTumblr}
              size="large"
            >
              <SourceIcon className={classes.icon} type={ST.tumblr} />
            </Fab>
          </Tooltip>
        </Grid>
        {/* <Grid item>
          <Tooltip disableInteractive title={redditAuthorized ? "Authorized: Click to Sign Out of Reddit" : "Unauthorized: Click to Authorize Reddit"}  placement="top-end">
            <Fab
              className={clsx(classes.fab, redditAuthorized ? classes.authorized : classes.noAuth)}
              onClick={redditAuthorized ? onClearReddit : onAuthReddit}
              size="large">
              <SourceIcon className={classes.icon} type={ST.reddit}/>
            </Fab>
          </Tooltip>
        </Grid> */}
        {/* <Grid item>
          <Tooltip disableInteractive title={twitterAuthorized ? "Authorized: Click to Sign Out of Twitter" : "Unauthorized: Click to Authorize Twitter"}  placement="top-end">
            <Fab
              className={clsx(classes.fab, twitterAuthorized ? classes.authorized : classes.noAuth)}
              onClick={twitterAuthorized ? onClearTwitter : onAuthTwitter}
              size="large">
              <SourceIcon className={classes.icon} type={ST.twitter}/>
            </Fab>
          </Tooltip>
        </Grid> */}
        <Grid item>
          <Tooltip
            disableInteractive
            title={
              instagramConfigured
                ? 'Authorized: Click to Sign Out of Instagram'
                : 'Unauthorized: Click to Authorize Instragram'
            }
            placement="top-end"
          >
            <Fab
              className={clsx(
                classes.fab,
                instagramConfigured ? classes.authorized : classes.noAuth
              )}
              onClick={instagramConfigured ? onClearInstagram : onAuthInstagram}
              size="large"
            >
              <SourceIcon className={classes.icon} type={ST.instagram} />
            </Fab>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip
            disableInteractive
            title={
              hydrusConfigured
                ? 'Configured: Click to Remove Hydrus Configuration'
                : 'Unauthorized: Click to Configure Hydrus'
            }
            placement="top-end"
          >
            <Fab
              className={clsx(
                classes.fab,
                hydrusConfigured ? classes.authorized : classes.noAuth
              )}
              onClick={hydrusConfigured ? onClearHydrus : onAuthHydrus}
              size="large"
            >
              <SourceIcon className={classes.icon} type={ST.hydrus} />
            </Fab>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip
            disableInteractive
            title={
              piwigoConfigured
                ? 'Configured: Click to Remove Piwigo Configuration'
                : 'Unauthorized: Click to Configure Piwigo'
            }
            placement="top-end"
          >
            <Fab
              className={clsx(
                classes.fab,
                piwigoConfigured ? classes.authorized : classes.noAuth
              )}
              onClick={piwigoConfigured ? onClearPiwigo : onAuthPiwigo}
              size="large"
            >
              <SourceIcon className={classes.icon} type={ST.piwigo} />
            </Fab>
          </Tooltip>
        </Grid>
        <Grid item xs={12} className={classes.center}>
          <BaseSwitch
            label="Silence Tumblr Throttle Alert"
            disabled={!tumblrAuthorized}
            selector={selectAppConfigRemoteSettingsSilenceTumblrAlert()}
            action={setConfigRemoteSettingsSilenceTumblrAlert}
          />
        </Grid>
      </Grid>

      <Dialog
        open={openMenu === MO.signOut}
        onClose={onCloseDialog}
        aria-labelledby="sign-out-title"
        aria-describedby="sign-out-description"
      >
        <DialogTitle id="sign-out-title">
          {menuTypeText} Sign Out
          <Avatar className={classes.iconAvatar}>
            <SourceIcon className={classes.icon} type={menuType} />
          </Avatar>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="sign-out-description">
            You are already authorized for {menuTypeText}. Are you sure you want
            to sign out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={menuTypeSignOut} color="primary">
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMenu === MO.signIn && menuType === ST.tumblr}
        onClose={onCloseDialog}
        aria-labelledby="sign-in-title"
        aria-describedby="sign-in-description"
      >
        <DialogTitle id="sign-in-title">
          Tumblr Sign In
          <Avatar className={classes.iconAvatar}>
            <SourceIcon className={classes.icon} type={ST.tumblr} />
          </Avatar>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="sign-in-description">
            You are about to be directed to{' '}
            <Link
              href="#"
              onClick={() => {
                openLink('https://www.tumblr.com')
              }}
              underline="hover"
            >
              Tumblr.com
            </Link>{' '}
            to authorize FlipFlip. You should only have to do this once. Tumblr
            has no Read-Only mode, so read <i>and</i> write access are
            requested. FlipFlip does not store any user information or make any
            changes to your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={onFinishAuthTumblr} color="primary">
            Authorize FlipFlip on Tumblr
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMenu === MO.new && menuType === ST.tumblr}
        onClose={onCloseDialog}
        aria-labelledby="tumblr-title"
        aria-describedby="tumblr-description"
      >
        <DialogTitle id="tumblr-title">
          Tumblr API Key
          <Avatar className={classes.iconAvatar}>
            <SourceIcon className={classes.icon} type={ST.tumblr} />
          </Avatar>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="tumblr-description">
            FlipFlip provides a few public keys for use, but we recommend
            registering and using your own on{' '}
            <Link
              href="#"
              onClick={() => {
                openLink('https://www.tumblr.com/oauth/apps')
              }}
              underline="hover"
            >
              Tumblr OAuth
            </Link>
            . Refer to the{' '}
            <Link
              href="#"
              onClick={() => {
                openLink('https://ififfy.github.io/flipflip/#/tumblr_api')
              }}
              underline="hover"
            >
              FlipFlip documentation
            </Link>{' '}
            for complete instructions.
          </DialogContentText>
          <div className={classes.root}>
            <div>
              <DialogContentText>Choose a key:</DialogContentText>
              <RadioGroup
                value={tumblrKeys.indexOf(tumblrKey) + 1}
                onChange={onTumblrKeyInput}
              >
                {[''].concat(Object.values(tumblrKeys)).map((tk, i) => (
                  <FormControlLabel
                    key={i}
                    value={i}
                    control={<Radio />}
                    label={i === 0 ? 'Use Your Key' : 'Public Key ' + i}
                  />
                ))}
              </RadioGroup>
            </div>
            <div className={classes.tumblrFields}>
              <TextField
                variant="standard"
                fullWidth
                margin="dense"
                label="Tumblr OAuth Consumer Key"
                value={input1}
                onChange={onInput1}
              />
              <TextField
                variant="standard"
                fullWidth
                margin="dense"
                label="Tumblr OAuth Consumer Secret"
                value={input2}
                onChange={onInput2}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button
            disabled={input1.length !== 50 || input2.length !== 50}
            onClick={onContinueAuthTumblr}
            color="primary"
          >
            Authorize FlipFlip on Tumblr
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMenu === MO.signIn && menuType === ST.reddit}
        onClose={onCloseDialog}
        aria-labelledby="sign-in-title"
        aria-describedby="sign-in-description"
      >
        <DialogTitle id="sign-in-title">
          Reddit Sign In
          <Avatar className={classes.iconAvatar}>
            <SourceIcon className={classes.icon} type={ST.reddit} />
          </Avatar>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="sign-in-description">
            You are about to be directed to{' '}
            <Link
              href="#"
              onClick={() => {
                openLink('https://www.reddit.com')
              }}
              underline="hover"
            >
              Reddit.com
            </Link>{' '}
            to authorize FlipFlip. You should only have to do this once.
            FlipFlip does not store any user information or make any changes to
            your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={onFinishAuthReddit} color="primary">
            Authorize FlipFlip on Reddit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMenu === MO.signIn && menuType === ST.twitter}
        onClose={onCloseDialog}
        aria-labelledby="sign-in-title"
        aria-describedby="sign-in-description"
      >
        <DialogTitle id="sign-in-title">
          Twitter Sign In
          <Avatar className={classes.iconAvatar}>
            <SourceIcon className={classes.icon} type={ST.twitter} />
          </Avatar>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="sign-in-description">
            You are about to be directed to{' '}
            <Link
              href="#"
              onClick={() => {
                openLink('https://www.twitter.com')
              }}
              underline="hover"
            >
              Twitter.com
            </Link>{' '}
            to authorize FlipFlip. You should only have to do this once.
            FlipFlip does not store any user information or make any changes to
            your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={onFinishAuthTwitter} color="primary">
            Authorize FlipFlip on Twitter
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMenu === MO.signIn && menuType === ST.instagram}
        onClose={onCloseDialog}
        aria-labelledby="instagram-title"
        aria-describedby="instagram-description"
      >
        <DialogTitle id="instagram-title">
          Instagram Sign In
          <Avatar className={classes.iconAvatar}>
            <SourceIcon className={classes.icon} type={ST.instagram} />
          </Avatar>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="instagram-description">
            FlipFlip does not store any user information or make changes to your
            account. Your login information is stored locally on your computer
            and is never shared with anyone or sent to any server (besides
            Instagram, obviously).
          </DialogContentText>
          <TextField
            variant="standard"
            fullWidth
            disabled={instagramMode != null}
            margin="dense"
            label="Instagram Username"
            value={input1}
            onChange={onInput1}
          />
          <TextField
            variant="standard"
            fullWidth
            disabled={instagramMode != null}
            margin="dense"
            label="Instagram Password"
            type="password"
            value={input2}
            onChange={onInput2}
          />
          <Collapse in={instagramMode === IG.tfa}>
            <DialogContentText id="instagram-description">
              Enter your two-factor authentication code to confirm login:
            </DialogContentText>
            <TextField
              variant="standard"
              fullWidth
              margin="dense"
              label="Instagram 2FA"
              value={input3}
              onChange={onInput3}
            />
          </Collapse>
          <Collapse in={instagramMode === IG.checkpoint}>
            <DialogContentText id="instagram-description">
              Please verify your account to continue: (check your email)
            </DialogContentText>
            <TextField
              variant="standard"
              fullWidth
              margin="dense"
              label="Instagram Checkpoint"
              value={input3}
              onChange={onInput3}
            />
          </Collapse>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          {instagramMode === IG.tfa && (
            <Button
              disabled={input3.length === 0}
              onClick={onTFAInstagram}
              color="primary"
            >
              Authorize FlipFlip on Instagram
            </Button>
          )}
          {instagramMode === IG.checkpoint && (
            <Button
              disabled={input3.length === 0}
              onClick={onCheckpointInstagram}
              color="primary"
            >
              Authorize FlipFlip on Instagram
            </Button>
          )}
          {instagramMode == null && (
            <Button
              disabled={input1.length === 0 || input2.length === 0}
              onClick={onFinishAuthInstagram}
              color="primary"
            >
              Authorize FlipFlip on Instagram
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMenu === MO.signIn && menuType === ST.hydrus}
        onClose={onCloseDialog}
        aria-labelledby="hydrus-title"
        aria-describedby="hydrus-description"
      >
        <DialogTitle id="hydrus-title">
          Hyrdus Configuration
          <Avatar className={classes.iconAvatar}>
            <SourceIcon className={classes.icon} type={ST.hydrus} />
          </Avatar>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="hydrus-description">
            FlipFlip does not store any user information or make changes to the
            Hydrus server. Your configured information is stored locally on your
            computer and is never shared with anyone or sent to any server
            (besides Hydrus, obviously).
          </DialogContentText>
          <FormControl variant="standard" margin="dense">
            <InputLabel>Protocol</InputLabel>
            <Select variant="standard" value={input1} onChange={onInput1}>
              <MenuItem key={'http'} value={'http'}>
                http
              </MenuItem>
              <MenuItem key={'https'} value={'https'}>
                https
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            variant="standard"
            className={classes.middleInput}
            margin="dense"
            label="Hydrus Domain"
            value={input2}
            onChange={onInput2}
          />
          <TextField
            variant="standard"
            margin="dense"
            label="Hydrus Port"
            value={input3}
            onChange={onInput3}
          />
          <TextField
            variant="standard"
            fullWidth
            margin="dense"
            label="Hydrus API Key"
            value={input4}
            onChange={onInput4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button
            disabled={
              input1.length === 0 ||
              input2.length === 0 ||
              input3.length === 0 ||
              input4.length === 0
            }
            onClick={onFinishAuthHydrus}
            color="primary"
          >
            Configure Hydrus
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMenu === MO.signIn && menuType === ST.piwigo}
        onClose={onCloseDialog}
        aria-labelledby="piwigo-title"
        aria-describedby="piwigo-description"
      >
        <DialogTitle id="piwigo-title">
          Piwigo Configuration
          <Avatar className={classes.iconAvatar}>
            <SourceIcon className={classes.icon} type={ST.piwigo} />
          </Avatar>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="piwigo-description">
            FlipFlip does not store any user information or make changes to the
            Piwigo server. Your configured information is stored locally on your
            computer and is never shared with anyone or sent to any server
            (besides Piwigo, obviously).
          </DialogContentText>
          <FormControl variant="standard" margin="dense">
            <InputLabel>Protocol</InputLabel>
            <Select variant="standard" value={input1} onChange={onInput1}>
              <MenuItem key={'http'} value={'http'}>
                http
              </MenuItem>
              <MenuItem key={'https'} value={'https'}>
                https
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            variant="standard"
            className={classes.middleInput}
            margin="dense"
            label="Piwigo Host"
            value={input2}
            onChange={onInput2}
          />
          <TextField
            variant="standard"
            fullWidth
            margin="dense"
            label="Username"
            value={input3}
            onChange={onInput3}
          />
          <TextField
            variant="standard"
            fullWidth
            margin="dense"
            label="Password"
            type="password"
            value={input4}
            onChange={onInput4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button
            disabled={input1.length === 0 || input2.length === 0}
            onClick={onFinishAuthPiwigo}
            color="primary"
          >
            Configure Piwigo
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={20000}
        onClose={onCloseSnack}
        TransitionComponent={TransitionUp}
      >
        <Alert onClose={onCloseSnack} severity={snackbarSeverity as any}>
          {snackbar}
        </Alert>
      </Snackbar>
    </React.Fragment>
  )
}

;(APICard as any).displayName = 'APICard'
export default withStyles(styles)(APICard as any)

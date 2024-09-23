import { useCallback, useEffect, useRef, useState } from 'react'
import { cx } from '@emotion/css'

import {
  AppBar,
  Divider,
  IconButton,
  type Theme,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ForwardIcon from '@mui/icons-material/Forward'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

import { PT } from 'flipflip-common'
import { setFullScreen, toggleFullScreen } from '../../data/actions'
import { useAppSelector } from '../../store/hooks'
import { selectAppTutorial } from '../../store/app/selectors'
import { selectDisplayName } from '../../store/display/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
  hoverBar: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'absolute',
    opacity: 0,
    height: theme.spacing(5),
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    minHeight: 64
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    height: theme.spacing(8),
    marginTop: theme.spacing(-8.5),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarHover: {
    marginTop: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  backdropTop: {
    zIndex: theme.zIndex.modal + 1
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid'
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    flexWrap: 'nowrap'
  },
  headerLeft: {
    flexBasis: '20%'
  },
  title: {
    textAlign: 'center',
    flexGrow: 1
  },
  headerRight: {
    flexBasis: '20%',
    justifyContent: 'flex-end',
    display: 'flex'
  }
}))

export interface DisplayManagerAppBarProps {
  drawerHover: boolean
  isPlaying: boolean
  hasStarted: boolean
  play: () => void
  pause: () => void
  displayID: number
  goBack: () => void
}

function DisplayManagerAppBar(props: DisplayManagerAppBarProps) {
  const { drawerHover, isPlaying, hasStarted, goBack, play, pause } = props
  const [appBarHover, setAppBarHover] = useState(false)

  const _appBarTimeout = useRef<number>()

  const tutorial = useAppSelector(selectAppTutorial())
  const title = useAppSelector(selectDisplayName(props.displayID))

  const onMouseEnterAppBar = () => {
    clearTimeout(_appBarTimeout.current)
    setAppBarHover(true)
  }

  const closeAppBar = () => {
    setAppBarHover(false)
  }

  const onMouseLeaveAppBar = () => {
    clearTimeout(_appBarTimeout.current)
    _appBarTimeout.current = window.setTimeout(closeAppBar, 1000)
  }

  const navigateBack = useCallback(async () => {
    setFullScreen(false)
    goBack()
  }, [goBack])

  const historyGoBack = useCallback(
    () => {
      // if (
      //   !drawerHover ||
      //   document.activeElement!.tagName.toLocaleLowerCase() !== 'input'
      // ) {
      //   if (historyOffset > -(historyPaths.length - 1)) {
      //     historyBack()
      //   }
      // }
    },
    [
      /*drawerHover, historyOffset, historyPaths, historyBack*/
    ]
  )

  const historyGoForward = useCallback(
    () => {
      // if (
      //   !drawerHover ||
      //   document.activeElement!.tagName.toLocaleLowerCase() !== 'input'
      // ) {
      //   if (historyOffset >= 0) {
      //     imagePlayerAdvanceHacks[0][0].fire()
      //   } else {
      //     historyForward()
      //   }
      // }
    },
    [
      /*drawerHover, historyOffset, imagePlayerAdvanceHacks, historyForward*/
    ]
  )

  const setPlayPause = useCallback(
    (doPlay: boolean) => {
      if (doPlay) {
        play()
      } else {
        pause()
      }
    },
    [play, pause]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const focus = document.activeElement!.tagName.toLocaleLowerCase()
      switch (e.key) {
        case ' ':
          if (
            hasStarted &&
            (!drawerHover || focus !== 'input') &&
            !e.shiftKey
          ) {
            e.preventDefault()
            setPlayPause(!isPlaying)
          }
          break
        case 'k':
          if (
            hasStarted &&
            (!drawerHover || focus !== 'input') &&
            !e.ctrlKey &&
            !e.shiftKey
          ) {
            e.preventDefault()
            setPlayPause(!isPlaying)
          }
          break
        case 'ArrowLeft':
          if (
            hasStarted &&
            (!drawerHover || focus !== 'input') &&
            !e.shiftKey
          ) {
            e.preventDefault()
            historyGoBack()
          }
          break
        case 'ArrowRight':
          if (
            hasStarted &&
            (!drawerHover || focus !== 'input') &&
            !e.shiftKey
          ) {
            e.preventDefault()
            historyGoForward()
          }
          break
        case 'Escape':
          e.preventDefault()
          navigateBack()
          break
        case 'f':
          if (!e.ctrlKey && !e.shiftKey) {
            e.preventDefault()
            toggleFullScreen()
          }
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [
    drawerHover,
    historyGoBack,
    historyGoForward,
    isPlaying,
    hasStarted,
    navigateBack,
    setPlayPause
  ])

  const historyCanGoBack = hasStarted // TODO implement history logic
  const historyCanGoForward = hasStarted // TODO implement history logic
  const { classes } = useStyles()
  return (
    <>
      <div
        className={classes.hoverBar}
        onMouseEnter={onMouseEnterAppBar}
        onMouseLeave={onMouseLeaveAppBar}
      />
      <AppBar
        enableColorOnDark
        position="absolute"
        onMouseEnter={onMouseEnterAppBar}
        onMouseLeave={onMouseLeaveAppBar}
        className={cx(
          classes.appBar,
          (tutorial === PT.toolbar || !isPlaying || appBarHover) &&
            classes.appBarHover,
          tutorial === PT.toolbar && cx(classes.backdropTop, classes.highlight)
        )}
      >
        <Toolbar className={classes.headerBar}>
          <div className={classes.headerLeft}>
            <Tooltip disableInteractive title="Back" placement="right-end">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Back"
                onClick={navigateBack}
                size="large"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </div>

          <Tooltip disableInteractive title={title}>
            <Typography
              component="h1"
              variant="h4"
              color="inherit"
              noWrap
              className={classes.title}
            >
              {title}
            </Typography>
          </Tooltip>

          <div className={classes.headerRight}>
            <Tooltip disableInteractive title="Toggle Fullscreen">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="FullScreen"
                onClick={toggleFullScreen}
                size="large"
              >
                <FullscreenIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            {/* TODO make historyGoBack and historyGoForward work on display */}
            <Divider
              component="div"
              orientation="vertical"
              style={{ height: 48, margin: '0 14px 0 3px' }}
            />
            <IconButton
              disabled={!historyCanGoBack}
              edge="start"
              color="inherit"
              aria-label="Backward"
              onClick={historyGoBack}
              size="large"
            >
              <ForwardIcon
                fontSize="large"
                style={{ transform: 'rotate(180deg)' }}
              />
            </IconButton>
            <IconButton
              edge="start"
              color="inherit"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={!hasStarted}
              onClick={() => setPlayPause(!isPlaying)}
              size="large"
            >
              {isPlaying ? (
                <PauseIcon fontSize="large" />
              ) : (
                <PlayArrowIcon fontSize="large" />
              )}
            </IconButton>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Forward"
              disabled={!historyCanGoForward}
              onClick={historyGoForward}
              size="large"
            >
              <ForwardIcon fontSize="large" />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    </>
  )
}

;(DisplayManagerAppBar as any).displayName = 'DisplayManagerAppBar'
export default DisplayManagerAppBar

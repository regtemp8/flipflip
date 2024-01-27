import React, { useEffect, useState, useRef, type ReactNode } from 'react'
import clsx from 'clsx'

import {
  AppBar,
  Container,
  IconButton,
  type Theme,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FullscreenIcon from '@mui/icons-material/Fullscreen'

import Player from './Player'
import type ChildCallbackHack from './ChildCallbackHack'
import { IdleTimer } from './IdleTimer'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  setConfigDisplaySettingsAlwaysOnTop,
  setConfigDisplaySettingsFullScreen,
  setConfigDisplaySettingsShowMenu
} from '../../../store/app/slice'
import { setRouteGoBack } from '../../../store/app/thunks'
import {
  selectAppConfigDisplaySettingsAlwaysOnTop,
  selectAppConfigDisplaySettingsShowMenu,
  selectAppConfigDisplaySettingsFullScreen
} from '../../../store/app/selectors'
import {
  selectSceneGridCellMatchesSceneCopy,
  selectSceneGridCellMirror,
  selectSceneGridCellSceneCopy,
  selectSceneGridCellSceneID,
  selectSceneGridName
} from '../../../store/sceneGrid/selectors'
import { type PlayerOverlayState } from '../../../store/player/slice'
import { selectGridPlayerFirstNotLoaded } from '../../../store/player/selectors'

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      height: theme.spacing(8),
      marginTop: -theme.spacing(8) - 3,
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
    title: {
      textAlign: 'center'
    },
    content: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      height: '100vh'
    },
    container: {
      height: '100%',
      padding: theme.spacing(0)
    },
    grid: {
      flexGrow: 1,
      display: 'grid',
      height: '100%'
    },
    gridCell: {
      height: '100%',
      width: '100%',
      display: 'grid',
      overflow: 'hidden'
    },
    fill: {
      flexGrow: 1
    },
    hidden: {
      opacity: 0
    },
    hideCursor: {
      cursor: 'none'
    },
    mirror: {
      transform: 'scaleX(-1)'
    }
  })

interface GridCellPlayerProps extends WithStyles<typeof styles> {
  gridID: number
  row: number
  col: number
  width: number
  height: number
  uuid: string
  advanceHack?: any
  allLoaded: boolean
  sceneCopyGrid: ReactNode[][]

  setProgress?: (total: number, current: number, message: string[]) => void
  setSceneCopy: (row: number, col: number, children: ReactNode) => void
  setVideo?: (index: number, video: HTMLVideoElement) => void
}

function GridCellPlayer(props: GridCellPlayerProps) {
  const {
    gridID,
    row,
    col,
    width,
    height,
    uuid,
    allLoaded,
    classes
  } = props

  //console.log('ALL LOADED: ' + allLoaded)
  const sceneID = useAppSelector(selectSceneGridCellSceneID(gridID, row, col))
  const sceneCopy = useAppSelector(
    selectSceneGridCellSceneCopy(gridID, row, col)
  )
  const mirror = useAppSelector(selectSceneGridCellMirror(gridID, row, col))
  const matchesSceneCopy = useAppSelector(
    selectSceneGridCellMatchesSceneCopy(gridID, [row, col])
  )

  if (sceneCopy.length > 0) {
    const sceneCopyGridCell = props.sceneCopyGrid[sceneCopy[0]][sceneCopy[1]]
    return (
      <div
        className={clsx(
          classes.gridCell,
          !sceneCopyGridCell && classes.hidden,
          mirror && classes.mirror
        )}
      >
        <div
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div>
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
              }}
            >
              <div
                style={{
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  position: 'static'
                }}
              >
                {sceneCopyGridCell}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div
        className={clsx(classes.gridCell, !sceneID && classes.hidden)}
      >
        {sceneID && (
          <Player
            uuid={uuid}
            preventSleep={row === 0 && col === 0}
            advanceHack={props.advanceHack}
            gridView
            gridCoordinates={matchesSceneCopy ? [row, col] : undefined}
            captionScale={1 / Math.sqrt(width * height)}
            allLoaded={allLoaded}
            setProgress={props.setProgress}
            setSceneCopy={props.setSceneCopy.bind(this, row, col)}
            setVideo={
              props.setVideo
                ? props.setVideo.bind(this, row * width + col)
                : undefined
            }
          />
        )}
      </div>
    )
  }
}

export interface GridPlayerProps extends WithStyles<typeof styles> {
  parentUUID?: string
  overlayIndex: number
  gridConfig: PlayerOverlayState
  advanceHacks?: ChildCallbackHack[]
  hideBars?: boolean
  setProgress?: (total: number, current: number, message: string[]) => void
  setVideo?: (index: number, video: HTMLVideoElement) => void
}

function GridPlayer(props: GridPlayerProps) {
  const dispatch = useAppDispatch()
  const firstNotLoaded = useAppSelector(selectGridPlayerFirstNotLoaded(props.overlayIndex, props.parentUUID))
  const allLoaded = firstNotLoaded[0] === -1 && firstNotLoaded[1] === -1
  const alwaysOnTop = useAppSelector(
    selectAppConfigDisplaySettingsAlwaysOnTop()
  )
  const showMenu = useAppSelector(selectAppConfigDisplaySettingsShowMenu())
  const fullScreen = useAppSelector(selectAppConfigDisplaySettingsFullScreen())
  const name = useAppSelector(selectSceneGridName(props.gridConfig.sceneID))

  const [appBarHover, setAppBarHover] = useState(false)
  const [hideCursor, setHideCursor] = useState(false)
  const [sceneCopyGrid, setSceneCopyGrid] = useState(
    props.gridConfig.grid.map((r) => r.map((c) => null)) as React.ReactNode[][]
  )

  const _idleTimerRef = useRef<any>()
  const _appBarTimeout = useRef<any>()

  useEffect(() => {
    window.flipflip.events.onGridNavigateBack(navigateBack)
    window.flipflip.events.onGridToggleFullscreen(toggleFullscreen)
    window.flipflip.events.onGridToggleAlwaysOnTop(toggleAlwaysOnTop)
    window.flipflip.events.onGridToggleMenuBarDisplay(toggleMenuBarDisplay)

    return () => {
      window.flipflip.events.removeGridNavigateBack()
      window.flipflip.events.removeGridToggleFullscreen()
      window.flipflip.events.removeGridToggleAlwaysOnTop()
      window.flipflip.events.removeGridToggleMenuBarDisplay()
      if (_appBarTimeout.current) {
        clearTimeout(_appBarTimeout.current)
      }
    }
  }, [])

  const setSceneCopy = (
    rowIndex: number,
    colIndex: number,
    children: React.ReactNode
  ) => {
    const newSceneCopyGrid = sceneCopyGrid
    newSceneCopyGrid[rowIndex][colIndex] = children
    setSceneCopyGrid(newSceneCopyGrid)
  }

  const onActive = () => {
    setHideCursor(false)
  }

  const onIdle = () => {
    setHideCursor(true)
  }

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

  const toggleFull = async () => {
    const fullScreen = await window.flipflip.api.gridToggleFullScreen()
    dispatch(setConfigDisplaySettingsFullScreen(fullScreen))
    dispatch(setConfigDisplaySettingsShowMenu(fullScreen))
  }

  const setAlwaysOnTop = (alwaysOnTop: boolean) => {
    window.flipflip.api.gridSetAlwaysOnTop(alwaysOnTop)
    dispatch(setConfigDisplaySettingsAlwaysOnTop(alwaysOnTop))
  }

  const toggleAlwaysOnTop = () => {
    setAlwaysOnTop(!alwaysOnTop)
  }

  const toggleMenuBarDisplay = () => {
    window.flipflip.api.gridSetMenuBarVisibility(!showMenu)
    dispatch(setConfigDisplaySettingsShowMenu(!showMenu))
  }

  const toggleFullscreen = () => {
    window.flipflip.api.gridSetFullScreen(!fullScreen)
    dispatch(setConfigDisplaySettingsFullScreen(!fullScreen))
  }

  const navigateBack = async () => {
    await window.flipflip.api.playerBack()
    dispatch(setRouteGoBack())
  }

  const classes = props.classes
  const grid = props.gridConfig.grid
  const height = grid && grid.length > 0 && grid[0].length > 0 ? grid.length : 1
  const width =
    grid && grid.length > 0 && grid[0].length > 0 ? grid[0].length : 1

  const colSize = 100 / width
  const rowSize = 100 / height
  let gridTemplateColumns = ''
  let gridTemplateRows = ''
  for (let w = 0; w < width; w++) {
    gridTemplateColumns += colSize.toString() + '% '
  }
  for (let h = 0; h < height; h++) {
    gridTemplateRows += rowSize.toString() + '% '
  }

  return (
    <div className={classes.root}>
      {!props.hideBars && (
        <React.Fragment>
          <div
            className={classes.hoverBar}
            onMouseEnter={onMouseEnterAppBar.bind(this)}
            onMouseLeave={onMouseLeaveAppBar.bind(this)}
          />

          <AppBar
            enableColorOnDark
            position="absolute"
            onMouseEnter={onMouseEnterAppBar.bind(this)}
            onMouseLeave={onMouseLeaveAppBar.bind(this)}
            className={clsx(classes.appBar, appBarHover && classes.appBarHover)}
          >
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
                {name}
              </Typography>
              <div className={classes.fill} />

              <Tooltip disableInteractive title="Toggle Fullscreen">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="FullScreen"
                  onClick={toggleFull.bind(this)}
                  size="large"
                >
                  <FullscreenIcon fontSize="large" />
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
        </React.Fragment>
      )}

      <main
        className={clsx(classes.content, hideCursor && classes.hideCursor)}
        ref={_idleTimerRef}
      >
        <IdleTimer
          ref={_idleTimerRef}
          onActive={onActive.bind(this)}
          onIdle={onIdle.bind(this)}
          timeout={2000}
        />
        <Container maxWidth={false} className={classes.container}>
          <div
            className={classes.grid}
            style={{
              gridTemplateColumns,
              gridTemplateRows
            }}
          >
            {[...Array(height).keys()].map((row) => (
              <React.Fragment key={row}>
                {[...Array(width).keys()].map((col) => {
                  const uuid = props.gridConfig.grid[row][col]
                  const showProgress = firstNotLoaded[0] === row && firstNotLoaded[1] === col
                  return (<GridCellPlayer
                    key={col}
                    gridID={props.gridConfig.sceneID}
                    row={row}
                    col={col}
                    width={width}
                    height={height}
                    uuid={uuid}
                    advanceHack={
                      props.advanceHacks
                        ? props.advanceHacks[row * width + col]
                        : undefined
                    }
                    allLoaded={allLoaded}
                    sceneCopyGrid={sceneCopyGrid}
                    setVideo={props.setVideo}
                    setProgress={showProgress ? props.setProgress : undefined}
                    setSceneCopy={setSceneCopy}
                    classes={classes}
                  />)
                })}
              </React.Fragment>
            ))}
          </div>
        </Container>
      </main>
    </div>
  )
}

;(GridPlayer as any).displayName = 'GridPlayer'
export default withStyles(styles)(GridPlayer as any)

import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  type ReactNode
} from 'react'
import { cx } from '@emotion/css'

import {
  AppBar,
  Container,
  IconButton,
  type Theme,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FullscreenIcon from '@mui/icons-material/Fullscreen'

import Player from './Player'
import type ChildCallbackHack from './ChildCallbackHack'
import { IdleTimer } from './IdleTimer'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setRouteGoBack } from '../../store/app/thunks'
import {
  selectSceneGridCellMatchesSceneCopy,
  selectSceneGridCellMirror,
  selectSceneGridCellSceneCopy,
  selectSceneGridCellSceneID,
  selectSceneGridName
} from '../../store/sceneGrid/selectors'
import {
  selectGridPlayerFirstNotLoaded,
  selectPlayerOverlayGrid,
  selectPlayerOverlaySceneID
} from '../../store/player/selectors'
import flipflip from '../../FlipFlipService'
import { setFullScreen, toggleFullScreen } from '../../data/actions'

const useStyles = makeStyles()((theme: Theme) => ({
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
}))

interface GridCellPlayerProps {
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
  const { classes } = useStyles()
  const { gridID, row, col, width, height, uuid, allLoaded } = props

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
        className={cx(
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
      <div className={cx(classes.gridCell, !sceneID && classes.hidden)}>
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
            setSceneCopy={(children: ReactNode) =>
              props.setSceneCopy(row, col, children)
            }
            setVideo={(video: HTMLVideoElement) => {
              if (props.setVideo != null) {
                props.setVideo(row * width + col, video)
              }
            }}
          />
        )}
      </div>
    )
  }
}

export interface GridPlayerProps {
  parentUUID: string
  overlayIndex: number
  advanceHacks?: ChildCallbackHack[]
  hideBars?: boolean
  setProgress?: (total: number, current: number, message: string[]) => void
  setVideo?: (index: number, video: HTMLVideoElement) => void
}

function GridPlayer(props: GridPlayerProps) {
  const dispatch = useAppDispatch()
  const firstNotLoaded = useAppSelector(
    selectGridPlayerFirstNotLoaded(props.overlayIndex, props.parentUUID)
  )
  const allLoaded = firstNotLoaded[0] === -1 && firstNotLoaded[1] === -1
  const sceneID = useAppSelector(
    selectPlayerOverlaySceneID(props.overlayIndex, props.parentUUID)
  )
  const grid = useAppSelector(
    selectPlayerOverlayGrid(props.overlayIndex, props.parentUUID)
  )
  const name = useAppSelector(selectSceneGridName(sceneID))

  const [appBarHover, setAppBarHover] = useState(false)
  const [hideCursor, setHideCursor] = useState(false)
  const [sceneCopyGrid, setSceneCopyGrid] = useState(
    grid.map((r) => r.map((c) => null)) as React.ReactNode[][]
  )

  const _idleTimerRef = useRef<any>()
  const _appBarTimeout = useRef<any>()

  const navigateBack = useCallback(async () => {
    setFullScreen(false)
    dispatch(setRouteGoBack())
  }, [dispatch])

  useEffect(() => {
    const abortController = new AbortController()
    flipflip().events.onGridNavigateBack(navigateBack, abortController)

    return () => {
      abortController.abort()
      if (_appBarTimeout.current) {
        clearTimeout(_appBarTimeout.current)
      }
    }
  }, [navigateBack])

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

  const { classes } = useStyles()
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
            onMouseEnter={onMouseEnterAppBar}
            onMouseLeave={onMouseLeaveAppBar}
          />

          <AppBar
            enableColorOnDark
            position="absolute"
            onMouseEnter={onMouseEnterAppBar}
            onMouseLeave={onMouseLeaveAppBar}
            className={cx(classes.appBar, appBarHover && classes.appBarHover)}
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
                  onClick={toggleFullScreen}
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
        className={cx(classes.content, hideCursor && classes.hideCursor)}
        ref={_idleTimerRef}
      >
        <IdleTimer
          ref={_idleTimerRef}
          onActive={onActive}
          onIdle={onIdle}
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
                  const uuid = grid[row][col]
                  const showProgress =
                    firstNotLoaded[0] === row && firstNotLoaded[1] === col
                  return (
                    <GridCellPlayer
                      key={col}
                      gridID={sceneID}
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
                    />
                  )
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
export default GridPlayer

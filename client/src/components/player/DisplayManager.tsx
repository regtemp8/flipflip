import { selectDisplayVisibleViews } from '../../store/display/selectors'
import { setRouteGoBack } from '../../store/app/thunks'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { makeStyles } from 'tss-react/mui'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Theme,
  Typography
} from '@mui/material'
import { selectDisplayView } from '../../store/displayView/selectors'
import ImagePlayer from './ImagePlayer'
import ChildCallbackHack from './ChildCallbackHack'
import { MVF } from 'flipflip-common'
import DisplayManagerAppBar from './DisplayManagerAppBar'
import useStayAwake from 'use-stay-awake'
import { usePageVisibility } from 'react-page-visibility'
import { useWakeLock } from 'react-screen-wake-lock'
import { useCallback, useEffect, useState } from 'react'
import { selectSourceScraperProgress } from '../../store/sourceScraper/selectors'
import {
  selectDisplayCanStart,
  selectDisplayHasStarted
} from '../../store/player/selectors'
import { setDisplayHasStarted } from '../../store/player/thunks'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    container: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    progressMain: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default,
      position: 'relative',
      zIndex: 1001
    },
    progressContainer: {
      padding: theme.spacing(0),
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      height: '100vh'
    },
    startNowBtn: {
      marginTop: theme.spacing(1)
    }
  }
})

interface ProgressCardProps {
  displayID: number
  start?: () => void
}

function ProgressCard(props: ProgressCardProps) {
  const { displayID } = props
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const { total, current, message } = useAppSelector(
    selectSourceScraperProgress(displayID)
  )
  const canStart = useAppSelector(selectDisplayCanStart(displayID))

  useEffect(() => {
    if (canStart) {
      dispatch(setDisplayHasStarted(displayID))
    }
  }, [canStart, dispatch, displayID])

  return (
    <div className={classes.progressMain}>
      <Container maxWidth={false} className={classes.progressContainer}>
        <CircularProgress
          size={500}
          value={Math.round((current / total) * 100)}
          variant="determinate"
        />
        <div
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            position: 'absolute',
            flexDirection: 'column'
          }}
        >
          <Typography component="h1" variant="h6" color="inherit" noWrap>
            {current} / {total}
          </Typography>
          {message.map((line, index) => (
            <Typography
              key={'msg-' + index}
              component="h1"
              variant="h5"
              color="inherit"
              noWrap
            >
              {line}
            </Typography>
          ))}
          {props.start && (
            <Button
              className={classes.startNowBtn}
              variant="contained"
              color="secondary"
              onClick={() => {
                if (props.start != null) {
                  props.start()
                }
              }}
            >
              Start Now
            </Button>
          )}
        </div>
      </Container>
    </div>
  )
}

interface DisplayViewProps {
  viewID: number
  isPlaying: boolean
}

const hack = new ChildCallbackHack()
function DisplayView(props: DisplayViewProps) {
  const view = useAppSelector(selectDisplayView(props.viewID))
  let transform: string | undefined = undefined
  if (view.sync) {
    if (view.mirrorSyncedView === MVF.horizontal) {
      transform = 'scaleY(-1)'
    }
    if (view.mirrorSyncedView === MVF.vertical) {
      transform = 'scaleX(-1)'
    }
  }
  return (
    <Box
      sx={{
        position: 'absolute',
        top: `${view.y}%`,
        left: `${view.x}%`,
        width: `${view.width}%`,
        height: `${view.height}%`,
        opacity: view.opacity / 100,
        zIndex: view.z,
        transform
      }}
    >
      <ImagePlayer
        uuid={view.playerUUID as string}
        isPlaying={props.isPlaying}
        historyOffset={0}
        setHistoryOffset={() => {}}
        setHistoryPaths={() => {}}
        advanceHack={hack}
        deleteHack={hack}
        setVideo={() => {}}
        setTimeToNextFrame={() => {}}
        synced={view.sync}
      />
    </Box>
  )
}

export interface DisplayManagerProps {
  displayID: number
}

function DisplayManager(props: DisplayManagerProps) {
  const [recentPictureGrid, setRecentPictureGrid] = useState(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const dispatch = useAppDispatch()
  const views = useAppSelector(selectDisplayVisibleViews(props.displayID))
  const hasStarted = useAppSelector(selectDisplayHasStarted(props.displayID))
  const canStart = useAppSelector(selectDisplayCanStart(props.displayID))

  const wakeLock = useWakeLock()
  const stayAwake = useStayAwake()
  const isPageVisible = usePageVisibility()

  useEffect(() => {
    if (isPageVisible) {
      if (wakeLock.isSupported && wakeLock.released !== false) {
        wakeLock.request().catch(() => {})
      } else if (!wakeLock.isSupported && stayAwake.canSleep) {
        stayAwake.preventSleeping()
      }
    } else if (!wakeLock.isSupported && !stayAwake.canSleep) {
      stayAwake.allowSleeping()
    }
  }, [isPageVisible, stayAwake, wakeLock])

  const play = useCallback(() => {
    if (hasStarted) {
      setIsPlaying(true)
    }
  }, [hasStarted])

  const pause = useCallback(() => {
    if (hasStarted) {
      setIsPlaying(false)
    }
  }, [hasStarted])

  useEffect(() => {
    play()
  }, [hasStarted, play])

  const goBack = useCallback(() => {
    if (recentPictureGrid) {
      setRecentPictureGrid(false)
    } else {
      if (wakeLock.isSupported && wakeLock.released === false) {
        wakeLock.release().catch(() => {})
      } else if (!wakeLock.isSupported && !stayAwake.canSleep) {
        stayAwake.allowSleeping()
      }

      dispatch(setRouteGoBack())
    }
  }, [dispatch, recentPictureGrid, stayAwake, wakeLock])

  const { classes } = useStyles()
  const start = canStart
    ? () => dispatch(setDisplayHasStarted(props.displayID))
    : undefined
  return (
    <>
      <DisplayManagerAppBar
        drawerHover={false} // TODO add settings drawer for single view
        isPlaying={isPlaying}
        hasStarted={hasStarted}
        play={play}
        pause={pause}
        displayID={props.displayID}
        goBack={goBack}
      />
      {!hasStarted && (
        <ProgressCard displayID={props.displayID} start={start} />
      )}
      <Box className={classes.container}>
        {views.map((id) => (
          <DisplayView key={id} viewID={id} isPlaying={isPlaying} />
        ))}
      </Box>
    </>
  )
}

;(DisplayManager as any).displayName = 'DisplayManager'
export default DisplayManager

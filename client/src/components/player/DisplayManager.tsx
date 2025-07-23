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
import ImagePlayer from './ImagePlayer'
import ChildCallbackHack from './ChildCallbackHack'
import { MVF } from 'flipflip-common'
import DisplayManagerAppBar from './DisplayManagerAppBar'
import useStayAwake from 'use-stay-awake'
import { usePageVisibility } from 'react-page-visibility'
import { useWakeLock } from 'react-screen-wake-lock'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  useGetPlayerScraperProgressQuery,
  useGetPlayerViewPlayersQuery,
  useGetViewPlayerConfigQuery
} from '../../store/api/slice'
import { setImagePlayersStarted } from '../../store/imagePlayer/slice'
import {
  selectPlayerCanStart,
  selectPlayerHasStarted
} from '../../store/imagePlayer/selectors'

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
  playerID: string
  start?: () => void
}

function ProgressCard(props: ProgressCardProps) {
  const { playerID } = props
  const { classes } = useStyles()
  const { data: progress } = useGetPlayerScraperProgressQuery(playerID, {
    pollingInterval: 10000
  })

  let current = 0
  let total = 0
  let message: string[] = []
  if (progress != null) {
    current = progress.current
    total = progress.total
    message = progress.message
  }
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
  viewPlayerID: string
  isPlaying: boolean
}

const hack = new ChildCallbackHack() // TODO get rid of hacks
function DisplayView(props: DisplayViewProps) {
  const { data: config } = useGetViewPlayerConfigQuery(props.viewPlayerID)
  if (config == null) {
    return null
  }

  const { view } = config
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
        uuid={props.viewPlayerID}
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

function DisplayManager() {
  const { id } = useParams()
  const playerID = id as string
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [recentPictureGrid, setRecentPictureGrid] = useState(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const { data: viewPlayers } = useGetPlayerViewPlayersQuery(playerID)
  const hasStarted = useAppSelector(selectPlayerHasStarted())
  const canStart = useAppSelector(selectPlayerCanStart())

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

      navigate(-1)
    }
  }, [recentPictureGrid, stayAwake, wakeLock])

  const { classes } = useStyles()
  const start = canStart ? () => dispatch(setImagePlayersStarted()) : undefined
  return (
    <>
      <DisplayManagerAppBar
        drawerHover={false} // TODO add settings drawer for single view
        isPlaying={isPlaying}
        hasStarted={hasStarted}
        play={play}
        pause={pause}
        playerID={playerID}
        goBack={goBack}
      />
      {!hasStarted && <ProgressCard playerID={playerID} start={start} />}
      <Box className={classes.container}>
        {viewPlayers &&
          viewPlayers.map((id) => (
            <DisplayView key={id} viewPlayerID={id} isPlaying={isPlaying} />
          ))}
      </Box>
    </>
  )
}

;(DisplayManager as any).displayName = 'DisplayManager'
export default DisplayManager

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
  useGetPlayerViewPlayersQuery,
  useGetViewPlayerConfigQuery,
  useStopPlayerMutation
} from '../../store/api/slice'
import {
  selectPlayerCanStart,
  selectPlayerHasStarted,
  selectPlayerProgress
} from '../../store/imagePlayer/selectors'
import {
  pauseImagePlayers,
  startImagePlayers
} from '../../store/imagePlayer/thunks'

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

function ProgressCard() {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const canStart = useAppSelector(selectPlayerCanStart())
  const { total, current } = useAppSelector(selectPlayerProgress())

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
          {canStart && (
            <Button
              className={classes.startNowBtn}
              variant="contained"
              color="secondary"
              onClick={() => {
                dispatch(startImagePlayers())
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
}

const hack = new ChildCallbackHack() // TODO get rid of hacks
function DisplayView(props: DisplayViewProps) {
  const { data: config } = useGetViewPlayerConfigQuery(props.viewPlayerID)
  if (config == null) {
    return null
  }

  const { view, uuid } = config
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
        uuid={uuid}
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
  const [stopPlayer] = useStopPlayerMutation()
  const [recentPictureGrid, setRecentPictureGrid] = useState(false)

  const { data: viewPlayers } = useGetPlayerViewPlayersQuery(playerID)
  const hasStarted = useAppSelector(selectPlayerHasStarted())

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

  const goBack = useCallback(async () => {
    if (recentPictureGrid) {
      setRecentPictureGrid(false)
    } else {
      if (wakeLock.isSupported && wakeLock.released === false) {
        try {
          await wakeLock.release()
        } catch {
          console.error('Failed to release wake lock')
        }
      } else if (!wakeLock.isSupported && !stayAwake.canSleep) {
        stayAwake.allowSleeping()
      }

      dispatch(pauseImagePlayers())
      await stopPlayer(playerID)
      navigate(-1)
    }
  }, [recentPictureGrid, stayAwake, wakeLock])

  const { classes } = useStyles()
  return (
    <>
      <DisplayManagerAppBar
        drawerHover={false} // TODO add settings drawer for single view
        playerID={playerID}
        goBack={goBack}
      />
      {!hasStarted && <ProgressCard />}
      <Box className={classes.container}>
        {viewPlayers &&
          viewPlayers.map((id) => <DisplayView key={id} viewPlayerID={id} />)}
      </Box>
    </>
  )
}

;(DisplayManager as any).displayName = 'DisplayManager'
export default DisplayManager

import React, { useEffect, useState, useRef } from 'react'
import Sound from 'react-sound'
import clsx from 'clsx'

import {
  Collapse,
  Grid,
  IconButton,
  Slider,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import Forward10Icon from '@mui/icons-material/Forward10'
import Forward5Icon from '@mui/icons-material/Forward5'
import Replay10Icon from '@mui/icons-material/Replay10'
import Replay5Icon from '@mui/icons-material/Replay5'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import VolumeDownIcon from '@mui/icons-material/VolumeDown'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'

import { getDuration, getMsRemainder, getTimestamp } from '../../data/utils'
import { RP, TF } from '../../data/const'
import SoundTick from './SoundTick'
import { nextScene } from '../../../store/scene/thunks'
import { playTrack } from '../../../store/audio/slice'
import BaseSlider from '../common/slider/BaseSlider'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  selectAudioBPM,
  selectAudioUrl,
  selectAudioTick,
  selectAudioTickMode,
  selectAudioTickDelay,
  selectAudioTickMaxDelay,
  selectAudioTickMinDelay,
  selectAudioTickSinRate,
  selectAudioTickBPMMulti,
  selectAudioVolume,
  selectAudioSpeed,
  selectAudioStopAtEnd,
  selectAudioNextSceneAtEnd
} from '../../../store/audio/selectors'

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: '100%'
    },
    noPadding: {
      padding: '0 !important'
    },
    noTransition: {
      transition: 'unset'
    }
  })

export interface AudioControlProps extends WithStyles<typeof styles> {
  sceneID: number
  audioID: number
  audioEnabled: boolean
  singleTrack: boolean
  lastTrack: boolean
  repeat: string
  scenePaths: any[]
  startPlaying: boolean
  shorterSeek?: boolean
  showMsTimestamp?: boolean
  audioVolumeAction: (value: number) => any
  nextTrack?: () => void
  prevTrack?: () => void
  goBack?: () => void
  onPlaying?: (position: number, duration: number) => void
}

function AudioControl (props: AudioControlProps) {
  const dispatch = useAppDispatch()
  const bpm = useAppSelector(selectAudioBPM(props.audioID))
  const url = useAppSelector(selectAudioUrl(props.audioID))
  const tick = useAppSelector(selectAudioTick(props.audioID))
  const tickMode = useAppSelector(selectAudioTickMode(props.audioID))
  const tickDelay = useAppSelector(selectAudioTickDelay(props.audioID))
  const tickMaxDelay = useAppSelector(selectAudioTickMaxDelay(props.audioID))
  const tickMinDelay = useAppSelector(selectAudioTickMinDelay(props.audioID))
  const tickSinRate = useAppSelector(selectAudioTickSinRate(props.audioID))
  const tickBPMMulti = useAppSelector(selectAudioTickBPMMulti(props.audioID))
  const stopAtEnd = useAppSelector(selectAudioStopAtEnd(props.audioID))
  const nextSceneAtEnd = useAppSelector(
    selectAudioNextSceneAtEnd(props.audioID)
  )
  const volume = useAppSelector(selectAudioVolume(props.audioID))
  const speed = useAppSelector(selectAudioSpeed(props.audioID))

  const [playing, setPlaying] = useState(props.startPlaying)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [tickState, setTickState] = useState(false)

  const _timeout = useRef<number>()
  const _queueNextTrack = useRef(false)

  useEffect(() => {
    if (playing) {
      tickLoop(true)
    }

    _queueNextTrack.current = false
    return () => {
      if (_timeout.current) {
        clearTimeout(_timeout.current)
      }

      _queueNextTrack.current = false
    }
  }, [])

  useEffect(() => {
    setPosition(0)
    setDuration(0)
  }, [url])

  useEffect(() => {
    if (playing && tick && tickMode !== TF.scene) {
      tickLoop(true)
    } else {
      clearTimeout(_timeout.current)
    }
  }, [playing])

  useEffect(() => {
    if (
      tick &&
      tickMode === TF.scene &&
      props.scenePaths &&
      props.scenePaths.length > 0
    ) {
      if (_queueNextTrack.current) {
        _queueNextTrack.current = false
        props.nextTrack!()
        setPosition(0)
        setDuration(0)
      }

      setTickState(!tickState)
    }
  }, [tick, tickMode, props.scenePaths])

  useEffect(() => {
    if (tick) {
      tickLoop(true)
    }
  }, [tick])

  useEffect(() => {
    if (tick && tickMode === TF.scene) {
      tickLoop(true)
    }
  }, [tickMode])

  const getTimestampFromMs = (ms: number): string => {
    const secs = Math.floor(ms / 1000)
    return getTimestamp(secs)
  }

  const tickLoop = (starting: boolean = false) => {
    if (!starting) {
      if (_queueNextTrack.current) {
        _queueNextTrack.current = false
        props.nextTrack!()
        setPosition(0)
        setDuration(0)
      }

      setTickState(!tickState)
    }
    if (tick) {
      const timeout = getDuration(
        {
          timingFunction: tickMode,
          time: tickDelay,
          timeMax: tickMaxDelay,
          timeMin: tickMinDelay,
          bpmMulti: tickBPMMulti,
          sinRate: tickSinRate
        },
        0,
        bpm
      )
      if (timeout != null) {
        _timeout.current = window.setTimeout(tickLoop.bind(this), timeout)
        return
      }
    }
    _timeout.current = undefined
  }

  const onChangePosition = (e: MouseEvent, value: number) => {
    setPosition(value)
  }

  const onFinishedPlaying = () => {
    // Increment play count upon finish
    dispatch(playTrack(props.audioID))

    if (stopAtEnd && props.goBack) {
      props.goBack()
    } else if (nextSceneAtEnd) {
      dispatch(nextScene(props.sceneID))
      setPosition(0)
      setDuration(0)
    } else {
      if (props.repeat === RP.all) {
        if (tick) {
          _queueNextTrack.current = true
        } else {
          if (props.singleTrack) {
            setPosition(1)
          } else {
            props.nextTrack!()
            setPosition(0)
            setDuration(0)
          }
        }
      } else if (props.repeat === RP.one) {
        setPosition(1)
      } else if (props.repeat === RP.none) {
        if (!props.lastTrack) {
          if (tick) {
            _queueNextTrack.current = true
          } else {
            props.nextTrack!()
            setPosition(0)
            setDuration(0)
          }
        } else {
          setPlaying(false)
        }
      }
    }
  }

  const onPlaying = (soundData: any) => {
    let newPosition = position
    let newDuration = duration
    if (soundData.position) {
      newPosition = soundData.position
    }
    if (soundData.duration) {
      newDuration = soundData.duration
    }
    if (props.onPlaying) {
      props.onPlaying(newPosition, newDuration)
    }

    setPosition(newPosition)
    setDuration(newDuration)
  }

  const onError = (errorCode: number, description: string) => {
    console.error(errorCode + ' - ' + description)
  }

  const onPlay = () => {
    setPlaying(true)
  }

  const onPause = () => {
    setPlaying(false)
  }

  const onBack = () => {
    const amount = props.shorterSeek ? 5000 : 10000
    setPosition(Math.max(position - amount, 0))
  }

  const onForward = () => {
    const amount = props.shorterSeek ? 5000 : 10000
    setPosition(Math.min(position + amount, duration))
  }

  const classes = props.classes
  const playStatus = playing
    ? (Sound as any).status.PLAYING
    : (Sound as any).status.PAUSED

  let msRemainder
  if (props.showMsTimestamp) {
    msRemainder = getMsRemainder(position)
    if (msRemainder === '.000') {
      msRemainder = undefined
    }
  }

  return (
    <React.Fragment key={props.audioID}>
      {props.audioEnabled && tick && playing && (
        <SoundTick
          url={url as string}
          playing={playStatus}
          speed={speed / 10}
          volume={volume}
          tick={tickState}
          onPlaying={onPlaying.bind(this)}
          onError={onError.bind(this)}
          onFinishedPlaying={onFinishedPlaying.bind(this)}
        />
      )}
      {props.audioEnabled && !tick && (
        <Sound
          url={url as string}
          playStatus={playStatus}
          playbackRate={speed / 10}
          volume={volume}
          position={position}
          onPlaying={onPlaying.bind(this)}
          onError={onError.bind(this)}
          onFinishedPlaying={onFinishedPlaying.bind(this)}
        />
      )}
      <Grid
        item
        xs={12}
        className={clsx(!props.audioEnabled && classes.noPadding)}
      >
        <Collapse in={props.audioEnabled} className={classes.fullWidth}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Grid
                container
                spacing={1}
                alignItems="center"
                justifyContent="center"
              >
                <Grid item xs={12} sm={12}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        {getTimestampFromMs(position)}
                      </Typography>
                    </Grid>
                    <Grid item xs>
                      <Slider
                        valueLabelDisplay={msRemainder ? 'auto' : 'off'}
                        valueLabelFormat={msRemainder}
                        value={position}
                        classes={{
                          thumb: classes.noTransition,
                          track: classes.noTransition
                        }}
                        max={duration}
                        onChange={onChangePosition.bind(this)}
                      />
                    </Grid>
                    <Grid item>
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        {getTimestampFromMs(duration)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  {props.prevTrack && (
                    <Tooltip disableInteractive title="Prev Track">
                      <IconButton
                        onClick={props.prevTrack.bind(this)}
                        size="large"
                      >
                        <SkipPreviousIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip disableInteractive title="Jump Back">
                    <IconButton onClick={onBack.bind(this)} size="large">
                      {props.shorterSeek ? <Replay5Icon /> : <Replay10Icon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    disableInteractive
                    title={playing ? 'Pause' : 'Play'}
                  >
                    <IconButton
                      onClick={playing ? onPause.bind(this) : onPlay.bind(this)}
                      size="large"
                    >
                      {playing ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip disableInteractive title="Jump Forward">
                    <IconButton onClick={onForward.bind(this)} size="large">
                      {props.shorterSeek ? <Forward5Icon /> : <Forward10Icon />}
                    </IconButton>
                  </Tooltip>
                  {props.nextTrack && (
                    <Tooltip disableInteractive title="Next Track">
                      <IconButton
                        onClick={props.nextTrack.bind(this)}
                        size="large"
                      >
                        <SkipNextIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <VolumeDownIcon />
                </Grid>
                <Grid item xs>
                  <BaseSlider
                    selector={selectAudioVolume(props.audioID)}
                    action={props.audioVolumeAction}
                    labelledBy="audio-volume-slider"
                  />
                </Grid>
                <Grid item>
                  <VolumeUpIcon />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </React.Fragment>
  )
}

;(AudioControl as any).displayName = 'AudioControl'
export default withStyles(styles)(AudioControl as any)

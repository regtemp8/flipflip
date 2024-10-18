import React, { useEffect, useState, useRef, useCallback } from 'react'
import Sound from 'react-sound'
import { cx } from '@emotion/css'

import {
  Collapse,
  Grid2,
  IconButton,
  Slider,
  Tooltip,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

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

import { getMsRemainder, getTimestamp } from '../../utils'
import { RP, TF } from 'flipflip-common'
import SoundTick from './SoundTick'
import BaseSlider from '../common/slider/BaseSlider'
import DurationCalculator from '../../data/DurationCalculator'
import { useGetAudioQuery } from '../../store/api/slice'

const useStyles = makeStyles()(() => ({
  fullWidth: {
    width: '100%'
  },
  noPadding: {
    padding: '0 !important'
  },
  noTransition: {
    transition: 'unset'
  }
}))

export interface AudioControlProps {
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

function AudioControl(props: AudioControlProps) {
  const {data: audio} = useGetAudioQuery(props.audioID)

  const [playing, setPlaying] = useState(props.startPlaying)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [tickState, setTickState] = useState(false)

  const _timeout = useRef<number>()
  const _queueNextTrack = useRef(false)
  const _duration = useRef(new DurationCalculator())

  const tickLoop = useCallback(
    (starting: boolean = false) => {
      if (!starting) {
        if (_queueNextTrack.current) {
          _queueNextTrack.current = false
          props.nextTrack!()
          setPosition(0)
          setDuration(0)
        }

        setTickState(!tickState)
      }
      if (audio?.tick) {
        const {tickMode, tickDelay, tickMaxDelay, tickMinDelay, tickBPMMulti, tickSinRate, bpm} = audio
        const timeout = _duration.current.calc(
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
          _timeout.current = window.setTimeout(tickLoop, timeout)
          return
        }
      }
      _timeout.current = undefined
    },
    [
      audio,
      props.nextTrack,
      tickState
    ]
  )

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
  }, [playing, tickLoop])

  useEffect(() => {
    setPosition(0)
    setDuration(0)
  }, [audio?.url])

  useEffect(() => {
    if (playing && audio?.tick && audio?.tickMode !== TF.scene) {
      tickLoop(true)
    } else {
      clearTimeout(_timeout.current)
    }
  }, [playing, audio?.tick, tickLoop, audio?.tickMode])

  useEffect(() => {
    if (
      audio?.tick &&
      audio?.tickMode === TF.scene &&
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
  }, [audio?.tick, audio?.tickMode, props.scenePaths, props.nextTrack, tickState])

  useEffect(() => {
    if (audio?.tick) {
      tickLoop(true)
    }
  }, [audio?.tick, tickLoop])

  useEffect(() => {
    if (audio?.tick && audio?.tickMode === TF.scene) {
      tickLoop(true)
    }
  }, [audio?.tickMode, audio?.tick, tickLoop])

  const getTimestampFromMs = (ms: number): string => {
    const secs = Math.floor(ms / 1000)
    return getTimestamp(secs)
  }

  const onChangePosition = (
    e: Event,
    value: number | number[],
    activeThumb: number
  ) => {
    const newPosition: number = Array.isArray(value) ? value[0] : value
    setPosition(newPosition)
  }

  const onFinishedPlaying = () => {
    // TODO Increment play count upon finish
    // dispatch(playTrack(props.audioID))

    if (audio?.stopAtEnd && props.goBack) {
      props.goBack()
    } else if (audio?.nextSceneAtEnd) {
      // TODO how is this going to work with scene playlists?
      // dispatch(nextScene(props.sceneID))
      setPosition(0)
      setDuration(0)
    } else {
      if (props.repeat === RP.all) {
        if (audio?.tick) {
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
          if (audio?.tick) {
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

  const onPlaying = () => {
    if (props.onPlaying) {
      props.onPlaying(position, duration)
    }
  }

  const onError = (component: string) => {
    console.error(component + ' - react-sound error')
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

  const { classes } = useStyles()
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
      {props.audioEnabled && audio?.tick && playing && (
        <SoundTick
          url={audio?.url as string}
          playing={playStatus}
          speed={(audio?.speed ?? 1) / 10}
          volume={audio?.volume}
          tick={tickState}
          onPlaying={onPlaying}
          onError={() => onError('SoundTick')}
          onFinishedPlaying={onFinishedPlaying}
        />
      )}
      {props.audioEnabled && !audio?.tick && (
        <Sound
          url={audio?.url as string}
          playStatus={playStatus}
          playbackRate={(audio?.speed ?? 1) / 10}
          volume={audio?.volume}
          position={position}
          onPlaying={onPlaying}
          onError={() => onError('Sound')}
          onFinishedPlaying={onFinishedPlaying}
        />
      )}
      <Grid2
        size={12}
        className={cx(!props.audioEnabled && classes.noPadding)}
      >
        <Collapse in={props.audioEnabled} className={classes.fullWidth}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={12}>
              <Grid2
                container
                spacing={1}
                alignItems="center"
                justifyContent="center"
              >
                <Grid2 size={12}>
                  <Grid2 container spacing={1} alignItems="center">
                    <Grid2>
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        {getTimestampFromMs(position)}
                      </Typography>
                    </Grid2>
                    <Grid2 size='grow'>
                      <Slider
                        valueLabelDisplay={msRemainder ? 'auto' : 'off'}
                        valueLabelFormat={msRemainder}
                        value={position}
                        classes={{
                          thumb: classes.noTransition,
                          track: classes.noTransition
                        }}
                        max={duration}
                        onChange={onChangePosition}
                      />
                    </Grid2>
                    <Grid2>
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        {getTimestampFromMs(duration)}
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>
                <Grid2>
                  {props.prevTrack && (
                    <Tooltip disableInteractive title="Prev Track">
                      <IconButton onClick={props.prevTrack} size="large">
                        <SkipPreviousIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip disableInteractive title="Jump Back">
                    <IconButton onClick={onBack} size="large">
                      {props.shorterSeek ? <Replay5Icon /> : <Replay10Icon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    disableInteractive
                    title={playing ? 'Pause' : 'Play'}
                  >
                    <IconButton
                      onClick={playing ? onPause : onPlay}
                      size="large"
                    >
                      {playing ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip disableInteractive title="Jump Forward">
                    <IconButton onClick={onForward} size="large">
                      {props.shorterSeek ? <Forward5Icon /> : <Forward10Icon />}
                    </IconButton>
                  </Tooltip>
                  {props.nextTrack && (
                    <Tooltip disableInteractive title="Next Track">
                      <IconButton onClick={props.nextTrack} size="large">
                        <SkipNextIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid2>
              </Grid2>
            </Grid2>
            <Grid2 size={12}>
              <Grid2 container spacing={1} alignItems="center">
                <Grid2>
                  <VolumeDownIcon />
                </Grid2>
                <Grid2 size='grow'>
                  <BaseSlider
                    selector={() => ({data: audio?.volume})}
                    action={props.audioVolumeAction}
                    labelledBy="audio-volume-slider"
                  />
                </Grid2>
                <Grid2>
                  <VolumeUpIcon />
                </Grid2>
              </Grid2>
            </Grid2>
          </Grid2>
        </Collapse>
      </Grid2>
    </React.Fragment>
  )
}

;(AudioControl as any).displayName = 'AudioControl'
export default AudioControl

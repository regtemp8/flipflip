import React, { useEffect, useState, useRef, useCallback } from 'react'
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
import { Audio } from 'flipflip-common'
import BaseSlider from '../common/slider/BaseSlider'
import DurationCalculator from '../../data/DurationCalculator'
import { AppDispatch } from '../../store/store'
import { useAppSelector } from '../../store/hooks'
import { setAudioOptionsVolume } from '../../store/audioOptions/slice'
import { selectAudioOptions, selectAudioOptionsVolume } from '../../store/audioOptions/selectors'

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
  nextTrack?: () => void
  prevTrack?: () => void
  goBack?: () => void
  onPlaying?: (position: number, duration: number) => void
}

function AudioControl(props: AudioControlProps) {
  const audio = useAppSelector(selectAudioOptions())

  const [playing, setPlaying] = useState(props.startPlaying)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  const _duration = useRef(new DurationCalculator())
  const _control = useRef<HTMLAudioElement|null>(null)
  const _tickDuration = useRef<number>(0)

  const onTimeUpdate = (currentTime: number) => {
    const {tick, tickMode, tickDelay, tickMaxDelay, tickMinDelay, tickBPMMulti, tickSinRate, bpm} = audio as Audio
    if(tick && currentTime >= _tickDuration.current) {
      _control.current!.currentTime = 0
      const nextTick = _duration.current.calc(
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

      _tickDuration.current = nextTick / 1000
    } else {
      setPosition(currentTime)
    }
  }

  useEffect(() => {
    setPosition(0)
    setDuration(0)
  }, [audio?.url])

  useEffect(() => {
    if(!_control.current || audio == null) {
      return
    }

    _control.current.currentTime = 0
    const {tick, tickMode, tickDelay, tickMaxDelay, tickMinDelay, tickBPMMulti, tickSinRate, bpm} = audio
    let nextTick = 0
    if(tick) {
      nextTick = _duration.current.calc(
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
    }

    _tickDuration.current = nextTick / 1000
  }, [audio?.tick, audio?.tickMode, audio?.tickDelay, audio?.tickMaxDelay, audio?.tickMinDelay, audio?.tickBPMMulti, audio?.tickSinRate, audio?.bpm])

  useEffect(() => {
    if(!_control.current || audio == null) {
      return
    }

    _control.current.volume = audio.volume / 100
  },[audio?.volume])

  useEffect(() => {
    if(!_control.current || audio == null) {
      return
    }

    _control.current.playbackRate = audio.speed / 10
  }, [audio?.speed])

  const onChangePosition = (
    e: Event,
    value: number | number[],
    activeThumb: number
  ) => {
    if(!_control.current || audio == null) {
      return
    }

    _control.current.currentTime = Array.isArray(value) ? value[0] : value
  }

  const togglePlay = () => {
    if(!_control.current) {
      return
    }

    if(_control.current.paused) {
      _control.current.play()
    } else {
      _control.current.pause()
    }
    setPlaying(value => !value)
  }

  const onBack = () => {
    if(!_control.current) {
      return
    }

    const amount = props.shorterSeek ? 5 : 10
    _control.current.currentTime -= amount
  }

  const onForward = () => {
    if(!_control.current) {
      return
    }

    const amount = props.shorterSeek ? 5 : 10
    _control.current.currentTime += amount
  }

  const { classes } = useStyles()

  let msRemainder = undefined
  if (props.showMsTimestamp) {
    msRemainder = getMsRemainder(position)
    if (msRemainder === '.000') {
      msRemainder = undefined
    }
  }

  return (
    <React.Fragment key={props.audioID}>
      {props.audioEnabled && (
        <audio 
          ref={_control} 
          src={audio?.fileUrl ?? ''} 
          autoPlay={props.startPlaying} 
          onLoadedData={(e) => setDuration(e.currentTarget.duration)} 
          onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
          onEnded={(e) => console.log('ENDED PLAYING')} // TODO play next track and/or switch to next scene
        />
      )}
      <Grid2 size={12} className={cx(!props.audioEnabled && classes.noPadding)}>
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
                        {getTimestamp(position)}
                      </Typography>
                    </Grid2>
                    <Grid2 size="grow">
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
                        {getTimestamp(duration)}
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
                      onClick={togglePlay}
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
                <Grid2 size="grow">
                  <BaseSlider
                    selector={() => useAppSelector(selectAudioOptionsVolume())}
                    action={(volume: number) => (dispatch: AppDispatch) => dispatch(setAudioOptionsVolume(volume))}
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

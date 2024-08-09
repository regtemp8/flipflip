import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'

import {
  Grid,
  IconButton,
  Slider,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import Forward5Icon from '@mui/icons-material/Forward5'
import Forward10Icon from '@mui/icons-material/Forward10'
import Forward30Icon from '@mui/icons-material/Forward30'
import FastForwardIcon from '@mui/icons-material/FastForward'
import FastRewindIcon from '@mui/icons-material/FastRewind'
import Replay5Icon from '@mui/icons-material/Replay5'
import Replay10Icon from '@mui/icons-material/Replay10'
import Replay30Icon from '@mui/icons-material/Replay30'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import SpeedIcon from '@mui/icons-material/Speed'
import VolumeDownIcon from '@mui/icons-material/VolumeDown'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'

import { getTimestamp } from '../../data/utils'
import {
  selectClipVolume,
  selectClipStartMarks
} from '../../store/clip/selectors'
import { useAppSelector } from '../../store/hooks'
import { RootState } from '../../store/store'

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    timeSlider: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(3),
      marginTop: theme.spacing(2)
    },
    valueLabel: {
      color: theme.palette.text.primary,
      backgroundColor: 'transparent',
      top: 2
    },
    noTransition: {
      transition: 'unset'
    }
  })

export interface VideoControlProps extends WithStyles<typeof styles> {
  video: HTMLVideoElement
  useHotkeys?: boolean
  player?: boolean
  volume?: any
  clipID?: number
  clipValue?: number[]
  clips?: number[]
  skip?: number
  onChangeVolume: (volume: number) => void
  onChangeSpeed?: (speed: number) => void
  nextTrack?: () => void
}

function VideoControl(props: VideoControlProps) {
  const volumeSelector =
    props.clipID != null
      ? selectClipVolume(props.clipID)
      : (state: RootState) => undefined
  const volume = useAppSelector(volumeSelector)
  const clipStartMarks = useAppSelector(selectClipStartMarks(props.clips))

  const [playing, setPlaying] = useState(true)
  const [update, setUpdate] = useState(true)
  const [showSpeed, setShowSpeed] = useState(false)

  const _interval = useRef<number>()

  useEffect(() => {
    _interval.current = window.setInterval(() => {
      if (!props.video) return
      if (!props.video.paused) {
        triggerUpdate()
      }
      if (props.clipValue) {
        if (props.video.paused && playing) {
          setPlaying(false)
        } else if (!props.video.paused && !playing) {
          setPlaying(true)
        }
        if (
          props.video.currentTime < props.clipValue[0] ||
          props.video.currentTime > props.clipValue[1]
        ) {
          if (props.video.onended) {
            props.video.onended(new Event('end'))
          }
          props.video.currentTime = props.clipValue[0]
        }
      }
    }, 50)
    if (props.useHotkeys) {
      if (props.player) {
        window.addEventListener('keydown', onPlayerKeyDown, false)
      } else {
        window.addEventListener('keydown', onKeyDown, false)
      }
    }

    return () => {
      clearInterval(_interval.current)
      if (props.useHotkeys) {
        if (props.player) {
          window.removeEventListener('keydown', onPlayerKeyDown)
        } else {
          window.removeEventListener('keydown', onKeyDown)
        }
      }
    }
  }, [])

  const onSwapSlider = () => {
    setShowSpeed(!showSpeed)
  }
  const triggerUpdate = () => {
    setUpdate(!update)
  }

  const onChangePosition = (e: Event, value: number | number[]) => {
    const newPosition: number = Array.isArray(value) ? value[0] : value
    props.video.currentTime = newPosition
    if (props.video.paused) {
      triggerUpdate()
    }
  }

  const onChangeVolume = (e: Event, volume: number | number[]) => {
    let newVolume = Array.isArray(volume) ? volume[0] : volume
    if (newVolume > 100) {
      newVolume = 100
    }
    if (newVolume < 0) {
      newVolume = 0
    }
    props.onChangeVolume(newVolume)
    if (props.video) {
      props.video.volume = newVolume / 100
      triggerUpdate()
    }
  }

  const onChangeSpeed = (
    e: Event | SyntheticEvent<Element>,
    speed: number | number[]
  ) => {
    const newSpeed = Array.isArray(speed) ? speed[0] : speed
    if (props.onChangeSpeed != null) {
      props.onChangeSpeed(newSpeed)
    }
    if (props.video) {
      props.video.playbackRate = newSpeed / 10
      triggerUpdate()
    }
  }

  const onPlay = () => {
    setPlaying(true)
    props.video.play().catch((err) => console.warn(err))
  }

  const onPause = () => {
    setPlaying(false)
    props.video.pause()
  }

  const onBack = () => {
    const skip = props.skip ? props.skip : 10
    let position = props.video.currentTime - skip
    if (position < 0) {
      position = 0
    }
    onChangePosition(new Event('back'), position)
  }

  const onForward = () => {
    const skip = props.skip ? props.skip : 10
    let position = props.video.currentTime + skip
    if (position > props.video.duration) {
      position = props.video.duration
    }
    onChangePosition(new Event('forward'), position)
  }

  const getMarks = (): Array<{ value: number; label: string }> => {
    if (!props.video) return []
    const min = props.clipValue ? props.clipValue[0] : 0
    const max = props.clipValue ? props.clipValue[1] : props.video.duration
    const marks = [
      { value: min, label: getTimestamp(min) },
      { value: max, label: getTimestamp(max) }
    ]
    if (!props.clipValue && clipStartMarks) {
      clipStartMarks.forEach((start, index) => {
        marks.push({ value: start, label: (index + 1).toString() })
      })
    }
    return marks
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const focus = document.activeElement!.tagName.toLocaleLowerCase()
    switch (e.key) {
      case ' ':
        e.preventDefault()
        playing ? onPause() : onPlay()
        break
      case 'ArrowUp':
        if (e.ctrlKey) {
          e.preventDefault()
          onChangeVolume(new Event(e.key), props.video.volume * 100 + 5)
        }
        break
      case 'ArrowDown':
        if (e.ctrlKey) {
          e.preventDefault()
          onChangeVolume(new Event(e.key), props.video.volume * 100 - 5)
        }
        break
      case 'ArrowLeft':
        if (focus !== 'input') {
          e.preventDefault()
          onBack()
        }
        break
      case 'ArrowRight':
        if (focus !== 'input') {
          e.preventDefault()
          onForward()
        }
        break
    }
  }

  const onPlayerKeyDown = (e: KeyboardEvent) => {
    const focus = document.activeElement!.tagName.toLocaleLowerCase()
    if (e.shiftKey) {
      switch (e.key) {
        case ' ':
          e.preventDefault()
          playing ? onPause() : onPlay()
          break
        case 'ArrowUp':
          if (e.ctrlKey) {
            e.preventDefault()
            onChangeVolume(new Event(e.key), props.video.volume * 100 + 5)
          }
          break
        case 'ArrowDown':
          if (e.ctrlKey) {
            e.preventDefault()
            onChangeVolume(new Event(e.key), props.video.volume * 100 - 5)
          }
          break
        case 'ArrowLeft':
          if (focus !== 'input') {
            e.preventDefault()
            onBack()
          }
          break
        case 'ArrowRight':
          if (focus !== 'input') {
            e.preventDefault()
            onForward()
          }
          break
      }
    }
  }

  if (props.video == null) {
    return (
      <Grid
        container
        spacing={1}
        alignItems="center"
        justifyContent={props.player ? 'center' : 'flex-start'}
      />
    )
  }

  const marks = getMarks()
  const classes = props.classes
  return (
    <Grid
      container
      spacing={1}
      alignItems="center"
      justifyContent={props.player ? 'center' : 'flex-start'}
    >
      <Grid item xs={props.player ? 12 : true} className={classes.timeSlider}>
        <Slider
          min={props.clipValue ? props.clipValue[0] : 0}
          max={props.clipValue ? props.clipValue[1] : props.video.duration}
          color={props.clipValue ? 'secondary' : 'primary'}
          value={props.video.currentTime}
          classes={{
            valueLabel: classes.valueLabel,
            thumb: classes.noTransition,
            track: classes.noTransition
          }}
          valueLabelDisplay="on"
          valueLabelFormat={(value) => getTimestamp(value)}
          marks={marks}
          onChange={onChangePosition}
        />
      </Grid>
      <Grid item>
        <Grid container alignItems="center">
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            {props.nextTrack && showSpeed && (
              <Tooltip disableInteractive title="Show Volume Controls">
                <IconButton onClick={onSwapSlider} size="large">
                  <VolumeUpIcon />
                </IconButton>
              </Tooltip>
            )}
            {props.nextTrack && !showSpeed && (
              <Tooltip disableInteractive title="Show Speed Controls">
                <IconButton onClick={onSwapSlider} size="large">
                  <SpeedIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip disableInteractive title="Jump Back">
              <IconButton onClick={onBack} size="large">
                {props.skip === 5 && <Replay5Icon />}
                {(!props.skip || props.skip === 10) && <Replay10Icon />}
                {props.skip === 30 && <Replay30Icon />}
                {props.skip === 60 && <FastRewindIcon />}
                {props.skip === 120 && <FastRewindIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip disableInteractive title={playing ? 'Pause' : 'Play'}>
              <IconButton onClick={playing ? onPause : onPlay} size="large">
                {playing ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip disableInteractive title="Jump Forward">
              <IconButton onClick={onForward} size="large">
                {props.skip === 5 && <Forward5Icon />}
                {(!props.skip || props.skip === 10) && <Forward10Icon />}
                {props.skip === 30 && <Forward30Icon />}
                {props.skip === 60 && <FastForwardIcon />}
                {props.skip === 120 && <FastForwardIcon />}
              </IconButton>
            </Tooltip>
            {props.nextTrack && (
              <Tooltip disableInteractive title="Next Track">
                <IconButton onClick={props.nextTrack} size="large">
                  <SkipNextIcon />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
          <Grid item xs={12}>
            {showSpeed && (
              <React.Fragment>
                <Typography
                  variant="caption"
                  component="div"
                  color="textSecondary"
                >
                  Video Speed {props.video.playbackRate}x
                </Typography>
                <Slider
                  min={1}
                  max={40}
                  defaultValue={props.video.playbackRate * 10}
                  onChangeCommitted={onChangeSpeed}
                  valueLabelDisplay={'auto'}
                  valueLabelFormat={(v) => v / 10 + 'x'}
                  aria-labelledby="video-speed-slider"
                />
              </React.Fragment>
            )}
            {!showSpeed && (
              <Grid container spacing={1}>
                <Grid item>
                  <VolumeDownIcon />
                </Grid>
                <Grid item xs>
                  <Slider
                    value={
                      props.volume
                        ? parseInt(props.volume)
                        : props.video.volume * 100
                    }
                    onChange={onChangeVolume}
                    marks={
                      volume != undefined ? [{ value: volume, label: '↑' }] : []
                    }
                  />
                </Grid>
                <Grid item>
                  <VolumeUpIcon />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

;(VideoControl as any).displayName = 'VideoControl'
export default withStyles(styles)(VideoControl as any)

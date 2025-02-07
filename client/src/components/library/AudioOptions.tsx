import React, { useEffect, useState } from 'react'
import { cx } from '@emotion/css'
import { analyze } from 'web-audio-beat-detector'

import {
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid2,
  IconButton,
  InputAdornment,
  SvgIcon,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import CheckIcon from '@mui/icons-material/Check'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

import { green, red } from '@mui/material/colors'

import { RP } from 'flipflip-common'
import AudioControl from '../player/AudioControl'
import TimingCard from '../common/TimingCard'
import BaseSwitch from '../common/BaseSwitch'
import BaseSlider from '../common/slider/BaseSlider'
import BaseTextField from '../common/text/BaseTextField'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { 
  selectAudioOptions,
  selectAudioOptionsUrl, 
  selectAudioOptionsStopAtEnd,
  selectAudioOptionsNextSceneAtEnd,
  selectAudioOptionsTick,
  selectAudioOptionsBPM,
  selectAudioOptionsSpeed,
  selectAudioOptionsHasBPM,
  selectAudioOptionsTickTF,
  selectAudioOptionsTickDuration,
  selectAudioOptionsTickDurationMin,
  selectAudioOptionsTickDurationMax,
  selectAudioOptionsTickSinRate,
  selectAudioOptionsTickBPMMulti
} from '../../store/audioOptions/selectors'
import { 
  setAudioOptionsBPM, 
  setAudioOptionsEditing, 
  setAudioOptionsNextSceneAtEnd, 
  setAudioOptionsSpeed, 
  setAudioOptionsStopAtEnd, 
  setAudioOptionsTick, 
  setAudioOptionsTickBPMMulti, 
  setAudioOptionsTickDuration, 
  setAudioOptionsTickDurationMax, 
  setAudioOptionsTickDurationMin, 
  setAudioOptionsTickSinRate, 
  setAudioOptionsTickTF, 
  setAudioOptionsUrl
} from '../../store/audioOptions/slice'
import { AppDispatch } from '../../store/store'
import { saveAudioOptions } from '../../store/audioOptions/thunks'
import { useLazyGetAudioBPMQuery } from '../../store/api/slice'

const useStyles = makeStyles()((theme: Theme) => ({
  bpmProgress: {
    position: 'absolute',
    right: 67
  },
  tagProgress: {
    position: 'absolute',
    right: 20
  },
  success: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700]
    }
  },
  failure: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700]
    }
  },
  actions: {
    marginRight: theme.spacing(3)
  },
  fullWidth: {
    width: '100%'
  },
  noPadding: {
    padding: '0 !important'
  },
  endInput: {
    paddingLeft: theme.spacing(1),
    paddingTop: 0
  },
  percentInput: {
    minWidth: theme.spacing(11)
  }
}))

function AudioOptions() {  
  const dispatch = useAppDispatch()
  const [getAudioBPM] = useLazyGetAudioBPMQuery()
  const audio = useAppSelector(selectAudioOptions())

  const [loadingBPM, setLoadingBPM] = useState(false)
  const [successBPM, setSuccessBPM] = useState(false)
  const [errorBPM, setErrorBPM] = useState(false)
  const [loadingTag, setLoadingTag] = useState(false)
  const [successTag, setSuccessTag] = useState(false)
  const [errorTag, setErrorTag] = useState(false)

  const onCancel = () => {
    dispatch(setAudioOptionsEditing(undefined))
  }

  const onDone = () => {
    dispatch(saveAudioOptions())
  }

  const onReadBPMTag = async () => {
    if (audio?.url != null && !loadingTag) {
      setLoadingTag(true)
      try {
        const {bpm} = await getAudioBPM(audio.id).unwrap()
        if (bpm) {
          dispatch(setAudioOptionsBPM(bpm))
          setLoadingTag(false)
          setSuccessTag(true)
          setTimeout(() => {
            setSuccessTag(false)
          }, 3000)
        } else {
          throw new Error('Failed to read BPM')
        }
      } catch(error) {
        console.error('Error reading BPM', error)
        setLoadingTag(false)
        setErrorTag(true)
        setTimeout(() => {
          setErrorTag(false)
        }, 3000)
      }
    }
  }

  const onDetectBPM = async () => {
    if (audio?.url != null && !loadingBPM) {
      setLoadingBPM(true)
      const context = new AudioContext()
      try {
        const data = await fetch(audio.fileUrl, {credentials: 'include'}).then((res) => res.arrayBuffer())
        const maxByteSize = 200000000
        if (data.byteLength < maxByteSize) {
          const audioBuffer = await context.decodeAudioData(data)
          const tempo = await analyze(audioBuffer)
          dispatch(setAudioOptionsBPM(tempo))
          setLoadingBPM(false)
          setSuccessBPM(true)
          setTimeout(() => {
            setSuccessBPM(false)
          }, 3000)
        } else {
          throw new Error(`'${audio.url}' is too large to decode`)
        }
      } catch (e) {
        console.error(e)
        setLoadingBPM(false)
        setErrorBPM(true)
        setTimeout(() => {
          setErrorBPM(false)
        }, 3000)
      } finally {
        await context.close()
      }
    }
  }

  const { classes } = useStyles()
  return audio != null && (
    <Dialog open={true} onClose={onCancel} aria-describedby="edit-description">
      <DialogContent>
        <Typography variant="h6">Edit song options</Typography>
        <Grid2 container spacing={2} alignItems="center">
          <Grid2 size={12}>
            <BaseTextField
              variant="standard"
              fullWidth
              margin="normal"
              label="URL"
              selector={() => useAppSelector(selectAudioOptionsUrl())}
              action={(url: string) => (dispatch: AppDispatch) => dispatch(setAudioOptionsUrl(url))}
            />
          </Grid2>
          <Grid2 size={12}>
            <AudioControl
              sceneID={0} // TODO make sceneID work for player
              audioID={audio.id}
              audioEnabled={true}
              singleTrack={true}
              lastTrack={true}
              repeat={RP.one}
              scenePaths={[]}
              startPlaying={false}
            />
          </Grid2>
          <Grid2 size={12}>
            <Grid2 container spacing={2} alignItems="center">
              <Grid2>
                <Collapse in={!audio.tick && !audio.nextSceneAtEnd}>
                  <BaseSwitch
                    label="Stop at End"
                    size="small"
                    selector={() => useAppSelector(selectAudioOptionsStopAtEnd())}
                    action={(stopAtEnd: boolean) => (dispatch: AppDispatch) => dispatch(setAudioOptionsStopAtEnd(stopAtEnd))}
                    />
                </Collapse>
                <Collapse in={!audio.tick && !audio.stopAtEnd}>
                  <BaseSwitch
                    label="Next Scene at End"
                    size="small"
                    selector={() => useAppSelector(selectAudioOptionsNextSceneAtEnd())}
                    action={(nextSceneAtEnd: boolean) => (dispatch: AppDispatch) => dispatch(setAudioOptionsNextSceneAtEnd(nextSceneAtEnd))}
                  />
                </Collapse>
                <Collapse in={!audio.stopAtEnd && !audio.nextSceneAtEnd}>
                  <BaseSwitch
                    label="Tick"
                    tooltip="Repeat track at particular interval"
                    size="small"
                    selector={() => useAppSelector(selectAudioOptionsTick())}
                    action={(tick: boolean) => (dispatch: AppDispatch) => dispatch(setAudioOptionsTick(tick))}
                  />
                </Collapse>
              </Grid2>
              <Divider
                component="div"
                orientation="vertical"
                style={{ height: 48 }}
              />
              <Grid2 size="grow">
                <Grid2 container>
                  <Grid2 size={12}>
                    <BaseTextField
                      variant="outlined"
                      label="BPM"
                      margin="dense"
                      selector={() => useAppSelector(selectAudioOptionsBPM())}
                      action={(bpm: number) => (dispatch: AppDispatch) => dispatch(setAudioOptionsBPM(bpm))}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip disableInteractive title="Detect BPM">
                              <IconButton
                                className={cx(
                                  successBPM && classes.success,
                                  errorBPM && classes.failure
                                )}
                                onClick={onDetectBPM}
                                size="large"
                              >
                                {successBPM ? (
                                  <CheckIcon />
                                ) : errorBPM ? (
                                  <ErrorOutlineIcon />
                                ) : (
                                  <SvgIcon viewBox="0 0 24 24" fontSize="small">
                                    <path d="M12,1.75L8.57,2.67L4.07,19.5C4.06,19.5 4,19.84 4,20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20C20,19.84 19.94,19.5 19.93,19.5L15.43,2.67L12,1.75M10.29,4H13.71L17.2,17H13V12H11V17H6.8L10.29,4M11,5V9H10V11H14V9H13V5H11Z" />
                                  </SvgIcon>
                                )}
                              </IconButton>
                            </Tooltip>
                            {loadingBPM && (
                              <CircularProgress
                                size={34}
                                className={classes.bpmProgress}
                              />
                            )}
                            <Tooltip
                              disableInteractive
                              title="Read BPM Metadata"
                            >
                              <IconButton
                                className={cx(
                                  successTag && classes.success,
                                  errorTag && classes.failure
                                )}
                                onClick={onReadBPMTag}
                                size="large"
                              >
                                {successTag ? (
                                  <CheckIcon />
                                ) : errorTag ? (
                                  <ErrorOutlineIcon />
                                ) : (
                                  <AudiotrackIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                            {loadingTag && (
                              <CircularProgress
                                size={34}
                                className={classes.tagProgress}
                              />
                            )}
                          </InputAdornment>
                        )
                      }}
                      inputProps={{
                        min: 0,
                        type: 'number'
                      }}
                    />
                  </Grid2>
                  <Grid2 size={12}>
                    <BaseSlider
                      min={5}
                      max={40}
                      selector={() => useAppSelector(selectAudioOptionsSpeed())}
                      action={(speed: number) => (dispatch: AppDispatch) => dispatch(setAudioOptionsSpeed(speed))}
                      labelledBy="audio-speed-slider"
                      label={{ text: 'Speed', appendValue: true }}
                      format={{ type: 'times', divideBy: 10 }}
                    />
                  </Grid2>
                </Grid2>
              </Grid2>
            </Grid2>
          </Grid2>
          <Grid2 size={12} className={cx(!audio.tick && classes.noPadding)}>
            <Collapse in={audio.tick} className={classes.fullWidth}>
              <TimingCard
                sidebar={false}
                hasBPMSelector={() => useAppSelector(selectAudioOptionsHasBPM())}
                timing={{
                  selector: () => useAppSelector(selectAudioOptionsTickTF()),
                  action: (tickTF: string) => (dispatch: AppDispatch) => dispatch(setAudioOptionsTickTF(tickTF))
                }}
                duration={{
                  selector: () => useAppSelector(selectAudioOptionsTickDuration()),
                  action: (duration: number) => (dispatch: AppDispatch) => dispatch(setAudioOptionsTickDuration(duration))
                }}
                durationMin={{
                  selector: () => useAppSelector(selectAudioOptionsTickDurationMin()),
                  action: (durationMin: number) => (dispatch: AppDispatch) => dispatch(setAudioOptionsTickDurationMin(durationMin))
                }}
                durationMax={{
                  selector: () => useAppSelector(selectAudioOptionsTickDurationMax()),
                  action: (durationMax: number) => (dispatch: AppDispatch) => dispatch(setAudioOptionsTickDurationMax(durationMax))
                }}
                wave={{
                  selector: () => useAppSelector(selectAudioOptionsTickSinRate()),
                  action: (sinRate: number) => (dispatch: AppDispatch) => dispatch(setAudioOptionsTickSinRate(sinRate)),
                  labelledBy: 'tick-sin-rate-slider'
                }}
                bpm={{
                  selector: () => useAppSelector(selectAudioOptionsTickBPMMulti()),
                  action: (bpmMulti: number) => (dispatch: AppDispatch) => dispatch(setAudioOptionsTickBPMMulti(bpmMulti)),
                  labelledBy: 'tick-bpm-multi-slider',
                  min: -8,
                  max: 10,
                  format: 'tick-bpm'
                }}
              />
            </Collapse>
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={onDone} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

;(AudioOptions as any).displayName = 'AudioOptions'
export default AudioOptions

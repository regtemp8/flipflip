import React, { useState } from 'react'
import { cx } from '@emotion/css'
import { analyze } from 'web-audio-beat-detector'
import wretch from 'wretch'

import {
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
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
import {
  setAudioTickTF,
  setAudioTickDuration,
  setAudioTickDurationMin,
  setAudioTickDurationMax,
  setAudioTickSinRate,
  setAudioTickBPMMulti,
  setAudioStopAtEnd,
  setAudioNextSceneAtEnd,
  setAudioTick,
  setAudioSpeed,
  setAudioVolume,
  setAudioUrl,
  setAudioBPM
} from '../../store/audio/actions'
import {
  selectAudio,
  selectAudioHasBPM,
  selectAudioTickTF,
  selectAudioTickDuration,
  selectAudioTickDurationMin,
  selectAudioTickDurationMax,
  selectAudioTickSinRate,
  selectAudioTickBPMMulti,
  selectAudioStopAtEnd,
  selectAudioNextSceneAtEnd,
  selectAudioTick,
  selectAudioSpeed,
  selectAudioUrl,
  selectAudioBPM
} from '../../store/audio/selectors'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import BaseTextField from '../common/text/BaseTextField'
import { setAudio } from '../../store/audio/slice'
import flipflip from '../../FlipFlipService'

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

export interface AudioOptionsProps {
  sceneID?: number
  audioID: number
  onDone: () => void
}

function AudioOptions(props: AudioOptionsProps) {
  const dispatch = useAppDispatch()
  const originalAudio = useAppSelector(selectAudio(props.audioID), () => true)
  const url = useAppSelector(selectAudioUrl(props.audioID))
  const tick = useAppSelector(selectAudioTick(props.audioID))
  const nextSceneAtEnd = useAppSelector(
    selectAudioNextSceneAtEnd(props.audioID)
  )
  const stopAtEnd = useAppSelector(selectAudioStopAtEnd(props.audioID))
  const [loadingBPM, setLoadingBPM] = useState(false)
  const [successBPM, setSuccessBPM] = useState(false)
  const [errorBPM, setErrorBPM] = useState(false)
  const [loadingTag, setLoadingTag] = useState(false)
  const [successTag, setSuccessTag] = useState(false)
  const [errorTag, setErrorTag] = useState(false)

  const onCancel = () => {
    dispatch(setAudio(originalAudio))
    props.onDone()
  }

  const onReadBPMTag = () => {
    if (url && !loadingTag) {
      setLoadingTag(true)
      flipflip()
        .api.parseMusicMetadataBpm(url)
        .then((bpm: number | undefined) => {
          if (bpm) {
            dispatch(setAudioBPM(props.audioID)(bpm))
            setLoadingTag(false)
            setSuccessTag(true)
            setTimeout(() => {
              setSuccessTag(false)
            }, 3000)
          } else {
            setLoadingTag(false)
            setErrorTag(true)
            setTimeout(() => {
              setErrorTag(false)
            }, 3000)
          }
        })
        .catch((err: any) => {
          console.error('Error reading metadata:', err.message)
          setLoadingTag(false)
          setErrorTag(true)
          setTimeout(() => {
            setErrorTag(false)
          }, 3000)
        })
    }
  }

  const onDetectBPM = async () => {
    const bpmError = () => {
      setLoadingBPM(false)
      setErrorBPM(true)
      setTimeout(() => {
        setErrorBPM(false)
      }, 3000)
    }

    const detectBPM = (data: ArrayBuffer) => {
      const maxByteSize = 200000000
      if (data.byteLength < maxByteSize) {
        const context = new AudioContext()
        context.decodeAudioData(
          data,
          (audioBuffer) => {
            analyze(audioBuffer)
              .then((tempo: number) => {
                dispatch(setAudioBPM(props.audioID)(Number(tempo.toFixed(2))))
                setLoadingBPM(false)
                setSuccessBPM(true)
                setTimeout(() => {
                  setSuccessBPM(false)
                }, 3000)
              })
              .catch((err: any) => {
                console.error('Error analyzing')
                console.error(err)
                bpmError()
              })
          },
          (err) => {
            console.error(err)
            bpmError()
          }
        )
      } else {
        console.error("'" + url + "' is too large to decode")
        bpmError()
      }
    }

    if (url && !loadingBPM) {
      setLoadingBPM(true)
      try {
        if (await flipflip().api.pathExists(url)) {
          const arrayBuffer = await flipflip().api.readBinaryFile(url)
          detectBPM(arrayBuffer)
        } else {
          wretch(url)
            .get()
            .arrayBuffer(detectBPM)
            .catch((err) => {
              console.error(err)
              bpmError()
            })
        }
      } catch (e) {
        console.error(e)
        bpmError()
      }
    }
  }

  const { classes } = useStyles()
  return (
    <Dialog open={true} onClose={onCancel} aria-describedby="edit-description">
      <DialogContent>
        <Typography variant="h6">Edit song options</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <BaseTextField
              variant="standard"
              fullWidth
              margin="normal"
              label="URL"
              selector={selectAudioUrl(props.audioID)}
              action={setAudioUrl(props.audioID)}
            />
          </Grid>
          <Grid item xs={12}>
            <AudioControl
              sceneID={props.sceneID}
              audioID={props.audioID}
              audioEnabled={true}
              singleTrack={true}
              lastTrack={true}
              repeat={RP.one}
              scenePaths={[]}
              startPlaying={false}
              audioVolumeAction={setAudioVolume(props.audioID)}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Collapse in={!tick && !nextSceneAtEnd}>
                  <BaseSwitch
                    label="Stop at End"
                    size="small"
                    selector={selectAudioStopAtEnd(props.audioID)}
                    action={setAudioStopAtEnd(props.audioID)}
                  />
                </Collapse>
                <Collapse in={!tick && !stopAtEnd}>
                  <BaseSwitch
                    label="Next Scene at End"
                    size="small"
                    selector={selectAudioNextSceneAtEnd(props.audioID)}
                    action={setAudioNextSceneAtEnd(props.audioID)}
                  />
                </Collapse>
                <Collapse in={!stopAtEnd && !nextSceneAtEnd}>
                  <BaseSwitch
                    label="Tick"
                    tooltip="Repeat track at particular interval"
                    size="small"
                    selector={selectAudioTick(props.audioID)}
                    action={setAudioTick(props.audioID)}
                  />
                </Collapse>
              </Grid>
              <Divider
                component="div"
                orientation="vertical"
                style={{ height: 48 }}
              />
              <Grid item xs>
                <Grid container>
                  <Grid item xs={12}>
                    <BaseTextField
                      variant="outlined"
                      label="BPM"
                      margin="dense"
                      selector={selectAudioBPM(props.audioID)}
                      action={setAudioBPM(props.audioID)}
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
                  </Grid>
                  <Grid item xs={12}>
                    <BaseSlider
                      min={5}
                      max={40}
                      selector={selectAudioSpeed(props.audioID)}
                      action={setAudioSpeed(props.audioID)}
                      labelledBy="audio-speed-slider"
                      label={{ text: 'Speed', appendValue: true }}
                      format={{ type: 'times', divideBy: 10 }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} className={cx(!tick && classes.noPadding)}>
            <Collapse in={tick} className={classes.fullWidth}>
              <TimingCard
                sidebar={false}
                hasBPMSelector={selectAudioHasBPM}
                timing={{
                  selector: selectAudioTickTF(props.audioID),
                  action: setAudioTickTF(props.audioID)
                }}
                duration={{
                  selector: selectAudioTickDuration(props.audioID),
                  action: setAudioTickDuration(props.audioID)
                }}
                durationMin={{
                  selector: selectAudioTickDurationMin(props.audioID),
                  action: setAudioTickDurationMin(props.audioID)
                }}
                durationMax={{
                  selector: selectAudioTickDurationMax(props.audioID),
                  action: setAudioTickDurationMax(props.audioID)
                }}
                wave={{
                  selector: selectAudioTickSinRate(props.audioID),
                  action: setAudioTickSinRate(props.audioID),
                  labelledBy: 'tick-sin-rate-slider'
                }}
                bpm={{
                  selector: selectAudioTickBPMMulti(props.audioID),
                  action: setAudioTickBPMMulti(props.audioID),
                  labelledBy: 'tick-bpm-multi-slider',
                  min: -8,
                  max: 10,
                  format: { type: 'tick-bpm' }
                }}
              />
            </Collapse>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={props.onDone} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

;(AudioOptions as any).displayName = 'AudioOptions'
export default AudioOptions

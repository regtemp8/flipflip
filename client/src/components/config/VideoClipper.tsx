import React, { ChangeEvent, useEffect, useState } from 'react'
import { cx } from '@emotion/css'
import { green, red } from '@mui/material/colors'

import {
  AppBar,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Collapse,
  Container,
  Drawer,
  Fab,
  Grid,
  IconButton,
  Slider,
  SvgIcon,
  TextField,
  type Theme,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import SaveIcon from '@mui/icons-material/Save'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'

import { getTimestamp, getTimestampValue } from '../../data/utils'
import { VCT } from 'flipflip-common'
import { selectClipTagsIncludes } from '../../store/clip/selectors'
import ImageView from '../player/ImageView'
import VideoControl from '../player/VideoControl'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectAppTags,
  selectAppTutorial,
  selectAppIsLibrary
} from '../../store/app/selectors'
import {
  selectLibrarySourceURL,
  selectLibrarySourceSubtitleFile,
  selectLibrarySourceClips,
  selectLibrarySourceClipsIncludes,
  selectLibrarySourceDisabledClipsIncludes
} from '../../store/librarySource/selectors'
import {
  setLibrarySourceToggleDisabledClip,
  setLibrarySourceRemoveClip
} from '../../store/librarySource/slice'
import { setTutorialVCTStart } from '../../store/app/slice'
import { cacheImage, setRouteGoBack } from '../../store/app/thunks'
import {
  selectVideoClipperSceneID,
  selectVideoClipperSceneVideoVolume
} from '../../store/scene/selectors'
import { setVideoClipperSceneVideoVolume } from '../../store/scene/thunks'
import { setClipToggleTag, setClipVolume } from '../../store/clip/slice'
import { selectTagName } from '../../store/tag/selectors'
import { selectVideoClipperState } from '../../store/videoClipper/selectors'
import {
  setVideoClipperResetState,
  setVideoClipperEditingValue,
  setVideoClipperEditingStartText,
  setVideoClipperEditingEndText
} from '../../store/videoClipper/slice'
import {
  navigateClipping,
  onVideoClipperAddClip,
  onVideoClipperEditClip,
  onSaveVideoClip,
  onVideoClipperPrevClip,
  onVideoClipperNextClip,
  onVideoClipperInheritTags
} from '../../store/videoClipper/thunks'
import { setPlayerState } from '../../store/player/slice'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex'
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default
  },
  videoContent: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.common.black
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing(0),
    position: 'relative'
  },
  progress: {
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex'
  },
  appBar: {
    height: theme.spacing(8)
  },
  drawerSpacer: {
    height: theme.spacing(21)
  },
  title: {
    textAlign: 'center',
    flexGrow: 1
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    flexWrap: 'nowrap'
  },
  headerLeft: {
    flexBasis: '3%'
  },
  clipDrawerPaper: {
    backgroundColor: theme.palette.background.default,
    height: theme.spacing(21),
    padding: theme.spacing(1),
    justifyContent: 'flex-end'
  },
  clipTagDrawerPaper: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1),
    justifyContent: 'flex-end'
  },
  tagList: {
    padding: theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  tag: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  tagContent: {
    padding: theme.spacing(1)
  },
  selectedTag: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText
  },
  tagButtons: {
    display: 'flex',
    flexDirection: 'column'
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: '25%'
  },
  emptyMessage2: {
    textAlign: 'center'
  },
  timeSlider: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(2)
  },
  clipField: {
    maxWidth: theme.spacing(8)
  },
  fab: {
    boxShadow: 'none'
  },
  addFab: {
    marginLeft: theme.spacing(1)
  },
  removeFab: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText
  },
  fill: {
    flexGrow: 1
  },
  backdropTop: {
    zIndex: theme.zIndex.modal + 1
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid'
  },
  disable: {
    pointerEvents: 'none'
  },
  enabledClip: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700]
    }
  },
  disabledClip: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700]
    }
  },
  valueLabel: {
    backgroundColor: 'transparent',
    top: 2
  },
  noTransition: {
    transition: 'unset'
  }
}))

interface TagCardProps {
  clipID: number
  tagID: number
}

function TagCard(props: TagCardProps) {
  const dispatch = useAppDispatch()
  const name = useAppSelector(selectTagName(props.tagID))
  const isClipTag = useAppSelector(
    selectClipTagsIncludes(props.clipID, props.tagID)
  )

  const toggleTag = () => {
    dispatch(setClipToggleTag({ id: props.clipID, value: props.tagID }))
  }

  const { classes } = useStyles()
  return (
    <Card
      className={cx(classes.tag, isClipTag && classes.selectedTag)}
      key={props.tagID}
    >
      <CardActionArea onClick={toggleTag}>
        <CardContent className={classes.tagContent}>
          <Typography component="h6" variant="body2">
            {name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

function VideoClipper() {
  const [video, setVideo] = useState<HTMLVideoElement>()
  const [empty, setEmpty] = useState(false)
  const [isTagging, setIsTagging] = useState(false)

  const dispatch = useAppDispatch()
  const {
    sourceID,
    editingClipID,
    editingValue,
    editingStartText,
    editingEndText
  } = useAppSelector(selectVideoClipperState())
  const tutorial = useAppSelector(selectAppTutorial())
  const sceneID = useAppSelector(selectVideoClipperSceneID())
  const videoVolume = useAppSelector(selectVideoClipperSceneVideoVolume())
  const sourceURL = useAppSelector(selectLibrarySourceURL(sourceID))
  const clips = useAppSelector(selectLibrarySourceClips(sourceID))
  const subtitleFile = useAppSelector(selectLibrarySourceSubtitleFile(sourceID))
  const isSourceClip = useAppSelector(
    selectLibrarySourceClipsIncludes(sourceID, editingClipID)
  )
  const isSourceDisabledClip = useAppSelector(
    selectLibrarySourceDisabledClipsIncludes(sourceID, editingClipID)
  )

  const tags = useAppSelector(selectAppTags())
  const isLibrary = useAppSelector(selectAppIsLibrary())

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('wheel', onScroll, false)
    initVideo()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', onScroll)
    }
  }, [])

  useEffect(() => {
    setVideo(undefined)
    setEmpty(false)
    initVideo()
  }, [sourceID])

  const initVideo = () => {
    const video = document.createElement('video')

    video.onerror = () => {
      console.error('Error loading ' + sourceURL)
      setEmpty(true)
    }

    video.onloadeddata = () => {
      dispatch(cacheImage(video))
      setVideo(video)
      dispatch(setTutorialVCTStart())
    }

    video.src = sourceURL as string
    video.preload = 'auto'
    video.loop = true
    if (subtitleFile != null && subtitleFile.length > 0) {
      video.setAttribute('subtitles', subtitleFile)
    }
    video.load()
  }

  const onAdd = () => {
    const duration = video?.duration as number
    dispatch(onVideoClipperAddClip(duration))
  }

  const onEdit = (clipID: number) => {
    dispatch(onVideoClipperEditClip(clipID))
  }

  const onCancel = () => {
    closeEdit()
  }

  const onSave = () => {
    dispatch(onSaveVideoClip())
    closeEdit()
  }

  const onToggleClip = () => {
    const value = editingClipID as number
    dispatch(setLibrarySourceToggleDisabledClip({ id: sourceID, value }))
  }

  const onTag = () => {
    dispatch(
      setPlayerState({
        uuid: 'video-clipper',
        value: {
          sceneID,
          nextSceneID: -1,
          overlays: [],
          firstImageLoaded: true,
          mainLoaded: true,
          isEmpty: false,
          hasStarted: true
        }
      })
    )
    setIsTagging(!isTagging)
  }

  const onClearVolume = () => {
    const id = editingClipID as number
    dispatch(setClipVolume({ id, value: undefined }))
  }

  const onSetVolume = () => {
    const id = editingClipID as number
    dispatch(setClipVolume({ id, value: videoVolume }))
  }

  const onInherit = () => {
    dispatch(onVideoClipperInheritTags())
  }

  const onRemove = () => {
    if (isSourceClip) {
      const value = editingClipID as number
      dispatch(setLibrarySourceRemoveClip({ id: sourceID, value }))
    }
    closeEdit()
  }

  const closeEdit = () => {
    dispatch(setVideoClipperResetState())
  }

  const onChangeVolume = (volume: number) => {
    dispatch(setVideoClipperSceneVideoVolume(volume))
  }

  const onChangePosition = (
    values: number[],
    forceStart = false,
    forceEnd = false
  ) => {
    const videoEl = video as HTMLVideoElement
    let min = values[0]
    let max = values[1]
    if (min < 0) min = 0
    if (max < 0) max = 0
    if (min > videoEl.duration) min = videoEl.duration
    if (max > videoEl.duration) max = videoEl.duration

    if (videoEl.paused) {
      if (forceStart || values[0] !== editingValue[0]) {
        videoEl.currentTime = min
      } else if (forceEnd || values[1] !== editingValue[1]) {
        videoEl.currentTime = max
      }
    } else {
      if (videoEl.currentTime < min) {
        videoEl.currentTime = min
      } else if (videoEl.currentTime > max) {
        videoEl.currentTime = max
      }
    }

    dispatch(setVideoClipperEditingValue({ start: min, end: max }))
  }

  const onChangeStartText = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    dispatch(setVideoClipperEditingStartText(value))
    const timestampValue = getTimestampValue(value)
    onChangeStartTextValue(timestampValue)
  }

  const onChangeStartTextValue = (timestampValue: number, force = false) => {
    if (timestampValue != null) {
      onChangePosition([timestampValue, editingValue[1]], force, false)
    }
  }

  const onClickStartText = () => {
    const time = video?.currentTime as number
    dispatch(setVideoClipperEditingStartText(getTimestamp(time)))
    onChangePosition([time, editingValue[1]])
  }

  const onChangeEndText = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    dispatch(setVideoClipperEditingEndText(value))
    const timestampValue = getTimestampValue(value)
    onChangeStartTextValue(timestampValue)
  }

  const onChangeEndTextValue = (timestampValue: number, force = false) => {
    if (timestampValue != null) {
      onChangePosition([editingValue[0], timestampValue], false, force)
    }
  }

  const onClickEndText = () => {
    const time = video?.currentTime as number
    dispatch(setVideoClipperEditingEndText(getTimestamp(time)))
    onChangePosition([editingValue[0], time])
  }

  const onScroll = (e: WheelEvent) => {
    const volumeChange = (e.deltaY / 100) * -5
    let newVolume = videoVolume + volumeChange
    if (newVolume < 0) {
      newVolume = 0
    } else if (newVolume > 100) {
      newVolume = 100
    }
    onChangeVolume(newVolume)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const focus = document.activeElement?.tagName.toLocaleLowerCase()
    const start = document.activeElement?.id === 'start'
    const end = document.activeElement?.id === 'end'
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        if (isTagging) {
          onTag()
        } else if (editingClipID) {
          if (isSourceClip) {
            onSave()
          } else {
            closeEdit()
          }
        } else {
          dispatch(setRouteGoBack())
        }
        break
      case '[':
        e.preventDefault()
        if (editingClipID) {
          prevClip()
        } else {
          prevSource()
        }
        break
      case ']':
        e.preventDefault()
        if (editingClipID) {
          nextClip()
        } else {
          nextSource()
        }
        break
      case 'ArrowDown':
        if (focus === 'input') {
          e.preventDefault()
          if (start) {
            const timestampValue = getTimestampValue(editingStartText)
            const startValue = timestampValue - 1 >= 0 ? timestampValue - 1 : 0
            onChangeStartTextValue(startValue, true)
          } else if (end) {
            const timestampValue = getTimestampValue(editingEndText)
            const endValue = timestampValue - 1 >= 0 ? timestampValue - 1 : 0
            onChangeEndTextValue(endValue, true)
          }
        }
        break
      case 'ArrowUp':
        if (focus === 'input') {
          e.preventDefault()
          const videoEl = video as HTMLVideoElement
          if (start) {
            const timestampValue = getTimestampValue(editingStartText)
            const startValue =
              timestampValue + 1 <= videoEl.duration
                ? timestampValue + 1
                : Math.floor(videoEl.duration)
            onChangeStartTextValue(startValue, true)
          } else if (end) {
            const timestampValue = getTimestampValue(editingEndText)
            const endValue =
              timestampValue + 1 <= videoEl.duration
                ? timestampValue + 1
                : Math.floor(videoEl.duration)
            onChangeEndTextValue(endValue, true)
          }
        }
        break
    }
  }

  const prevClip = () => {
    dispatch(onVideoClipperPrevClip())
  }

  const nextClip = () => {
    dispatch(onVideoClipperNextClip())
  }

  const prevSource = () => {
    dispatch(navigateClipping(-1))
  }

  const nextSource = () => {
    dispatch(navigateClipping(1))
  }

  const { classes } = useStyles()
  if (video) {
    video.volume = videoVolume / 100
  }

  return (
    <div className={cx(classes.root, 'VideoClipper')}>
      <AppBar enableColorOnDark className={classes.appBar}>
        <Toolbar className={classes.headerBar}>
          <div className={classes.headerLeft}>
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
          </div>

          <Typography
            component="h1"
            variant="h4"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {sourceURL}
          </Typography>

          <div className={classes.headerLeft} />
        </Toolbar>
      </AppBar>

      {!video && !empty && (
        <main className={classes.content}>
          <div className={classes.appBar} />
          <Container
            maxWidth={false}
            className={cx(classes.container, classes.progress)}
          >
            <CircularProgress size={200} />
          </Container>
        </main>
      )}

      {!video && empty && (
        <main className={classes.content}>
          <div className={classes.appBar} />
          <Container maxWidth={false} className={classes.container}>
            <Typography
              component="h1"
              variant="h3"
              color="inherit"
              noWrap
              className={classes.emptyMessage}
            >
              (ಥ﹏ಥ)
            </Typography>
            <Typography
              component="h1"
              variant="h4"
              color="inherit"
              noWrap
              className={classes.emptyMessage2}
            >
              I couldn't find anything
            </Typography>
          </Container>
        </main>
      )}

      {video && (
        <React.Fragment>
          <main className={classes.videoContent}>
            <div className={classes.appBar} />
            <Container maxWidth={false} className={classes.container}>
              {isTagging && (
                <ImageView uuid="video-clipper" image={video} fitParent />
              )}
              {!isTagging && (
                <ImageView uuid="video-clipper" image={video} fitParent />
              )}
            </Container>
            {!isTagging && <div className={classes.drawerSpacer} />}
            {isTagging && (
              <Grid
                container
                alignItems="center"
                className={classes.clipTagDrawerPaper}
              >
                <Grid item xs>
                  <div className={classes.tagList}>
                    {tags.map((tagID) => (
                      <TagCard clipID={editingClipID as number} tagID={tagID} />
                    ))}
                  </div>
                </Grid>
                <Grid item className={classes.tagButtons}>
                  <Tooltip disableInteractive title="Inherit Source Tags">
                    <Fab color="primary" size="small" onClick={onInherit}>
                      <SystemUpdateAltIcon />
                    </Fab>
                  </Tooltip>
                  <Tooltip
                    disableInteractive
                    title="End Tagging"
                    placement="top"
                  >
                    <IconButton onClick={onTag} size="large">
                      <KeyboardReturnIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid
                  item
                  xs={12}
                  className={cx(tutorial === VCT.controls && classes.highlight)}
                >
                  <VideoControl
                    video={video}
                    volume={videoVolume}
                    clipID={!editingClipID ? null : editingClipID}
                    clipValue={!editingClipID ? null : editingValue}
                    useHotkeys
                    onChangeVolume={onChangeVolume}
                  />
                </Grid>
              </Grid>
            )}
          </main>

          {!isTagging && (
            <Drawer
              variant="permanent"
              anchor="bottom"
              className={cx(
                (tutorial === VCT.controls ||
                  tutorial === VCT.clips ||
                  tutorial === VCT.clip) &&
                  classes.backdropTop
              )}
              classes={{ paper: classes.clipDrawerPaper }}
              open
            >
              <Grid container alignItems="center">
                <Grid item xs={12}>
                  <Collapse in={!editingClipID}>
                    <Grid
                      container
                      spacing={1}
                      alignItems="center"
                      className={cx(
                        tutorial === VCT.controls && classes.disable,
                        tutorial === VCT.clips && classes.highlight
                      )}
                    >
                      <Grid key={-1} item>
                        <Tooltip
                          disableInteractive
                          title="New Clip"
                          placement="top"
                        >
                          <Fab
                            color="primary"
                            size="small"
                            className={cx(
                              classes.fab,
                              classes.addFab,
                              tutorial === VCT.clips && classes.highlight
                            )}
                            onClick={onAdd}
                          >
                            <AddIcon />
                          </Fab>
                        </Tooltip>
                      </Grid>
                      {clips.map((clipID, index) => (
                        <Grid key={clipID} item>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            className={cx(
                              tutorial === VCT.clips && classes.disable
                            )}
                            onClick={() => onEdit(clipID)}
                          >
                            {index + 1}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Collapse>
                  <Collapse in={!!editingClipID}>
                    <Grid
                      container
                      spacing={1}
                      alignItems="center"
                      className={cx(tutorial === VCT.clip && classes.highlight)}
                    >
                      {!isLibrary && editingClipID && isSourceClip && (
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={
                              isSourceDisabledClip ? 'Disabled' : 'Enabled'
                            }
                            placement="top"
                          >
                            <Fab
                              size="small"
                              className={cx(
                                classes.fab,
                                !isSourceDisabledClip && classes.enabledClip,
                                isSourceDisabledClip && classes.disabledClip
                              )}
                              onClick={onToggleClip}
                            >
                              {isSourceDisabledClip ? (
                                <CloseIcon />
                              ) : (
                                <CheckIcon />
                              )}
                            </Fab>
                          </Tooltip>
                        </Grid>
                      )}
                      <Grid item xs className={classes.timeSlider}>
                        <Slider
                          min={0}
                          max={video.duration}
                          value={editingValue}
                          classes={{
                            valueLabel: classes.valueLabel,
                            thumb: classes.noTransition,
                            track: classes.noTransition
                          }}
                          valueLabelDisplay="on"
                          valueLabelFormat={(value) => getTimestamp(value)}
                          marks={[
                            { value: 0, label: getTimestamp(0) },
                            {
                              value: video.duration,
                              label: getTimestamp(video.duration)
                            }
                          ]}
                          onChange={(event, value) => {
                            const values = !Array.isArray(value)
                              ? [value]
                              : value
                            onChangePosition(values)
                          }}
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          variant="standard"
                          id="start"
                          className={classes.clipField}
                          label="Start"
                          value={editingStartText}
                          onDoubleClick={onClickStartText}
                          onChange={onChangeStartText}
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          variant="standard"
                          id="end"
                          className={classes.clipField}
                          label="End"
                          value={editingEndText}
                          onDoubleClick={onClickEndText}
                          onChange={onChangeEndText}
                        />
                      </Grid>
                      <Grid item>
                        <Tooltip
                          disableInteractive
                          title="Save"
                          placement="top"
                        >
                          <Fab
                            color="primary"
                            size="small"
                            className={cx(
                              classes.fab,
                              tutorial === VCT.clip && classes.highlight
                            )}
                            onClick={onSave}
                          >
                            <SaveIcon />
                          </Fab>
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Tooltip
                          disableInteractive
                          title="Tag Clip"
                          placement="top"
                        >
                          <Fab
                            color="secondary"
                            size="small"
                            className={cx(
                              classes.fab,
                              tutorial === VCT.clip && classes.disable
                            )}
                            onClick={onTag}
                          >
                            <LocalOfferIcon />
                          </Fab>
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Tooltip
                          disableInteractive
                          title="Set Volume"
                          placement="top"
                        >
                          <Fab
                            color="secondary"
                            size="small"
                            className={cx(
                              classes.fab,
                              tutorial === VCT.clip && classes.disable
                            )}
                            onClick={onSetVolume}
                            onContextMenu={onClearVolume}
                          >
                            <SvgIcon viewBox="0 0 24 24">
                              <path d="M3 9V15H7L12 20V4L7 9H3M16 15H14V9H16V15M20 19H18V5H20V19Z" />
                            </SvgIcon>
                          </Fab>
                        </Tooltip>
                      </Grid>
                      {isSourceClip && (
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title="Delete Clip"
                            placement="top"
                          >
                            <Fab
                              size="small"
                              className={cx(
                                classes.fab,
                                classes.removeFab,
                                tutorial === VCT.clip && classes.disable
                              )}
                              onClick={onRemove}
                            >
                              <DeleteIcon color="inherit" />
                            </Fab>
                          </Tooltip>
                        </Grid>
                      )}
                      <Grid item>
                        <Tooltip
                          disableInteractive
                          title="Cancel"
                          placement="top"
                        >
                          <IconButton
                            className={cx(
                              tutorial === VCT.clip && classes.disable
                            )}
                            onClick={onCancel}
                            size="large"
                          >
                            <KeyboardReturnIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Collapse>
                </Grid>
                <Grid
                  item
                  xs={12}
                  className={cx(tutorial === VCT.controls && classes.highlight)}
                >
                  <VideoControl
                    video={video}
                    volume={videoVolume}
                    clipID={!editingClipID ? null : editingClipID}
                    clipValue={!editingClipID ? null : editingValue}
                    clips={clips}
                    useHotkeys
                    onChangeVolume={onChangeVolume}
                  />
                </Grid>
              </Grid>
            </Drawer>
          )}
        </React.Fragment>
      )}
    </div>
  )
}

;(VideoClipper as any).displayName = 'VideoClipper'
export default VideoClipper

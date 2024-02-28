import React, { useEffect, useState, useRef, useCallback } from 'react'
import { cx } from '@emotion/css'

import {
  AppBar,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  IconButton,
  Link,
  type Theme,
  Toolbar,
  Tooltip,
  Typography,
  Fab
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ForwardIcon from '@mui/icons-material/Forward'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'

import { getSourceType, urlToPath, PT, ST } from 'flipflip-common'
import { selectTagName } from '../../store/tag/selectors'
import type ChildCallbackHack from './ChildCallbackHack'
import SceneOptionCard from '../configGroups/SceneOptionCard'
import ImageVideoCard from '../configGroups/ImageVideoCard'
import ZoomMoveCard from '../configGroups/ZoomMoveCard'
import CrossFadeCard from '../configGroups/CrossFadeCard'
import SlideCard from '../configGroups/SlideCard'
import StrobeCard from '../configGroups/StrobeCard'
import AudioCard from '../configGroups/AudioCard'
import TextCard from '../configGroups/TextCard'
import VideoCard from '../configGroups/VideoCard'
import VideoControl from './VideoControl'
import FadeIOCard from '../configGroups/FadeIOCard'
import PanningCard from '../configGroups/PanningCard'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectConstants } from '../../store/constants/selectors'
import {
  selectAppConfigCachingEnabled,
  selectAppConfigDisplaySettingsFullScreen,
  selectAppConfigDisplaySettingsClickToProgress,
  selectAppConfigDisplaySettingsClickToProgressWhilePlaying,
  selectAppConfigGeneralSettingsConfirmBlacklist,
  selectAppConfigGeneralSettingsConfirmFileDeletion,
  selectAppTutorial,
  selectAppPlayerTags,
  selectAppPlayerTagsIncludes,
  selectPlayerAllTags,
  selectAppPlayerCanInheritClipTags
} from '../../store/app/selectors'
import {
  selectSceneIsAudioScene,
  selectSceneVideoVolume,
  selectSceneIsGridScene,
  selectSceneIsDownloadScene,
  selectSceneIsScriptScene,
  selectSceneNextSceneID,
  selectSceneSources,
  selectSceneVideoSkip,
  selectSceneLibraryID,
  selectSceneAudioEnabled
} from '../../store/scene/selectors'
import {
  clipVideo,
  blacklistFile,
  playSceneFromLibrary,
  playerToggleTag
} from '../../store/app/thunks'
import { setSceneVideoVolume } from '../../store/scene/slice'
import { inheritTagsFromClips } from '../../store/librarySource/thunks'
import flipflip from '../../FlipFlipService'
import { setFullScreen, toggleFullScreen } from '../../data/actions'

const drawerWidth = 340

const hexToRGB = (h: string) => {
  let r = '0'
  let g = '0'
  let b = '0'

  // 3 digits
  if (h.length === 4) {
    r = '0x' + h[1] + h[1]
    g = '0x' + h[2] + h[2]
    b = '0x' + h[3] + h[3]

    // 6 digits
  } else if (h.length === 7) {
    r = '0x' + h[1] + h[2]
    g = '0x' + h[3] + h[4]
    b = '0x' + h[5] + h[6]
  }

  return 'rgb(' + +r + ',' + +g + ',' + +b + ', 0.6)'
}

const useStyles = makeStyles()((theme: Theme) => ({
  hoverBar: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'absolute',
    opacity: 0,
    height: theme.spacing(5),
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    minHeight: 64
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    height: theme.spacing(8),
    marginTop: theme.spacing(-8.5),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarHover: {
    marginTop: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
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
    flexBasis: '20%'
  },
  headerRight: {
    flexBasis: '20%',
    justifyContent: 'flex-end',
    display: 'flex'
  },
  drawerToolbar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    padding: '0 8px',
    minHeight: 64
  },
  drawer: {
    zIndex: theme.zIndex.drawer,
    width: drawerWidth,
    marginLeft: -drawerWidth - 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  drawerHover: {
    marginLeft: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  hoverDrawer: {
    zIndex: theme.zIndex.drawer,
    position: 'absolute',
    opacity: 0,
    width: theme.spacing(5),
    height: '100%'
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    height: '100vh',
    width: 0,
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperHover: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  tagDrawer: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'absolute'
  },
  tagDrawerPaper: {
    overflow: 'hidden',
    transform: 'scale(0)',
    transformOrigin: 'bottom left',
    backgroundColor: hexToRGB(theme.palette.background.default),
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  tagDrawerPaperHover: {
    transform: 'scale(1)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  hoverTagDrawer: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'absolute',
    bottom: 0,
    opacity: 0,
    width: '100%',
    height: theme.spacing(5)
  },
  tagList: {
    padding: theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%'
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
  wordWrap: {
    wordWrap: 'break-word'
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
  }
}))

interface TagCardProps {
  tagID: number
  libraryID: number
  sceneID: number
}

function TagCard(props: TagCardProps) {
  const dispatch = useAppDispatch()
  const name = useAppSelector(selectTagName(props.tagID))
  const isPlayerTag = useAppSelector(
    selectAppPlayerTagsIncludes(props.sceneID, props.tagID)
  )

  const onClickTag = () => {
    dispatch(playerToggleTag(props.sceneID, props.libraryID, props.tagID))
  }

  const { classes } = useStyles()
  return (
    <Card
      className={cx(classes.tag, isPlayerTag && classes.selectedTag)}
      key={props.tagID}
    >
      <CardActionArea
        onClick={() => {
          onClickTag()
        }}
      >
        <CardContent className={classes.tagContent}>
          <Typography component="h6" variant="body2">
            {name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export interface PlayerBarsProps {
  hasStarted: boolean
  historyPaths: any[]
  historyOffset: number
  imagePlayerAdvanceHacks: ChildCallbackHack[][]
  imagePlayerDeleteHack: ChildCallbackHack
  isEmpty: boolean
  isPlaying: boolean
  mainVideo: HTMLVideoElement
  overlayVideos: HTMLVideoElement[][]
  persistAudio: boolean
  persistText: boolean
  recentPictureGrid: boolean
  sceneID: number
  title: string
  goBack: () => void
  historyBack: () => void
  historyForward: () => void
  navigateTagging: (offset: number) => void
  onRecentPictureGrid: () => void
  play: () => void
  pause: () => void
  setCurrentAudio: (audioID: number) => void
  onPlaying?: (position: number, duration: number) => void
}

function PlayerBars(props: PlayerBarsProps) {
  const dispatch = useAppDispatch()
  const { isWin32 } = useAppSelector(selectConstants())
  const allTags = useAppSelector(selectPlayerAllTags())
  const tags = useAppSelector(selectAppPlayerTags(props.sceneID))
  const cachingEnabled = useAppSelector(selectAppConfigCachingEnabled())
  const fullScreen = useAppSelector(selectAppConfigDisplaySettingsFullScreen())
  const clickToProgress = useAppSelector(
    selectAppConfigDisplaySettingsClickToProgress()
  )
  const clickToProgressWhilePlaying = useAppSelector(
    selectAppConfigDisplaySettingsClickToProgressWhilePlaying()
  )
  const confirmBlacklist = useAppSelector(
    selectAppConfigGeneralSettingsConfirmBlacklist()
  )
  const confirmFileDeletion = useAppSelector(
    selectAppConfigGeneralSettingsConfirmFileDeletion()
  )
  const tutorial = useAppSelector(selectAppTutorial())
  const isAudioScene = useAppSelector(selectSceneIsAudioScene(props.sceneID))
  const isGridScene = useAppSelector(selectSceneIsGridScene(props.sceneID))
  const isDownloadScene = useAppSelector(
    selectSceneIsDownloadScene(props.sceneID)
  )
  const isScriptScene = useAppSelector(selectSceneIsScriptScene(props.sceneID))
  const videoVolume = useAppSelector(selectSceneVideoVolume(props.sceneID))
  const nextSceneID = useAppSelector(selectSceneNextSceneID(props.sceneID))
  const sources = useAppSelector(selectSceneSources(props.sceneID))
  const videoSkip = useAppSelector(selectSceneVideoSkip(props.sceneID))
  const libraryID = useAppSelector(selectSceneLibraryID(props.sceneID))
  const audioEnabled = useAppSelector(selectSceneAudioEnabled(props.sceneID))
  const canInheritClipTags = useAppSelector(
    selectAppPlayerCanInheritClipTags(props.sceneID)
  )

  const [appBarHover, setAppBarHover] = useState(false)
  const [drawerHover, setDrawerHover] = useState(false)
  const [tagDrawerHover, setTagDrawerHover] = useState(false)
  const [sourceToBlacklist, setSourceToBlacklist] = useState<string>()
  const [fileToBlacklist, setFileToBlacklist] = useState<string>()
  const [deletePath, setDeletePath] = useState<string>()
  const [deleteError, setDeleteError] = useState<string>()

  const _interval = useRef<number>()
  const _appBarTimeout = useRef<any>()
  const _drawerTimeout = useRef<any>()
  const _tagDrawerTimeout = useRef<any>()
  const _showVideoControls = useRef(false)

  const {
    historyPaths,
    historyOffset,
    imagePlayerDeleteHack,
    imagePlayerAdvanceHacks,
    historyBack,
    historyForward,
    goBack,
    play,
    pause,
    isPlaying,
    navigateTagging,
    hasStarted,
    mainVideo,
    onRecentPictureGrid,
    recentPictureGrid,
    sceneID
  } = props

  const canChangeSource = useCallback(() => {
    return (
      !isDownloadScene && !isAudioScene && !isScriptScene && allTags != null
    )
  }, [allTags, isAudioScene, isDownloadScene, isScriptScene])

  const copyImageToClipboard = useCallback(
    (sourceURL: string) => {
      let url = sourceURL
      if (!url) {
        url = historyPaths[historyPaths.length - 1 + historyOffset].src
      }
      const isFile = url.startsWith('file://')
      const path = urlToPath(url, isWin32)
      const imagePath = isFile ? path : url
      if (
        imagePath.toLocaleLowerCase().endsWith('.png') ||
        imagePath.toLocaleLowerCase().endsWith('.jpg') ||
        imagePath.toLocaleLowerCase().endsWith('.jpeg')
      ) {
        flipflip().clipboard.copyImageToClipboard(imagePath)
      } else {
        flipflip().clipboard.copyTextToClipboard(imagePath)
      }
    },
    [isWin32, historyOffset, historyPaths]
  )

  const doDelete = useCallback(
    async (path: string) => {
      const errorMessage = await flipflip().api.deletePath(path)
      if (errorMessage != null) {
        setDeletePath(undefined)
        setDeleteError(
          'An error occurred while deleting the file: ' + errorMessage
        )
        console.error(errorMessage)
      } else {
        imagePlayerDeleteHack.fire()
        onCloseDialog()
      }
    },
    [imagePlayerDeleteHack]
  )

  const historyGoBack = useCallback(() => {
    if (
      !drawerHover ||
      document.activeElement!.tagName.toLocaleLowerCase() !== 'input'
    ) {
      if (historyOffset > -(historyPaths.length - 1)) {
        historyBack()
      }
    }
  }, [drawerHover, historyOffset, historyPaths, historyBack])

  const historyGoForward = useCallback(() => {
    if (
      !drawerHover ||
      document.activeElement!.tagName.toLocaleLowerCase() !== 'input'
    ) {
      if (historyOffset >= 0) {
        imagePlayerAdvanceHacks[0][0].fire()
      } else {
        historyForward()
      }
    }
  }, [drawerHover, historyOffset, imagePlayerAdvanceHacks, historyForward])

  const prevSource = useCallback(() => {
    navigateTagging(-1)
  }, [navigateTagging])

  const nextSource = useCallback(() => {
    navigateTagging(1)
  }, [navigateTagging])

  const navigateBack = useCallback(async () => {
    setFullScreen(false)
    goBack()
  }, [goBack])

  const onDeletePath = useCallback(
    async (path: string) => {
      const exists = await flipflip().api.pathExists(path)
      if (exists) {
        if (confirmFileDeletion) {
          setDeletePath(path)
        } else {
          doDelete(path)
        }
      } else {
        setDeletePath(undefined)
        setDeleteError("This file doesn't exist, cannot delete")
      }
    },
    [confirmFileDeletion, doDelete]
  )

  const onDelete = useCallback(() => {
    if (
      !drawerHover ||
      document.activeElement!.tagName.toLocaleLowerCase() !== 'input'
    ) {
      const img = historyPaths[historyPaths.length - 1 + historyOffset]
      const url = img.src
      const isFile = url.startsWith('file://')
      const path = urlToPath(url, isWin32)
      if (isFile) {
        onDeletePath(path)
      }
    }
  }, [drawerHover, isWin32, onDeletePath, historyOffset, historyPaths])

  const onBlacklistFile = useCallback(
    (source: string, fileToBlacklist: string) => {
      if (confirmBlacklist) {
        setSourceToBlacklist(source)
        setFileToBlacklist(fileToBlacklist)
      } else {
        dispatch(blacklistFile(source, fileToBlacklist))
      }
    },
    [confirmBlacklist, dispatch]
  )

  const onBlacklist = useCallback(() => {
    const img = historyPaths[historyPaths.length - 1 + historyOffset]
    if (img == null) return
    const source = img.getAttribute('source')
    const url = img.src
    const isFile = url.startsWith('file://')
    const path = urlToPath(url, isWin32)
    const type = getSourceType(source)
    if (
      (!isFile && type !== ST.video && type !== ST.playlist) ||
      type === ST.local
    ) {
      onBlacklistFile(source, isFile ? path : url)
    }
  }, [isWin32, onBlacklistFile, historyOffset, historyPaths])

  const setPlayPause = useCallback(
    (doPlay: boolean) => {
      if (doPlay) {
        play()
      } else {
        pause()
      }
    },
    [play, pause]
  )

  const playPause = useCallback(() => {
    if (
      !drawerHover ||
      document.activeElement!.tagName.toLocaleLowerCase() !== 'input'
    ) {
      setPlayPause(!isPlaying)
    }
  }, [drawerHover, isPlaying, setPlayPause])

  useEffect(() => {
    const abortController = new AbortController()
    flipflip().events.onPlayerPlayPause(playPause, abortController)
    flipflip().events.onPlayerHistoryBack(historyGoBack, abortController)
    flipflip().events.onPlayerHistoryForward(historyGoForward, abortController)
    flipflip().events.onPlayerNavigateBack(navigateBack, abortController)
    flipflip().events.onPlayerDelete(doDelete, abortController)
    flipflip().events.onPlayerPrevSource(prevSource, abortController)
    flipflip().events.onPlayerNextSource(nextSource, abortController)
    flipflip().events.onBlackListFile(async (source: string, file: string) => {
      await dispatch(blacklistFile(source, file))
    }, abortController)
    flipflip().events.onGotoTagSource(async (sourceURL: string) => {
      await dispatch(playSceneFromLibrary(sourceURL, []))
    }, abortController)
    flipflip().events.onGotoClipSource((sourceURL: string) => {
      dispatch(clipVideo(sourceURL, []))
    }, abortController)
    flipflip().events.onRecentPictureGrid(onRecentPictureGrid, abortController)

    const onClick = (e: MouseEvent) => {
      if (
        isAudioScene ||
        recentPictureGrid ||
        drawerHover ||
        tagDrawerHover ||
        appBarHover
      ) {
        return
      }
      if ((!isPlaying || clickToProgressWhilePlaying) && hasStarted) {
        imagePlayerAdvanceHacks[0][0].fire()
        // TODO Improve this to be able to advance specific grids
        /* for (let x of props.imagePlayerAdvanceHacks) {
          for (let y of x) {
            y.fire();
          }
        } */
      }
    }

    const onScroll = (e: WheelEvent) => {
      if (recentPictureGrid || drawerHover) return
      const volumeChange = (e.deltaY / 100) * -5
      let newVolume = parseInt(videoVolume as any) + volumeChange
      if (newVolume < 0) {
        newVolume = 0
      } else if (newVolume > 100) {
        newVolume = 100
      }
      if (mainVideo) {
        mainVideo.volume = newVolume / 100
      }

      dispatch(setSceneVideoVolume({ id: sceneID, value: newVolume }))
    }
    const showContextMenu = async (e: MouseEvent) => {
      if (tutorial != null) return
      // const img = props.recentPictureGrid
      //   ? e.target
      //   : props.historyPaths[props.historyPaths.length - 1 + props.historyOffset]
      // const url = img.src
      // let source = img.getAttribute('source')
      // const post = img.hasAttribute('post') ? img.getAttribute('post') : null
      // const literalSource = source
      // if (/^https?:\/\//g.exec(source) == null) {
      //   const fileUrl = await flipflip().api.getFileUrl(source)
      //   source = urlToPath(fileUrl, isWin32)
      // }
      // const isFile = url.startsWith('file://')
      // const path = urlToPath(url, isWin32)
      // const type = getSourceType(source)

      // TODO show context menu
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const focus = document.activeElement!.tagName.toLocaleLowerCase()
      switch (e.key) {
        case ' ':
          if ((!drawerHover || focus !== 'input') && !e.shiftKey) {
            e.preventDefault()
            playPause()
          }
          break
        case 'ArrowLeft':
          if ((!drawerHover || focus !== 'input') && !e.shiftKey) {
            e.preventDefault()
            historyGoBack()
          }
          break
        case 'ArrowRight':
          if ((!drawerHover || focus !== 'input') && !e.shiftKey) {
            e.preventDefault()
            historyGoForward()
          }
          break
        case 'Escape':
          e.preventDefault()
          navigateBack()
          break
        case 'c':
          if (e.ctrlKey) {
            e.preventDefault()
            copyImageToClipboard('')
          }
          break
        case 'f':
          if (e.ctrlKey) {
            e.preventDefault()
            toggleFullScreen()
          }
          break
        case 'b':
          if (e.ctrlKey) {
            e.preventDefault()
            onBlacklist()
          }
          break
        case 'Delete':
          if (!drawerHover || focus !== 'input') {
            if (cachingEnabled) {
              e.preventDefault()
              onDelete()
            }
          }
          break
        case '[':
          if (canChangeSource()) {
            e.preventDefault()
            prevSource()
          }
          break
        case ']':
          if (canChangeSource()) {
            e.preventDefault()
            nextSource()
          }
          break
      }
    }

    window.addEventListener('contextmenu', showContextMenu, false)
    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('wheel', onScroll, false)
    if (clickToProgress) {
      window.addEventListener('click', onClick, false)
    }

    return () => {
      clearInterval(_interval.current)
      _interval.current = undefined
      clearTimeout(_appBarTimeout.current)
      clearTimeout(_drawerTimeout.current)
      clearTimeout(_tagDrawerTimeout.current)
      _appBarTimeout.current = null
      _drawerTimeout.current = null
      _tagDrawerTimeout.current = null

      abortController.abort()

      window.removeEventListener('contextmenu', showContextMenu)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', onScroll)
      if (clickToProgress) {
        window.removeEventListener('click', onClick)
      }
    }
  }, [
    appBarHover,
    cachingEnabled,
    canChangeSource,
    clickToProgress,
    clickToProgressWhilePlaying,
    copyImageToClipboard,
    dispatch,
    doDelete,
    drawerHover,
    fullScreen,
    historyGoBack,
    historyGoForward,
    isAudioScene,
    navigateBack,
    nextSource,
    onBlacklist,
    onDelete,
    playPause,
    prevSource,
    hasStarted,
    imagePlayerAdvanceHacks,
    isPlaying,
    mainVideo,
    onRecentPictureGrid,
    recentPictureGrid,
    sceneID,
    tagDrawerHover,
    tutorial,
    videoVolume
  ])

  const openLink = (url: string) => {
    window.open(url, '_blank')?.focus()
  }

  const onMouseEnterAppBar = () => {
    clearTimeout(_appBarTimeout.current)
    setAppBarHover(true)
  }

  const closeAppBar = () => {
    setAppBarHover(false)
  }

  const onMouseLeaveAppBar = () => {
    clearTimeout(_appBarTimeout.current)
    _appBarTimeout.current = window.setTimeout(closeAppBar, 1000)
  }

  const onMouseEnterDrawer = () => {
    clearTimeout(_drawerTimeout.current)
    setDrawerHover(true)
  }

  const closeDrawer = () => {
    setDrawerHover(false)
  }

  const onMouseLeaveDrawer = () => {
    clearTimeout(_drawerTimeout.current)
    _drawerTimeout.current = window.setTimeout(closeDrawer, 1000)
  }

  const onMouseEnterTagDrawer = () => {
    clearTimeout(_tagDrawerTimeout.current)
    setTagDrawerHover(true)
  }

  const closeTagDrawer = () => {
    setTagDrawerHover(false)
  }

  const onMouseLeaveTagDrawer = () => {
    clearTimeout(_tagDrawerTimeout.current)
    _tagDrawerTimeout.current = window.setTimeout(closeTagDrawer, 500)
  }

  const onCloseDialog = () => {
    setSourceToBlacklist(undefined)
    setFileToBlacklist(undefined)
    setDeletePath(undefined)
    setDeleteError(undefined)
  }

  const onFinishBlacklistFile = () => {
    dispatch(blacklistFile(sourceToBlacklist as string, fileToBlacklist))
    onCloseDialog()
  }

  const onFinishDeletePath = () => {
    doDelete(deletePath as string)
  }

  const inheritClipTags =
    isAudioScene || isScriptScene
      ? undefined
      : (libraryID: number) => {
          dispatch(inheritTagsFromClips(libraryID))
        }

  const { classes } = useStyles()
  const canGoBack = props.historyOffset > -(props.historyPaths.length - 1)
  const canGoForward = props.historyOffset < 0
  let clipValue: number[] | undefined
  let clipID: number | undefined
  let videoSourceURL = ''
  if (
    props.mainVideo &&
    props.mainVideo.hasAttribute('start') &&
    props.mainVideo.hasAttribute('end')
  ) {
    clipValue = [
      parseFloat(props.mainVideo.getAttribute('start') as string),
      parseFloat(props.mainVideo.getAttribute('end') as string)
    ]
    clipID = parseInt(props.mainVideo.getAttribute('clip') as string)
    videoSourceURL = props.mainVideo.getAttribute('source') as string
  }

  if (!_showVideoControls.current) {
    _showVideoControls.current =
      props.mainVideo != null ||
      props.overlayVideos.find((a) => a != null) != null
  }

  return (
    <React.Fragment>
      <div
        className={classes.hoverBar}
        onMouseEnter={onMouseEnterAppBar}
        onMouseLeave={onMouseLeaveAppBar}
      />

      <AppBar
        enableColorOnDark
        position="absolute"
        onMouseEnter={onMouseEnterAppBar}
        onMouseLeave={onMouseLeaveAppBar}
        className={cx(
          classes.appBar,
          (tutorial === PT.toolbar ||
            !props.hasStarted ||
            props.isEmpty ||
            appBarHover) &&
            classes.appBarHover,
          tutorial === PT.toolbar && cx(classes.backdropTop, classes.highlight)
        )}
      >
        <Toolbar className={classes.headerBar}>
          <div className={classes.headerLeft}>
            <Tooltip disableInteractive title="Back" placement="right-end">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Back"
                onClick={navigateBack}
                size="large"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </div>

          <Tooltip disableInteractive title={props.title}>
            <Typography
              component="h1"
              variant="h4"
              color="inherit"
              noWrap
              className={classes.title}
            >
              {props.title}
            </Typography>
          </Tooltip>

          <div className={classes.headerRight}>
            <Tooltip disableInteractive title="Toggle Fullscreen">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="FullScreen"
                onClick={toggleFullScreen}
                size="large"
              >
                <FullscreenIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            {!isGridScene && (
              <React.Fragment>
                <Divider
                  component="div"
                  orientation="vertical"
                  style={{ height: 48, margin: '0 14px 0 3px' }}
                />
                <IconButton
                  disabled={!canGoBack}
                  edge="start"
                  color="inherit"
                  aria-label="Backward"
                  onClick={historyGoBack}
                  size="large"
                >
                  <ForwardIcon
                    fontSize="large"
                    style={{ transform: 'rotate(180deg)' }}
                  />
                </IconButton>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label={props.isPlaying ? 'Pause' : 'Play'}
                  onClick={() => setPlayPause(!props.isPlaying)}
                  size="large"
                >
                  {props.isPlaying ? (
                    <PauseIcon fontSize="large" />
                  ) : (
                    <PlayArrowIcon fontSize="large" />
                  )}
                </IconButton>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="Forward"
                  onClick={historyGoForward}
                  size="large"
                >
                  <ForwardIcon
                    fontSize="large"
                    style={
                      canGoForward
                        ? {}
                        : {
                            color: 'rgba(255, 255, 255, 0.3)',
                            backgroundColor: 'transparent'
                          }
                    }
                  />
                </IconButton>
              </React.Fragment>
            )}
          </div>
        </Toolbar>
      </AppBar>

      {props.hasStarted &&
        !props.isEmpty &&
        !props.recentPictureGrid &&
        !isDownloadScene && (
          <React.Fragment>
            <div
              className={classes.hoverDrawer}
              onMouseEnter={onMouseEnterDrawer}
              onMouseLeave={onMouseLeaveDrawer}
            />

            <Drawer
              variant="permanent"
              className={cx(
                classes.drawer,
                (tutorial === PT.sidebar || drawerHover) && classes.drawerHover
              )}
              classes={{
                paper: cx(
                  classes.drawerPaper,
                  (tutorial === PT.sidebar || drawerHover) &&
                    classes.drawerPaperHover,
                  tutorial === PT.toolbar &&
                    cx(classes.backdropTop, classes.highlight)
                )
              }}
              open={tutorial === PT.sidebar || drawerHover}
              onMouseEnter={onMouseEnterDrawer}
              onMouseLeave={onMouseLeaveDrawer}
            >
              <div className={classes.drawerToolbar}>
                <Typography variant="h4">Settings</Typography>
              </div>

              {!isAudioScene && _showVideoControls.current && (
                <Accordion TransitionProps={{ unmountOnExit: false }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Video Controls</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <VideoCard
                      sceneID={props.sceneID}
                      isPlaying={props.isPlaying}
                      mainVideo={props.mainVideo}
                      mainClipID={clipID}
                      mainClipValue={clipValue}
                      otherVideos={props.overlayVideos}
                      imagePlayerAdvanceHacks={props.imagePlayerAdvanceHacks}
                    />
                  </AccordionDetails>
                </Accordion>
              )}

              {!isAudioScene && !isGridScene && (
                <React.Fragment>
                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Scene Options</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <SceneOptionCard
                        sceneID={props.sceneID}
                        isTagging={allTags != null}
                      />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Image/Video Options</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ImageVideoCard sceneID={props.sceneID} />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Zoom/Move</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ZoomMoveCard sceneID={props.sceneID} />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Cross-Fade</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <CrossFadeCard sceneID={props.sceneID} />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Slide</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <SlideCard sceneID={props.sceneID} />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Strobe</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <StrobeCard sceneID={props.sceneID} />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Fade In/Out</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FadeIOCard sceneID={props.sceneID} />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Panning</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <PanningCard sceneID={props.sceneID} />
                    </AccordionDetails>
                  </Accordion>
                </React.Fragment>
              )}

              {!isGridScene && (
                <Accordion
                  defaultExpanded={isAudioScene}
                  TransitionProps={{
                    unmountOnExit: !audioEnabled && nextSceneID === 0
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Audio Tracks</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <AudioCard
                      sceneID={props.sceneID}
                      scenePaths={props.historyPaths}
                      startPlaying
                      persist={props.persistAudio}
                      goBack={navigateBack}
                      onPlaying={props.onPlaying}
                      setCurrentAudio={props.setCurrentAudio}
                    />
                  </AccordionDetails>
                </Accordion>
              )}

              {!isAudioScene && !isGridScene && !props.persistText && (
                <Accordion TransitionProps={{ unmountOnExit: true }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Text Overlay</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextCard sceneID={props.sceneID} />
                  </AccordionDetails>
                </Accordion>
              )}
            </Drawer>
          </React.Fragment>
        )}

      {!isDownloadScene && props.hasStarted && allTags && (
        <React.Fragment>
          <div
            className={classes.hoverTagDrawer}
            onMouseEnter={onMouseEnterTagDrawer}
            onMouseLeave={onMouseLeaveTagDrawer}
          />

          <Drawer
            variant="permanent"
            anchor="bottom"
            className={classes.tagDrawer}
            classes={{
              paper: cx(
                classes.tagDrawerPaper,
                tagDrawerHover && classes.tagDrawerPaperHover
              )
            }}
            open={tagDrawerHover}
            onMouseEnter={onMouseEnterTagDrawer}
            onMouseLeave={onMouseLeaveTagDrawer}
          >
            <Grid container alignItems="center">
              {tags != null && (
                <React.Fragment>
                  <Grid item xs>
                    <div className={classes.tagList}>
                      {allTags.map((tag) => (
                        <TagCard
                          tagID={tag}
                          libraryID={libraryID}
                          sceneID={props.sceneID}
                        />
                      ))}
                    </div>
                  </Grid>
                  {inheritClipTags && canInheritClipTags && (
                    <Grid item>
                      <Tooltip disableInteractive title="Inherit Clip Tags">
                        <Fab
                          color="primary"
                          size="small"
                          onClick={() => {
                            inheritClipTags(libraryID)
                          }}
                        >
                          <SystemUpdateAltIcon />
                        </Fab>
                      </Tooltip>
                    </Grid>
                  )}
                </React.Fragment>
              )}
              <Grid item xs={12}>
                {sources.length === 1 &&
                  getSourceType(videoSourceURL) === ST.video && (
                    <VideoControl
                      video={props.mainVideo}
                      clipID={clipID}
                      clipValue={clipValue}
                      useHotkeys
                      skip={videoSkip}
                      onChangeVolume={() => {}}
                    />
                  )}
              </Grid>
            </Grid>
          </Drawer>
        </React.Fragment>
      )}

      <Dialog
        open={!!fileToBlacklist}
        onClose={onCloseDialog}
        aria-labelledby="blacklist-title"
        aria-describedby="blacklist-description"
      >
        <DialogTitle id="blacklist-title">Blacklist File</DialogTitle>
        <DialogContent>
          <DialogContentText id="blacklist-description">
            Are you sure you want to blacklist{' '}
            <Link
              className={classes.wordWrap}
              href="#"
              onClick={() => openLink(fileToBlacklist as string)}
              underline="hover"
            >
              {fileToBlacklist as string}
            </Link>{' '}
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={onFinishBlacklistFile} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deletePath}
        onClose={onCloseDialog}
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
      >
        <DialogTitle id="delete-title">Delete File</DialogTitle>
        <DialogContent>
          {deletePath && (
            <DialogContentText id="delete-description">
              Are you sure you want to delete{' '}
              <Link
                className={classes.wordWrap}
                href="#"
                onClick={() => openLink(deletePath)}
                underline="hover"
              >
                {deletePath}
              </Link>
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={onFinishDeletePath} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteError}
        onClose={onCloseDialog}
        aria-describedby="delete-error-description"
      >
        <DialogContent>
          <DialogContentText
            className={classes.wordWrap}
            id="delete-error-description"
          >
            {deleteError}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}

;(PlayerBars as any).displayName = 'PlayerBars'
export default PlayerBars

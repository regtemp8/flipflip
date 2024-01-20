import React, {
  useEffect,
  useState,
  type MouseEvent,
  type ChangeEvent
} from 'react'
import { cx } from '@emotion/css'
import wretch from 'wretch'

import {
  AppBar,
  Backdrop,
  Badge,
  Button,
  Chip,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Fab,
  IconButton,
  InputAdornment,
  LinearProgress,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
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
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CancelIcon from '@mui/icons-material/Cancel'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import FolderIcon from '@mui/icons-material/Folder'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import GetAppIcon from '@mui/icons-material/GetApp'
import HttpIcon from '@mui/icons-material/Http'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import MenuIcon from '@mui/icons-material/Menu'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import MovieFilterIcon from '@mui/icons-material/MovieFilter'
import MovieIcon from '@mui/icons-material/Movie'
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt'
import PublishIcon from '@mui/icons-material/Publish'
import SelectAllIcon from '@mui/icons-material/SelectAll'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import SortIcon from '@mui/icons-material/Sort'

import flipflip from '../../FlipFlipService'
import { getSourceType, en, AF, LT, MO, PR, SF, SP, ST } from 'flipflip-common'
import { getCachePath, getLocalPath } from '../../data/utils'
import BatchClipDialog from './BatchClipDialog'
import LibrarySearch from './LibrarySearch'
import SourceIcon from './SourceIcon'
import SourceList from './SourceList'
import GooninatorDialog from '../sceneDetail/GooninatorDialog'
import PiwigoDialog from '../sceneDetail/PiwigoDialog'
import URLDialog from '../sceneDetail/URLDialog'
import {
  setProgressMode,
  setLibraryFilters,
  setLibrarySelected,
  systemMessage,
  batchClip,
  batchTag,
  manageTags,
  setLibraryRemoveOne,
  setLibraryRemove,
  setLibraryRemoveAll
} from '../../store/app/slice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectAppConfigRemoteSettingsTumblrAuthorized,
  selectAppConfigRemoteSettingsRedditAuthorized,
  selectAppConfigRemoteSettingsTwitterAuthorized,
  selectAppConfigRemoteSettingsInstagramConfigured,
  selectAppConfigRemoteSettingsPiwigoConfigured,
  selectAppTutorial,
  selectAppConfigCachingDirectory,
  selectAppTags,
  selectAppSpecialMode,
  selectAppProgressCurrent,
  selectAppProgressMode,
  selectAppProgressTotal,
  selectAppLibraryFilters,
  selectAppLibrarySelected,
  selectAppFilteredSources,
  selectAppLibrarySelectedTagNames
} from '../../store/app/selectors'
import {
  setRouteGoBack,
  exportLibrary,
  importFromLibrary,
  setLibraryRemoveVisible,
  markOffline,
  importInstagram,
  // importReddit,
  importTumblr,
  // importTwitter,
  updateVideoMetadata,
  importLibrary,
  doneTutorial,
  sortSources
} from '../../store/app/thunks'
import { setLibrarySourceMove } from '../../store/librarySource/slice'
import {
  setLibrarySourcesToggleMarked,
  setLibrarySourcesTags,
  setLibrarySourcesAddTags,
  setLibrarySourcesRemoveTags
} from '../../store/librarySource/thunks'
import { addSource } from '../../store/scene/thunks'
import { selectLibrarySources } from '../../store/librarySource/selectors'

const drawerWidth = 240

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  appBarSpacerWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0,
    minHeight: 64
  },
  appBarSpacerCollapse: {
    width: '100%'
  },
  appBarSpacer: {
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    minHeight: 64
  },
  backButton: {
    float: 'left'
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
  searchBar: {
    float: 'right',
    display: 'flex',
    maxWidth: '100%'
  },
  searchCount: {
    color: theme.palette.primary.contrastText,
    marginTop: 3,
    marginRight: theme.spacing(1)
  },
  displayCount: {
    marginTop: 3,
    marginRight: theme.spacing(1)
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    height: '100vh',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9)
    },
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  drawerPaperHidden: {
    width: 0,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  drawer: {
    position: 'absolute'
  },
  drawerSpacer: {
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9)
    }
  },
  drawerButton: {
    backgroundColor: theme.palette.primary.main,
    minHeight: theme.spacing(6),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0
    }
  },
  drawerIcon: {
    color: theme.palette.primary.contrastText
  },
  chip: {
    transition: theme.transitions.create(['opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  chipClose: {
    opacity: 0,
    transition: theme.transitions.create(['opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default
  },
  container: {
    padding: theme.spacing(0),
    overflow: 'hidden',
    flexGrow: 1
  },
  containerNotEmpty: {
    display: 'flex'
  },
  addMenuButton: {
    backgroundColor: theme.palette.primary.dark,
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed'
  },
  sortMenuButton: {
    backgroundColor: theme.palette.secondary.dark,
    margin: 0,
    top: 'auto',
    right: 80,
    bottom: 20,
    left: 'auto',
    position: 'fixed'
  },
  selectAllButton: {
    backgroundColor: theme.palette.secondary.dark,
    margin: 0,
    top: 'auto',
    right: 130,
    bottom: 20,
    left: 'auto',
    position: 'fixed'
  },
  selectNoneButton: {
    backgroundColor: theme.palette.secondary.light,
    margin: 0,
    top: 'auto',
    right: 180,
    bottom: 20,
    left: 'auto',
    position: 'fixed'
  },
  importBadge: {
    top: 'auto',
    right: 30,
    bottom: 50,
    left: 'auto',
    position: 'fixed',
    zIndex: theme.zIndex.fab + 1
  },
  addButton: {
    backgroundColor: theme.palette.primary.main,
    margin: 0,
    top: 'auto',
    right: 28,
    bottom: 25,
    left: 'auto',
    position: 'fixed',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  addURLButton: {
    marginBottom: 60
  },
  addDirectoryButton: {
    marginBottom: 115
  },
  addVideoButton: {
    marginBottom: 170
  },
  addPiwigoButton: {
    marginBottom: 225
  },
  removeAllButton: {
    backgroundColor: theme.palette.error.main,
    margin: 0,
    top: 'auto',
    right: 130,
    bottom: 20,
    left: 'auto',
    position: 'fixed'
  },
  addButtonClose: {
    marginBottom: 0,
    transition: theme.transitions.create(['margin', 'opacity'], {
      easing: theme.transitions.easing.sharp,
      duration:
        theme.transitions.duration.leavingScreen +
        theme.transitions.duration.standard
    })
  },
  icon: {
    color: theme.palette.primary.contrastText
  },
  sortMenu: {
    width: 200
  },
  fill: {
    flexGrow: 1
  },
  backdrop: {
    zIndex: theme.zIndex.modal,
    height: '100%',
    width: '100%'
  },
  hidden: {
    opacity: 0,
    transition: theme.transitions.create(['margin', 'opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: 100
    })
  },
  noScroll: {
    overflow: 'visible'
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

function Library() {
  const dispatch = useAppDispatch()
  const tutorial = useAppSelector(selectAppTutorial())
  const library = useAppSelector(selectLibrarySources())
  const tags = useAppSelector(selectAppTags())
  const specialMode = useAppSelector(selectAppSpecialMode())
  const tumblrAuthorized = useAppSelector(
    selectAppConfigRemoteSettingsTumblrAuthorized()
  )
  const redditAuthorized = useAppSelector(
    selectAppConfigRemoteSettingsRedditAuthorized()
  )
  const twitterAuthorized = useAppSelector(
    selectAppConfigRemoteSettingsTwitterAuthorized()
  )
  const instagramConfigured = useAppSelector(
    selectAppConfigRemoteSettingsInstagramConfigured()
  )
  const piwigoConfigured = useAppSelector(
    selectAppConfigRemoteSettingsPiwigoConfigured()
  )
  const cachingDirectory = useAppSelector(selectAppConfigCachingDirectory())
  const progressCurrent = useAppSelector(selectAppProgressCurrent())
  const progressMode = useAppSelector(selectAppProgressMode())
  const progressTotal = useAppSelector(selectAppProgressTotal())
  const filters = useAppSelector(selectAppLibraryFilters())
  const selected = useAppSelector(selectAppLibrarySelected())
  const displaySources = useAppSelector(selectAppFilteredSources())
  const selectedTagNames = useAppSelector(selectAppLibrarySelectedTagNames())

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [menuAnchorEl, setMenuAnchorEl] = useState<any>()
  const [openMenu, setOpenMenu] = useState<string>()
  const [moveDialog, setMoveDialog] = useState(false)
  const [importFile, setImportFile] = useState('')

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown, false)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    if (tutorial === LT.final && drawerOpen) {
      setDrawerOpen(false)
    }
  }, [tutorial, drawerOpen])

  // Use alt+P to access import modal
  // Use alt+M to toggle highlighting  sources
  // Use alt+L to move cached offline sources to local sources
  const onKeyDown = (e: KeyboardEvent) => {
    if (
      !e.shiftKey &&
      !e.ctrlKey &&
      e.altKey &&
      (e.key === 'p' || e.key === 'π')
    ) {
      setOpenMenu(
        openMenu === MO.gooninatorImport ? undefined : MO.gooninatorImport
      )
    } else if (
      !e.shiftKey &&
      !e.ctrlKey &&
      e.altKey &&
      (e.key === 'm' || e.key === 'µ')
    ) {
      toggleMarked()
    } else if (
      !e.shiftKey &&
      !e.ctrlKey &&
      e.altKey &&
      (e.key === 'l' || e.key === '¬')
    ) {
      moveOffline()
    } else if (e.key === 'Escape' && specialMode != null) {
      dispatch(setRouteGoBack())
    }
  }

  const moveOffline = () => {
    setMoveDialog(true)
  }

  const openPiwigoDialog = () => {
    setOpenMenu(MO.piwigo)
  }

  const onFinishMove = async () => {
    for (const source of library) {
      if (source.offline) {
        const cachePath = (await getCachePath(
          cachingDirectory,
          source.url
        )) as string
        let files = []
        let error: NodeJS.ErrnoException | undefined
        try {
          files = await flipflip().api.readdir(cachePath)
        } catch (err: any) {
          // TODO does catch still work?
          error = err
        }

        if (!!error || files.length === 0) {
          dispatch(setLibraryRemoveOne(source.id))
        } else {
          const localPath = (await getLocalPath(
            cachingDirectory,
            source.url as string
          )) as string
          await flipflip().api.move(cachePath, localPath)
          dispatch(
            setLibrarySourceMove({
              id: source.id,
              url: localPath,
              count: files.length
            })
          )
        }
      }
    }
    onCloseMoveDialog()
  }

  const onCloseMoveDialog = () => {
    setMoveDialog(false)
  }

  const onBatchClip = () => {
    onCloseDialog()
    dispatch(batchClip())
  }

  const onBatchTag = () => {
    onCloseDialog()
    dispatch(batchTag)
  }

  const onFindMerges = () => {
    onUpdateFilters(['<Mergeable>'])
  }

  const goBack = () => {
    if (specialMode === SP.batchTag) {
      dispatch(setLibrarySelected([]))
      setSelectedTags([])
      dispatch(batchTag())
    } else if (specialMode === SP.batchClip) {
      dispatch(setLibrarySelected([]))
      dispatch(batchClip())
    } else {
      dispatch(setRouteGoBack())
    }
  }

  const onUpdateFilters = (filters: string[]) =>
    dispatch(setLibraryFilters(filters))

  const onAddSource = (addFunction: string, e?: MouseEvent, ...args: any[]) => {
    onCloseDialog()
    if (addFunction === AF.videos && e?.shiftKey) {
      addFunction = AF.videoDir
    }

    dispatch(addSource(addFunction, undefined, ...args))
  }

  const onToggleBatchClipModal = () => {
    const newOpenMenu = openMenu === MO.batchClip ? undefined : MO.batchClip
    setOpenMenu(newOpenMenu)
  }

  const onToggleBatchTagModal = () => {
    if (openMenu === MO.batchTag) {
      setOpenMenu(undefined)
      setSelectedTags([])
    } else {
      setOpenMenu(MO.batchTag)
      setSelectedTags(selectedTagNames)
    }
  }

  const onSelectTags = (selectedTags: string[]) => {
    setSelectedTags(selectedTags)
  }

  const onToggleDrawer = () => {
    if (tutorial === LT.sidebar1) {
      dispatch(doneTutorial(LT.sidebar1))
    }
    setDrawerOpen(!drawerOpen)
  }

  const onToggleNewMenu = () => {
    setOpenMenu(openMenu === MO.new ? undefined : MO.new)
  }

  const onOpenSortMenu = (e: MouseEvent) => {
    setMenuAnchorEl(e.currentTarget)
    setOpenMenu(MO.sort)
  }

  const onCloseDialog = () => {
    setMenuAnchorEl(null)
    setOpenMenu(undefined)
    setDrawerOpen(false)
    setImportFile('')
  }

  const onRemoveAll = (e: MouseEvent) => {
    if (e.shiftKey && e.altKey && e.ctrlKey) {
      setOpenMenu(MO.deleteAlert)
    } else {
      setOpenMenu(MO.removeAllAlert)
    }
  }

  const onFinishRemoveAll = () => {
    dispatch(setLibraryRemoveAll())
    onCloseDialog()
  }

  const onFinishRemoveVisible = () => {
    dispatch(setLibraryRemove(displaySources))
    onCloseDialog()
    dispatch(setLibraryFilters([]))
  }

  const onFinishDeleteAll = async () => {
    for (const l of library) {
      const url = l.url as string
      const fileType = getSourceType(url)
      try {
        if (fileType === ST.local) {
          flipflip().api.rimrafSync(url)
        } else if (
          fileType === ST.video ||
          fileType === ST.playlist ||
          fileType === ST.list
        ) {
          await flipflip().api.unlink(url)
        }
      } catch (e) {
        console.error(e)
      }
    }
    dispatch(setLibraryRemoveAll())
    onCloseDialog()
  }

  const onFinishDeleteVisible = () => {
    dispatch(setLibraryRemoveVisible(displaySources))

    onCloseDialog()
    dispatch(setLibraryFilters([]))
  }

  const onOpenImportFile = async () => {
    const filePath = await flipflip().api.openJsonFile()
    if (filePath) {
      setImportFile(filePath)
    }
  }

  const onChangeImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    setImportFile(e.target.value)
  }
  const onImportLibrary = () => {
    setOpenMenu(MO.libraryImport)
  }

  const onFinishImportLibrary = async () => {
    if (importFile.startsWith('http')) {
      wretch(importFile)
        .get()
        .text((text) => {
          let json
          try {
            json = JSON.parse(text)
            dispatch(importLibrary(json))
            onCloseDialog()
          } catch (e) {
            dispatch(systemMessage('This is not a valid JSON file'))
          }
        })
        .catch((e) => {
          dispatch(systemMessage('Error accessing URL'))
        })
    } else {
      const text = await flipflip().api.readTextFile(importFile)
      dispatch(importLibrary(JSON.parse(text)))
      onCloseDialog()
    }
  }

  const onImportFromLibrary = () => {
    dispatch(importFromLibrary(selected))
  }

  const onSelectAll = () => {
    const newSelected = new Set([...selected, ...displaySources])
    dispatch(setLibrarySelected([...newSelected]))
  }

  const onSelectNone = () => {
    const newSelected = selected.filter((id) => !displaySources.includes(id))
    dispatch(setLibrarySelected(newSelected))
  }

  const toggleMarked = () => {
    dispatch(setLibrarySourcesToggleMarked(displaySources))
  }

  const batchTagOverwrite = () => {
    dispatch(setLibrarySourcesTags(selected, selectedTags))
    onCloseDialog()
  }

  const batchTagAdd = () => {
    dispatch(setLibrarySourcesAddTags(selected, selectedTags))
    onCloseDialog()
  }

  const batchTagRemove = () => {
    dispatch(setLibrarySourcesRemoveTags(selected, selectedTags))
    onCloseDialog()
  }

  const getCancelProgressMessage = () => {
    switch (progressMode) {
      case PR.offline:
        return (
          'Cancel Offline Check ( ' +
          progressCurrent +
          ' / ' +
          progressTotal +
          ' )'
        )
      case PR.videoMetadata:
        return (
          'End Video MD Check ( ' +
          progressCurrent +
          ' / ' +
          progressTotal +
          ' )'
        )
      case PR.tumblr:
        return (
          'Cancel Import ( ' + progressCurrent + ' / ' + progressTotal + ' )'
        )
      case PR.reddit:
      case PR.twitter:
      case PR.instagram:
        return 'Cancel Import'
    }
  }

  const remoteAuthorized =
    tumblrAuthorized ||
    redditAuthorized ||
    twitterAuthorized ||
    instagramConfigured
  const { classes } = useStyles()
  const open = drawerOpen
  const cancelProgressMessage = getCancelProgressMessage()

  return (
    <div className={classes.root}>
      <AppBar
        enableColorOnDark
        position="absolute"
        className={cx(
          classes.appBar,
          tutorial === LT.toolbar && cx(classes.backdropTop, classes.disable)
        )}
      >
        <Toolbar className={classes.headerBar}>
          <div className={classes.headerLeft}>
            <Tooltip
              disableInteractive
              title={specialMode === SP.select ? 'Cancel Import' : 'Back'}
              placement="right-end"
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Back"
                className={classes.backButton}
                onClick={goBack}
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
            Library
          </Typography>

          <div className={classes.headerRight}>
            <div
              className={cx(
                classes.searchBar,
                tutorial === LT.toolbar && classes.highlight
              )}
            >
              {library.length > 0 && (
                <Chip
                  className={classes.searchCount}
                  label={library.length}
                  size="medium"
                  variant="outlined"
                />
              )}
              {filters.length > 0 && (
                <Chip
                  className={classes.displayCount}
                  label={displaySources.length}
                  size="medium"
                />
              )}
              <LibrarySearch
                displaySources={displaySources}
                filters={filters}
                placeholder={'Search ...'}
                isCreatable
                onlyUsed
                onUpdateFilters={onUpdateFilters}
              />
            </div>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        className={cx(
          classes.drawer,
          (tutorial === LT.sidebar1 ||
            tutorial === LT.sidebar2 ||
            drawerOpen) &&
            classes.backdropTop,
          tutorial === LT.sidebar2 && classes.highlight
        )}
        variant="permanent"
        classes={{
          paper: cx(
            classes.drawerPaper,
            !open && classes.drawerPaperClose,
            specialMode && classes.drawerPaperHidden
          )
        }}
        open={drawerOpen}
      >
        <div className={cx(!open && classes.appBarSpacerWrapper)}>
          <Collapse in={!open} className={classes.appBarSpacerCollapse}>
            <div className={classes.appBarSpacer} />
          </Collapse>
        </div>

        <ListItem className={classes.drawerButton}>
          <IconButton
            className={cx(tutorial === LT.sidebar1 && classes.highlight)}
            onClick={onToggleDrawer}
            size="large"
          >
            <MenuIcon className={classes.drawerIcon} />
          </IconButton>
        </ListItem>

        <Divider />

        <div className={cx(tutorial != null && classes.disable)}>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Manage Tags'}>
            <ListItemButton onClick={() => dispatch(manageTags())}>
              <ListItemIcon>
                <LocalOfferIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Tags" />
              {tags.length > 0 && (
                <Chip
                  className={cx(classes.chip, !open && classes.chipClose)}
                  label={tags.length}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </ListItemButton>
          </Tooltip>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Batch Tag'}>
            <ListItemButton onClick={onBatchTag}>
              <ListItemIcon>
                <FormatListBulletedIcon />
              </ListItemIcon>
              <ListItemText primary="Batch Tag" />
            </ListItemButton>
          </Tooltip>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Batch Clip'}>
            <ListItemButton onClick={onBatchClip}>
              <ListItemIcon>
                <SvgIcon>
                  <path
                    d="M11 21H7V19H11V21M15.5 19H17V21H13V19H13.2L11.8 12.9L9.3 13.5C9.2 14 9 14.4 8.8
                        14.8C7.9 16.3 6 16.7 4.5 15.8C3 14.9 2.6 13 3.5 11.5C4.4 10 6.3 9.6 7.8 10.5C8.2 10.7 8.5
                        11.1 8.7 11.4L11.2 10.8L10.6 8.3C10.2 8.2 9.8 8 9.4 7.8C8 6.9 7.5 5 8.4 3.5C9.3 2 11.2
                        1.6 12.7 2.5C14.2 3.4 14.6 5.3 13.7 6.8C13.5 7.2 13.1 7.5 12.8 7.7L15.5 19M7 11.8C6.3
                        11.3 5.3 11.6 4.8 12.3C4.3 13 4.6 14 5.3 14.4C6 14.9 7 14.7 7.5 13.9C7.9 13.2 7.7 12.2 7
                        11.8M12.4 6C12.9 5.3 12.6 4.3 11.9 3.8C11.2 3.3 10.2 3.6 9.7 4.3C9.3 5 9.5 6 10.3 6.5C11
                        6.9 12 6.7 12.4 6M12.8 11.3C12.6 11.2 12.4 11.2 12.3 11.4C12.2 11.6 12.2 11.8 12.4
                        11.9C12.6 12 12.8 12 12.9 11.8C13.1 11.6 13 11.4 12.8 11.3M21 8.5L14.5 10L15 12.2L22.5
                        10.4L23 9.7L21 8.5M23 19H19V21H23V19M5 19H1V21H5V19Z"
                  />
                </SvgIcon>
              </ListItemIcon>
              <ListItemText primary="Batch Clip" />
            </ListItemButton>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={'Identify local sources which have identical tags'}
          >
            <ListItemButton onClick={onFindMerges}>
              <ListItemIcon>
                <MergeTypeIcon />
              </ListItemIcon>
              <ListItemText primary="Find Mergeables" />
            </ListItemButton>
          </Tooltip>
        </div>

        {remoteAuthorized && (
          <React.Fragment>
            <Divider />

            <div className={cx(tutorial != null && classes.disable)}>
              <Collapse in={open}>
                <ListSubheader inset>Import Remote Sources</ListSubheader>
              </Collapse>
              {tumblrAuthorized && (
                <Tooltip
                  disableInteractive
                  title={drawerOpen ? '' : 'Import from Tumblr'}
                >
                  <ListItemButton
                    disabled={progressMode != null}
                    onClick={async () => {
                      await dispatch(importTumblr())
                    }}
                  >
                    <ListItemIcon>
                      <SourceIcon type={ST.tumblr} />
                    </ListItemIcon>
                    <ListItemText primary="Tumblr" />
                  </ListItemButton>
                </Tooltip>
              )}
              {/* {redditAuthorized && (
                <Tooltip disableInteractive title={drawerOpen ? "" : "Import from Reddit"}>
                  <ListItemButton disabled={progressMode != null} onClick={() => dispatch(importReddit())}>
                    <ListItemIcon>
                      <SourceIcon type={ST.reddit}/>
                    </ListItemIcon>
                    <ListItemText primary="Reddit" />
                  </ListItemButton>
                </Tooltip>
              )} */}
              {/* {twitterAuthorized && (
                <Tooltip disableInteractive title={drawerOpen ? "" : "Import from Twitter"}>
                  <ListItemButton disabled={progressMode != null} onClick={() => dispatch(importTwitter())}>
                    <ListItemIcon>
                      <SourceIcon type={ST.twitter}/>
                    </ListItemIcon>
                    <ListItemText primary="Twitter" />
                  </ListItemButton>
                </Tooltip>
              )} */}
              {instagramConfigured && (
                <Tooltip
                  disableInteractive
                  title={drawerOpen ? '' : 'Import from Instagram'}
                >
                  <ListItemButton
                    disabled={progressMode != null}
                    onClick={() => {
                      dispatch(importInstagram())
                    }}
                  >
                    <ListItemIcon>
                      <SourceIcon type={ST.instagram} />
                    </ListItemIcon>
                    <ListItemText primary="Instagram" />
                  </ListItemButton>
                </Tooltip>
              )}
            </div>
          </React.Fragment>
        )}

        <Divider />

        <div className={cx(tutorial != null && classes.disable)}>
          <Tooltip
            disableInteractive
            title={'Identify sources which are not accessible'}
          >
            <ListItemButton
              disabled={progressMode != null}
              onClick={() => {
                dispatch(markOffline())
              }}
            >
              <ListItemIcon>
                <OfflineBoltIcon />
              </ListItemIcon>
              <ListItemText primary="Mark Offline" />
            </ListItemButton>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={'Detect duration and resolution of video sources'}
          >
            <ListItemButton
              disabled={progressMode != null}
              onClick={() => {
                dispatch(updateVideoMetadata())
              }}
            >
              <ListItemIcon>
                <MovieFilterIcon />
              </ListItemIcon>
              <ListItemText primary="Video Metadata" />
            </ListItemButton>
          </Tooltip>
        </div>

        {progressMode != null && (
          <React.Fragment>
            <Divider />

            <div>
              <Tooltip
                disableInteractive
                title={drawerOpen ? '' : cancelProgressMessage}
              >
                <ListItemButton
                  onClick={() => dispatch(setProgressMode(PR.cancel))}
                >
                  <ListItemIcon>
                    <CancelIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary={cancelProgressMessage} />
                </ListItemButton>
              </Tooltip>
              {(progressMode === PR.offline ||
                progressMode === PR.tumblr ||
                progressMode === PR.videoMetadata) && (
                <LinearProgress
                  variant="determinate"
                  value={Math.round((progressCurrent / progressTotal) * 100)}
                />
              )}
              {progressMode !== PR.offline &&
                progressMode !== PR.tumblr &&
                progressMode !== PR.videoMetadata && (
                  <LinearProgress
                    variant={
                      progressMode === PR.cancel ? 'query' : 'indeterminate'
                    }
                  />
                )}
            </div>
          </React.Fragment>
        )}

        <div className={classes.fill} />

        <div className={cx(tutorial != null && classes.disable)}>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Export Library'}
          >
            <ListItemButton
              onClick={() => {
                dispatch(exportLibrary())
              }}
            >
              <ListItemIcon>
                <PublishIcon />
              </ListItemIcon>
              <ListItemText primary="Export Library" />
            </ListItemButton>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Import Library'}
          >
            <ListItemButton onClick={onImportLibrary}>
              <ListItemIcon>
                <GetAppIcon />
              </ListItemIcon>
              <ListItemText primary="Import Library" />
            </ListItemButton>
          </Tooltip>
        </div>
      </Drawer>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div className={cx(classes.root, classes.fill)}>
          {!specialMode && <div className={classes.drawerSpacer} />}
          <Container
            maxWidth={false}
            className={cx(
              classes.container,
              displaySources.length > 0 && classes.containerNotEmpty
            )}
          >
            <SourceList
              isLibrary
              isSelect={!!specialMode}
              selected={selected}
              showHelp={!specialMode && filters.length === 0}
              sources={displaySources}
            />
          </Container>
        </div>
      </main>

      <Backdrop
        className={classes.backdrop}
        onClick={onCloseDialog}
        open={tutorial == null && (openMenu === MO.new || drawerOpen)}
      />

      {specialMode && (
        <React.Fragment>
          <Tooltip disableInteractive title="Clear" placement="top-end">
            <Fab
              className={classes.selectNoneButton}
              onClick={onSelectNone}
              size="small"
            >
              <ClearIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip disableInteractive title="Select All" placement="top-end">
            <Fab
              className={classes.selectAllButton}
              onClick={onSelectAll}
              size="medium"
            >
              <SelectAllIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={
              specialMode === SP.batchTag
                ? 'Batch Tag'
                : specialMode === SP.batchClip
                  ? 'Batch Clip'
                  : 'Import'
            }
            placement="top-end"
          >
            <Badge
              classes={{
                badge: classes.importBadge
              }}
              overlap="circular"
              color="secondary"
              badgeContent={selected.length}
              max={999}
            >
              <Fab
                className={classes.addMenuButton}
                disabled={selected.length === 0}
                onClick={
                  specialMode === SP.batchTag
                    ? onToggleBatchTagModal
                    : specialMode === SP.batchClip
                      ? onToggleBatchClipModal
                      : onImportFromLibrary
                }
                size="large"
              >
                {specialMode === SP.select && (
                  <GetAppIcon className={classes.icon} />
                )}
                {specialMode === SP.batchTag && (
                  <LocalOfferIcon className={classes.icon} />
                )}
                {specialMode === SP.batchClip && (
                  <SvgIcon className={classes.icon}>
                    <path
                      d="M11 21H7V19H11V21M15.5 19H17V21H13V19H13.2L11.8 12.9L9.3 13.5C9.2 14 9 14.4 8.8
                        14.8C7.9 16.3 6 16.7 4.5 15.8C3 14.9 2.6 13 3.5 11.5C4.4 10 6.3 9.6 7.8 10.5C8.2 10.7 8.5
                        11.1 8.7 11.4L11.2 10.8L10.6 8.3C10.2 8.2 9.8 8 9.4 7.8C8 6.9 7.5 5 8.4 3.5C9.3 2 11.2
                        1.6 12.7 2.5C14.2 3.4 14.6 5.3 13.7 6.8C13.5 7.2 13.1 7.5 12.8 7.7L15.5 19M7 11.8C6.3
                        11.3 5.3 11.6 4.8 12.3C4.3 13 4.6 14 5.3 14.4C6 14.9 7 14.7 7.5 13.9C7.9 13.2 7.7 12.2 7
                        11.8M12.4 6C12.9 5.3 12.6 4.3 11.9 3.8C11.2 3.3 10.2 3.6 9.7 4.3C9.3 5 9.5 6 10.3 6.5C11
                        6.9 12 6.7 12.4 6M12.8 11.3C12.6 11.2 12.4 11.2 12.3 11.4C12.2 11.6 12.2 11.8 12.4
                        11.9C12.6 12 12.8 12 12.9 11.8C13.1 11.6 13 11.4 12.8 11.3M21 8.5L14.5 10L15 12.2L22.5
                        10.4L23 9.7L21 8.5M23 19H19V21H23V19M5 19H1V21H5V19Z"
                    />
                  </SvgIcon>
                )}
              </Fab>
            </Badge>
          </Tooltip>
        </React.Fragment>
      )}

      {!specialMode && (
        <React.Fragment>
          {library.length > 0 && (
            <Tooltip
              disableInteractive
              title={
                filters.length === 0
                  ? 'Delete All Sources'
                  : 'Delete These Sources'
              }
              placement="left"
            >
              <Fab
                className={classes.removeAllButton}
                onClick={onRemoveAll}
                size="small"
              >
                <DeleteSweepIcon className={classes.icon} />
              </Fab>
            </Tooltip>
          )}
          <Dialog
            open={openMenu === MO.libraryImport}
            onClose={onCloseDialog}
            aria-labelledby="import-title"
            aria-describedby="import-description"
          >
            <DialogTitle id="import-title">Import Library</DialogTitle>
            <DialogContent>
              <DialogContentText id="import-description">
                To import a library, enter the URL or open a local file.
              </DialogContentText>
              <TextField
                variant="standard"
                label="Import File"
                fullWidth
                placeholder="Paste URL Here"
                margin="dense"
                value={importFile}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip disableInteractive title="Open File">
                        <IconButton onClick={onOpenImportFile} size="large">
                          <FolderIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
                onChange={onChangeImportFile}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={onCloseDialog}>Cancel</Button>
              <Button
                color="primary"
                disabled={importFile.length === 0}
                onClick={onFinishImportLibrary}
              >
                Import
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={openMenu === MO.removeAllAlert}
            onClose={onCloseDialog}
            aria-labelledby="remove-all-title"
            aria-describedby="remove-all-description"
          >
            {filters.length === 0 && (
              <React.Fragment>
                <DialogTitle id="remove-all-title">Delete Library</DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you really wanna delete your entire library...?
                    ಠ_ಠ
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={onCloseDialog} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={onFinishRemoveAll} color="primary">
                    Yea... I'm sure
                  </Button>
                </DialogActions>
              </React.Fragment>
            )}
            {filters.length > 0 && (
              <React.Fragment>
                <DialogTitle id="remove-all-title">Delete Sources</DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you want to remove these sources from your
                    library?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={onCloseDialog} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={onFinishRemoveVisible} color="primary">
                    Confirm
                  </Button>
                </DialogActions>
              </React.Fragment>
            )}
          </Dialog>
          <Dialog
            open={openMenu === MO.deleteAlert}
            onClose={onCloseDialog}
            aria-labelledby="delete-all-title"
            aria-describedby="delete-all-description"
          >
            {filters.length === 0 && (
              <React.Fragment>
                <DialogTitle id="delete-all-title">
                  PERMANENTLY Delete Library
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="delete-all-description">
                    Are you sure you really wanna delete your entire library...?
                    ಠ_ಠ
                  </DialogContentText>
                  <DialogContentText id="delete-all-description">
                    WARNING: THIS WILL DELETE ANY LOCAL FILES FROM DISK
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={onCloseDialog} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={onFinishDeleteAll} color="primary">
                    PERMANENTLY DELETE FROM DISK
                  </Button>
                </DialogActions>
              </React.Fragment>
            )}
            {filters.length > 0 && (
              <React.Fragment>
                <DialogTitle id="delete-all-title">
                  PERMANENTLY Delete Sources
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="delete-all-description">
                    Are you sure you want to remove these sources from your
                    library?
                  </DialogContentText>
                  <DialogContentText id="delete-all-description">
                    WARNING: THIS WILL DELETE ANY LOCAL FILES FROM DISK
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={onCloseDialog} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={onFinishDeleteVisible} color="primary">
                    PERMANENTLY DELETE FROM DISK
                  </Button>
                </DialogActions>
              </React.Fragment>
            )}
          </Dialog>
          {piwigoConfigured && (
            <Tooltip
              disableInteractive
              title={filters.length > 0 ? '' : 'Piwigo'}
              placement="left"
            >
              <Fab
                className={cx(
                  classes.addButton,
                  classes.addPiwigoButton,
                  openMenu !== MO.new && classes.addButtonClose,
                  openMenu === MO.new && classes.backdropTop,
                  filters.length > 0 && classes.hidden
                )}
                disabled={filters.length > 0}
                onClick={openPiwigoDialog}
                size="small"
              >
                <SourceIcon className={classes.icon} type={ST.piwigo} />
              </Fab>
            </Tooltip>
          )}
          <Tooltip
            disableInteractive
            title={filters.length > 0 ? '' : 'Local Video/Playlist'}
            placement="left"
          >
            <Fab
              className={cx(
                classes.addButton,
                classes.addVideoButton,
                openMenu !== MO.new && classes.addButtonClose,
                openMenu === MO.new && classes.backdropTop,
                filters.length > 0 && classes.hidden
              )}
              disabled={filters.length > 0}
              onClick={(e: MouseEvent<HTMLButtonElement>) =>
                onAddSource(AF.videos, e)
              }
              size="small"
            >
              <MovieIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={filters.length > 0 ? '' : 'Local Directory'}
            placement="left"
          >
            <Fab
              className={cx(
                classes.addButton,
                classes.addDirectoryButton,
                openMenu !== MO.new && classes.addButtonClose,
                openMenu === MO.new && classes.backdropTop,
                filters.length > 0 && classes.hidden
              )}
              disabled={filters.length > 0}
              onClick={(e: MouseEvent<HTMLButtonElement>) =>
                onAddSource(AF.directory, e)
              }
              size="small"
            >
              <FolderIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={filters.length > 0 ? '' : 'URL'}
            placement="left"
          >
            <Fab
              className={cx(
                classes.addButton,
                classes.addURLButton,
                openMenu !== MO.new && classes.addButtonClose,
                openMenu === MO.new && classes.backdropTop,
                filters.length > 0 && classes.hidden
              )}
              disabled={filters.length > 0}
              onClick={(e: MouseEvent<HTMLButtonElement>) =>
                onAddSource(AF.url, e)
              }
              size="small"
            >
              <HttpIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Fab
            className={cx(
              classes.addMenuButton,
              openMenu === MO.new && classes.backdropTop
            )}
            disabled={filters.length > 0}
            onClick={onToggleNewMenu}
            size="large"
          >
            <AddIcon className={classes.icon} />
          </Fab>
        </React.Fragment>
      )}

      <PiwigoDialog
        open={openMenu === MO.piwigo}
        onClose={onCloseDialog}
        onImportURL={onAddSource}
      />

      <Fab
        disabled={library.length < 2}
        className={classes.sortMenuButton}
        aria-haspopup="true"
        aria-controls="sort-menu"
        aria-label="Sort Sources"
        onClick={onOpenSortMenu}
        size="medium"
      >
        <SortIcon className={classes.icon} />
      </Fab>
      <Menu
        id="sort-menu"
        elevation={1}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        anchorEl={menuAnchorEl}
        keepMounted
        classes={{ paper: classes.sortMenu }}
        open={openMenu === MO.sort}
        onClose={onCloseDialog}
      >
        {Object.values(SF)
          .filter((sf) => sf !== SF.random)
          .map((sf) => (
            <MenuItem key={sf}>
              <ListItemText primary={en.get(sf)} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    dispatch(sortSources(sf, true))
                  }}
                  size="large"
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => {
                    dispatch(sortSources(sf, false))
                  }}
                  size="large"
                >
                  <ArrowDownwardIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </MenuItem>
          ))}
        <MenuItem key={SF.random}>
          <ListItemText primary={en.get(SF.random)} />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={() => {
                dispatch(sortSources(SF.random, true))
              }}
              size="large"
            >
              <ShuffleIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </MenuItem>
      </Menu>

      <GooninatorDialog
        open={openMenu == MO.gooninatorImport}
        onImportURL={onAddSource}
        onClose={onCloseDialog}
      />
      <URLDialog
        open={openMenu === MO.urlImport}
        onImportURL={onAddSource}
        onClose={onCloseDialog}
      />
      <Dialog
        classes={{ paper: classes.noScroll }}
        open={openMenu === MO.batchTag}
        onClose={onCloseDialog}
        aria-labelledby="batch-tag-title"
        aria-describedby="batch-tag-description"
      >
        <DialogTitle id="batch-tag-title">Batch Tag</DialogTitle>
        <DialogContent className={classes.noScroll}>
          <DialogContentText id="batch-tag-description">
            Choose tags to add, remove, or overwrite on the selected source(s)
          </DialogContentText>
          {openMenu === MO.batchTag && (
            <LibrarySearch
              displaySources={library}
              filters={selectedTags}
              placeholder={'Tag These Sources'}
              isClearable
              onlyTags
              showCheckboxes
              hideSelectedOptions={false}
              onUpdateFilters={onSelectTags}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            disabled={selectedTags && selectedTags.length === 0}
            onClick={batchTagRemove}
            color="secondary"
          >
            - Remove
          </Button>
          <Button
            disabled={selectedTags && selectedTags.length === 0}
            onClick={batchTagAdd}
            color="secondary"
          >
            + Add
          </Button>
          <Button onClick={batchTagOverwrite} color="primary">
            Overwrite
          </Button>
        </DialogActions>
      </Dialog>
      <BatchClipDialog
        open={openMenu === MO.batchClip}
        selected={selected}
        onCloseDialog={onCloseDialog}
      />
      <Dialog
        open={moveDialog}
        onClose={onCloseMoveDialog}
        aria-describedby="move-description"
      >
        <DialogTitle id="move-title">Localize Offline Sources</DialogTitle>
        <DialogContent>
          <DialogContentText id="move-description">
            You are about to convert all offline sources to local sources. Any
            cached images will be moved to a local directory. Offline sources
            without cached images will be removed from the Library.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseMoveDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={onFinishMove} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

;(Library as any).displayName = 'Library'
export default Library

import React, {
  ChangeEvent,
  MouseEvent,
  useEffect,
  useState,
  useRef,
  useCallback
} from 'react'
import { cx } from '@emotion/css'

import {
  AppBar,
  Backdrop,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  LinearProgress,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Tab,
  Tabs,
  TextField,
  type Theme,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AddIcon from '@mui/icons-material/Add'
import AlbumIcon from '@mui/icons-material/Album'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import CancelIcon from '@mui/icons-material/Cancel'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import EditIcon from '@mui/icons-material/Edit'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import GetAppIcon from '@mui/icons-material/GetApp'
import HttpIcon from '@mui/icons-material/Http'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import SelectAllIcon from '@mui/icons-material/SelectAll'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import SortIcon from '@mui/icons-material/Sort'

import { red } from '@mui/material/colors'

import { getCachePath } from '../../data/utils'
import { en, AF, ASF, ALT, MO, SP, PR } from 'flipflip-common'
import type Audio from '../../store/audio/Audio'
import LibrarySearch from './LibrarySearch'
import AudioSourceList from './AudioSourceList'
import AudioArtistList from './AudioArtistList'
import AudioAlbumList from './AudioAlbumList'
import PlaylistSelect from '../configGroups/PlaylistSelect'
import PlaylistList from './PlaylistList'
import AudioEdit from './AudioEdit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectAppConfigCachingDirectory,
  selectAppSpecialMode,
  selectAppTutorial,
  selectAppAudios,
  selectAppAudioOpenTab,
  selectAppAudioFilters,
  selectAppAudioSelected,
  selectAppProgressMode,
  selectAppProgressCurrent,
  selectAppProgressTotal,
  selectAppTagsCount,
  selectAppAudioSelectedTagNames
} from '../../store/app/selectors'
import {
  setProgressMode,
  setAudioOpenTab,
  setAudioFilters,
  setAudioSelected,
  addToPlaylist,
  batchEdit,
  manageTags,
  setAudios,
  removeAudios,
  batchTag
} from '../../store/app/slice'
import {
  sortAudioSources,
  doneTutorial,
  addPlaylist,
  removePlaylist,
  sortPlaylist,
  detectBPMs
} from '../../store/app/thunks'
import {
  onAddAudioUrl,
  onAddAudioSources,
  importAudioFromLibrary,
  setAudiosRemoveTags,
  setAudiosAddTags,
  setAudiosTags,
  setAudiosChangeKeys,
  toggleAudiosMarked
} from '../../store/audio/thunks'
import {
  selectAudioLibraryDisplaySources,
  selectAudioLibraryLoadingMetadata,
  selectAudioLibraryLoadingSources,
  selectAudioLibraryError,
  selectAudioLibraryOpenMenu,
  selectAudioLibraryPlaylistID,
  selectAudioLibrarySelectedTags,
  selectCommonAudio
} from '../../store/audioLibrary/selectors'
import {
  setLoadingSources,
  setOpenMenu,
  setSelectedTags
} from '../../store/audioLibrary/slice'
import {
  setPlaylistAddAudios,
  setPlaylistAddAudiosUnique
} from '../../store/playlist/slice'
import {
  changePlaylistId,
  closeDialog,
  goBack
} from '../../store/audioLibrary/thunks'
import flipflip from '../../FlipFlipService'

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
    minWidth: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
      minWidth: theme.spacing(9)
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
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default
  },
  container: {
    height: '100%',
    padding: theme.spacing(0),
    overflowY: 'auto'
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
  addLocalButton: {
    marginBottom: 115
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
  playlistMenu: {
    minHeight: 365,
    minWidth: 250
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
  },
  urlDialog: {
    width: '100%'
  },
  progress: {
    position: 'absolute',
    right: 20
  },
  error: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700]
    }
  },
  tabSection: {
    height: '100%'
  },
  tabPanel: {
    display: 'flex',
    height: '100%'
  },
  tab: {
    width: drawerWidth,
    height: theme.spacing(12),
    transition: theme.transitions.create(
      ['width', 'margin', 'background', 'opacity'],
      {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      }
    ),
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      opacity: 1,
      transition: theme.transitions.create(['background', 'opacity'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    }
  },
  tabClose: {
    minWidth: 0,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9)
    }
  },
  playlistsTab: {
    ariaControls: 'vertical-tabpanel-0'
  },
  artistsTab: {
    ariaControls: 'vertical-tabpanel-1'
  },
  albumsTab: {
    ariaControls: 'vertical-tabpanel-2'
  },
  songsTab: {
    ariaControls: 'vertical-tabpanel-3'
  },
  addProgress: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    zIndex: 1
  }
}))

function AudioLibrary() {
  const dispatch = useAppDispatch()
  const tagsCount = useAppSelector(selectAppTagsCount())
  const tutorial = useAppSelector(selectAppTutorial())
  const audios = useAppSelector(selectAppAudios())
  const openTab = useAppSelector(selectAppAudioOpenTab())
  const filters = useAppSelector(selectAppAudioFilters())
  const selected = useAppSelector(selectAppAudioSelected())
  const specialMode = useAppSelector(selectAppSpecialMode())
  const cachingDirectory = useAppSelector(selectAppConfigCachingDirectory())
  const progressMode = useAppSelector(selectAppProgressMode())
  const progressCurrent = useAppSelector(selectAppProgressCurrent())
  const progressTotal = useAppSelector(selectAppProgressTotal())
  const displaySources = useAppSelector(selectAudioLibraryDisplaySources())
  const loadingMetadata = useAppSelector(selectAudioLibraryLoadingMetadata())
  const loadingSources = useAppSelector(selectAudioLibraryLoadingSources())
  const error = useAppSelector(selectAudioLibraryError())
  const openMenu = useAppSelector(selectAudioLibraryOpenMenu())
  const playlistID = useAppSelector(selectAudioLibraryPlaylistID())
  const selectedTags = useAppSelector(selectAudioLibrarySelectedTags())
  const commonAudio = useAppSelector(selectCommonAudio())
  const selectedTagNames = useAppSelector(selectAppAudioSelectedTagNames())

  const [cachePath, setCachePath] = useState<string>('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [importURL, setImportURL] = useState<string>()

  const _menuAnchorEl = useRef<any>()

  const toggleMarked = useCallback(() => {
    dispatch(toggleAudiosMarked(displaySources))
  }, [dispatch, displaySources])

  useEffect(() => {
    getCachePath(cachingDirectory)
      .then((path) => path ?? '')
      .then(setCachePath)

    // Use alt+M to toggle highlighting  sources
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        !e.shiftKey &&
        !e.ctrlKey &&
        e.altKey &&
        (e.key === 'm' || e.key === 'µ')
      ) {
        toggleMarked()
      } else if (e.key === 'Escape' && specialMode != null) {
        dispatch(goBack())
      }
    }

    window.addEventListener('keydown', onKeyDown, false)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [cachingDirectory, dispatch, specialMode, toggleMarked])

  useEffect(() => {
    getCachePath(cachingDirectory)
      .then((path) => path ?? '')
      .then(setCachePath)
  }, [cachingDirectory])

  useEffect(() => {
    if (tutorial === ALT.final && drawerOpen) {
      setDrawerOpen(false)
    }
  }, [tutorial, drawerOpen])

  const onChangeTab = (e: any, newTab: number) => {
    if (newTab !== openTab) {
      dispatch(setAudioOpenTab(newTab))
    }
  }

  const onClickPlaylist = (playlist: string) => {
    dispatch(setAudioOpenTab(3))
    dispatch(setAudioFilters(['playlist:' + playlist]))
  }

  const onClickArtist = (artist: string) => {
    dispatch(setAudioOpenTab(2))
    dispatch(
      setAudioFilters(
        filters
          .filter((f) => !f.startsWith('album:') && !f.startsWith('artist:'))
          .concat(['artist:' + artist])
      )
    )
  }

  const onClickAlbum = (album: string) => {
    dispatch(setAudioOpenTab(3))
    dispatch(
      setAudioFilters(
        filters
          .filter((f) => !f.startsWith('album:') && !f.startsWith('artist:'))
          .concat(['album:' + album])
      )
    )
  }

  const onAddToPlaylist = () => {
    onCloseDialog()
    dispatch(addToPlaylist())
  }

  const onBatchTag = () => {
    onCloseDialog()
    dispatch(batchTag())
  }

  const onBatchEdit = () => {
    onCloseDialog()
    dispatch(batchEdit())
  }

  const onUpdateFilters = (filters: string[]) =>
    dispatch(setAudioFilters(filters))

  const onURLChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImportURL(e.target.value)
  }

  const onAddSource = async (type: string, e: MouseEvent) => {
    onCloseDialog()
    switch (type) {
      case AF.url:
        dispatch(setOpenMenu(MO.urlImport))
        setImportURL('')
        break
      case AF.audios:
        const audioSources = await flipflip().api.loadAudioSources(e.shiftKey)
        if (audioSources) {
          dispatch(setLoadingSources(true))
          addAudioSources(audioSources)
        }
        break
    }
  }

  const onAddURL = () => {
    dispatch(onAddAudioUrl(importURL as string, cachePath as string))
    onCloseDialog()
  }

  const addAudioSources = (newSources: string[]) => {
    dispatch(onAddAudioSources(newSources, cachePath as string))
  }

  const onToggleBatchTagModal = () => {
    if (openMenu === MO.batchTag) {
      dispatch(setOpenMenu(undefined))
      dispatch(setSelectedTags([]))
    } else {
      dispatch(setOpenMenu(MO.batchTag))
      dispatch(setSelectedTags(selectedTagNames))
    }
  }

  const onShowBatchEditModal = () => {
    dispatch(setOpenMenu(MO.batchEdit))
  }

  const onTogglePlaylistDialog = (e: MouseEvent) => {
    if (openMenu === MO.playlist) {
      _menuAnchorEl.current = null
      dispatch(setOpenMenu(undefined))
    } else {
      _menuAnchorEl.current = e.currentTarget
      dispatch(setOpenMenu(MO.playlist))
    }
  }

  const onChoosePlaylist = (playlistID: number) => {
    dispatch(changePlaylistId(playlistID))
  }

  const onSkipDuplicates = () => {
    dispatch(
      setPlaylistAddAudiosUnique({ id: playlistID as number, value: selected })
    )
    dispatch(goBack())
    onCloseDialog()
  }

  const onAddDuplicates = () => {
    dispatch(
      setPlaylistAddAudios({ id: playlistID as number, value: selected })
    )
    dispatch(goBack())
    onCloseDialog()
  }

  const onAddPlaylist = () => {
    dispatch(addPlaylist(importURL as string, selected))
    dispatch(goBack())
    onCloseDialog()
  }

  const onSelectTags = (selectedTags: string[]) => {
    dispatch(setSelectedTags(selectedTags))
  }

  const onToggleDrawer = () => {
    if (tutorial === ALT.sidebar1) {
      dispatch(doneTutorial(ALT.sidebar1))
    }
    setDrawerOpen(!drawerOpen)
  }

  const onToggleNewMenu = () => {
    dispatch(setOpenMenu(openMenu === MO.new ? undefined : MO.new))
  }

  const onOpenSortMenu = (e: MouseEvent) => {
    _menuAnchorEl.current = e.currentTarget
    dispatch(setOpenMenu(MO.sort))
  }

  const onCloseDialog = () => {
    _menuAnchorEl.current = null
    dispatch(closeDialog())
  }

  const onRemoveAll = () => {
    dispatch(setOpenMenu(MO.removeAllAlert))
  }

  const onFinishRemoveAll = () => {
    dispatch(setAudios([]))
    onCloseDialog()
  }

  const onFinishRemovePlaylist = () => {
    const playlistName = filters
      .find((f) => f.startsWith('playlist:'))
      ?.replace('playlist:', '') as string
    dispatch(removePlaylist(playlistName))
    onCloseDialog()
    dispatch(setAudioFilters([]))
  }

  const onFinishRemoveVisible = () => {
    dispatch(removeAudios(displaySources))
    onCloseDialog()
    dispatch(setAudioFilters([]))
  }

  const onImportFromLibrary = () => {
    dispatch(importAudioFromLibrary(selected))
  }
  const onUpdateSelected = (selected: number[]) =>
    dispatch(setAudioSelected(selected))
  const onSelectAll = () => dispatch(setAudioSelected(displaySources))
  const onSelectNone = () =>
    dispatch(
      setAudioSelected(selected.filter((id) => !displaySources.includes(id)))
    )

  const onFinishBatchEdit = (common: Audio) => {
    const keys = ['thumb', 'name', 'artist', 'album', 'comment', 'trackNum']
    dispatch(setAudiosChangeKeys(selected, keys, common))
    onCloseDialog()
  }

  const batchTagOverwrite = () => {
    dispatch(setAudiosTags(selected, selectedTags))
    onCloseDialog()
  }

  const batchTagAdd = () => {
    dispatch(setAudiosAddTags(selected, selectedTags))
    onCloseDialog()
  }

  const batchTagRemove = () => {
    dispatch(setAudiosRemoveTags(selected, selectedTags))
    onCloseDialog()
  }

  const { classes } = useStyles()
  const open = drawerOpen
  const playlist = filters
    .find((f) => f.startsWith('playlist:'))
    ?.replace('playlist:', '')
  return (
    <div className={classes.root}>
      <AppBar
        enableColorOnDark
        position="absolute"
        className={cx(
          classes.appBar,
          tutorial === ALT.toolbar && cx(classes.backdropTop, classes.disable)
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
                onClick={() => {
                  dispatch(goBack())
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
            Audio Library
          </Typography>

          <div className={classes.headerRight}>
            <div
              className={cx(
                classes.searchBar,
                tutorial === ALT.toolbar && classes.highlight
              )}
            >
              {audios.length > 0 && (
                <Chip
                  className={classes.searchCount}
                  label={audios.length}
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
                isAudio
                isCreatable
                onlyUsed
                noTypes
                onUpdateFilters={onUpdateFilters}
              />
            </div>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        className={cx(
          classes.drawer,
          (tutorial === ALT.sidebar1 ||
            tutorial === ALT.sidebar2 ||
            drawerOpen) &&
            classes.backdropTop,
          tutorial === ALT.sidebar2 && classes.highlight
        )}
        variant="permanent"
        classes={{
          paper: cx(classes.drawerPaper, !open && classes.drawerPaperClose)
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
            className={cx(tutorial === ALT.sidebar1 && classes.highlight)}
            onClick={onToggleDrawer}
            size="large"
          >
            <MenuIcon className={classes.drawerIcon} />
          </IconButton>
        </ListItem>

        <Divider />

        <div>
          <Tabs
            orientation="vertical"
            value={openTab}
            onChange={onChangeTab}
            aria-label="audio library tabs"
            className={classes.tabs}
          >
            <Tab
              id="vertical-tab-0"
              aria-controls="vertical-tabpanel-0"
              icon={<QueueMusicIcon />}
              label={open ? 'Playlists' : ''}
              className={cx(
                classes.tab,
                classes.playlistsTab,
                !open && classes.tabClose
              )}
            />
            <Tab
              id="vertical-tab-1"
              aria-controls="vertical-tabpanel-1"
              icon={<PersonIcon />}
              label={open ? 'Artists' : ''}
              className={cx(
                classes.tab,
                classes.artistsTab,
                !open && classes.tabClose
              )}
            />
            <Tab
              id="vertical-tab-2"
              aria-controls="vertical-tabpanel-2"
              icon={<AlbumIcon />}
              label={open ? 'Albums' : ''}
              className={cx(
                classes.tab,
                classes.albumsTab,
                !open && classes.tabClose
              )}
            />
            <Tab
              id="vertical-tab-3"
              aria-controls="vertical-tabpanel-3"
              icon={<AudiotrackIcon />}
              label={open ? 'Songs' : ''}
              className={cx(
                classes.tab,
                classes.songsTab,
                !open && classes.tabClose
              )}
            />
          </Tabs>
        </div>

        <Divider />

        <div className={cx(tutorial != null && classes.disable)}>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Manage Tags'}>
            <ListItemButton
              onClick={() => dispatch(manageTags())}
              disabled={specialMode != null}
            >
              <ListItemIcon>
                <LocalOfferIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Tags" />
              {tagsCount > 0 && (
                <Chip
                  className={cx(classes.chip, !open && classes.chipClose)}
                  label={tagsCount}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </ListItemButton>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Add to Playlist'}
          >
            <ListItemButton
              onClick={onAddToPlaylist}
              disabled={specialMode != null}
            >
              <ListItemIcon>
                <PlaylistAddIcon />
              </ListItemIcon>
              <ListItemText primary="Add to Playlist" />
            </ListItemButton>
          </Tooltip>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Batch Tag'}>
            <ListItemButton onClick={onBatchTag} disabled={specialMode != null}>
              <ListItemIcon>
                <FormatListBulletedIcon />
              </ListItemIcon>
              <ListItemText primary="Batch Tag" />
            </ListItemButton>
          </Tooltip>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Batch Edit'}>
            <ListItemButton
              onClick={onBatchEdit}
              disabled={specialMode != null}
            >
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary="Batch Edit" />
            </ListItemButton>
          </Tooltip>
        </div>

        <Divider />

        <div className={cx(tutorial != null && classes.disable)}>
          <Tooltip disableInteractive title={'BPM Detection'}>
            <ListItemButton
              disabled={progressMode != null}
              onClick={() => {
                dispatch(detectBPMs())
              }}
            >
              <ListItemIcon>
                <SvgIcon viewBox="0 0 24 24" fontSize="small">
                  <path d="M12,1.75L8.57,2.67L4.07,19.5C4.06,19.5 4,19.84 4,20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20C20,19.84 19.94,19.5 19.93,19.5L15.43,2.67L12,1.75M10.29,4H13.71L17.2,17H13V12H11V17H6.8L10.29,4M11,5V9H10V11H14V9H13V5H11Z" />
                </SvgIcon>
              </ListItemIcon>
              <ListItemText primary="BPM Detection" />
            </ListItemButton>
          </Tooltip>
        </div>

        {progressMode != null && (
          <React.Fragment>
            <Divider />

            <div>
              <Tooltip
                disableInteractive
                title={drawerOpen ? '' : 'Cancel BPM Detection'}
              >
                <ListItemButton
                  onClick={() => dispatch(setProgressMode(PR.cancel))}
                >
                  <ListItemIcon>
                    <CancelIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary={'Cancel BPM Detection'} />
                </ListItemButton>
              </Tooltip>
              <LinearProgress
                variant="determinate"
                value={Math.round((progressCurrent / progressTotal) * 100)}
              />
            </div>
          </React.Fragment>
        )}

        <div className={classes.fill} />
      </Drawer>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth={false} className={classes.container}>
          {openTab === 0 && (
            <Typography component="div">
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box p={2} className={classes.fill}>
                  <PlaylistList
                    showHelp={!specialMode && filters.length === 0}
                    onClickPlaylist={onClickPlaylist}
                  />
                </Box>
              </div>
            </Typography>
          )}

          {openTab === 1 && (
            <Typography className={classes.tabSection} component="div">
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box p={2} className={classes.fill}>
                  <AudioArtistList
                    sources={displaySources}
                    showHelp={!specialMode && filters.length === 0}
                    onClickArtist={onClickArtist}
                  />
                </Box>
              </div>
            </Typography>
          )}

          {openTab === 2 && (
            <Typography className={classes.tabSection} component="div">
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box p={2} className={classes.fill}>
                  <AudioAlbumList
                    sources={displaySources}
                    showHelp={!specialMode && filters.length === 0}
                    onClickAlbum={onClickAlbum}
                    onClickArtist={onClickArtist}
                  />
                </Box>
              </div>
            </Typography>
          )}

          {openTab === 3 && (
            <Typography className={classes.tabSection} component="div">
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box className={classes.fill}>
                  <AudioSourceList
                    cachePath={cachePath}
                    isSelect={!!specialMode}
                    selected={selected}
                    showHelp={!specialMode && filters.length === 0}
                    audios={displaySources}
                    playlist={playlist}
                    onClickAlbum={onClickAlbum}
                    onClickArtist={onClickArtist}
                    onUpdateSelected={onUpdateSelected}
                  />
                </Box>
              </div>
            </Typography>
          )}
        </Container>
      </main>

      <Backdrop
        className={classes.backdrop}
        onClick={onCloseDialog}
        open={tutorial == null && (openMenu === MO.new || drawerOpen)}
      />

      {specialMode && openTab === 3 && (
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
          {specialMode === SP.batchTag && (
            <Tooltip disableInteractive title={'Batch Tag'} placement="top-end">
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
                  onClick={onToggleBatchTagModal}
                  size="large"
                >
                  <LocalOfferIcon className={classes.icon} />
                </Fab>
              </Badge>
            </Tooltip>
          )}
          {specialMode === SP.batchEdit && (
            <Tooltip
              disableInteractive
              title={'Batch Edit'}
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
                  onClick={onShowBatchEditModal}
                  size="large"
                >
                  <EditIcon className={classes.icon} />
                </Fab>
              </Badge>
            </Tooltip>
          )}
          {specialMode === SP.addToPlaylist && (
            <Tooltip
              disableInteractive
              title={'Add to Playlist'}
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
                  onClick={onTogglePlaylistDialog}
                  size="large"
                >
                  <PlaylistAddIcon className={classes.icon} />
                </Fab>
              </Badge>
            </Tooltip>
          )}
          {specialMode === SP.select && (
            <Tooltip disableInteractive title={'Import'} placement="top-end">
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
                  onClick={onImportFromLibrary}
                  size="large"
                >
                  <GetAppIcon className={classes.icon} />
                </Fab>
              </Badge>
            </Tooltip>
          )}
        </React.Fragment>
      )}

      {!specialMode && openTab === 3 && (
        <React.Fragment>
          {audios.length > 0 && (
            <Tooltip
              disableInteractive
              title={
                filters.length === 0
                  ? 'Delete All Sources'
                  : playlist
                    ? 'Delete Playlist'
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
            open={openMenu === MO.removeAllAlert}
            onClose={onCloseDialog}
            aria-labelledby="remove-all-title"
            aria-describedby="remove-all-description"
          >
            {filters.length === 0 && (
              <React.Fragment>
                <DialogTitle id="remove-all-title">
                  Delete Audio Library
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you really wanna delete your entire audio
                    library...? ಠ_ಠ
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
            {filters.length > 0 && !playlist && (
              <React.Fragment>
                <DialogTitle id="remove-all-title">Delete Sources</DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you want to remove these sources from your
                    audio library?
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
            {filters.length > 0 && playlist && (
              <React.Fragment>
                <DialogTitle id="remove-all-title">Delete Playlist</DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you want to delete this playlist?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={onCloseDialog} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={onFinishRemovePlaylist} color="primary">
                    Confirm
                  </Button>
                </DialogActions>
              </React.Fragment>
            )}
          </Dialog>
          <Tooltip
            disableInteractive
            title={filters.length > 0 ? '' : 'Local Audio'}
            placement="left"
          >
            <Fab
              className={cx(
                classes.addButton,
                classes.addLocalButton,
                openMenu !== MO.new && classes.addButtonClose,
                openMenu === MO.new && classes.backdropTop,
                filters.length > 0 && classes.hidden
              )}
              disabled={filters.length > 0}
              onClick={(e: MouseEvent) => onAddSource(AF.audios, e)}
              size="small"
            >
              <AudiotrackIcon className={classes.icon} />
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
              onClick={(e: MouseEvent) => onAddSource(AF.url, e)}
              size="small"
            >
              <HttpIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          {loadingSources && (
            <CircularProgress
              size={60}
              color="secondary"
              className={classes.addProgress}
            />
          )}
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

      {openTab === 3 && (
        <React.Fragment>
          <Fab
            disabled={audios.length < 2}
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
            anchorEl={_menuAnchorEl.current}
            keepMounted
            classes={{ paper: classes.sortMenu }}
            open={openMenu === MO.sort}
            onClose={onCloseDialog}
          >
            {Object.values(ASF)
              .filter((f) => f !== ASF.trackNum && f !== ASF.random)
              .map((sf) => (
                <MenuItem key={sf}>
                  <ListItemText primary={en.get(sf)} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        playlist
                          ? dispatch(sortPlaylist(playlist, sf, true))
                          : dispatch(sortAudioSources(sf, true))
                      }}
                      size="large"
                    >
                      <ArrowUpwardIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        playlist
                          ? dispatch(sortPlaylist(playlist, sf, false))
                          : dispatch(sortAudioSources(sf, false))
                      }}
                      size="large"
                    >
                      <ArrowDownwardIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </MenuItem>
              ))}
            <MenuItem key={ASF.random}>
              <ListItemText primary={en.get(ASF.random)} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    playlist
                      ? dispatch(sortPlaylist(playlist, ASF.random, true))
                      : dispatch(sortAudioSources(ASF.random, true))
                  }}
                  size="large"
                >
                  <ShuffleIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </MenuItem>
          </Menu>
        </React.Fragment>
      )}

      {openMenu === MO.urlImport && (
        <Dialog
          classes={{ paper: cx(classes.noScroll, classes.urlDialog) }}
          open={openMenu === MO.urlImport}
          onClose={onCloseDialog}
          aria-labelledby="add-url-title"
        >
          <DialogTitle id="add-url-title">Add Audio URL</DialogTitle>
          <DialogContent className={classes.noScroll}>
            <DialogContentText id="add-url-description">
              Enter the URL of the audio file:
            </DialogContentText>
            <TextField
              variant="standard"
              label="Audio URL"
              fullWidth
              placeholder="Paste URL Here"
              margin="dense"
              value={importURL == null ? '' : importURL}
              onChange={onURLChange}
            />
          </DialogContent>
          <DialogActions>
            {loadingMetadata && (
              <CircularProgress size={34} className={classes.progress} />
            )}
            <Button
              className={cx(error && classes.error)}
              onClick={onAddURL}
              color="primary"
            >
              Import
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {openMenu === MO.playlist && (
        <Menu
          elevation={1}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          anchorEl={_menuAnchorEl.current}
          keepMounted
          classes={{ paper: classes.playlistMenu }}
          open={openMenu === MO.playlist}
          onClose={onCloseDialog}
        >
          <PlaylistSelect menuIsOpen autoFocus onChange={onChoosePlaylist} />
        </Menu>
      )}

      {openMenu === MO.newPlaylist && (
        <Dialog
          classes={{ paper: cx(classes.noScroll, classes.urlDialog) }}
          open={true}
          onClose={onCloseDialog}
          aria-labelledby="add-playlist-title"
        >
          <DialogTitle id="add-playist-title">New Playlist</DialogTitle>
          <DialogContent className={classes.noScroll}>
            <TextField
              variant="standard"
              label="Name"
              fullWidth
              placeholder="Name your playlist"
              margin="dense"
              value={importURL == null ? '' : importURL}
              onChange={onURLChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={onAddPlaylist} color="primary">
              Create Playlist
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {openMenu === MO.playlistDuplicates && (
        <Dialog
          classes={{ paper: cx(classes.noScroll, classes.urlDialog) }}
          open={true}
          onClose={onCloseDialog}
          aria-labelledby="duplicate-title"
        >
          <DialogTitle id="duplicate-title">Add duplicate songs?</DialogTitle>
          <DialogContent className={classes.noScroll}>
            Some of these songs are already in this playlist
          </DialogContent>
          <DialogActions>
            <Button onClick={onSkipDuplicates} color="secondary">
              Skip Duplicates
            </Button>
            <Button onClick={onAddDuplicates} color="primary">
              Add Anyway
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {openMenu === MO.batchEdit && (
        <AudioEdit
          audio={commonAudio}
          cachePath={cachePath}
          title={'Batch Edit song info'}
          onCancel={onCloseDialog}
          onFinishEdit={onFinishBatchEdit}
        />
      )}

      {openMenu === MO.batchTag && (
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
                displaySources={audios}
                filters={selectedTags}
                placeholder={'Tag These Sources'}
                isAudio
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
      )}
    </div>
  )
}

;(AudioLibrary as any).displayName = 'AudioLibrary'
export default AudioLibrary

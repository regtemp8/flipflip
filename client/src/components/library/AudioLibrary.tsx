import {
  ChangeEvent,
  MouseEvent,
  useEffect,
  useState,
  useRef,
  useCallback
} from 'react'
import { cx } from '@emotion/css'
import { Route, Routes, useNavigate, useLocation } from 'react-router'

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
  ListItemText,
  Menu,
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

import { en, AF, ASF, ALT, MO, SP, BatchTagOperation } from 'flipflip-common'
import LibrarySearch from './LibrarySearch'
import AudioSourceList from './AudioSourceList'
import AudioArtistList from './AudioArtistList'
import AudioAlbumList from './AudioAlbumList'
import PlaylistList from './PlaylistList'
import AudioEdit from './AudioEdit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectSpecialMode } from '../../store/app/selectors'
import {
  useBatchTagAudiosMutation,
  useCreateAudiosMutation,
  useGetAudioBatchTagOptionsQuery,
  useGetAudioSearchOptionsQuery,
  useGetAudiosQuery,
  useGetFilteredAudiosQuery,
  useSortAudiosMutation,
  useMarkAudiosMutation,
  useDeleteAudiosMutation
} from '../../store/api/slice'
import {
  selectAudioLibrarySelectedTagIDs,
  selectLibrarySelectedTagNames
} from '../../store/api/selectors'
import FilePicker from '../common/FilePicker'
import { setAudioLibraryFilters } from '../../store/audioLibrary/slice'
import { selectAudioLibraryFilters } from '../../store/audioLibrary/selectors'
import { editAudioEdit } from '../../store/audioEdit/thunks'
import { saveAudioLibraryYOffset } from '../../store/audioLibrary/thunks'
import { setSpecialMode } from '../../store/app/slice'

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
    alignItems: 'center',
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

const tabRoutes = [
  '/audio-library/playlists',
  '/audio-library/artists',
  '/audio-library/albums',
  '/audio-library/tracks'
]
const getOpenTab = (pathname: string) => {
  const index = tabRoutes.findIndex((tab) => tab === pathname)
  return pathname.startsWith('/audio-library') && index === -1
    ? tabRoutes.length - 1
    : index
}

interface PlaylistsTabProps {
  specialMode?: string
  filters: string[]
  displaySources: number[]
  onClickPlaylist: (playlist: string) => void
}

function PlaylistsTab(props: PlaylistsTabProps) {
  const { classes } = useStyles()
  const { specialMode, filters, onClickPlaylist } = props
  return (
    <Box p={2} className={classes.fill}>
      <PlaylistList
        showHelp={!specialMode && filters.length === 0}
        onClickPlaylist={onClickPlaylist}
      />
    </Box>
  )
}

interface ArtistsTabProps {
  specialMode?: string
  filters: string[]
  displaySources: number[]
  onClickArtist: (artist: string) => void
}

function ArtistsTab(props: ArtistsTabProps) {
  const { classes } = useStyles()
  const { specialMode, filters, displaySources, onClickArtist } = props
  return (
    <Box p={2} className={classes.fill}>
      <AudioArtistList
        sources={displaySources ?? []}
        showHelp={!specialMode && filters.length === 0}
        onClickArtist={onClickArtist}
      />
    </Box>
  )
}

interface AlbumsTabProps {
  specialMode?: string
  filters: string[]
  displaySources: number[]
  onClickAlbum: (album: string) => void
  onClickArtist: (artist: string) => void
}

function AlbumsTab(props: AlbumsTabProps) {
  const { classes } = useStyles()
  const { specialMode, filters, displaySources, onClickAlbum, onClickArtist } =
    props
  return (
    <Box p={2} className={classes.fill}>
      <AudioAlbumList
        sources={displaySources ?? []}
        showHelp={!specialMode && filters.length === 0}
        onClickAlbum={onClickAlbum}
        onClickArtist={onClickArtist}
      />
    </Box>
  )
}

interface TracksTabProps {
  cachePath: string
  specialMode?: string
  selected: number[]
  filters: string[]
  audios: number[]
  displaySources: number[]
  playlist?: string
  onClickAlbum: (album: string) => void
  onClickArtist: (artist: string) => void
  onUpdateSelected: (selected: number[]) => void
}

function TracksTab(props: TracksTabProps) {
  const { classes } = useStyles()
  const {
    cachePath,
    specialMode,
    selected,
    filters,
    audios,
    displaySources,
    playlist,
    onClickAlbum,
    onClickArtist,
    onUpdateSelected
  } = props
  return (
    <Box className={classes.fill}>
      <AudioSourceList
        cachePath={cachePath}
        isSelect={!!specialMode}
        selected={selected}
        showHelp={!specialMode && filters.length === 0}
        audios={audios}
        filters={filters}
        sources={displaySources}
        playlist={playlist}
        onClickAlbum={onClickAlbum}
        onClickArtist={onClickArtist}
        onUpdateSelected={onUpdateSelected}
      />
    </Box>
  )
}

function AudioLibrary() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [createAudios] = useCreateAudiosMutation()
  const [sortAudios] = useSortAudiosMutation()
  const [batchTagAudios] = useBatchTagAudiosMutation()
  const [markAudios] = useMarkAudiosMutation()
  // const { data: tutorials } = useGetTutorialsQuery()
  const { data: audios } = useGetAudiosQuery()
  const { data: tagOptions } = useGetAudioBatchTagOptionsQuery()
  const { data: searchOptions } = useGetAudioSearchOptionsQuery()

  const openTab = getOpenTab(location.pathname)
  const tutorial = undefined
  const playlistId = undefined
  const tagsCount = 0
  const specialMode = useAppSelector(selectSpecialMode())
  const progressMode = ''
  const progressCurrent = 0
  const progressTotal = 100
  const loadingSources = false
  const loadingMetadata = false
  const error = false

  const [openMenu, setOpenMenu] = useState<string>()
  const [cachePath, _setCachePath] = useState<string>('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [importURL, setImportURL] = useState<string>()

  const _menuAnchorEl = useRef<any>()

  const selectedTagIDs = useAppSelector(
    selectAudioLibrarySelectedTagIDs(selected)
  )
  const selectedTagNames = useAppSelector(
    selectLibrarySelectedTagNames(selectedTagIDs)
  )
  const filters = useAppSelector(selectAudioLibraryFilters())
  const { data: displaySources } = useGetFilteredAudiosQuery(filters)
  const [deleteAudios] = useDeleteAudiosMutation()

  const goBack = useCallback(() => {
    const modes = [SP.batchTag, SP.batchEdit, SP.addToPlaylist]
    if (specialMode != null && modes.includes(specialMode)) {
      setSelected([])
      setSelectedTags([])
    }

    if (specialMode === SP.batchTag) {
      onBatchTag()
    } else if (specialMode === SP.batchEdit) {
      onBatchEdit()
    } else if (specialMode === SP.addToPlaylist) {
      onAddToPlaylist()
    } else {
      dispatch(saveAudioLibraryYOffset())
      navigate(-1)
    }

    dispatch(setSpecialMode(undefined))
  }, [dispatch, specialMode])

  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      if (
        !e.shiftKey &&
        !e.ctrlKey &&
        e.altKey &&
        (e.key === 'm' || e.key === 'µ') &&
        displaySources != null
      ) {
        await markAudios(displaySources)
      } else if (e.key === 'Escape' && specialMode) {
        goBack()
      }
    }

    window.addEventListener('keydown', onKeyDown, false)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [goBack, specialMode, markAudios, displaySources])

  // useEffect(() => {
  //   getCachePath(cachingDirectory)
  //     .then((path) => path ?? '')
  //     .then(setCachePath)
  // }, [cachingDirectory])

  useEffect(() => {
    if (tutorial === ALT.final && drawerOpen) {
      setDrawerOpen(false)
    }
  }, [tutorial, drawerOpen])

  const onClickPlaylist = (_playlist: string) => {
    // dispatch(setAudioOpenTab(3))
    // dispatch(setAudioFilters(['playlist:' + playlist]))
  }

  const onClickArtist = (artist: string) => {
    const newFilters = filters.filter(
      (f) => !f.startsWith('album:') && !f.startsWith('artist:')
    )
    newFilters.push('artist:' + artist)
    dispatch(setAudioLibraryFilters(newFilters))
    gotoTracksTab()
  }

  const onClickAlbum = (album: string) => {
    const newFilters = filters.filter(
      (f) => !f.startsWith('album:') && !f.startsWith('artist:')
    )
    newFilters.push('album:' + album)
    dispatch(setAudioLibraryFilters(newFilters))
    gotoTracksTab()
  }

  const gotoTracksTab = () => {
    if (openTab != 3) {
      navigate(tabRoutes[3], { replace: true })
    }
  }

  const onAddToPlaylist = () => {
    onCloseDialog()
    dispatch(setSpecialMode(SP.addToPlaylist))
    gotoTracksTab()
    // dispatch(addToPlaylist())
  }

  const onBatchTag = () => {
    onCloseDialog()
    dispatch(setSpecialMode(SP.batchTag))
    gotoTracksTab()
  }

  const onBatchEdit = () => {
    onCloseDialog()
    dispatch(setSpecialMode(SP.batchEdit))
    gotoTracksTab()
  }

  const onTabChange = (tabIndex: number) => {
    if (openTab === 3) {
      dispatch(saveAudioLibraryYOffset())
    }

    navigate(tabRoutes[tabIndex], { replace: true })
  }

  const onURLChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImportURL(e.target.value)
  }

  const onAddSource = async (type: string) => {
    onCloseDialog()
    switch (type) {
      case AF.url:
        setOpenMenu(MO.urlImport)
        setImportURL('')
        break
      case AF.audios:
        setOpenMenu(MO.openLocal)
        break
    }
  }

  const onOpenLocalFiles = async (chosenFiles?: string[]) => {
    onCloseDialog()
    if (chosenFiles != null) {
      await createAudios(chosenFiles)
    }
  }

  const onAddURL = async () => {
    await createAudios([importURL as string])
    onCloseDialog()
  }

  // const addAudioSources = (newSources: string[]) => {
  //   dispatch(onAddAudioSources(newSources, cachePath as string))
  // }

  const onToggleBatchTagModal = () => {
    if (openMenu === MO.batchTag) {
      setOpenMenu(undefined)
      setSelectedTags([])
    } else {
      setOpenMenu(MO.batchTag)
      setSelectedTags(selectedTagNames)
    }
  }

  const onShowBatchEditModal = () => {
    dispatch(editAudioEdit(selected))
  }

  const onTogglePlaylistDialog = (_e: MouseEvent) => {
    // if (openMenu === MO.playlist) {
    //   _menuAnchorEl.current = null
    //   setOpenMenu(undefined)
    // } else {
    //   _menuAnchorEl.current = e.currentTarget
    //   setOpenMenu(MO.playlist)
    // }
  }

  const onSkipDuplicates = () => {
    // dispatch(
    //   setPlaylistAddItemsUnique({ id: playlistID as number, value: selected })
    // )
    // dispatch(goBack())
    onCloseDialog()
  }

  const onAddDuplicates = () => {
    // dispatch(setPlaylistAddItems({ id: playlistID as number, value: selected }))
    // dispatch(goBack())
    onCloseDialog()
  }

  const onAddPlaylist = () => {
    // dispatch(addPlaylist(importURL as string, selected))
    // dispatch(goBack())
    onCloseDialog()
  }

  const onSelectTags = (selectedTags: string[]) => {
    setSelectedTags(selectedTags)
  }

  const onToggleDrawer = () => {
    if (tutorial === ALT.sidebar1) {
      // dispatch(doneTutorial(ALT.sidebar1))
    }
    setDrawerOpen(!drawerOpen)
  }

  const onToggleNewMenu = () => {
    setOpenMenu(openMenu === MO.new ? undefined : MO.new)
  }

  const onOpenSortMenu = (e: MouseEvent) => {
    _menuAnchorEl.current = e.currentTarget
    setOpenMenu(MO.sort)
  }

  const onCloseDialog = () => {
    _menuAnchorEl.current = null
    setOpenMenu(undefined)
    setDrawerOpen(false)
  }

  const onRemoveAll = () => {
    setOpenMenu(MO.removeAllAlert)
  }

  const onFinishRemoveAll = async () => {
    await deleteAudios(undefined)
    onCloseDialog()
  }

  const onFinishRemovePlaylist = () => {
    // const playlistName = filters
    //   .find((f) => f.startsWith('playlist:'))
    //   ?.replace('playlist:', '') as string
    // dispatch(removePlaylist(playlistName))
    onCloseDialog()
    // dispatch(setAudioFilters([]))
  }

  const onFinishRemoveVisible = async () => {
    await deleteAudios(displaySources)
    onCloseDialog()
    dispatch(setAudioLibraryFilters([]))
  }

  const onImportFromLibrary = () => {
    // dispatch(importAudioFromLibrary(selected))
  }
  const onUpdateSelected = (selected: number[]) => {
    setSelected(selected)
  }
  const onSelectAll = () => {
    setSelected(displaySources ?? [])
  }
  const onSelectNone = () => {
    setSelected([])
  }

  const batchTagOverwrite = async () => {
    await batchTag('overwrite')
    onCloseDialog()
  }

  const batchTagAdd = async () => {
    await batchTag('add')
    onCloseDialog()
  }

  const batchTagRemove = async () => {
    await batchTag('remove')
    onCloseDialog()
  }

  const batchTag = async (operation: BatchTagOperation) =>
    await batchTagAudios({
      operation,
      ids: selected,
      tags: selectedTags
    })

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
            Audio Library
          </Typography>

          <div className={classes.headerRight}>
            <div
              className={cx(
                classes.searchBar,
                tutorial === ALT.toolbar && classes.highlight
              )}
            >
              {(audios?.length ?? 0) > 0 && (
                <Chip
                  className={classes.searchCount}
                  label={audios?.length}
                  size="medium"
                  variant="outlined"
                />
              )}
              {filters.length > 0 && (
                <Chip
                  className={classes.displayCount}
                  label={displaySources?.length}
                  size="medium"
                />
              )}
              <LibrarySearch
                appBar
                filters={filters}
                options={searchOptions ?? []}
                placeholder={'Search ...'}
                isCreatable
                onUpdateFilters={(filters) =>
                  dispatch(setAudioLibraryFilters(filters))
                }
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
              onClick={() => onTabChange(0)}
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
              onClick={() => onTabChange(1)}
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
              onClick={() => onTabChange(2)}
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
              onClick={() => onTabChange(3)}
            />
          </Tabs>
        </div>

        <Divider />

        <div className={cx(tutorial != null && classes.disable)}>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Manage Tags'}>
            <ListItemButton
              onClick={() => {
                dispatch(saveAudioLibraryYOffset())
                navigate('/tags')
              }}
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
                // dispatch(detectBPMs())
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
          <>
            <Divider />

            <div>
              <Tooltip
                disableInteractive
                title={drawerOpen ? '' : 'Cancel BPM Detection'}
              >
                <ListItemButton
                  onClick={() => {} /*dispatch(setProgressMode(PR.cancel))*/}
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
          </>
        )}

        <div className={classes.fill} />
      </Drawer>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth={false} className={classes.container}>
          <div className={classes.tabPanel}>
            <div className={classes.drawerSpacer} />
            <Routes>
              <Route
                path="/playlists"
                element={
                  <PlaylistsTab
                    specialMode={specialMode}
                    filters={filters}
                    displaySources={displaySources ?? []}
                    onClickPlaylist={onClickPlaylist}
                  />
                }
              />
              <Route
                path="/artists"
                element={
                  <ArtistsTab
                    specialMode={specialMode}
                    filters={filters}
                    displaySources={displaySources ?? []}
                    onClickArtist={onClickArtist}
                  />
                }
              />
              <Route
                path="/albums"
                element={
                  <AlbumsTab
                    specialMode={specialMode}
                    filters={filters}
                    displaySources={displaySources ?? []}
                    onClickArtist={onClickArtist}
                    onClickAlbum={onClickAlbum}
                  />
                }
              />
              <Route
                path="*"
                element={
                  <TracksTab
                    cachePath={cachePath}
                    specialMode={specialMode}
                    selected={selected}
                    filters={filters}
                    audios={audios ?? []}
                    displaySources={displaySources ?? []}
                    playlist={playlist}
                    onClickAlbum={onClickAlbum}
                    onClickArtist={onClickArtist}
                    onUpdateSelected={onUpdateSelected}
                  />
                }
              />
            </Routes>
          </div>
        </Container>
      </main>

      <Backdrop
        className={classes.backdrop}
        onClick={onCloseDialog}
        open={tutorial == null && (openMenu === MO.new || drawerOpen)}
      />

      {specialMode && openTab === 3 && (
        <>
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
        </>
      )}

      {!specialMode && openTab === 3 && (
        <>
          {(audios?.length ?? 0) > 0 && (
            <Tooltip
              disableInteractive
              title={
                filters.length === 0
                  ? 'Delete All Tracks'
                  : playlist
                    ? 'Delete Playlist'
                    : 'Delete These Tracks'
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
              <>
                <DialogTitle id="remove-all-title">
                  Delete Audio Library
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you want to delete your entire audio library?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={onCloseDialog} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={onFinishRemoveAll} color="primary">
                    Confirm
                  </Button>
                </DialogActions>
              </>
            )}
            {filters.length > 0 && !playlist && (
              <>
                <DialogTitle id="remove-all-title">
                  Delete Audio Tracks
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you want to remove these tracks from your
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
              </>
            )}
            {filters.length > 0 && playlist && (
              <>
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
              </>
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
              onClick={() => onAddSource(AF.audios)}
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
              onClick={() => onAddSource(AF.url)}
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
        </>
      )}

      {openTab === 3 && (
        <>
          <Fab
            disabled={(audios?.length ?? 0) < 2}
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
                <ListItem
                  key={sf}
                  secondaryAction={
                    <>
                      <IconButton
                        edge="end"
                        onClick={async () => {
                          await sortAudios({
                            sortBy: sf,
                            sortOrder: 'asc',
                            playlistId
                          })
                        }}
                        size="large"
                      >
                        <ArrowUpwardIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={async () => {
                          await sortAudios({
                            sortBy: sf,
                            sortOrder: 'desc',
                            playlistId
                          })
                        }}
                        size="large"
                      >
                        <ArrowDownwardIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText primary={en.get(sf)} />
                </ListItem>
              ))}
            <ListItem
              key={ASF.random}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={async () => {
                    await sortAudios({
                      sortBy: ASF.random,
                      sortOrder: 'asc',
                      playlistId
                    })
                  }}
                  size="large"
                >
                  <ShuffleIcon />
                </IconButton>
              }
            >
              <ListItemText primary={en.get(ASF.random)} />
            </ListItem>
          </Menu>
        </>
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
              value={importURL ?? ''}
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
              disabled={!importURL}
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
          {/* <PlaylistSelect
            type={PLT.audio}
            selector={selectAudioLibraryPlaylistIDText()}
            action={setAudioLibraryPlaylistID}
          /> */}
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

      <AudioEdit />

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
                options={tagOptions ?? []}
                filters={selectedTags}
                placeholder={'Tag These Sources'}
                showCheckboxes
                onUpdateFilters={onSelectTags}
                inputVariant="standard"
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
      <FilePicker
        open={openMenu === MO.openLocal}
        type="audio"
        multiple
        path=""
        onClose={onOpenLocalFiles}
      />
    </div>
  )
}

;(AudioLibrary as any).displayName = 'AudioLibrary'
export default AudioLibrary

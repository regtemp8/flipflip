import React, {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useEffect,
  useState
} from 'react'
import { cx } from '@emotion/css'

import {
  Alert,
  AppBar,
  Backdrop,
  Badge,
  Box,
  Button,
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
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Slide,
  Snackbar,
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import BuildIcon from '@mui/icons-material/Build'
import CachedIcon from '@mui/icons-material/Cached'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CollectionsIcon from '@mui/icons-material/Collections'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import FilterListIcon from '@mui/icons-material/FilterList'
import FilterListOffIcon from '@mui/icons-material/FilterListOff'
import FolderIcon from '@mui/icons-material/Folder'
import HttpIcon from '@mui/icons-material/Http'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'
import MenuIcon from '@mui/icons-material/Menu'
import MovieIcon from '@mui/icons-material/Movie'
import PhotoFilterIcon from '@mui/icons-material/PhotoFilter'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PublishIcon from '@mui/icons-material/Publish'
import RestoreIcon from '@mui/icons-material/Restore'
import SaveIcon from '@mui/icons-material/Save'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import SortIcon from '@mui/icons-material/Sort'

import {
  en,
  AF,
  MO,
  SDGT,
  SDT,
  SF,
  SP,
  SS,
  ST,
  TT,
  WF,
  WeightGroup
} from 'flipflip-common'
import SceneEffects from './SceneEffects'
import SceneGenerator from './SceneGenerator'
import SceneOptions from './SceneOptions'
import GooninatorDialog from './GooninatorDialog'
import LibrarySearch from '../library/LibrarySearch'
import SourceList from '../library/SourceList'
import SourceIcon from '../library/SourceIcon'
import URLDialog from './URLDialog'
import AudioTextEffects from './AudioTextEffects'
import PiwigoDialog from './PiwigoDialog'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  doneTutorial,
  setRouteGoBack,
  sortSources
} from '../../store/app/thunks'
import {
  generateScenes,
  addSource,
  deleteScene,
  cloneScene,
  resetScene,
  saveAsScene,
  applyEffectsToScene
} from '../../store/scene/thunks'
import { playScene } from '../../store/player/thunks'
import {
  selectAppConfigRemoteSettingsPiwigoConfigured,
  selectAppLibrary,
  selectAppTutorial,
  selectAppSpecialMode,
  selectAppConfigGeneralSettingsConfirmSceneDeletion,
  selectAppConfigDisplaySettingsFullScreen
} from '../../store/app/selectors'
import { setSceneGeneratorMax } from '../../store/scene/actions'
import {
  setSceneOverrideIgnore,
  setSceneAddGeneratorWeight,
  setSceneUseWeights,
  setSceneOpenTab,
  setSceneName,
  setSceneRemoveAllSources,
  setSceneRemoveSources,
  setSceneGeneratorWeights
} from '../../store/scene/slice'
import {
  selectSceneWeightFunction,
  selectSceneGeneratorWeights,
  selectSceneRegenerate,
  selectSceneOpenTab,
  selectSceneName,
  selectSceneSources,
  selectSceneUseWeights,
  selectSceneOverrideIgnore,
  selectSceneGeneratorMax,
  selectSceneGeneratorWeightsValid,
  selectSceneEffectsBase64
} from '../../store/scene/selectors'
import BaseTextField from '../common/text/BaseTextField'
import { setSceneDetailFilters } from '../../store/sceneDetail/slice'
import {
  selectSceneDetailFilters,
  selectSceneDetailDisplaySources
} from '../../store/sceneDetail/selectors'
import flipflip from '../../FlipFlipService'
import { setFullScreen } from '../../data/actions'

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
  title: {
    textAlign: 'center'
  },
  titleField: {
    width: '100%',
    margin: 0
  },
  titleInput: {
    color: theme.palette.primary.contrastText,
    textAlign: 'center',
    fontSize: theme.typography.h4.fontSize
  },
  noTitle: {
    width: '33%',
    height: theme.spacing(7)
  },
  drawer: {
    position: 'absolute'
  },
  drawerSpacer: {
    minWidth: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      minWidth: theme.spacing(9)
    }
  },
  drawerButton: {
    backgroundColor: theme.palette.primary.main,
    minHeight: theme.spacing(6),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0
    }
  },
  drawerIcon: {
    color: theme.palette.primary.contrastText
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
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9)
    }
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
  sourcesSection: {
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
  optionsTab: {
    ariaControls: 'vertical-tabpanel-0'
  },
  effectsTab: {
    ariaControls: 'vertical-tabpanel-1'
  },
  audioTextTab: {
    ariaControls: 'vertical-tabpanel-2'
  },
  sourcesTab: {
    ariaControls: 'vertical-tabpanel-3'
  },
  generateTab: {
    ariaControls: 'vertical-tabpanel-4'
  },
  deleteItem: {
    color: theme.palette.error.main
  },
  removeAllWGButton: {
    backgroundColor: theme.palette.error.main,
    margin: 0,
    top: 'auto',
    right: 190,
    bottom: 20,
    left: 'auto',
    position: 'fixed'
  },
  overrideOn: {
    backgroundColor: theme.palette.primary.dark
  },
  overrideOff: {
    backgroundColor: theme.palette.secondary.dark
  },
  overrideIgnoreWGButton: {
    margin: 0,
    top: 'auto',
    right: 135,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
    transition: theme.transitions.create('height', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  generateTooltip: {
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
    borderRadius: '50%',
    width: theme.spacing(7),
    height: theme.spacing(7)
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
  weightButton: {
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    margin: 0,
    top: 'auto',
    right: 135,
    bottom: 20,
    left: 'auto',
    position: 'fixed'
  },
  sortMenuButton: {
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    margin: 0,
    top: 'auto',
    right: 80,
    bottom: 20,
    left: 'auto',
    position: 'fixed'
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
  libraryImportButton: {
    marginBottom: 225
  },
  piwigoImportButton: {
    marginBottom: 280
  },
  removeAllButton: {
    backgroundColor: theme.palette.error.main,
    marginBottom: 280
  },
  removeAllButtonAlt: {
    marginBottom: 335
  },
  addButtonClose: {
    marginBottom: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  importBadge: {
    top: 'auto',
    right: 30,
    bottom: 50,
    left: 'auto',
    position: 'fixed',
    zIndex: theme.zIndex.fab + 1
  },
  icon: {
    color: theme.palette.primary.contrastText
  },
  playButton: {
    boxShadow: 'none'
  },
  maxMenu: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
    width: 100
  },
  sortMenu: {
    width: 200
  },
  tagMenu: {
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
  backdropTop: {
    zIndex: `${theme.zIndex.modal + 1} !important` as any
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid'
  },
  disable: {
    pointerEvents: 'none'
  },
  phraseInput: {
    minWidth: 550,
    minHeight: 100
  },
  confirmCopy: {
    color: theme.palette.success.main,
    position: 'absolute'
  },
  librarySearch: {
    position: 'absolute',
    right: 95
  }
}))

function TransitionUp(props: any) {
  return <Slide {...props} direction="up" />
}

export interface SceneDetailProps {
  sceneID: number
}

function SceneDetail(props: SceneDetailProps) {
  const dispatch = useAppDispatch()
  const tutorial = useAppSelector(selectAppTutorial())
  const piwigoConfigured = useAppSelector(
    selectAppConfigRemoteSettingsPiwigoConfigured()
  )
  const confirmSceneDeletion = useAppSelector(
    selectAppConfigGeneralSettingsConfirmSceneDeletion()
  )
  const library = useAppSelector(selectAppLibrary())
  const openTab = useAppSelector(selectSceneOpenTab(props.sceneID))
  const name = useAppSelector(selectSceneName(props.sceneID))
  const sources = useAppSelector(selectSceneSources(props.sceneID))
  const weightFunction = useAppSelector(
    selectSceneWeightFunction(props.sceneID)
  )
  const useWeights = useAppSelector(selectSceneUseWeights(props.sceneID))
  const overrideIgnore = useAppSelector(
    selectSceneOverrideIgnore(props.sceneID)
  )
  const generatorWeights = useAppSelector(
    selectSceneGeneratorWeights(props.sceneID)
  )
  const generatorWeightsValid = useAppSelector(
    selectSceneGeneratorWeightsValid(props.sceneID)
  )
  const regenerate = useAppSelector(selectSceneRegenerate(props.sceneID))
  const generatorMax = useAppSelector(selectSceneGeneratorMax(props.sceneID))
  const autoEdit = useAppSelector(selectAppSpecialMode()) === SP.autoEdit
  const sceneEffectsBase64 = useAppSelector(
    selectSceneEffectsBase64(props.sceneID)
  )
  const specialMode = useAppSelector(selectAppSpecialMode())
  const filters = useAppSelector(selectSceneDetailFilters())
  const displaySources = useAppSelector(
    selectSceneDetailDisplaySources(props.sceneID)
  )
  const fullScreen = useAppSelector(selectAppConfigDisplaySettingsFullScreen())

  const [isEditingName, setIsEditingName] = useState<string>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState<any>()
  const [openMenu, setOpenMenu] = useState<string>()
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<string>()
  const [snackbarSeverity, setSnackbarSeverity] = useState<string>()
  const [sceneEffects, setSceneEffects] = useState('')
  const [confirmCopy, setConfirmCopy] = useState(false)

  useEffect(() => {
    // Use alt+P to access import modal
    // Use alt+U to toggle highlighting untagged sources
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        !e.shiftKey &&
        !e.ctrlKey &&
        e.altKey &&
        (e.key === 'p' || e.key === 'π')
      ) {
        setOpenMenu((menu) =>
          menu === MO.gooninatorImport ? undefined : MO.gooninatorImport
        )
      }
    }

    window.addEventListener('keydown', onKeyDown, false)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    if (autoEdit) {
      setIsEditingName(name)
    }
  }, [autoEdit, name])

  const onUpdateFilters = (filters: string[]) =>
    dispatch(setSceneDetailFilters(filters))

  const onCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const onOpenMaxMenu = (e: MouseEvent) => {
    setMenuAnchorEl(e.currentTarget)
    setOpenMenu(MO.max)
  }

  const onPlayScene = () => {
    if (tutorial === SDT.play) {
      dispatch(doneTutorial(SDT.play))
    }

    // Regenerate scene(s) before playback
    dispatch(generateScenes(props.sceneID))
    dispatch(playScene(props.sceneID))
    setFullScreen(fullScreen)
  }

  const onToggleOverrideIgnore = () => {
    dispatch(
      setSceneOverrideIgnore({ id: props.sceneID, value: !overrideIgnore })
    )
  }

  const getRemainingPercent = (): number => {
    let remaining = 100
    const weights = generatorWeights as WeightGroup[]
    for (const wg of weights) {
      if (wg.type === TT.weight) {
        remaining = remaining - (wg.percent as number)
      }
    }
    return remaining
  }

  const onGenerate = () => {
    dispatch(generateScenes(props.sceneID, false, true))
    generateCallback()
  }

  const generateCallback = () => {
    if (sources.length === 0) {
      setSnackbarOpen(true)
      setSnackbar('Sorry, no sources were found for these rules')
      setSnackbarSeverity(SS.warning)
      if (tutorial === SDGT.generate) {
        dispatch(doneTutorial(SDGT.generateError))
      }
    } else {
      setSnackbarOpen(true)
      setSnackbar('Generated scene with ' + sources.length + ' sources')
      setSnackbarSeverity(SS.success)
      if (tutorial === SDGT.generate) {
        dispatch(doneTutorial(SDGT.generate))
      }
    }
  }

  const onAddAdvRule = () => {
    dispatch(
      setSceneAddGeneratorWeight({
        id: props.sceneID,
        value: {
          percent: 0,
          type: TT.weight,
          rules: []
        }
      })
    )
  }

  const onAddRule = (filters: string[]) => {
    if (tutorial === SDGT.buttons) {
      dispatch(doneTutorial(SDGT.buttons))
      onCloseDialog()
    }

    const weights = generatorWeights as WeightGroup[]
    for (const search of filters) {
      if (
        search.length > 0 &&
        weights.find((wg) => wg.search === search) == null
      ) {
        weights.push({
          percent: 0,
          type: TT.weight,
          search
        })
      }
    }

    dispatch(setSceneGeneratorWeights({ id: props.sceneID, value: weights }))
  }

  const onFinishRemoveAllRules = () => {
    dispatch(setSceneGeneratorWeights({ id: props.sceneID, value: [] }))
  }

  const onOpenTagMenu = (e: MouseEvent) => {
    setMenuAnchorEl(e.currentTarget)
    setOpenMenu(MO.simpleRule)
  }

  const onAddSource = (addFunction: string, e?: MouseEvent, ...args: any[]) => {
    onCloseDialog()
    if (tutorial === SDT.add2) {
      dispatch(doneTutorial(SDT.add2))
      dispatch(addSource('tutorial', props.sceneID))
    } else if (addFunction === AF.videos && e?.shiftKey) {
      dispatch(addSource(AF.videoDir, props.sceneID, ...args))
    } else if (addFunction === AF.url && e?.shiftKey) {
      setOpenMenu(MO.urlImport)
    } else {
      dispatch(addSource(addFunction, props.sceneID, ...args))
    }
  }

  const onToggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const onToggleNewMenu = () => {
    if (tutorial === SDT.add1) {
      dispatch(doneTutorial(SDT.add1))
    }
    setOpenMenu(openMenu === MO.new ? undefined : MO.new)
  }

  const onOpenSortMenu = (e: MouseEvent) => {
    setMenuAnchorEl(e.currentTarget)
    setOpenMenu(MO.sort)
  }

  const onToggleWeight = () => {
    dispatch(setSceneUseWeights({ id: props.sceneID, value: !useWeights }))
  }

  const onOpenPiwigoMenu = () => {
    setOpenMenu(MO.piwigo)
  }

  const onOpenSceneEffectsMenu = () => {
    setOpenMenu(MO.effects)
    setSceneEffects(sceneEffectsBase64)
  }

  const onCopySceneEffects = () => {
    flipflip().clipboard.copyTextToClipboard(sceneEffects)
    setConfirmCopy(true)
    setTimeout(() => {
      setConfirmCopy(false)
    }, 1000)
  }

  const onChangeSceneEffects = (e: ChangeEvent<HTMLInputElement>) => {
    setSceneEffects(e.target.value)
  }

  const onApplySceneEffects = () => {
    dispatch(applyEffectsToScene(props.sceneID, sceneEffects))
    onCloseDialog()
  }

  const onCloseDialog = () => {
    setMenuAnchorEl(undefined)
    setOpenMenu(undefined)
    setDrawerOpen(false)
    setSceneEffects('')
  }

  const onChangeTab = (e: any, newTab: number) => {
    if (tutorial === SDT.options1) {
      dispatch(doneTutorial(SDT.options1))
      setDrawerOpen(false)
    }
    if (tutorial === SDT.effects1) {
      dispatch(doneTutorial(SDT.effects1))
      setDrawerOpen(false)
    }
    dispatch(setSceneOpenTab({ id: props.sceneID, value: newTab }))
  }

  const beginEditingName = () => {
    setIsEditingName(name)
  }

  const endEditingName = (e: FormEvent) => {
    e.preventDefault()
    dispatch(
      setSceneName({ id: props.sceneID, value: isEditingName as string })
    )
    setIsEditingName(undefined)
  }

  const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setIsEditingName(e.currentTarget.value)
  }

  const onDeleteScene = () => {
    if (confirmSceneDeletion) {
      setOpenMenu(MO.deleteAlert)
    } else {
      dispatch(deleteScene(props.sceneID))
    }
  }

  const onFinishDeleteScene = () => {
    dispatch(deleteScene(props.sceneID))
  }

  const onRemoveAll = () => {
    setOpenMenu(MO.removeAllAlert)
  }

  const onFinishRemoveAll = () => {
    dispatch(setSceneRemoveAllSources(props.sceneID))
    onCloseDialog()
  }

  const onFinishRemoveVisible = () => {
    dispatch(
      setSceneRemoveSources({ id: props.sceneID, value: displaySources })
    )
    onCloseDialog()
  }

  const { classes } = useStyles()
  const open = drawerOpen
  return (
    <div className={classes.root}>
      <AppBar
        enableColorOnDark
        position="absolute"
        className={cx(
          classes.appBar,
          (tutorial === SDT.title || tutorial === SDT.play) &&
            classes.backdropTop
        )}
      >
        <Toolbar>
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

          {isEditingName != null && (
            <form onSubmit={endEditingName} className={classes.titleField}>
              <TextField
                variant="standard"
                autoFocus
                fullWidth
                id="title"
                value={isEditingName}
                margin="none"
                inputProps={{ className: classes.titleInput }}
                onBlur={endEditingName}
                onChange={onChangeName}
              />
            </form>
          )}
          {isEditingName == null && (
            <React.Fragment>
              <div className={classes.fill} />
              <Typography
                component="h1"
                variant="h4"
                color="inherit"
                noWrap
                className={cx(
                  classes.title,
                  name.length === 0 && classes.noTitle,
                  tutorial === SDT.title && classes.highlight
                )}
                onClick={beginEditingName}
              >
                {name}
              </Typography>
              <div className={classes.fill} />
            </React.Fragment>
          )}

          {openTab === 3 && (
            <div className={classes.librarySearch}>
              <LibrarySearch
                displaySources={displaySources}
                filters={filters}
                placeholder={'Search ...'}
                isLibrary
                isCreatable
                onlyUsed
                onUpdateFilters={onUpdateFilters}
              />
            </div>
          )}

          <Fab
            className={cx(
              classes.playButton,
              tutorial === SDT.play && classes.highlight
            )}
            disabled={
              sources.length === 0 && (!regenerate || !generatorWeightsValid)
            }
            color="secondary"
            aria-label="Play"
            onClick={onPlayScene}
          >
            <PlayCircleOutlineIcon fontSize="large" />
          </Fab>
        </Toolbar>
      </AppBar>

      <Drawer
        className={cx(
          classes.drawer,
          (drawerOpen ||
            tutorial === SDT.options1 ||
            tutorial === SDT.effects1) &&
            classes.backdropTop
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
          <IconButton onClick={onToggleDrawer} size="large">
            <MenuIcon className={classes.drawerIcon} />
          </IconButton>
        </ListItem>

        <Divider />

        <div>
          <Tabs
            orientation="vertical"
            value={openTab}
            onChange={onChangeTab}
            aria-label="scene detail tabs"
            className={classes.tabs}
          >
            <Tab
              id="vertical-tab-0"
              aria-controls="vertical-tabpanel-0"
              icon={<BuildIcon />}
              label={open ? 'Options' : ''}
              className={cx(
                classes.tab,
                classes.optionsTab,
                !open && classes.tabClose,
                tutorial === SDT.options1 && classes.highlight,
                tutorial === SDT.effects1 && classes.disable
              )}
            />
            <Tab
              id="vertical-tab-1"
              aria-controls="vertical-tabpanel-1"
              icon={<PhotoFilterIcon />}
              label={open ? 'Effects' : ''}
              className={cx(
                classes.tab,
                classes.effectsTab,
                !open && classes.tabClose,
                tutorial === SDT.options1 && classes.disable,
                tutorial === SDT.effects1 && classes.highlight
              )}
            />
            <Tab
              id="vertical-tab-2"
              aria-controls="vertical-tabpanel-2"
              icon={<AudiotrackIcon />}
              label={open ? 'Audio/Text' : ''}
              className={cx(
                classes.tab,
                classes.audioTextTab,
                !open && classes.tabClose,
                tutorial === SDT.options1 && classes.disable,
                (tutorial === SDT.options1 || tutorial === SDT.effects1) &&
                  classes.disable
              )}
            />
            <Tab
              id="vertical-tab-3"
              aria-controls="vertical-tabpanel-3"
              icon={<CollectionsIcon />}
              label={open ? `Sources (${sources.length})` : ''}
              className={cx(
                classes.tab,
                classes.sourcesTab,
                !open && classes.tabClose,
                (tutorial === SDT.options1 || tutorial === SDT.effects1) &&
                  classes.disable
              )}
            />
            {generatorWeights && (
              <Tab
                id="vertical-tab-4"
                aria-controls="vertical-tabpanel-4"
                icon={<LocalOfferIcon />}
                label={open ? `Generate (${generatorWeights.length})` : ''}
                className={cx(
                  classes.tab,
                  classes.generateTab,
                  !open && classes.tabClose
                )}
              />
            )}
          </Tabs>
        </div>
        <div className={classes.fill} />

        <div>
          {generatorWeights && (
            <ListItemButton
              onClick={() => {
                dispatch(saveAsScene(props.sceneID))
              }}
              className={cx(
                (tutorial === SDT.options1 || tutorial === SDT.effects1) &&
                  classes.disable
              )}
            >
              <ListItemIcon>
                <SaveIcon />
              </ListItemIcon>
              <ListItemText primary="Save as Scene" />
            </ListItemButton>
          )}
          <Tooltip
            disableInteractive
            title={
              drawerOpen
                ? ''
                : `Clone ${generatorWeights ? 'Generator' : 'Scene'}`
            }
          >
            <ListItemButton
              onClick={() => {
                dispatch(cloneScene(props.sceneID))
              }}
              className={cx(
                (tutorial === SDT.options1 || tutorial === SDT.effects1) &&
                  classes.disable
              )}
            >
              <ListItemIcon>
                <FileCopyIcon />
              </ListItemIcon>
              <ListItemText
                primary={`Clone ${generatorWeights ? 'Generator' : 'Scene'}`}
              />
            </ListItemButton>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Scene Effects Import/Export'}
          >
            <ListItem
              button
              onClick={onOpenSceneEffectsMenu}
              className={cx(
                (tutorial === SDT.options1 || tutorial === SDT.effects1) &&
                  classes.disable
              )}
            >
              <ListItemIcon>
                <SvgIcon viewBox="0 0 488.472 488.472">
                  <path d="m331.351 96.061c-5.963-5.963-15.622-5.963-21.585 0l-305.294 305.294c-5.963 5.963-5.963 15.622 0 21.585l61.059 61.059c2.981 2.981 6.887 4.472 10.793 4.472s7.811-1.491 10.793-4.472l305.293-305.294c5.963-5.963 5.963-15.622 0-21.585 0 0-61.059-61.059-61.059-61.059zm-255.028 355.561-39.473-39.474 207.385-207.385 39.474 39.474c0-.001-207.386 207.385-207.386 207.385zm228.971-228.971-39.474-39.474 54.738-54.738 39.474 39.474z" />
                  <path d="m213.707 122.118c15.265-30.529 30.529-45.794 61.059-61.059-30.529-15.265-45.794-30.529-61.059-61.059-15.265 30.529-30.531 45.794-61.059 61.059 30.53 15.265 45.794 30.53 61.059 61.059z" />
                  <path d="m457.942 213.707c-7.632 15.265-15.267 22.897-30.529 30.529 15.265 7.632 22.897 15.265 30.529 30.529 7.632-15.265 15.265-22.897 30.529-30.529-15.264-7.632-22.896-15.265-30.529-30.529z" />
                  <path d="m457.942 45.795c-22.897-11.449-34.346-22.897-45.794-45.794-11.449 22.897-22.899 34.346-45.794 45.794 22.897 11.449 34.346 22.897 45.794 45.794 11.449-22.897 22.897-34.346 45.794-45.794z" />
                </SvgIcon>
              </ListItemIcon>
              <ListItemText primary="Export Scene Effects" />
            </ListItem>
          </Tooltip>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Export Scene'}>
            <ListItemButton
              onClick={() => {
                // TODO export subset of AppStorage
                // dispatch(exportScene(props.sceneID))
              }}
              className={cx(
                (tutorial === SDT.options1 || tutorial === SDT.effects1) &&
                  classes.disable
              )}
            >
              <ListItemIcon>
                <PublishIcon />
              </ListItemIcon>
              <ListItemText primary="Export Scene" />
            </ListItemButton>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={drawerOpen ? '' : 'Restore Defaults'}
          >
            <ListItemButton
              onClick={() => {
                dispatch(resetScene(props.sceneID))
              }}
              className={cx(
                (tutorial === SDT.options1 || tutorial === SDT.effects1) &&
                  classes.disable
              )}
            >
              <ListItemIcon>
                <RestoreIcon />
              </ListItemIcon>
              <ListItemText primary={'Restore Defaults'} />
            </ListItemButton>
          </Tooltip>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Delete Scene'}>
            <ListItemButton
              onClick={onDeleteScene}
              className={cx(
                classes.deleteItem,
                (tutorial === SDT.options1 || tutorial === SDT.effects1) &&
                  classes.disable
              )}
            >
              <ListItemIcon>
                <DeleteForeverIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Delete Scene" />
            </ListItemButton>
          </Tooltip>
          <Dialog
            open={openMenu === MO.deleteAlert}
            onClose={onCloseDialog}
            aria-labelledby="delete-title"
            aria-describedby="delete-description"
          >
            <DialogTitle id="Delete-title">Delete '{name}'</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-description">
                Are you sure you want to delete {name}? It will be automatically
                removed from all overlays/grids.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={onCloseDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={onFinishDeleteScene} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </Drawer>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth={false} className={classes.container}>
          {openTab === 0 && (
            <Typography component="div">
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box p={2} className={classes.fill}>
                  <SceneOptions sceneID={props.sceneID} />
                </Box>
              </div>
            </Typography>
          )}

          {openTab === 1 && (
            <Typography component="div">
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box p={2} className={classes.fill}>
                  <SceneEffects sceneID={props.sceneID} />
                </Box>
              </div>
            </Typography>
          )}

          {openTab === 2 && (
            <Typography component="div">
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box p={2} className={classes.fill}>
                  <AudioTextEffects sceneID={props.sceneID} />
                </Box>
              </div>
            </Typography>
          )}

          {openTab === 3 && (
            <Typography
              className={cx(openTab === 3 && classes.sourcesSection)}
              component="div"
            >
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box className={classes.fill}>
                  <SourceList
                    sources={displaySources}
                    useWeights={weightFunction === WF.sources && useWeights}
                    showHelp={!specialMode && filters.length === 0}
                  />
                </Box>
              </div>
            </Typography>
          )}

          {generatorWeights && openTab === 4 && (
            <Typography component="div">
              <div className={classes.tabPanel}>
                <div className={classes.drawerSpacer} />
                <Box p={1} className={classes.fill}>
                  <SceneGenerator sceneID={props.sceneID} />
                </Box>
              </div>
            </Typography>
          )}
        </Container>
      </main>

      <Backdrop
        className={classes.backdrop}
        onClick={onCloseDialog}
        open={!tutorial && (openMenu === MO.new || drawerOpen)}
      />

      <Dialog
        open={openMenu === MO.effects}
        onClose={onCloseDialog}
        aria-labelledby="effects-all-title"
        aria-describedby="effects-all-description"
      >
        <DialogTitle id="effects-all-title">
          Scene Effects Import/Export
        </DialogTitle>
        <DialogContent>
          <TextField
            variant="standard"
            fullWidth
            multiline
            label="Scene Effects Hash"
            helperText="Copy this hash to share with others, or paste a hash here to import."
            id="phrase"
            value={sceneEffects}
            margin="dense"
            inputProps={{ className: classes.phraseInput }}
            onChange={onChangeSceneEffects}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCopySceneEffects} color="secondary">
            {confirmCopy && <CheckCircleIcon className={classes.confirmCopy} />}
            Copy to Clipboard
          </Button>
          <Button onClick={onApplySceneEffects} color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {openTab === 3 && (
        <React.Fragment>
          {sources.length > 0 && (
            <Tooltip
              disableInteractive
              title={
                filters.length === 0
                  ? 'Remove All Sources'
                  : 'Remove These Sources'
              }
              placement="left"
            >
              <Fab
                className={cx(
                  classes.addButton,
                  !piwigoConfigured && classes.removeAllButton,
                  piwigoConfigured && classes.removeAllButtonAlt,
                  openMenu !== MO.new && classes.addButtonClose,
                  openMenu === MO.new && classes.backdropTop,
                  tutorial && classes.disable
                )}
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
                  Remove All Sources
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you want to remove all sources from this scene?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={onCloseDialog} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={onFinishRemoveAll} color="primary">
                    OK
                  </Button>
                </DialogActions>
              </React.Fragment>
            )}
            {filters.length > 0 && (
              <React.Fragment>
                <DialogTitle id="remove-all-title">Remove Sources</DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you want to remove these sources from this
                    scene?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={onCloseDialog} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={onFinishRemoveVisible} color="primary">
                    OK
                  </Button>
                </DialogActions>
              </React.Fragment>
            )}
          </Dialog>
          {piwigoConfigured && (
            <Tooltip disableInteractive title="From Piwigo" placement="left">
              <Fab
                className={cx(
                  classes.addButton,
                  classes.piwigoImportButton,
                  openMenu !== MO.new && classes.addButtonClose,
                  openMenu === MO.new && classes.backdropTop,
                  tutorial && classes.disable
                )}
                onClick={onOpenPiwigoMenu}
                size="small"
              >
                <SourceIcon type={ST.piwigo} className={classes.icon} />
              </Fab>
            </Tooltip>
          )}
          <Tooltip disableInteractive title="From Library" placement="left">
            <Fab
              className={cx(
                classes.addButton,
                classes.libraryImportButton,
                openMenu !== MO.new && classes.addButtonClose,
                openMenu === MO.new && classes.backdropTop,
                tutorial && classes.disable
              )}
              onClick={(e: MouseEvent) => onAddSource(AF.library, e)}
              size="small"
            >
              <LocalLibraryIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip
            disableInteractive
            title="Local Video/Playlist"
            placement="left"
          >
            <Fab
              className={cx(
                classes.addButton,
                classes.addVideoButton,
                openMenu !== MO.new && classes.addButtonClose,
                openMenu === MO.new && classes.backdropTop,
                tutorial && classes.disable
              )}
              onClick={(e: MouseEvent) => onAddSource(AF.videos, e)}
              size="small"
            >
              <MovieIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip disableInteractive title="Local Directory" placement="left">
            <Fab
              className={cx(
                classes.addButton,
                classes.addDirectoryButton,
                openMenu !== MO.new && classes.addButtonClose,
                openMenu === MO.new && classes.backdropTop,
                tutorial && classes.disable
              )}
              onClick={(e: MouseEvent) => onAddSource(AF.directory, e)}
              size="small"
            >
              <FolderIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip disableInteractive title="URL" placement="left">
            <Fab
              className={cx(
                classes.addButton,
                classes.addURLButton,
                openMenu !== MO.new && classes.addButtonClose,
                openMenu === MO.new && classes.backdropTop,
                openMenu !== MO.new && classes.addButtonClose,
                tutorial === SDT.add2 && classes.highlight
              )}
              onClick={(e: MouseEvent) => onAddSource(AF.url, e)}
              size="small"
            >
              <HttpIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Fab
            className={cx(
              classes.addMenuButton,
              openMenu === MO.new && classes.backdropTop,
              (tutorial === SDT.add1 || tutorial === SDT.add2) &&
                classes.backdropTop,
              tutorial === SDT.add1 && classes.highlight
            )}
            onClick={onToggleNewMenu}
            size="large"
          >
            <AddIcon className={classes.icon} />
          </Fab>

          <GooninatorDialog
            open={openMenu === MO.gooninatorImport}
            onImportURL={onAddSource}
            onClose={onCloseDialog}
          />
          <URLDialog
            open={openMenu === MO.urlImport}
            onImportURL={onAddSource}
            onClose={onCloseDialog}
          />
          <PiwigoDialog
            open={openMenu === MO.piwigo}
            onClose={onCloseDialog}
            onImportURL={onAddSource}
          />

          {sources.length >= 2 && (
            <React.Fragment>
              {weightFunction === WF.sources && (
                <Fab
                  className={classes.weightButton}
                  onClick={onToggleWeight}
                  size="medium"
                >
                  <SvgIcon viewBox="0 0 489.183 489.183" fontSize="small">
                    <path
                      d="M487.106,259.27c-2.808-4.906-8.032-7.918-13.678-7.918h-3.219L411.005,56.795c-4.736-15.562-20.915-24.607-36.652-20.492
                            l-104.48,27.322V30.391c0-13.967-11.317-25.284-25.283-25.284c-13.966,0-25.283,11.317-25.283,25.284V76.9l-111.262,28.928
                            c-13.496,3.509-24.215,13.759-28.349,27.077C62.657,187.792,18.954,329.07,18.954,329.07h-3.203c-5.653,0-10.864,3.029-13.67,7.926
                            c-2.807,4.905-2.774,10.938,0.09,15.801c19.045,32.304,54.188,53.99,94.409,53.99c40.22,0,75.354-21.679,94.399-53.99
                            c2.871-4.864,2.913-10.904,0.106-15.81c-2.806-4.905-8.033-7.917-13.679-7.917h-3.217l-61.611-198.008l106.728-28.022V433.51
                            h-75.848c-13.966,0-25.283,11.316-25.283,25.283c0,13.966,11.317,25.282,25.283,25.282h202.263
                            c13.966,0,25.283-11.316,25.283-25.282c0-13.967-11.317-25.283-25.283-25.283h-75.849V89.763l103.881-27.267l-58.78,188.856h-3.202
                            c-5.654,0-10.864,3.029-13.671,7.925c-2.806,4.905-2.772,10.938,0.092,15.803c19.043,32.303,54.186,53.989,94.406,53.989
                            s75.355-21.678,94.398-53.989C489.872,270.216,489.913,264.176,487.106,259.27z M147.714,329.07H45.439l51.142-164.339
                            L147.714,329.07z M341.458,251.353l51.142-164.338l51.134,164.338H341.458z"
                    />
                  </SvgIcon>
                </Fab>
              )}
              <Fab
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
                            dispatch(sortSources(sf, true, props.sceneID))
                          }}
                          size="large"
                        >
                          <ArrowUpwardIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            dispatch(sortSources(sf, false, props.sceneID))
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
                        dispatch(sortSources(SF.random, true, props.sceneID))
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
        </React.Fragment>
      )}

      {openTab === 4 && (
        <React.Fragment>
          {generatorWeights != null && generatorWeights.length > 0 && (
            <React.Fragment>
              <Tooltip
                disableInteractive
                title="Remove All Rules"
                placement="top-end"
              >
                <Fab
                  className={classes.removeAllWGButton}
                  onClick={onRemoveAll}
                  size="small"
                >
                  <DeleteSweepIcon className={classes.icon} />
                </Fab>
              </Tooltip>
              <Dialog
                open={openMenu === MO.removeAllAlert}
                onClose={onCloseDialog}
                aria-labelledby="remove-all-title"
                aria-describedby="remove-all-description"
              >
                <DialogTitle id="remove-all-title">Delete Rules</DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you want to remove all rules?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={onCloseDialog} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={onFinishRemoveAllRules} color="primary">
                    OK
                  </Button>
                </DialogActions>
              </Dialog>
            </React.Fragment>
          )}
          <Tooltip
            disableInteractive
            title={
              overrideIgnore
                ? 'Overriding globally ignored tags/types'
                : 'Respecting globally ignored tags/types'
            }
            placement="top-end"
          >
            <Fab
              className={cx(
                classes.overrideIgnoreWGButton,
                overrideIgnore && classes.overrideOn,
                !overrideIgnore && classes.overrideOff
              )}
              onClick={onToggleOverrideIgnore}
              size="medium"
            >
              {overrideIgnore && <FilterListOffIcon className={classes.icon} />}
              {!overrideIgnore && <FilterListIcon className={classes.icon} />}
            </Fab>
          </Tooltip>
          <Tooltip disableInteractive title="Max" placement="top">
            <Fab
              className={cx(
                classes.sortMenuButton,
                tutorial === SDGT.buttons &&
                  cx(classes.backdropTop, classes.disable)
              )}
              onClick={onOpenMaxMenu}
              size="medium"
            >
              {generatorMax}
            </Fab>
          </Tooltip>
          <Menu
            id="max-menu"
            elevation={1}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'center'
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            anchorEl={menuAnchorEl}
            keepMounted
            classes={{ paper: classes.maxMenu }}
            open={openMenu === MO.max}
            onClose={onCloseDialog}
          >
            <BaseTextField
              variant="standard"
              label="Max"
              margin="dense"
              selector={selectSceneGeneratorMax(props.sceneID)}
              action={setSceneGeneratorMax(props.sceneID)}
              inputProps={{
                min: 1,
                type: 'number'
              }}
            />
          </Menu>
          <Tooltip disableInteractive title="Adv Rule" placement="left">
            <Fab
              className={cx(
                classes.addButton,
                classes.addDirectoryButton,
                tutorial === SDGT.buttons &&
                  cx(classes.backdropTop, classes.disable)
              )}
              onClick={onAddAdvRule}
              size="small"
            >
              <AddCircleOutlineIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip disableInteractive title="Simple Rule" placement="left">
            <Fab
              className={cx(
                classes.addButton,
                classes.addURLButton,
                tutorial === SDGT.buttons &&
                  cx(classes.backdropTop, classes.highlight)
              )}
              onClick={onOpenTagMenu}
              size="small"
            >
              <AddIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip
            disableInteractive
            title="Generate Sources"
            placement="top-end"
          >
            <span
              className={cx(
                classes.generateTooltip,
                tutorial === SDGT.buttons &&
                  cx(classes.backdropTop, classes.disable),
                tutorial === SDGT.generate && classes.backdropTop
              )}
              style={!generatorWeightsValid ? { pointerEvents: 'none' } : {}}
            >
              <Fab
                disabled={!generatorWeightsValid}
                className={cx(
                  classes.addMenuButton,
                  tutorial === SDGT.generate && classes.highlight
                )}
                onClick={onGenerate}
                size="large"
              >
                <Badge
                  classes={{
                    badge: classes.importBadge
                  }}
                  overlap="circular"
                  color="secondary"
                  max={100}
                  invisible={generatorWeightsValid}
                  badgeContent={getRemainingPercent()}
                >
                  <CachedIcon className={classes.icon} />
                </Badge>
              </Fab>
            </span>
          </Tooltip>
          <Menu
            elevation={1}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'center'
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            anchorEl={menuAnchorEl}
            keepMounted
            className={cx(tutorial === SDGT.buttons && classes.backdropTop)}
            classes={{
              paper: cx(
                classes.tagMenu,
                tutorial === SDGT.buttons &&
                  cx(classes.backdropTop, classes.highlight)
              )
            }}
            open={openMenu === MO.simpleRule}
            onClose={onCloseDialog}
          >
            {openMenu === MO.simpleRule && (
              <LibrarySearch
                displaySources={library}
                filters={(generatorWeights as WeightGroup[])
                  .filter((wg) => wg.rules == null)
                  .filter((wg) => wg.search != null)
                  .map((wg) => wg.search as string)}
                placeholder={'Search ...'}
                autoFocus
                isLibrary
                isCreatable
                fullWidth
                onlyUsed
                menuIsOpen
                controlShouldRenderValue={false}
                onUpdateFilters={onAddRule}
              />
            )}
          </Menu>
        </React.Fragment>
      )}
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={5000}
        onClose={onCloseSnackbar}
        TransitionComponent={TransitionUp}
      >
        <Alert onClose={onCloseSnackbar} severity={snackbarSeverity as any}>
          {snackbar}
        </Alert>
      </Snackbar>
    </div>
  )
}

;(SceneDetail as any).displayName = 'SceneDetail'
export default SceneDetail

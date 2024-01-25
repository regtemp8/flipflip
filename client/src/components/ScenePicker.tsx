/// <reference path="../react-sortablejs.d.ts" />
import React, {
  MouseEvent,
  type ReactNode,
  useEffect,
  useState,
  SyntheticEvent,
  ChangeEvent
} from 'react'
import wretch from 'wretch'
import { cx } from '@emotion/css'
import Sortable from 'react-sortablejs'

import {
  AppBar,
  Badge,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
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
  Link,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
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
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CasinoIcon from '@mui/icons-material/Casino'
import CloseIcon from '@mui/icons-material/Close'
import CodeIcon from '@mui/icons-material/Code'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import DeleteIcon from '@mui/icons-material/Delete'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import FolderIcon from '@mui/icons-material/Folder'
import GetAppIcon from '@mui/icons-material/GetApp'
import GridOnIcon from '@mui/icons-material/GridOn'
import HelpIcon from '@mui/icons-material/Help'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'
import MenuIcon from '@mui/icons-material/Menu'
import MovieIcon from '@mui/icons-material/Movie'
import MovieFilterIcon from '@mui/icons-material/MovieFilter'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SettingsIcon from '@mui/icons-material/Settings'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import SortIcon from '@mui/icons-material/Sort'
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate'

import { convertGridIDToSceneID } from '../data/utils'
import { en, MO, SF, SG, SPT } from 'flipflip-common'
import Jiggle from '../animations/Jiggle'
import VSpin from '../animations/VSpin'
import SceneSearch from './SceneSearch'
import {
  setConfigNewWindowAlerted,
  setOpenTab,
  setTutorialStart,
  systemMessage
} from '../store/app/slice'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import {
  selectAppCanGenerate,
  selectAppCanGrid,
  selectAppAudioLibraryCount,
  selectAppScriptLibraryCount,
  selectAppLibraryCount,
  selectAppOpenTab,
  selectAppTutorial,
  selectAppVersion,
  selectAppConfigNewWindowAlerted
} from '../store/app/selectors'
import {
  addGenerator,
  addGrid,
  addSceneGroup,
  addScene,
  routeToAudios,
  routeToConfig,
  routeToGrid,
  routeToLibrary,
  routeToScriptor,
  routeToScripts,
  routeToScene,
  deleteScenes,
  removeSceneGroup,
  doneTutorial,
  sortScenes,
  importScenes
} from '../store/app/thunks'
import { setSceneGroupName } from '../store/sceneGroup/actions'
import {
  selectSceneGroupName,
  selectSceneGroupType
} from '../store/sceneGroup/selectors'
import BaseTextField from './common/text/BaseTextField'
import { selectSceneName } from '../store/scene/selectors'
import { selectSceneGridName } from '../store/sceneGrid/selectors'
import {
  selectScenePickerGeneratorGroups,
  selectScenePickerGridGroups,
  selectScenePickerGroupItems,
  selectScenePickerSceneGroups,
  selectScenePickerUngroupedGenerators,
  selectScenePickerUngroupedScenes,
  selectScenePickerUngroupedGrids,
  selectScenePickerSceneCount,
  selectScenePickerGeneratorCount,
  selectScenePickerGridCount,
  selectScenePickerAllScenesCount
} from '../store/scenePicker/selectors'
import {
  onScenePickerChangeSceneGroupItemsSort,
  onScenePickerChangeSceneGroupSort,
  onScenePickerChangeUngroupedSort,
  routeToRandomScene
} from '../store/scenePicker/thunks'
import flipflip from '../FlipFlipService'

const drawerWidth = 240

const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      display: 'flex'
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth})`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    logo: {
      marginLeft: 24,
      width: theme.spacing(6),
      height: theme.spacing(6),
      marginRight: 5,
      background: 'url("img/flipflip_logo.png") no-repeat',
      backgroundSize: theme.spacing(6),
      transition: theme.transitions.create(['opacity', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    drawerLogo: {
      marginLeft: 0
    },
    title: {
      transition: theme.transitions.create(['opacity', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    version: {
      marginTop: 35,
      marginLeft: -11,
      transition: theme.transitions.create(['opacity', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    updateIcon: {
      float: 'right'
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
    drawerToolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      color: theme.palette.primary.contrastText,
      padding: '0 8px',
      paddingLeft: 23,
      backgroundColor: theme.palette.primary.main,
      minHeight: 64
    },
    drawerBottom: {
      width: drawerWidth,
      padding: 8,
      paddingLeft: 16,
      transition: theme.transitions.create(['opacity'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    drawerBottomClose: {
      opacity: 0,
      transition: theme.transitions.create(['opacity'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
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
    appBarSpacer: {
      backgroundColor: theme.palette.primary.main,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      minHeight: 64
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
      overflowY: 'auto'
    },
    sceneList: {
      padding: theme.spacing(1),
      display: 'flex',
      flexWrap: 'wrap'
    },
    scene: {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    deleteScene: {
      backgroundColor: theme.palette.error.main
    },
    deleteButton: {
      backgroundColor: theme.palette.error.main,
      margin: 0,
      top: 'auto',
      right: 20,
      bottom: 20,
      left: 'auto',
      position: 'fixed'
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
    randomButton: {
      backgroundColor: theme.palette.secondary.light,
      margin: 0,
      top: 'auto',
      right: 132,
      bottom: 20,
      left: 'auto',
      position: 'fixed'
    },
    extraWindowRandomButton: {
      right: 28,
      bottom: 25
    },
    generateTooltip: {
      top: 'auto',
      right: 28,
      bottom: 140,
      left: 'auto',
      position: 'fixed',
      borderRadius: '50%',
      width: theme.spacing(5),
      height: theme.spacing(5)
    },
    gridTooltip: {
      top: 'auto',
      right: 28,
      bottom: 85,
      left: 'auto',
      position: 'fixed',
      borderRadius: '50%',
      width: theme.spacing(5),
      height: theme.spacing(5)
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
    addSceneButton: {
      marginBottom: 170
    },
    addGeneratorButton: {
      marginBottom: 115
    },
    addGridButton: {
      marginBottom: 60
    },
    importSceneButton: {
      marginBottom: 225
    },
    deleteScenesButton: {
      marginBottom: 280,
      backgroundColor: theme.palette.error.main
    },
    addButtonClose: {
      marginBottom: 0,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    icon: {
      color: theme.palette.primary.contrastText
    },
    sortMenu: {
      width: 200
    },
    tabs: {
      borderRight: `1px solid ${theme.palette.divider}`
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
    sceneTab: {
      ariaControls: 'vertical-tabpanel-0'
    },
    generatorTab: {
      ariaControls: 'vertical-tabpanel-1'
    },
    gridTab: {
      ariaControls: 'vertical-tabpanel-2'
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
    groupTitle: {
      lineHeight: '45px',
      minWidth: '20px',
      color: theme.palette.text.primary
    },
    titleInput: {
      color: theme.palette.text.primary,
      fontSize: theme.typography.h6.fontSize
    },
    groupHandle: {
      margin: theme.spacing(1),
      cursor: 'move'
    }
  }
})

interface SceneCardProps {
  sceneID: number
  toDelete: boolean
  action: (id: number) => void
  grid?: boolean
}

function SceneCard(props: SceneCardProps) {
  const { sceneID, grid, toDelete, action } = props
  const { classes } = useStyles()
  const nameSelector = grid ? selectSceneGridName : selectSceneName
  const name = useAppSelector(nameSelector(sceneID))
  return (
    <Jiggle
      id={sceneID.toString()}
      bounce
      disable={toDelete}
      className={classes.scene}
    >
      <Card className={cx(toDelete && classes.deleteScene)}>
        <CardActionArea
          onClick={() => {
            action(sceneID)
          }}
        >
          <CardContent>
            <Typography component="h2" variant="h6">
              {name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Jiggle>
  )
}

interface SceneGroupProps {
  id: number
  isEditingName: boolean

  beginEditingName: (groupID: number) => void
  endEditingName: () => void
  renderCard: (id: number) => ReactNode
}

function SceneGroup(props: SceneGroupProps) {
  const { id, isEditingName, beginEditingName, endEditingName, renderCard } =
    props
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const name = useAppSelector(selectSceneGroupName(id))
  const type = useAppSelector(selectSceneGroupType(id))
  const items = useAppSelector(selectScenePickerGroupItems(id, type))

  return (
    <>
      <div className={classes.root}>
        <DragHandleIcon className={cx('group-handle', classes.groupHandle)} />
        {isEditingName && (
          <form onSubmit={endEditingName} className={classes.groupTitle}>
            <BaseTextField
              variant="standard"
              autoFocus
              id="title"
              margin="none"
              selector={selectSceneGroupName(id)}
              action={setSceneGroupName(id)}
              onBlur={endEditingName}
              inputProps={{ className: classes.titleInput }}
            />
          </form>
        )}
        {!isEditingName && (
          <Typography
            variant={'h6'}
            onClick={() => {
              beginEditingName(id)
            }}
            className={classes.groupTitle}
          >
            {name}
          </Typography>
        )}
        <div className={classes.fill} />
        <IconButton
          color="inherit"
          aria-label="Delete"
          onClick={() => {
            dispatch(removeSceneGroup(id))
          }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </div>
      <Sortable
        className={classes.sceneList}
        options={{
          group: {
            name: type,
            pull: true,
            put: true
          },
          animation: 150,
          easing: 'cubic-bezier(1, 0, 0, 1)'
        }}
        onChange={(order: any, sortable: any, evt: any) => {
          dispatch(
            onScenePickerChangeSceneGroupItemsSort(
              id,
              items,
              evt.type,
              evt.oldIndex,
              evt.newIndex,
              evt.itemID,
              order.length
            )
          )
        }}
      >
        {items.map((id) => renderCard(id))}
      </Sortable>
    </>
  )
}

function ScenePicker() {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const canGenerate = useAppSelector(selectAppCanGenerate())
  const canGrid = useAppSelector(selectAppCanGrid())
  const newWindowAlerted = useAppSelector(selectAppConfigNewWindowAlerted())
  const audioLibraryCount = useAppSelector(selectAppAudioLibraryCount())
  const scriptLibraryCount = useAppSelector(selectAppScriptLibraryCount())
  const libraryCount = useAppSelector(selectAppLibraryCount())
  const openTab = useAppSelector(selectAppOpenTab())
  const tutorial = useAppSelector(selectAppTutorial())
  const version = useAppSelector(selectAppVersion())
  const sceneGroups = useAppSelector(selectScenePickerSceneGroups())
  const generatorGroups = useAppSelector(selectScenePickerGeneratorGroups())
  const gridGroups = useAppSelector(selectScenePickerGridGroups())
  const ungroupedScenes = useAppSelector(selectScenePickerUngroupedScenes())
  const ungroupedGenerators = useAppSelector(
    selectScenePickerUngroupedGenerators()
  )
  const ungroupedGrids = useAppSelector(selectScenePickerUngroupedGrids())
  const sceneCount = useAppSelector(selectScenePickerSceneCount())
  const generatorCount = useAppSelector(selectScenePickerGeneratorCount())
  const gridCount = useAppSelector(selectScenePickerGridCount())
  const allScenesCount = useAppSelector(selectScenePickerAllScenesCount())

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newVersion, setNewVersion] = useState('')
  const [newVersionLink, setNewVersionLink] = useState('')
  const [isFirstWindow, setIsFirstWindow] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState<any>()
  const [openMenu, setOpenMenu] = useState<string>()
  const [scenesToDelete, setScenesToDelete] = useState<number[]>()
  const [importFile, setImportFile] = useState('')
  const [importSources, setImportSources] = useState(false)
  const [isEditing, setIsEditing] = useState(-1)

  useEffect(() => {
    dispatch(setTutorialStart())
    flipflip()
      .api.getWindowId()
      .then((id) => {
        if (id === 1) {
          setIsFirstWindow(true)
          wretch(
            'https://api.github.com/repos/regtemp8/flipflip/releases/latest'
          )
            .get()
            .json((json) => {
              const newestReleaseTag = json.tag_name
              const newestReleaseURL = json.html_url
              let releaseVersion = newestReleaseTag
                .replace('v', '')
                .replace('.', '')
                .replace('.', '')
              let releaseBetaVersion = -1
              if (releaseVersion.includes('-')) {
                const releaseSplit = releaseVersion.split('-')
                releaseVersion = releaseSplit[0]
                const betaString = releaseSplit[1]
                const betaNumber = betaString.replace('beta', '')
                if (betaNumber === '') {
                  releaseBetaVersion = 0
                } else {
                  releaseBetaVersion = parseInt(betaNumber)
                }
              }
              let thisVersion = version.replace('.', '').replace('.', '')
              let thisBetaVersion = -1
              if (thisVersion.includes('-')) {
                const releaseSplit = thisVersion.split('-')
                thisVersion = releaseSplit[0]
                const betaString = releaseSplit[1]
                const betaNumber = betaString.replace('beta', '')
                if (betaNumber === '') {
                  thisBetaVersion = 0
                } else {
                  thisBetaVersion = parseInt(betaNumber)
                }
              }
              if (parseInt(releaseVersion) > parseInt(thisVersion)) {
                setNewVersion(newestReleaseTag)
                setNewVersionLink(newestReleaseURL)
              } else if (parseInt(releaseVersion) === parseInt(thisVersion)) {
                if (
                  (releaseBetaVersion === -1 && thisBetaVersion >= 0) ||
                  releaseBetaVersion > thisBetaVersion
                ) {
                  setNewVersion(newestReleaseTag)
                  setNewVersionLink(newestReleaseURL)
                }
              }
            })
            .catch((e) => {
              console.error(e)
            })
        }
      })
  }, [dispatch, version])

  const onImportScene = () => {
    setOpenMenu(MO.urlImport)
  }

  const onDeleteScenes = () => {
    setOpenMenu(undefined)
    setScenesToDelete([])
  }

  const onCancelDelete = () => {
    setScenesToDelete(undefined)
  }

  const onFinishDelete = () => {
    dispatch(deleteScenes(scenesToDelete as number[]))
    setScenesToDelete(undefined)
  }

  const onToggleDelete = (sceneID: number) => {
    console.log('onToggleDelete(' + sceneID + ')')
    const newDeleteScenes = Array.from(scenesToDelete as number[])
    if (newDeleteScenes.includes(sceneID)) {
      newDeleteScenes.splice(newDeleteScenes.indexOf(sceneID), 1)
    } else {
      newDeleteScenes.push(sceneID)
    }
    setScenesToDelete(newDeleteScenes)
  }

  const onFinishImportScene = (importFile: string, importSources: boolean) => {
    if (importFile.startsWith('http')) {
      wretch(importFile)
        .get()
        .text((text) => {
          let json
          try {
            json = JSON.parse(text)
            dispatch(importScenes(json, importSources))
            onCloseDialog()
          } catch (e) {
            dispatch(systemMessage('This is not a valid JSON file'))
          }
        })
        .catch((e) => {
          dispatch(systemMessage('Error accessing URL'))
        })
    } else {
      flipflip()
        .api.readTextFile(importFile)
        .then((text) => {
          try {
            const json = JSON.parse(text)
            dispatch(importScenes(json, importSources))
            onCloseDialog()
          } catch (e) {
            dispatch(systemMessage('This is not a valid JSON file'))
          }
        })
    }
  }

  const onNewWindow = () => {
    if (!newWindowAlerted) {
      setOpenMenu(MO.newWindowAlert)
    } else {
      newWindow(false)
    }
  }

  const onChangeTab = (e: SyntheticEvent, tab: number) => {
    if (openTab !== tab) {
      dispatch(setOpenTab(tab))
    }
  }

  const newWindow = (hideFutureWarnings: boolean) => {
    if (openMenu === MO.newWindowAlert) {
      setOpenMenu(undefined)
      if (hideFutureWarnings) {
        dispatch(setConfigNewWindowAlerted(true))
      }
    }

    window.open(
      window.location.href,
      'FlipFlipWindow',
      `width:${window.outerWidth},height:${window.outerHeight}`
    )
  }

  const onToggleDrawer = () => {
    if (tutorial === SPT.scenePicker) {
      dispatch(doneTutorial(SPT.scenePicker))
    }
    setDrawerOpen(!drawerOpen)
  }

  const onToggleNewMenu = () => {
    if (tutorial === SPT.add1) {
      dispatch(doneTutorial(SPT.add1))
    }
    setOpenMenu(openMenu === MO.new ? undefined : MO.new)
  }

  const onAddScene = () => {
    if (tutorial === SPT.add2) {
      dispatch(doneTutorial(SPT.add2))
    }
    dispatch(addScene())
  }

  const onAddGroup = () => {
    if (openTab === 0) {
      dispatch(addSceneGroup(SG.scene))
    } else if (openTab === 1) {
      dispatch(addSceneGroup(SG.generator))
    } else if (openTab === 2) {
      dispatch(addSceneGroup(SG.grid))
    }
  }

  const beginEditingName = (groupID: number) => {
    setIsEditing(groupID)
  }
  const endEditingName = () => {
    setIsEditing(-1)
  }

  const onOpenSortMenu = (e: MouseEvent) => {
    setMenuAnchorEl(e.currentTarget)
    setOpenMenu(MO.sort)
  }

  const onClickCloseMenu = (e: MouseEvent) => {
    if (openMenu === MO.new) {
      let parent: any = e.target
      do {
        let className = parent.className
        if (typeof className !== 'string' && className.baseVal != null) {
          className = className.baseVal
        }
        if (className.includes('MuiFab-')) {
          return
        }
        if (className.includes('ScenePicker-root')) {
          break
        }
      } while ((parent = parent.parentNode) != null)
      setMenuAnchorEl(undefined)
      setOpenMenu(undefined)
    }
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

  const onChangeImportSources = (e: ChangeEvent<HTMLInputElement>) => {
    setImportSources(e.target.checked)
  }

  const onCloseDialog = () => {
    setMenuAnchorEl(undefined)
    setOpenMenu(undefined)
    setImportFile('')
    setImportSources(false)
  }

  const onRandomScene = () => {
    dispatch(routeToRandomScene())
  }

  const openGitRelease = () => {
    openLink(newVersionLink)
  }

  const openLink = (url: string) => {
    window.open(url, '_blank')?.focus()
  }

  const renderSceneCard = (sceneID: number) => {
    return (
      <SceneCard
        key={sceneID}
        sceneID={sceneID}
        toDelete={scenesToDelete != null && scenesToDelete.includes(sceneID)}
        action={
          scenesToDelete == null
            ? () => dispatch(routeToScene(sceneID))
            : () => onToggleDelete(sceneID)
        }
      />
    )
  }

  const renderGridCard = (gridID: number) => {
    const sceneID = convertGridIDToSceneID(gridID)
    return (
      <SceneCard
        grid
        key={sceneID}
        sceneID={gridID}
        toDelete={scenesToDelete != null && scenesToDelete.includes(sceneID)}
        action={
          scenesToDelete == null
            ? () => dispatch(routeToGrid(gridID))
            : () => onToggleDelete(sceneID)
        }
      />
    )
  }

  const renderUngroupedSortable = (type: string, ungrouped: number[]) => {
    const renderCard = type === SG.grid ? renderGridCard : renderSceneCard
    return (
      <Sortable
        className={classes.sceneList}
        options={{
          group: {
            name: type,
            pull: true,
            put: true
          },
          animation: 150,
          easing: 'cubic-bezier(1, 0, 0, 1)'
        }}
        onChange={(order: any, sortable: any, evt: any) => {
          dispatch(
            onScenePickerChangeUngroupedSort(
              ungrouped,
              type,
              evt.type,
              evt.oldIndex,
              evt.newIndex,
              evt.item.id,
              order.length
            )
          )
        }}
      >
        {ungrouped.map((id) => renderCard(id))}
      </Sortable>
    )
  }

  const renderSceneGroupsSortable = (type: string, sceneGroups: number[]) => {
    const renderCard = type === SG.grid ? renderGridCard : renderSceneCard
    return (
      <Sortable
        options={{
          group: {
            name: 'group',
            pull: false,
            put: false
          },
          animation: 150,
          handle: '.group-handle',
          easing: 'cubic-bezier(1, 0, 0, 1)'
        }}
        onChange={(order: any, sortable: any, evt: any) => {
          dispatch(
            onScenePickerChangeSceneGroupSort(type, evt.oldIndex, evt.newIndex)
          )
        }}
      >
        {sceneGroups.map((id) => (
          <SceneGroup
            key={id}
            id={id}
            isEditingName={isEditing === id}
            endEditingName={endEditingName}
            beginEditingName={beginEditingName}
            renderCard={renderCard}
          />
        ))}
      </Sortable>
    )
  }

  const open = drawerOpen
  return (
    <div className={classes.root} onClick={onClickCloseMenu}>
      <AppBar
        enableColorOnDark
        position="absolute"
        className={cx(
          classes.appBar,
          open && classes.appBarShift,
          tutorial === SPT.scenePicker && classes.backdropTop
        )}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Toggle Drawer"
            className={cx(tutorial === SPT.scenePicker && classes.highlight)}
            onClick={onToggleDrawer}
            size="large"
          >
            <MenuIcon />
          </IconButton>
          <VSpin>
            <div className={classes.logo} />
          </VSpin>
          <Typography
            component="h1"
            variant="h4"
            color="inherit"
            noWrap
            className={classes.title}
          >
            FlipFlip
          </Typography>
          <Typography
            variant="caption"
            color="inherit"
            noWrap
            className={classes.version}
          >
            v{version}
          </Typography>
          <div className={classes.fill} />
          {newVersion !== '' && (
            <Tooltip disableInteractive title={`Download ${newVersion}`}>
              <IconButton
                color="inherit"
                className={classes.updateIcon}
                onClick={openGitRelease}
                size="large"
              >
                <Badge variant="dot" color="secondary">
                  <SystemUpdateIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          <SceneSearch placeholder={'Search ...'} />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        className={
          tutorial === SPT.drawer
            ? cx(classes.backdropTop, classes.disable, classes.highlight)
            : ''
        }
        classes={{
          paper: cx(classes.drawerPaper, !open && classes.drawerPaperClose)
        }}
        open={open}
      >
        <div className={classes.drawerToolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Toggle Drawer"
            onClick={onToggleDrawer}
            size="large"
          >
            <MenuIcon />
          </IconButton>
          <VSpin>
            <div className={cx(classes.logo, classes.drawerLogo)} />
          </VSpin>
          <Typography component="h1" variant="h6" color="inherit" noWrap>
            FlipFlip
          </Typography>
        </div>

        <Divider />

        <div>
          <Tabs
            orientation="vertical"
            value={openTab}
            onChange={onChangeTab}
            aria-label="scene picker tabs"
            className={classes.tabs}
          >
            <Tab
              id="vertical-tab-0"
              aria-controls="vertical-tabpanel-0"
              icon={<MovieIcon />}
              label={open ? `Scenes (${sceneCount})` : ''}
              className={cx(
                classes.tab,
                classes.sceneTab,
                !open && classes.tabClose
              )}
            />
            <Tab
              id="vertical-tab-1"
              aria-controls="vertical-tabpanel-1"
              icon={<MovieFilterIcon />}
              label={open ? `Scene Generators (${generatorCount})` : ''}
              className={cx(
                classes.tab,
                classes.generatorTab,
                !open && classes.tabClose
              )}
            />
            <Tab
              id="vertical-tab-2"
              aria-controls="vertical-tabpanel-2"
              icon={<GridOnIcon />}
              label={open ? `Scene Grids (${gridCount})` : ''}
              className={cx(
                classes.tab,
                classes.gridTab,
                !open && classes.tabClose
              )}
            />
          </Tabs>
        </div>

        {isFirstWindow && (
          <>
            <Divider />

            <div>
              <Tooltip disableInteractive title={drawerOpen ? '' : 'Library'}>
                <ListItemButton
                  onClick={() => {
                    dispatch(routeToLibrary())
                  }}
                >
                  <ListItemIcon>
                    <LocalLibraryIcon />
                  </ListItemIcon>
                  <ListItemText primary="Library" />
                  {libraryCount > 0 && (
                    <Chip
                      className={cx(classes.chip, !open && classes.chipClose)}
                      label={libraryCount}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </ListItemButton>
              </Tooltip>
              <Tooltip
                disableInteractive
                title={drawerOpen ? '' : 'Audio Library'}
              >
                <ListItemButton
                  onClick={() => {
                    dispatch(routeToAudios())
                  }}
                >
                  <ListItemIcon>
                    <LibraryMusicIcon />
                  </ListItemIcon>
                  <ListItemText primary="Audio Library" />
                  {audioLibraryCount > 0 && (
                    <Chip
                      className={cx(classes.chip, !open && classes.chipClose)}
                      label={audioLibraryCount}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </ListItemButton>
              </Tooltip>
              <Tooltip
                disableInteractive
                title={drawerOpen ? '' : 'Script Library'}
              >
                <ListItemButton
                  onClick={() => {
                    dispatch(routeToScripts())
                  }}
                >
                  <ListItemIcon>
                    <LibraryBooksIcon />
                  </ListItemIcon>
                  <ListItemText primary="Script Library" />
                  {scriptLibraryCount > 0 && (
                    <Chip
                      className={cx(classes.chip, !open && classes.chipClose)}
                      label={scriptLibraryCount}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </div>

            <Divider />

            <div>
              <Tooltip
                disableInteractive
                title={drawerOpen ? '' : 'Caption Scripter'}
              >
                <ListItemButton onClick={() => dispatch(routeToScriptor)}>
                  <ListItemIcon>
                    <CodeIcon />
                  </ListItemIcon>
                  <ListItemText primary="Caption Scripter" />
                </ListItemButton>
              </Tooltip>
            </div>

            <Divider />

            <div>
              {allScenesCount > 0 && (
                <>
                  <Tooltip
                    disableInteractive
                    title={drawerOpen ? '' : 'New Window'}
                  >
                    <ListItemButton onClick={onNewWindow}>
                      <ListItemIcon>
                        <OpenInNewIcon />
                      </ListItemIcon>
                      <ListItemText primary="New Window" />
                    </ListItemButton>
                  </Tooltip>

                  <Dialog
                    open={openMenu === MO.newWindowAlert}
                    onClose={onCloseDialog}
                    aria-labelledby="new-window-title"
                    aria-describedby="new-window-description"
                  >
                    <DialogTitle id="new-window-title">
                      New Window Warning
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="new-window-description">
                        Please be aware that only changes made in the main
                        window (this window) will be saved.
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => newWindow(true)} color="secondary">
                        Don't show again
                      </Button>
                      <Button onClick={() => newWindow(false)} color="primary">
                        OK
                      </Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}
              <Tooltip disableInteractive title={drawerOpen ? '' : 'Settings'}>
                <ListItemButton
                  onClick={() => {
                    dispatch(routeToConfig())
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItemButton>
              </Tooltip>
              <Tooltip
                disableInteractive
                title={drawerOpen ? '' : 'User Manual'}
              >
                <ListItemButton
                  onClick={() =>
                    openLink('https://ififfy.github.io/flipflip/#/')
                  }
                >
                  <ListItemIcon>
                    <HelpIcon />
                  </ListItemIcon>
                  <ListItemText primary="User Manual" />
                </ListItemButton>
              </Tooltip>
            </div>
          </>
        )}
        <div className={classes.fill} />

        <div
          className={cx(
            classes.drawerBottom,
            !open && classes.drawerBottomClose
          )}
        >
          <Typography variant="body2" color="inherit">
            Questions? Suggestions?
            <br />
            Visit us on{' '}
            <Link
              href="#"
              onClick={() => openLink('https://github.com/regtemp8/flipflip')}
              underline="hover"
            >
              GitHub
            </Link>{' '}
            or{' '}
            <Link
              href="#"
              onClick={() => openLink('https://www.reddit.com/r/flipflip')}
              underline="hover"
            >
              Reddit
            </Link>
          </Typography>
        </div>
      </Drawer>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth={false} className={classes.container}>
          {openTab === 0 && (
            <Box>
              {renderUngroupedSortable(SG.scene, ungroupedScenes)}
              {renderSceneGroupsSortable(SG.scene, sceneGroups)}
            </Box>
          )}
          {openTab === 1 && (
            <Box>
              {renderUngroupedSortable(SG.generator, ungroupedGenerators)}
              {renderSceneGroupsSortable(SG.generator, generatorGroups)}
            </Box>
          )}
          {openTab === 2 && (
            <Box>
              {renderUngroupedSortable(SG.grid, ungroupedGrids)}
              {renderSceneGroupsSortable(SG.grid, gridGroups)}
            </Box>
          )}
        </Container>
      </main>

      {scenesToDelete != null && (
        <>
          <Tooltip disableInteractive title={'Delete Selected Scenes'}>
            <Fab
              className={classes.deleteButton}
              onClick={onFinishDelete}
              size="large"
            >
              <DeleteIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip disableInteractive title={'Cancel Delete'}>
            <Fab
              className={classes.sortMenuButton}
              onClick={onCancelDelete}
              size="medium"
            >
              <CloseIcon className={classes.icon} />
            </Fab>
          </Tooltip>
        </>
      )}

      {scenesToDelete == null && (
        <>
          {isFirstWindow && (
            <>
              {allScenesCount > 0 && (
                <Tooltip
                  disableInteractive
                  title="Delete Scenes"
                  placement="left"
                >
                  <Fab
                    className={cx(
                      classes.addButton,
                      classes.deleteScenesButton,
                      openMenu !== MO.new && classes.addButtonClose
                    )}
                    onClick={onDeleteScenes}
                    size="small"
                  >
                    <DeleteIcon className={classes.icon} />
                  </Fab>
                </Tooltip>
              )}
              <Tooltip disableInteractive title="Import Scene" placement="left">
                <Fab
                  className={cx(
                    classes.addButton,
                    classes.importSceneButton,
                    openMenu !== MO.new && classes.addButtonClose
                  )}
                  onClick={onImportScene}
                  size="small"
                >
                  <GetAppIcon className={classes.icon} />
                </Fab>
              </Tooltip>
              <Tooltip disableInteractive title="Add Scene" placement="left">
                <Fab
                  className={cx(
                    classes.addButton,
                    classes.addSceneButton,
                    openMenu !== MO.new && classes.addButtonClose,
                    tutorial === SPT.add2 &&
                      cx(classes.backdropTop, classes.highlight)
                  )}
                  onClick={onAddScene}
                  size="small"
                >
                  <MovieIcon className={classes.icon} />
                </Fab>
              </Tooltip>
              <Tooltip
                disableInteractive
                title="Add Scene Generator"
                placement="left"
              >
                <span
                  className={classes.generateTooltip}
                  style={!canGenerate ? { pointerEvents: 'none' } : {}}
                >
                  <Fab
                    className={cx(
                      classes.addButton,
                      classes.addGeneratorButton,
                      openMenu !== MO.new && classes.addButtonClose
                    )}
                    onClick={() => {
                      dispatch(addGenerator())
                    }}
                    disabled={!canGenerate}
                    size="small"
                  >
                    <MovieFilterIcon className={classes.icon} />
                  </Fab>
                </span>
              </Tooltip>
              <Tooltip
                disableInteractive
                title="Add Scene Grid"
                placement="left"
              >
                <span
                  className={classes.gridTooltip}
                  style={!canGrid ? { pointerEvents: 'none' } : {}}
                >
                  <Fab
                    className={cx(
                      classes.addButton,
                      classes.addGridButton,
                      openMenu !== MO.new && classes.addButtonClose
                    )}
                    onClick={() => {
                      dispatch(addGrid())
                    }}
                    disabled={!canGrid}
                    size="small"
                  >
                    <GridOnIcon className={classes.icon} />
                  </Fab>
                </span>
              </Tooltip>
              <Tooltip disableInteractive title="Add Group" placement="left">
                <Fab
                  className={cx(
                    classes.addButton,
                    classes.addGridButton,
                    openMenu === MO.new && classes.addButtonClose
                  )}
                  onClick={onAddGroup}
                  size="small"
                >
                  <CreateNewFolderIcon className={classes.icon} />
                </Fab>
              </Tooltip>
              <Fab
                className={cx(
                  classes.addMenuButton,
                  (tutorial === SPT.add1 || tutorial === SPT.add2) &&
                    classes.backdropTop,
                  tutorial === SPT.add1 && classes.highlight
                )}
                onClick={onToggleNewMenu}
                size="large"
              >
                <AddIcon className={classes.icon} />
              </Fab>

              {allScenesCount >= 2 && (
                <>
                  <Fab
                    className={classes.sortMenuButton}
                    aria-haspopup="true"
                    aria-controls="sort-menu"
                    aria-label="Sort Scenes"
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
                    {[SF.alpha, SF.date, SF.count].map((sf) => (
                      <MenuItem key={sf}>
                        <ListItemText primary={en.get(sf)} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => {
                              dispatch(sortScenes(sf, true))
                            }}
                            size="large"
                          >
                            <ArrowUpwardIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => {
                              dispatch(sortScenes(sf, false))
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
                            dispatch(sortScenes(SF.random, true))
                          }}
                          size="large"
                        >
                          <ShuffleIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </MenuItem>
                  </Menu>
                </>
              )}
            </>
          )}
          <Tooltip disableInteractive title="Random Scene">
            <Fab
              className={cx(
                classes.randomButton,
                !isFirstWindow && classes.extraWindowRandomButton
              )}
              onClick={onRandomScene}
              size="small"
            >
              <CasinoIcon className={classes.icon} />
            </Fab>
          </Tooltip>
        </>
      )}

      <Dialog
        open={openMenu === MO.urlImport}
        onClose={onCloseDialog}
        aria-labelledby="import-title"
        aria-describedby="import-description"
      >
        <DialogTitle id="import-title">Import Scene</DialogTitle>
        <DialogContent>
          <DialogContentText id="import-description">
            To import a scene, enter the URL or open a local file. You can also
            choose whether or not to import sources into your Library.
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
                  <Tooltip
                    disableInteractive
                    title="Import Sources into Library"
                  >
                    <Checkbox
                      value={importSources}
                      onChange={onChangeImportSources}
                      checked={importSources}
                    />
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
            onClick={() => onFinishImportScene(importFile, importSources)}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

;(ScenePicker as any).displayName = 'ScenePicker'
export default ScenePicker

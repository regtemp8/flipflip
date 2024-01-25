import React, {
  MouseEvent,
  useEffect,
  useState,
  useRef,
  useCallback
} from 'react'
import wretch from 'wretch'
import { cx } from '@emotion/css'

import {
  AppBar,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  type Theme,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import FolderIcon from '@mui/icons-material/Folder'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import GetAppIcon from '@mui/icons-material/GetApp'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import SaveIcon from '@mui/icons-material/Save'

import { CST, MO, RP } from 'flipflip-common'
import captionProgramDefaults from '../../data/utils'
import Player from '../player/Player'
import SceneSelect from '../configGroups/SceneSelect'
import CaptionProgram from '../player/CaptionProgram'
import ChildCallbackHack from '../player/ChildCallbackHack'
import AudioCard from '../configGroups/AudioCard'
import FontOptions from '../library/FontOptions'
import CodeMirror, {
  booleanSetters,
  colorSetters,
  singleSetters,
  stringSetters,
  timestampRegex,
  tupleSetters
} from './CodeMirror'
import BaseSlider from '../common/slider/BaseSlider'
import { selectAppTutorial } from '../../store/app/selectors'
import { addScriptSingle } from '../../store/app/slice'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { setRouteGoBack, addToScriptsIfNotExists } from '../../store/app/thunks'
import { setCaptionScriptOpacity } from '../../store/captionScript/actions'
import {
  setCaptionScriptScript,
  setCaptionScriptURL
} from '../../store/captionScript/slice'
import {
  selectCaptionScriptUrl,
  selectCaptionScriptScript,
  selectCaptionScriptOpacity
} from '../../store/captionScript/selectors'
import {
  onCaptionScriptorChangeScene,
  onCaptionScriptorNewScript,
  onCaptionScriptorOpenScript
} from '../../store/captionScriptor/thunks'
import {
  selectCaptionScriptorCaptionScriptID,
  selectCaptionScriptorSceneID,
  selectCaptionScriptorSceneScripts
} from '../../store/captionScriptor/selectors'
import { selectSceneAudioEnabled } from '../../store/scene/selectors'
import flipflip from '../../FlipFlipService'
import { RootState } from '../../store/store'

require('codemirror/lib/codemirror.css')
require('codemirror/theme/material.css')

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex'
  },
  fill: {
    flexGrow: 1
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
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
    flexBasis: '3%'
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
    display: 'grid',
    gridTemplateColumns: '40% 20% 40%',
    gridTemplateRows: '50% 50%'
  },
  scriptGrid: {
    gridRowStart: 1,
    gridRowEnd: 3,
    display: 'flex',
    flexDirection: 'column'
  },
  scriptArea: {
    alignItems: 'start'
  },
  menuGrid: {
    gridRowStart: 1,
    gridRowEnd: 3,
    display: 'flex',
    flexDirection: 'column'
  },
  menuCard: {
    height: '100%',
    overflowY: 'auto'
  },
  playerGrid: {
    overflow: 'hidden',
    display: 'grid'
  },
  fontGrid: {
    borderWidth: 1,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'none none none solid'
  },
  fontCard: {
    height: '100%',
    overflowY: 'auto'
  },
  menuCardContent: {
    paddingTop: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  menuGridButtons: {
    display: 'flex',
    padding: '0 !important',
    marginTop: theme.spacing(1)
  },
  noPaddingTop: {
    paddingTop: '0 !important'
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: '25%'
  },
  emptyMessage2: {
    textAlign: 'center'
  },
  errorIcon: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    width: '10em',
    height: '10em',
    zIndex: 3
  },
  statusMessage: {
    display: 'flex',
    marginLeft: theme.spacing(1)
  },
  errorMessageIcon: {
    marginTop: 3,
    marginRight: theme.spacing(1)
  },
  okIcon: {
    marginTop: 3,
    color: theme.palette.success.main
  },
  hidden: {
    opacity: 0
  },
  openFileName: {
    marginLeft: 'auto',
    marginTop: theme.spacing(1.5),
    color: (theme.palette.text as any).hint
  },
  menuDivider: {
    marginLeft: 'auto'
  },
  actionButton: {
    color: '#FFCB6B'
  },
  setterButton: {
    color: '#F78C6C'
  },
  storeButton: {
    color: '#DECB6B'
  },
  keywordButton: {
    color: '#F07178'
  },
  codeMirrorWrapper: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: '100%'
  },
  backdropTop: {
    zIndex: theme.zIndex.modal + 1
  },
  backdropTopHighlight: {
    zIndex: theme.zIndex.modal + 1,
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid'
  },
  disable: {
    pointerEvents: 'none'
  },
  relative: {
    position: 'relative'
  }
}))

function CaptionScriptor() {
  const dispatch = useAppDispatch()
  const tutorial = useAppSelector(selectAppTutorial())
  const sceneID = useAppSelector(selectCaptionScriptorSceneID())
  const sceneScripts = useAppSelector(selectCaptionScriptorSceneScripts())
  const captionScriptID = useAppSelector(selectCaptionScriptorCaptionScriptID())
  const loadFromSceneError = false

  const audioEnabledSelector =
    sceneID !== 0
      ? selectSceneAudioEnabled(sceneID)
      : (state: RootState) => false
  const audioEnabled = useAppSelector(audioEnabledSelector)
  const url = useAppSelector(selectCaptionScriptUrl(captionScriptID))
  const script = useAppSelector(selectCaptionScriptScript(captionScriptID))

  const [selectScript, setSelectScript] = useState('')
  const [error, setError] = useState<string>()
  const [fullscreen, setFullscreen] = useState(false)
  const [scriptChanged, setScriptChanged] = useState(false)
  const [openMenu, setOpenMenu] = useState<string>()
  const [menuAnchorEl, setMenuAnchorEl] = useState<any>()

  const _currentTimestamp = useRef<number>(0)
  const _captionProgramJumpToHack = useRef(new ChildCallbackHack())
  const _codeMirrorAddHack = useRef(new ChildCallbackHack())
  const _codeMirrorOverwriteHack = useRef(new ChildCallbackHack())

  const onFullscreen = useCallback(() => {
    if (sceneID != null) {
      setFullscreen((fullscreen) => !fullscreen)
    } else {
      setFullscreen(false)
    }
  }, [sceneID])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) {
        onFullscreen()
      }
    }

    window.addEventListener('keydown', onKeyDown, false)
    return () => {
      _currentTimestamp.current = 0
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [fullscreen, onFullscreen])

  useEffect(() => {
    if (script) {
      _codeMirrorOverwriteHack.current.args = [script]
      _codeMirrorOverwriteHack.current.fire()
      setScriptChanged(false)
    } else {
      wretch(url)
        .get()
        .text((data) => {
          _codeMirrorOverwriteHack.current.args = [data]
          _codeMirrorOverwriteHack.current.fire()
          setScriptChanged(false)
        })
    }
  }, [script, url])

  const onPlaying = (position: number, duration: number) => {
    _currentTimestamp.current = position
  }

  const onCloseDialog = () => {
    setOpenMenu(undefined)
    setMenuAnchorEl(null)
    setSelectScript('')
  }

  const onNew = () => {
    if (scriptChanged) {
      setOpenMenu(MO.new)
    } else {
      onConfirmNew()
    }
  }

  const onConfirmNew = () => {
    onCloseDialog()
    setError(undefined)
    dispatch(onCaptionScriptorNewScript())
  }

  const onOpenMenu = (e: MouseEvent) => {
    setMenuAnchorEl(e.currentTarget)
    setOpenMenu(MO.open)
  }

  const onOpen = () => {
    onCloseDialog()
    if (scriptChanged) {
      setOpenMenu(MO.openLocal)
    } else {
      onConfirmOpen()
    }
  }

  const onConfirmOpen = async () => {
    onCloseDialog()
    const url = await flipflip().api.openTextFile()
    if (!url) return
    dispatch(onCaptionScriptorOpenScript(url))
  }

  const onOpenFromLibrary = () => {
    onCloseDialog()
    if (scriptChanged) {
      setOpenMenu(MO.openLibrary)
    } else {
      onConfirmOpenFromLibrary()
    }
  }

  const onConfirmOpenFromLibrary = () => {
    onCloseDialog()
    dispatch(addScriptSingle())
  }

  const onSaveThen = async (then?: () => void) => {
    const saved = (await onSave()) === true
    if (saved && then != null) {
      then()
    }
  }

  const onSaveMenu = (e: MouseEvent) => {
    setMenuAnchorEl(e.currentTarget)
    setOpenMenu(MO.save)
  }

  const onSave = async () => {
    onCloseDialog()
    if (!url) {
      await onSaveAs()
    } else {
      if (!url.startsWith('http')) {
        await flipflip().api.writeFile(url, script as string)
        setScriptChanged(false)
        return true
      } else {
        return false
      }
    }
  }

  const onSaveAs = async () => {
    onCloseDialog()
    const filePath = await flipflip().api.saveTextFile(
      url as string,
      script as string
    )
    if (filePath) {
      dispatch(setCaptionScriptURL({ id: captionScriptID, value: filePath }))
    }
  }

  const onSaveToLibrary = () => {
    onCloseDialog()
    onSave()
    dispatch(addToScriptsIfNotExists(captionScriptID))
  }

  const onLoadFromScene = () => {
    if (sceneScripts.length === 0 || loadFromSceneError) return
    if (scriptChanged) {
      setOpenMenu(MO.load)
    } else {
      onOpenScriptSelect()
    }
  }

  const onOpenScriptSelect = () => {
    const defScript =
      sceneScripts != null && sceneScripts.length > 0 ? sceneScripts[0] : ''

    setOpenMenu(MO.select)
    setSelectScript(defScript)
  }

  const onChangeSelectScript = (e: SelectChangeEvent) => {
    setSelectScript(e.target.value)
  }

  const onConfirmLoadFromScene = () => {
    dispatch(onCaptionScriptorOpenScript(selectScript))
    onCloseDialog()
  }

  const onError = (e: string) => {
    setError(e)
  }

  const onUpdateScript = (script: string, changed = false) => {
    setError(undefined)
    setScriptChanged(changed ? true : scriptChanged)
    dispatch(setCaptionScriptScript({ id: captionScriptID, value: script }))
  }

  const onGutterClick = (editor: any, clickedLine: number) => {
    let lineNum = clickedLine - 1
    const text = script as string
    const lines = text.split('\n')
    for (let l = 0; l < clickedLine; l++) {
      const line = lines[l]
      if (
        line.trim().length === 0 ||
        line[0] === '#' ||
        line.toLowerCase().startsWith('storephrase ') ||
        line.toLowerCase().startsWith('storeaudio ') ||
        timestampRegex.exec(line.split(' ')[0]) != null
      ) {
        lineNum--
      }
    }
    lineNum = Math.max(lineNum, 0)
    _captionProgramJumpToHack.current.args = [lineNum]
    _captionProgramJumpToHack.current.fire()
  }

  const goBack = () => {
    if (fullscreen) {
      onFullscreen()
    } else if (scriptChanged) {
      setOpenMenu(MO.error)
    } else {
      dispatch(setRouteGoBack())
    }
  }

  const onAddBlink = () => {
    onAddString('blink <TEXT> / <TEXT> / <TEXT>', true)
  }

  const onAddCap = () => {
    onAddString('cap <TEXT>', true)
  }

  const onAddBigCap = () => {
    onAddString('bigcap <TEXT>', true)
  }

  const onAddCount = () => {
    onAddString('count <START> <END>', true)
  }

  const onAddWait = () => {
    onAddString('wait <MILLISECONDS>', true)
  }

  const onAddAdvance = () => {
    onAddString('advance', true)
  }

  const onAddPlayAudio = () => {
    onAddString('playAudio <ALIAS> <VOLUME>', true)
  }

  const onAddStorePhrase = () => {
    onAddString('storePhrase <TEXT>', true)
  }

  const onAddStoreAudio = () => {
    onAddString('storeAudio <PATH> <ALIAS>', true)
  }

  const addAllSetters = () => {
    let addString = ''
    for (const setter of tupleSetters) {
      let property = setter.replace('set', '')
      property = property.charAt(0).toLowerCase() + property.slice(1)
      const defaultVal = (captionProgramDefaults as any)[property]
      addString += setter + ' ' + defaultVal[0] + ' ' + defaultVal[1] + '\n'
    }
    addString += '\n'
    for (const setter of stringSetters) {
      addString += setter + ' constant\n'
    }
    addString += '\n'
    for (const setter of singleSetters) {
      let property = setter.replace('set', '')
      property = property.charAt(0).toLowerCase() + property.slice(1)
      const defaultVal = (captionProgramDefaults as any)[property]
      addString += setter + ' ' + defaultVal + '\n'
    }
    addString += '\n'
    for (const setter of booleanSetters) {
      addString += setter + ' false\n'
    }
    for (const setter of colorSetters) {
      addString += setter + ' 0 #FFFFFF\n'
    }
    onAddString(addString, true)
  }

  const onAddSetter = (e: SelectChangeEvent) => {
    const value = e.target.value
    if (value === 'all') {
      addAllSetters()
    } else {
      if (tupleSetters.includes(value)) {
        onAddTupleSetter(value)
      } else if (singleSetters.includes(value)) {
        onAddSingleSetter(value)
      } else if (stringSetters.includes(value)) {
        onAddStringSetter(value)
      } else if (booleanSetters.includes(value)) {
        onAddBooleanSetter(value)
      } else if (colorSetters.includes(value)) {
        onAddColorSetter(value)
      }
    }
  }

  const onAddSingleSetter = (setter: string) => {
    let property = setter.replace('set', '')
    property = property.charAt(0).toLowerCase() + property.slice(1)
    const defaultVal = (captionProgramDefaults as any)[property]
    onAddString(setter + ' ' + defaultVal, true)
  }

  const onAddTupleSetter = (setter: string) => {
    let property = setter.replace('set', '')
    property = property.charAt(0).toLowerCase() + property.slice(1)
    const defaultVal = (captionProgramDefaults as any)[property]
    onAddString(setter + ' ' + defaultVal[0] + ' ' + defaultVal[1], true)
  }

  const onAddStringSetter = (setter: string) => {
    onAddString(setter + ' constant', true)
  }

  const onAddBooleanSetter = (setter: string) => {
    onAddString(setter + ' false', true)
  }

  const onAddColorSetter = (setter: string) => {
    onAddString(setter + ' 0 #FFFFFF', true)
  }

  const onAddString = (string: string, newLine = false) => {
    _codeMirrorAddHack.current.args = [string, newLine]
    _codeMirrorAddHack.current.fire()
  }

  const openLink = (url: string) => {
    window.open(url, '_blank')?.focus()
  }

  const getMenu = () => {
    let menuName, menuThen
    switch (openMenu) {
      case MO.error:
        menuName = 'Back'
        menuThen = () => {
          dispatch(setRouteGoBack())
        }
        break
      case MO.new:
        menuName = 'New'
        menuThen = onConfirmNew
        break
      case MO.openLocal:
        menuName = 'Open'
        menuThen = onConfirmOpen
        break
      case MO.openLibrary:
        menuName = 'Open'
        menuThen = onConfirmOpenFromLibrary
        break
      case MO.load:
        menuName = 'Load From Scene'
        menuThen = onOpenScriptSelect
        break
    }

    return { menuName, menuThen }
  }

  const { classes } = useStyles()
  const { menuName, menuThen } = getMenu()
  const getTimestamp = () => _currentTimestamp.current

  return (
    <div className={classes.root}>
      <AppBar enableColorOnDark position="absolute" className={classes.appBar}>
        <Toolbar className={classes.headerBar}>
          <div className={classes.headerLeft}>
            <Tooltip disableInteractive title="Back" placement="right-end">
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
            {url || 'Caption Scriptor'}
          </Typography>

          <Tooltip
            disableInteractive
            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <span style={sceneID === 0 ? { pointerEvents: 'none' } : {}}>
              <IconButton
                disabled={sceneID === 0}
                edge="start"
                color="inherit"
                aria-label={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                onClick={onFullscreen}
                size="large"
              >
                {fullscreen ? (
                  <FullscreenExitIcon fontSize="large" />
                ) : (
                  <FullscreenIcon fontSize="large" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />

        <div className={cx(classes.root, classes.fill)}>
          <Container maxWidth={false} className={classes.container}>
            <div
              className={cx(classes.scriptGrid, fullscreen && classes.hidden)}
              id={'script-field'}
            >
              {error != null && (
                <div className={classes.statusMessage}>
                  <ErrorOutlineIcon
                    className={classes.errorMessageIcon}
                    color="error"
                  />
                  <Typography component="div" variant="h5" color="error">
                    {error}
                  </Typography>
                </div>
              )}
              {error == null && script && script.length > 0 && (
                <div className={classes.statusMessage}>
                  <CheckCircleOutlineIcon className={classes.okIcon} />
                </div>
              )}
              {(!script || script.length === 0) && (
                <div className={classes.statusMessage}>
                  <Typography
                    component="div"
                    variant="subtitle1"
                    color="textPrimary"
                  >
                    Paste or type your script here.
                  </Typography>
                </div>
              )}
              <CodeMirror
                className={
                  tutorial === CST.code
                    ? classes.backdropTopHighlight
                    : classes.codeMirrorWrapper
                }
                onGutterClick={onGutterClick}
                onUpdateScript={onUpdateScript}
                addHack={_codeMirrorAddHack.current}
                overwriteHack={_codeMirrorOverwriteHack.current}
              />
            </div>
            <div className={cx(classes.menuGrid, fullscreen && classes.hidden)}>
              <Card className={classes.menuCard}>
                <CardContent className={classes.menuCardContent}>
                  <Grid container spacing={2}>
                    <Grid
                      item
                      xs={12}
                      className={cx(
                        classes.menuGridButtons,
                        tutorial === CST.menu && classes.backdropTopHighlight,
                        tutorial === CST.menu && classes.disable
                      )}
                    >
                      <Tooltip disableInteractive title="New">
                        <IconButton onClick={onNew} size="large">
                          <InsertDriveFileIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip disableInteractive title="Open">
                        <IconButton onClick={onOpenMenu} size="large">
                          <FolderIcon />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        id="open-menu"
                        elevation={1}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center'
                        }}
                        anchorEl={menuAnchorEl}
                        keepMounted
                        open={openMenu === MO.open}
                        onClose={onCloseDialog}
                      >
                        <MenuItem onClick={onOpen}>Open File</MenuItem>
                        <MenuItem onClick={onOpenFromLibrary}>
                          Open From Library
                        </MenuItem>
                      </Menu>
                      <Tooltip disableInteractive title="Save">
                        <IconButton onClick={onSaveMenu} size="large">
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        id="save-menu"
                        elevation={1}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center'
                        }}
                        anchorEl={menuAnchorEl}
                        keepMounted
                        open={openMenu === MO.save}
                        onClose={onCloseDialog}
                      >
                        <MenuItem
                          disabled={
                            !scriptChanged ||
                            (url != null && url.startsWith('http'))
                          }
                          onClick={onSave}
                        >
                          Save
                        </MenuItem>
                        <MenuItem onClick={onSaveAs}>Save As</MenuItem>
                        <MenuItem disabled={!url} onClick={onSaveToLibrary}>
                          Save To Library
                        </MenuItem>
                      </Menu>
                      <Divider
                        orientation="vertical"
                        flexItem
                        className={classes.menuDivider}
                      />
                      <Tooltip disableInteractive title="Load From Scene">
                        <span
                          style={
                            !sceneScripts?.length
                              ? { pointerEvents: 'none' }
                              : {}
                          }
                        >
                          <IconButton
                            disabled={!sceneScripts?.length}
                            onClick={onLoadFromScene}
                            size="large"
                          >
                            {loadFromSceneError ? (
                              <ErrorOutlineIcon color={'error'} />
                            ) : (
                              <GetAppIcon />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      className={cx(
                        classes.noPaddingTop,
                        tutorial === CST.menu && classes.backdropTop
                      )}
                    >
                      <Divider variant={'fullWidth'} />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      className={cx(
                        tutorial === CST.menu && classes.backdropTopHighlight,
                        tutorial === CST.menu && classes.disable
                      )}
                    >
                      {sceneID === 0 && (
                        <Typography
                          component="div"
                          variant="subtitle1"
                          color="textPrimary"
                        >
                          Select a Scene to start testing
                        </Typography>
                      )}
                      <SceneSelect
                        value={sceneID}
                        onChange={(sceneID: number) => {
                          dispatch(
                            onCaptionScriptorChangeScene(
                              sceneID,
                              captionScriptID
                            )
                          )
                        }}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      className={cx(
                        tutorial === CST.actions &&
                          classes.backdropTopHighlight,
                        tutorial === CST.actions && classes.disable
                      )}
                    >
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <Typography variant={'h5'}>Actions</Typography>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={
                              'For each <TEXT> between slashes, show text for blinkDuration ms, then wait blinkDelay ms. When they are all done, wait blinkGroupDelay ms.'
                            }
                          >
                            <Button
                              className={classes.actionButton}
                              onClick={onAddBlink}
                              variant="outlined"
                            >
                              blink
                            </Button>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={
                              'Show smaller <TEXT> for captionDuration ms, then wait captionDelay ms.'
                            }
                          >
                            <Button
                              className={classes.actionButton}
                              onClick={onAddCap}
                              variant="outlined"
                            >
                              cap
                            </Button>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={
                              'Show bigger <TEXT> for captionDuration ms, then wait captionDelay ms.'
                            }
                          >
                            <Button
                              className={classes.actionButton}
                              onClick={onAddBigCap}
                              variant="outlined"
                            >
                              bigcap
                            </Button>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={
                              'Count from <START> to <END> (<START> and <END> are whole numbers). Display each number for countDuration ms, then wait countDelay ms. When they are all done, wait countGroupDelay ms.'
                            }
                          >
                            <Button
                              className={classes.actionButton}
                              onClick={onAddCount}
                              variant="outlined"
                            >
                              count
                            </Button>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={'Wait <MILLISECONDS> ms'}
                          >
                            <Button
                              className={classes.actionButton}
                              onClick={onAddWait}
                              variant="outlined"
                            >
                              wait
                            </Button>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={'Advance to the next image'}
                          >
                            <Button
                              className={classes.actionButton}
                              onClick={onAddAdvance}
                              variant="outlined"
                            >
                              advance
                            </Button>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={'Play audio <ALIAS> at volume <VOLUME>'}
                          >
                            <Button
                              className={classes.actionButton}
                              onClick={onAddPlayAudio}
                              variant="outlined"
                            >
                              playAudio
                            </Button>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      className={cx(
                        tutorial === CST.actions && classes.backdropTop
                      )}
                    >
                      <Divider variant={'fullWidth'} />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      className={cx(
                        tutorial === CST.actions &&
                          classes.backdropTopHighlight,
                        tutorial === CST.actions && classes.disable
                      )}
                    >
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <Typography variant={'h5'}>Setters</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Select
                            variant="standard"
                            fullWidth
                            value={''}
                            onChange={onAddSetter}
                          >
                            <MenuItem key={'all'} value={'all'}>
                              Insert All
                            </MenuItem>
                            <Divider />
                            {tupleSetters.map((s) => (
                              <MenuItem
                                className={classes.setterButton}
                                key={s}
                                value={s}
                              >
                                {s}
                              </MenuItem>
                            ))}
                            <Divider />
                            {stringSetters.map((s) => (
                              <MenuItem
                                className={classes.setterButton}
                                key={s}
                                value={s}
                              >
                                {s}
                              </MenuItem>
                            ))}
                            <Divider />
                            {singleSetters.map((s) => (
                              <MenuItem
                                className={classes.setterButton}
                                key={s}
                                value={s}
                              >
                                {s}
                              </MenuItem>
                            ))}
                            <Divider />
                            {booleanSetters.map((s) => (
                              <MenuItem
                                className={classes.setterButton}
                                key={s}
                                value={s}
                              >
                                {s}
                              </MenuItem>
                            ))}
                            {colorSetters.map((s) => (
                              <MenuItem
                                className={classes.setterButton}
                                key={s}
                                value={s}
                              >
                                {s}
                              </MenuItem>
                            ))}
                          </Select>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      className={cx(
                        tutorial === CST.actions && classes.backdropTop
                      )}
                    >
                      <Divider variant={'fullWidth'} />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      className={cx(
                        tutorial === CST.actions &&
                          classes.backdropTopHighlight,
                        tutorial === CST.actions && classes.disable
                      )}
                    >
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <Typography variant={'h5'}>Special</Typography>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={
                              'Stores an audio file to be used with playAudio'
                            }
                          >
                            <Button
                              className={classes.storeButton}
                              onClick={onAddStoreAudio}
                              variant="outlined"
                            >
                              storeAudio
                            </Button>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={
                              'Stores a phrase to be used with $RANDOM_PHRASE'
                            }
                          >
                            <Button
                              className={classes.storeButton}
                              onClick={onAddStorePhrase}
                              variant="outlined"
                            >
                              storePhrase
                            </Button>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={
                              'When running, is replaced with a random stored phrase'
                            }
                          >
                            <Button
                              className={classes.keywordButton}
                              onClick={() => onAddString('$RANDOM_PHRASE')}
                              variant="outlined"
                            >
                              $RANDOM_PHRASE
                            </Button>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            disableInteractive
                            title={
                              'When running, is replaced with a random tag phrase based on the current source'
                            }
                          >
                            <Button
                              className={classes.keywordButton}
                              onClick={() => onAddString('$TAG_PHRASE')}
                              variant="outlined"
                            >
                              $TAG_PHRASE
                            </Button>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider variant={'fullWidth'} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="inherit">
                        See{' '}
                        <Link
                          href="#"
                          onClick={() =>
                            openLink(
                              'https://regtemp8.github.io/flipflip/#/caption_script'
                            )
                          }
                          underline="hover"
                        >
                          documentation
                        </Link>{' '}
                        for help.
                      </Typography>
                    </Grid>
                  </Grid>
                  <div className={classes.fill} />
                  {sceneID !== 0 && !fullscreen && (
                    <AudioCard
                      startPlaying
                      shorterSeek
                      showMsTimestamp
                      sceneID={sceneID}
                      onPlaying={onPlaying}
                    />
                  )}
                  <BaseSlider
                    min={0}
                    max={100}
                    selector={selectCaptionScriptOpacity(captionScriptID)}
                    action={setCaptionScriptOpacity(captionScriptID)}
                    labelledBy="opacity-slider"
                    label={{ text: 'Script Opacity:', appendValue: true }}
                    format={{ type: 'percent' }}
                  />
                </CardContent>
              </Card>
            </div>
            <div
              className={cx(
                classes.playerGrid,
                tutorial === CST.player && classes.backdropTopHighlight
              )}
            >
              {sceneID !== 0 && (
                <Player
                  uuid="caption-scriptor"
                  gridView={!fullscreen}
                  captionScale={fullscreen ? 1 : 0.3753}
                  onCaptionError={onError}
                  captionProgramJumpToHack={_captionProgramJumpToHack.current}
                  getCurrentTimestamp={
                    fullscreen === true || audioEnabled === false
                      ? undefined
                      : getTimestamp
                  }
                />
              )}
              {error != null && (
                <ErrorOutlineIcon className={classes.errorIcon} color="error" />
              )}
              {sceneID !== 0 && script && script.length > 0 && (
                <div className={cx(!fullscreen && classes.relative)}>
                  <CaptionProgram
                    sceneID={sceneID}
                    captionScriptID={captionScriptID}
                    persist={false}
                    repeat={RP.one}
                    scale={0.35}
                    singleTrack={true}
                    jumpToHack={_captionProgramJumpToHack.current}
                    onError={onError}
                  />
                </div>
              )}
            </div>
            <div
              className={cx(
                classes.fontGrid,
                fullscreen && classes.hidden,
                tutorial === CST.fonts && classes.backdropTopHighlight
              )}
            >
              <Card className={classes.fontCard}>
                <CardContent>
                  <Grid item xs={12}>
                    <FontOptions
                      name={'Blink'}
                      captionScriptID={captionScriptID}
                      type="blink"
                    />
                    <Divider />
                    <FontOptions
                      name={'Caption'}
                      captionScriptID={captionScriptID}
                      type="caption"
                    />
                    <Divider />
                    <FontOptions
                      name={'Big Caption'}
                      captionScriptID={captionScriptID}
                      type="captionBig"
                    />
                    <Divider />
                    <FontOptions
                      name={'Count'}
                      captionScriptID={captionScriptID}
                      type="count"
                    />
                  </Grid>
                </CardContent>
              </Card>
            </div>
          </Container>
        </div>
      </main>

      <Dialog
        open={openMenu === MO.select}
        onClose={onCloseDialog}
        aria-labelledby="load-title"
        aria-describedby="load-description"
      >
        <DialogTitle id="load-title">Load From Scene</DialogTitle>
        <DialogContent>
          <DialogContentText id="load-description">
            Choose a script to load:
          </DialogContentText>
          <Select
            variant="standard"
            fullWidth
            value={selectScript}
            onChange={onChangeSelectScript}
          >
            {sceneScripts &&
              sceneScripts.map((url, i) => (
                <MenuItem key={i} value={url}>
                  {url}
                </MenuItem>
              ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button
            disabled={!selectScript.length}
            onClick={onConfirmLoadFromScene}
            color="primary"
          >
            Load Script
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!menuName && !!menuThen}
        onClose={onCloseDialog}
        aria-labelledby="back-title"
        aria-describedby="back-description"
      >
        <DialogTitle id="back-title">Save Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText id="back-description">
            You have unsaved changes. Would you like to save?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={menuThen} color="inherit">
            {menuName} - Don't Save
          </Button>
          <Button onClick={onCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => onSaveThen(menuThen)} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

;(CaptionScriptor as any).displayName = 'CaptionScriptor'
export default CaptionScriptor

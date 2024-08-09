import React, { type MouseEvent, useEffect, useState } from 'react'
import clsx from 'clsx'

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
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  type Theme,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import DescriptionIcon from '@mui/icons-material/Description'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import GetAppIcon from '@mui/icons-material/GetApp'
import HttpIcon from '@mui/icons-material/Http'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import MenuIcon from '@mui/icons-material/Menu'
import SelectAllIcon from '@mui/icons-material/SelectAll'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import SortIcon from '@mui/icons-material/Sort'

import LibrarySearch from './LibrarySearch'
import ScriptSourceList from './ScriptSourceList'
import { en, AF, MO, SF, SP, SLT } from 'flipflip-common'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectAppTutorial,
  selectAppSpecialMode,
  selectAppScriptSelected,
  selectAppTagsCount,
  selectAppScripts,
  selectAppScriptFilters,
  selectAppFilteredScripts,
  selectAppScriptSelectedTagNames
} from '../../store/app/selectors'
import {
  setScriptFilters,
  setScriptSelected,
  batchTag,
  manageTags,
  setScriptsRemove,
  setScriptsRemoveAll
} from '../../store/app/slice'
import {
  setRouteGoBack,
  sortScripts,
  setScriptsAddAtStart,
  setScriptsAddAllAtStart,
  doneTutorial,
  importScriptFromLibrary,
  importSingleScriptFromLibrary
} from '../../store/app/thunks'
import {
  setCaptionScriptsTags,
  setCaptionScriptsAddTags,
  setCaptionScriptsRemoveTags,
  setCaptionScriptsToggleMarked
} from '../../store/captionScript/thunks'
import FlipFlipService from '../../FlipFlipService'

const drawerWidth = 240

const styles = (theme: Theme) =>
  createStyles({
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
  })

function ScriptLibrary(props: WithStyles<typeof styles>) {
  const flipflip = FlipFlipService.getInstance()
  const dispatch = useAppDispatch()
  const tutorial = useAppSelector(selectAppTutorial())
  const scripts = useAppSelector(selectAppScripts())
  const specialMode = useAppSelector(selectAppSpecialMode())
  const filters = useAppSelector(selectAppScriptFilters())
  const displaySources = useAppSelector(selectAppFilteredScripts())
  const selected = useAppSelector(selectAppScriptSelected())
  const tagsCount = useAppSelector(selectAppTagsCount())
  const selectedTagNames = useAppSelector(selectAppScriptSelectedTagNames())

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [menuAnchorEl, setMenuAnchorEl] = useState<any>()
  const [openMenu, setOpenMenu] = useState<string>()

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown, false)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    if (tutorial === SLT.final && drawerOpen) {
      setDrawerOpen(false)
    }
  }, [tutorial, drawerOpen])

  const onKeyDown = (e: KeyboardEvent) => {
    if (
      !e.shiftKey &&
      !e.ctrlKey &&
      e.altKey &&
      (e.key === 'm' || e.key === 'µ')
    ) {
      toggleMarked()
    } else if (e.key === 'Escape' && specialMode != null) {
      goBack()
    }
  }

  const onBatchTag = () => {
    onCloseDialog()
    dispatch(batchTag())
  }

  const goBack = () => {
    if (specialMode === SP.batchTag) {
      dispatch(setScriptSelected([]))
      setSelectedTags([])
      dispatch(batchTag())
    } else {
      dispatch(setRouteGoBack())
    }
  }

  const onUpdateFilters = (filters: string[]) => {
    dispatch(setScriptFilters(filters))
  }

  const onAddSource = async (type: string, e: MouseEvent) => {
    onCloseDialog()
    switch (type) {
      case AF.url:
        dispatch(setScriptsAddAtStart())
        break
      case AF.script:
        const scriptSources = await flipflip.api.loadScriptSources(e.shiftKey)
        if (scriptSources) {
          await addScriptSources(scriptSources)
        }
        break
    }
  }

  const addScriptSources = async (newSources: string[]) => {
    dispatch(setScriptsAddAllAtStart(newSources))
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
    if (tutorial === SLT.sidebar1) {
      dispatch(doneTutorial(SLT.sidebar1))
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
  }

  const onRemoveAll = () => {
    setOpenMenu(MO.removeAllAlert)
  }

  const onFinishRemoveAll = () => {
    dispatch(setScriptsRemoveAll())
    onCloseDialog()
  }

  const onFinishRemoveVisible = () => {
    dispatch(setScriptsRemove(displaySources))
    onCloseDialog()
    dispatch(setScriptFilters([]))
  }

  const onImportFromLibrary = () => {
    dispatch(importScriptFromLibrary(selected))
  }
  const onImportSingleFromLibrary = () => {
    dispatch(importSingleScriptFromLibrary(selected))
  }

  const onUpdateSelected = (selected: number[]) => {
    dispatch(setScriptSelected(selected))
  }

  const onSelectAll = () => {
    const newSelected = new Set([...selected, ...displaySources])
    dispatch(setScriptSelected([...newSelected]))
  }

  const onSelectNone = () => {
    const newSelected = selected.filter((id) => !displaySources.includes(id))
    dispatch(setScriptSelected(newSelected))
  }

  const toggleMarked = () => {
    dispatch(setCaptionScriptsToggleMarked(displaySources))
  }

  const batchTagOverwrite = () => {
    dispatch(setCaptionScriptsTags(selected, selectedTags))
    onCloseDialog()
  }

  const batchTagAdd = () => {
    dispatch(setCaptionScriptsAddTags(selected, selectedTags))
    onCloseDialog()
  }

  const batchTagRemove = () => {
    dispatch(setCaptionScriptsRemoveTags(selected, selectedTags))
    onCloseDialog()
  }

  const classes = props.classes
  const open = drawerOpen

  return (
    <div className={classes.root}>
      <AppBar
        enableColorOnDark
        position="absolute"
        className={clsx(
          classes.appBar,
          tutorial === SLT.toolbar && clsx(classes.backdropTop, classes.disable)
        )}
      >
        <Toolbar className={classes.headerBar}>
          <div className={classes.headerLeft}>
            <Tooltip
              disableInteractive
              title={
                specialMode === SP.select || specialMode === SP.selectSingle
                  ? 'Cancel Import'
                  : 'Back'
              }
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
            Caption Script Library
          </Typography>

          <div className={classes.headerRight}>
            <div
              className={clsx(
                classes.searchBar,
                tutorial === SLT.toolbar && classes.highlight
              )}
            >
              {scripts.length > 0 && (
                <Chip
                  className={classes.searchCount}
                  label={scripts.length}
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
                noTypes
                onUpdateFilters={onUpdateFilters}
              />
            </div>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        className={clsx(
          classes.drawer,
          (tutorial === SLT.sidebar1 ||
            tutorial === SLT.sidebar2 ||
            drawerOpen) &&
            classes.backdropTop,
          tutorial === SLT.sidebar2 && classes.highlight
        )}
        variant="permanent"
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !open && classes.drawerPaperClose,
            specialMode && classes.drawerPaperHidden
          )
        }}
        open={drawerOpen}
      >
        <div className={clsx(!open && classes.appBarSpacerWrapper)}>
          <Collapse in={!open} className={classes.appBarSpacerCollapse}>
            <div className={classes.appBarSpacer} />
          </Collapse>
        </div>

        <ListItem className={classes.drawerButton}>
          <IconButton
            className={clsx(tutorial === SLT.sidebar1 && classes.highlight)}
            onClick={onToggleDrawer}
            size="large"
          >
            <MenuIcon className={classes.drawerIcon} />
          </IconButton>
        </ListItem>

        <Divider />

        <div className={clsx(tutorial != null && classes.disable)}>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Manage Tags'}>
            <ListItemButton onClick={() => dispatch(manageTags())}>
              <ListItemIcon>
                <LocalOfferIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Tags" />
              {tagsCount > 0 && (
                <Chip
                  className={clsx(classes.chip, !open && classes.chipClose)}
                  label={tagsCount}
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
        </div>
      </Drawer>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div className={clsx(classes.root, classes.fill)}>
          {!specialMode && <div className={classes.drawerSpacer} />}
          <Container
            maxWidth={false}
            className={clsx(
              classes.container,
              displaySources.length > 0 && classes.containerNotEmpty
            )}
          >
            <ScriptSourceList
              selected={selected}
              showHelp={!specialMode && filters.length === 0}
              sources={displaySources}
              onUpdateSelected={onUpdateSelected}
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
            title={specialMode === SP.batchTag ? 'Batch Tag' : 'Import'}
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
                    : specialMode === SP.select
                      ? onImportFromLibrary
                      : onImportSingleFromLibrary
                }
                size="large"
              >
                {(specialMode === SP.select ||
                  specialMode === SP.selectSingle) && (
                  <GetAppIcon className={classes.icon} />
                )}
                {specialMode === SP.batchTag && (
                  <LocalOfferIcon className={classes.icon} />
                )}
              </Fab>
            </Badge>
          </Tooltip>
        </React.Fragment>
      )}

      {!specialMode && (
        <React.Fragment>
          {scripts.length > 0 && (
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
            open={openMenu === MO.removeAllAlert}
            onClose={onCloseDialog}
            aria-labelledby="remove-all-title"
            aria-describedby="remove-all-description"
          >
            {filters.length === 0 && (
              <React.Fragment>
                <DialogTitle id="remove-all-title">
                  Delete Caption Script Library
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you really wanna delete your entire caption
                    script library...? ಠ_ಠ
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
                    caption script library?
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
          <Tooltip
            disableInteractive
            title={filters.length > 0 ? '' : 'Local Script'}
            placement="left"
          >
            <Fab
              className={clsx(
                classes.addButton,
                classes.addLocalButton,
                openMenu !== MO.new && classes.addButtonClose,
                openMenu === MO.new && classes.backdropTop,
                filters.length > 0 && classes.hidden
              )}
              disabled={filters.length > 0}
              onClick={(e: MouseEvent) => onAddSource(AF.script, e)}
              size="small"
            >
              <DescriptionIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Tooltip
            disableInteractive
            title={filters.length > 0 ? '' : 'URL'}
            placement="left"
          >
            <Fab
              className={clsx(
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
          <Fab
            className={clsx(
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

      <Fab
        disabled={scripts.length < 2}
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
        {[SF.alpha, SF.alphaFull, SF.date].map((sf) => (
          <MenuItem key={sf}>
            <ListItemText primary={en.get(sf)} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => {
                  dispatch(sortScripts(sf, true))
                }}
                size="large"
              >
                <ArrowUpwardIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => {
                  dispatch(sortScripts(sf, false))
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
                dispatch(sortScripts(SF.random, true))
              }}
              size="large"
            >
              <ShuffleIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </MenuItem>
      </Menu>

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
              displaySources={scripts}
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
    </div>
  )
}

;(ScriptLibrary as any).displayName = 'ScriptLibrary'
export default withStyles(styles)(ScriptLibrary as any)

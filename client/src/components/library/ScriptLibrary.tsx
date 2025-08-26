import { type MouseEvent, useEffect, useState, useCallback } from 'react'
import { cx } from '@emotion/css'

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
  ListItemText,
  Menu,
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
import { en, AF, MO, SF, SP, SLT, BatchTagOperation } from 'flipflip-common'
import { useNavigate } from 'react-router'
import {
  useBatchTagCaptionScriptsMutation,
  useCreateCaptionScriptsMutation,
  useDeleteCaptionScriptsMutation,
  useGetCaptionScriptBatchTagOptionsQuery,
  useGetCaptionScriptSearchOptionsQuery,
  useGetCaptionScriptsQuery,
  useGetFilteredCaptionScriptsQuery,
  useGetTagsCountQuery,
  useGetTutorialsQuery,
  useMarkCaptionScriptsMutation,
  useSortCaptionScriptsMutation
} from '../../store/api/slice'
import FilePicker from '../common/FilePicker'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectSpecialMode } from '../../store/app/selectors'
import { setSpecialMode } from '../../store/app/slice'
import {
  selectScriptLibrarySelectedTagIDs,
  selectLibrarySelectedTagNames
} from '../../store/api/selectors'
import { saveScriptLibraryYOffset } from '../../store/scriptLibrary/thunks'
import { selectScriptLibraryFilters } from '../../store/scriptLibrary/selectors'
import { setScriptLibraryAddHttpUrl, setScriptLibraryFilters } from '../../store/scriptLibrary/slice'

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
  headerLeft: {
    flexBasis: '20%',
    flexGrow: 1
  },
  headerRight: {
    maxWidth: '33%',
    flexBasis: '20%',
    flexGrow: 1,
    justifyContent: 'flex-end',
    display: 'flex'
  },
  searchBar: {
    float: 'right',
    display: 'flex',
    maxWidth: '100%',
    alignItems: 'center'
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
}))

function ScriptLibrary() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [createScripts] = useCreateCaptionScriptsMutation()
  const [sortScripts] = useSortCaptionScriptsMutation()
  const [deleteCaptionScripts] = useDeleteCaptionScriptsMutation()
  const [batchTagCaptionScripts] = useBatchTagCaptionScriptsMutation()
  const [markCaptionScripts] = useMarkCaptionScriptsMutation()
  const { data: tutorial } = useGetTutorialsQuery()
  const { data: scripts } = useGetCaptionScriptsQuery()
  const { data: tagsCount } = useGetTagsCountQuery()
  const { data: tagOptions } = useGetCaptionScriptBatchTagOptionsQuery()
  const { data: searchOptions } = useGetCaptionScriptSearchOptionsQuery()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [menuAnchorEl, setMenuAnchorEl] = useState<any>()
  const [openMenu, setOpenMenu] = useState<string>()
  const [selected, setSelected] = useState<number[]>([])
  const selectedTagIDs = useAppSelector(
    selectScriptLibrarySelectedTagIDs(selected)
  )
  const selectedTagNames = useAppSelector(
    selectLibrarySelectedTagNames(selectedTagIDs)
  )
  const specialMode = useAppSelector(selectSpecialMode())
  const filters = useAppSelector(selectScriptLibraryFilters())
  const { data: displaySources } = useGetFilteredCaptionScriptsQuery(filters)

  const goBack = useCallback(() => {
    if (specialMode === SP.batchTag) {
      setSelected([])
      setSelectedTags([])
    } else {
      dispatch(saveScriptLibraryYOffset())
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
        await markCaptionScripts(displaySources)
      } else if (e.key === 'Escape' && specialMode) {
        goBack()
      }
    }

    window.addEventListener('keydown', onKeyDown, false)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [goBack, specialMode, markCaptionScripts, displaySources])

  useEffect(() => {
    if (tutorial?.current === SLT.final && drawerOpen) {
      setDrawerOpen(false)
    }
  }, [tutorial?.current, drawerOpen])

  const onBatchTag = () => {
    dispatch(setSpecialMode(SP.batchTag))
    onCloseDialog()
  }

  const onAddSource = async (type: string) => {
    switch (type) {
      case AF.url:
        dispatch(setScriptLibraryAddHttpUrl(true))
        await createScripts([''])
        onCloseDialog()
        break
      case AF.script:
        setOpenMenu(MO.openLocal)
        break
    }
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
    // if (tutorial?.current === SLT.sidebar1) {
    //   dispatch(doneTutorial(SLT.sidebar1))
    // }
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

  const onFinishRemoveAll = async () => {
    await deleteCaptionScripts(undefined)
    onCloseDialog()
  }

  const onFinishRemoveVisible = async () => {
    await deleteCaptionScripts(displaySources)
    onCloseDialog()
    dispatch(setScriptLibraryFilters([]))
  }

  const onImportFromLibrary = () => {
    // dispatch(importScriptFromLibrary(selected))
  }
  const onImportSingleFromLibrary = () => {
    // dispatch(importSingleScriptFromLibrary(selected))
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
    await batchTagCaptionScripts({
      operation,
      ids: selected,
      tags: selectedTags
    })

  const onOpenLocalFiles = async (chosenFiles?: string[]) => {
    onCloseDialog()
    if (chosenFiles != null) {
      await createScripts(chosenFiles)
    }
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
          tutorial?.current === SLT.toolbar &&
            cx(classes.backdropTop, classes.disable)
        )}
      >
        <Toolbar>
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
              className={cx(
                classes.searchBar,
                tutorial?.current === SLT.toolbar && classes.highlight
              )}
            >
              {(scripts?.length ?? 0) > 0 && (
                <Chip
                  className={classes.searchCount}
                  label={scripts?.length}
                  size="medium"
                  variant="outlined"
                />
              )}
              {filters.length > 0 && (
                <Chip
                  className={classes.displayCount}
                  label={displaySources?.length ?? 0}
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
                  dispatch(setScriptLibraryFilters(filters))
                }
              />
            </div>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        className={cx(
          classes.drawer,
          (tutorial?.current === SLT.sidebar1 ||
            tutorial?.current === SLT.sidebar2 ||
            drawerOpen) &&
            classes.backdropTop,
          tutorial?.current === SLT.sidebar2 && classes.highlight
        )}
        variant="permanent"
        classes={{
          paper: cx(
            classes.drawerPaper,
            !specialMode && !open && classes.drawerPaperClose,
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
            className={cx(
              tutorial?.current === SLT.sidebar1 && classes.highlight
            )}
            onClick={onToggleDrawer}
            size="large"
          >
            <MenuIcon className={classes.drawerIcon} />
          </IconButton>
        </ListItem>

        <Divider />

        <div className={cx(tutorial?.current != null && classes.disable)}>
          <Tooltip disableInteractive title={drawerOpen ? '' : 'Manage Tags'}>
            <ListItemButton
              onClick={() => {
                dispatch(saveScriptLibraryYOffset())
                navigate('/tags')
              }}
            >
              <ListItemIcon>
                <LocalOfferIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Tags" />
              {(tagsCount ?? 0) > 0 && (
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
        <div className={cx(classes.root, classes.fill)}>
          {!specialMode && <div className={classes.drawerSpacer} />}
          <Container
            maxWidth={false}
            className={cx(
              classes.container,
              (displaySources?.length ?? 0) > 0 && classes.containerNotEmpty
            )}
          >
            <ScriptSourceList
              selected={selected}
              showHelp={!specialMode && filters.length === 0}
              scripts={scripts ?? []}
              filters={filters}
              sources={displaySources ?? []}
              onUpdateSelected={onUpdateSelected}
            />
          </Container>
        </div>
      </main>

      <Backdrop
        className={classes.backdrop}
        onClick={onCloseDialog}
        open={tutorial?.current == null && (openMenu === MO.new || drawerOpen)}
      />

      {specialMode && (
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
        </>
      )}

      {!specialMode && (
        <>
          {(scripts?.length ?? 0) > 0 && (
            <Tooltip
              disableInteractive
              title={
                filters.length === 0
                  ? 'Delete All Scripts'
                  : 'Delete These Scripts'
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
                  Delete Caption Script Library
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you want to delete your entire caption script
                    library?
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
            {filters.length > 0 && (
              <>
                <DialogTitle id="remove-all-title">
                  Delete Caption Scripts
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-all-description">
                    Are you sure you want to remove these caption scripts from
                    your library?
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
          </Dialog>
          <Tooltip
            disableInteractive
            title={filters.length > 0 ? '' : 'Local Script'}
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
              onClick={() => onAddSource(AF.script)}
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

      <Fab
        disabled={(scripts?.length ?? 0) < 2}
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
          <ListItem
            key={sf}
            secondaryAction={
              <>
                <IconButton
                  edge="end"
                  onClick={async () => {
                    await sortScripts({ sortBy: sf, sortOrder: 'asc' })
                  }}
                  size="large"
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={async () => {
                    await sortScripts({ sortBy: sf, sortOrder: 'desc' })
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
          key={SF.random}
          secondaryAction={
            <IconButton
              edge="end"
              onClick={async () => {
                await sortScripts({ sortBy: SF.random, sortOrder: 'asc' })
              }}
              size="large"
            >
              <ShuffleIcon />
            </IconButton>
          }
        >
          <ListItemText primary={en.get(SF.random)} />
        </ListItem>
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
              filters={selectedTags}
              placeholder={'Tag These Sources'}
              showCheckboxes
              onUpdateFilters={onSelectTags}
              inputVariant="standard"
              options={tagOptions ?? []}
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
      <FilePicker
        open={openMenu === MO.openLocal}
        type="txt"
        multiple
        path=""
        onClose={onOpenLocalFiles}
      />
    </div>
  )
}

;(ScriptLibrary as any).displayName = 'ScriptLibrary'
export default ScriptLibrary

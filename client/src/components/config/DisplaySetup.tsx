import React, { useCallback, useEffect, useState } from 'react'
import { cx } from '@emotion/css'
import {
  Card,
  CardActions,
  AppBar,
  IconButton,
  Toolbar,
  Tooltip,
  type Theme,
  Typography,
  List,
  Box,
  CardHeader,
  CardContent,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import { makeStyles } from 'tss-react/mui'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setRouteGoBack } from '../../store/app/thunks'
import {
  selectDisplayName,
  selectDisplayViews,
  selectDisplaySelectedViewName,
  selectDisplaySelectedView,
  selectDisplayViewsListYOffset
} from '../../store/display/selectors'
import { setDisplayName } from '../../store/display/actions'
import {
  addDisplayView,
  cloneDisplay,
  cloneDisplayView,
  removeDisplay,
  removeDisplayView
} from '../../store/display/thunks'
import BaseTextField from '../common/text/BaseTextField'
import DisplayViewSettings from './DisplayViewSettings'
import {
  setDisplayViewsListYOffset,
  swapDisplayViews
} from '../../store/display/slice'
import DisplayViewListItem from './DisplayViewListItem'
import ExpandLess from '@mui/icons-material/ExpandLess'
import DisplaySetupPreview from './DisplaySetupPreview'
import {
  ContentCopy,
  DeleteForever,
  FileCopy,
  Publish
} from '@mui/icons-material'
import { MO } from 'flipflip-common'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex',
    height: '100vh'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
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
    flexBasis: '13%'
  },
  headerRight: {
    flexBasis: '13%',
    justifyContent: 'flex-end',
    display: 'flex'
  },
  titleField: {
    margin: 0,
    textAlign: 'center',
    flexGrow: 1
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
  content: {
    width: '100%',
    backgroundColor: theme.palette.background.default
  },
  disable: {
    pointerEvents: 'none'
  },
  scrollableContent: {
    height: `calc(100% - ${theme.spacing(5)})`,
    padding: theme.spacing(2),
    overflow: 'scroll',
    '&:last-child': {
      paddingBottom: theme.spacing(3)
    }
  }
}))

interface SortableElementProps {
  value: SortableValue
}

interface SortableValue {
  index: number
  style: any
  data: any[]
}

interface SortableVirtualListProps {
  yOffset: number
  views: number[]
  height: number
  width: number
}

export interface DisplaySetupProps {
  displayID: number
}

function DisplaySetup(props: DisplaySetupProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [userExpandedSettings, setUserExpandedSettings] = useState<boolean>()
  const [openMenu, setOpenMenu] = useState<string>()

  const dispatch = useAppDispatch()
  const name = useAppSelector(selectDisplayName(props.displayID))
  const views = useAppSelector(selectDisplayViews(props.displayID))
  const selectedView = useAppSelector(
    selectDisplaySelectedView(props.displayID)
  )
  const selectedViewName = useAppSelector(
    selectDisplaySelectedViewName(props.displayID)
  )
  const yOffset = useAppSelector(selectDisplayViewsListYOffset(props.displayID))

  const getScrollTop = useCallback(() => {
    let scrollTop: number | undefined = undefined
    const sortableList = document.getElementById('sortable-list')
    if (sortableList != null) {
      const scrollElement = sortableList.firstElementChild
      scrollTop = scrollElement?.scrollTop ?? 0
    }

    return scrollTop
  }, [])

  const savePosition = useCallback(() => {
    const scrollTop = getScrollTop()
    if (scrollTop != null) {
      dispatch(
        setDisplayViewsListYOffset({ id: props.displayID, value: scrollTop })
      )
    }
  }, [dispatch, getScrollTop, props.displayID])

  useEffect(() => {
    return () => {
      savePosition()
    }
  }, [savePosition])

  const beginEditingName = () => {
    setIsEditingName(true)
  }

  const endEditingName = () => {
    setIsEditingName(false)
  }

  const goBack = () => {
    dispatch(setRouteGoBack())
  }

  const onPlayDisplay = () => {
    // TODO play display
  }

  const onCloneDisplay = () => {
    dispatch(cloneDisplay(props.displayID))
  }

  const onExportDisplay = () => {
    // TODO export subset of AppStorage
    // dispatch(exportDisplay(props.displayID))
  }

  const onDeleteDisplay = () => {
    setOpenMenu(MO.deleteAlert)
  }

  const onCloseDeleteDialog = () => {
    setOpenMenu(undefined)
  }

  const onFinishDeleteDisplay = () => {
    setOpenMenu(undefined)
    dispatch(removeDisplay(props.displayID))
  }

  const onAddView = () => {
    dispatch(addDisplayView(props.displayID))
  }

  const onCloneView = () => {
    dispatch(cloneDisplayView(props.displayID, selectedView as number))
  }

  const onDeleteView = () => {
    dispatch(removeDisplayView(props.displayID, selectedView as number))
  }

  const toggleSettingsExpand = () => {
    setUserExpandedSettings((value) =>
      value != null ? !value : selectedView == null
    )
  }

  const onSortEnd = ({
    oldIndex,
    newIndex
  }: {
    oldIndex: number
    newIndex: number
  }) => {
    const yOffset = getScrollTop()
    dispatch(
      swapDisplayViews({
        id: props.displayID,
        value: { oldIndex, newIndex, yOffset }
      })
    )
  }

  const VirtualList = (props: any) => {
    const { views, height, width, yOffset } = props
    return (
      <FixedSizeList
        height={height}
        width={width}
        initialScrollOffset={yOffset}
        itemSize={56}
        itemCount={views.length}
        itemData={views}
        itemKey={(index: number, data: any) => data[index]}
        overscanCount={10}
      >
        {Row}
      </FixedSizeList>
    )
  }

  const SortableVirtualList =
    SortableContainer<SortableVirtualListProps>(VirtualList)

  const SortableItem = SortableElement<SortableElementProps>(
    ({ value }: SortableElementProps) => {
      const index = value.index
      const viewID = value.data[index]
      return (
        <DisplayViewListItem
          index={index}
          viewID={viewID}
          displayID={props.displayID}
          selected={viewID === selectedView}
          style={value.style}
          getScrollTop={getScrollTop}
        />
      )
    }
  )

  const Row = (props: any) => {
    const { index } = props
    return <SortableItem index={index} value={props} />
  }

  const { classes } = useStyles()
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
                onClick={goBack}
                size="large"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </div>

          {isEditingName && (
            <form onSubmit={endEditingName} className={classes.titleField}>
              <BaseTextField
                variant="standard"
                autoFocus
                fullWidth
                id="title"
                margin="none"
                inputProps={{ className: classes.titleInput }}
                selector={selectDisplayName(props.displayID)}
                action={setDisplayName(props.displayID)}
                onBlur={endEditingName}
              />
            </form>
          )}
          {!isEditingName && (
            <Typography
              component="h1"
              variant="h4"
              noWrap
              className={cx(
                classes.title,
                name.length === 0 && classes.noTitle
              )}
              onClick={beginEditingName}
            >
              {name}
            </Typography>
          )}

          <div className={classes.headerRight}>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="Play"
              onClick={onPlayDisplay}
              size="large"
            >
              <PlayCircleOutlineIcon fontSize="large" />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <Box
          sx={{
            position: 'absolute',
            top: '64px',
            left: 0,
            height: 'calc(100% - 64px)',
            width: '75%',
            padding: 2
          }}
        >
          <Box
            sx={{
              position: 'relative',
              aspectRatio: '16 / 9',
              width: '100%',
              background: 'white'
            }}
          >
            <DisplaySetupPreview
              displayID={props.displayID}
              selectedView={selectedView}
            />
          </Box>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '64px',
            right: 0,
            height: 'calc(100% - 64px)',
            width: '25%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Card sx={{ overflow: 'visible' }}>
            <CardActions>
              <Tooltip title="Clone Display">
                <IconButton onClick={onCloneDisplay}>
                  <FileCopy />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Display">
                <IconButton onClick={onExportDisplay}>
                  <Publish />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Display">
                <IconButton onClick={onDeleteDisplay}>
                  <DeleteForever color="error" />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
          <Card sx={{ maxHeight: '50%' }}>
            <CardHeader
              title={
                selectedViewName != null
                  ? `Settings - ${selectedViewName}`
                  : 'Settings'
              }
              action={
                <IconButton onClick={toggleSettingsExpand}>
                  {userExpandedSettings ?? selectedView != null ? (
                    <ExpandMoreIcon />
                  ) : (
                    <ExpandLess />
                  )}
                </IconButton>
              }
            />
            <CardContent className={classes.scrollableContent}>
              <Collapse
                in={selectedView != null && userExpandedSettings !== false}
              >
                {selectedView && (
                  <DisplayViewSettings
                    displayID={props.displayID}
                    viewID={selectedView}
                  />
                )}
              </Collapse>
            </CardContent>
          </Card>
          <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <CardHeader title="Layers" />
            <CardContent sx={{ flexGrow: 1 }}>
              <AutoSizer>
                {({ height, width }: { height: number; width: number }) => (
                  <List id="sortable-list" disablePadding>
                    <SortableVirtualList
                      helperContainer={() =>
                        document.getElementById('sortable-list') as HTMLElement
                      }
                      distance={5}
                      onSortEnd={onSortEnd}
                      yOffset={yOffset}
                      views={views}
                      height={height}
                      width={width}
                    />
                  </List>
                )}
              </AutoSizer>
            </CardContent>
            <CardActions>
              <Tooltip title="Add View">
                <IconButton onClick={onAddView}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clone View">
                <span
                  className={selectedView == null ? classes.disable : undefined}
                >
                  <IconButton
                    onClick={onCloneView}
                    disabled={selectedView == null}
                  >
                    <ContentCopy />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Delete View">
                <span
                  className={selectedView == null ? classes.disable : undefined}
                >
                  <IconButton
                    onClick={onDeleteView}
                    disabled={selectedView == null}
                  >
                    <DeleteIcon
                      color={selectedView == null ? 'disabled' : 'error'}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </CardActions>
          </Card>
        </Box>
        <Dialog
          open={openMenu === MO.deleteAlert}
          onClose={onCloseDeleteDialog}
          aria-labelledby="delete-title"
          aria-describedby="delete-description"
        >
          <DialogTitle id="Delete-title">Delete '{name}'</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-description">
              Are you sure you want to delete {name}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseDeleteDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={onFinishDeleteDisplay} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </div>
  )
}

;(DisplaySetup as any).displayName = 'DisplaySetup'
export default DisplaySetup

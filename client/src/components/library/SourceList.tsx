import React, { useEffect, useState, useRef, ChangeEvent } from 'react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import clsx from 'clsx'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  InputAdornment,
  Link,
  List,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import FolderIcon from '@mui/icons-material/Folder'

import { getCachePath, getTimestamp } from '../../data/utils'
import { getFileName } from '../player/Scrapers'
import {
  getSourceType,
  urlToPath,
  en,
  RF,
  RT,
  SDT,
  ST,
  SDGT
} from 'flipflip-common'
import SourceListItem from './SourceListItem'
import BaseSwitch from '../common/BaseSwitch'
import { selectConstants } from '../../store/constants/selectors'
import {
  selectAppConfigCachingDirectory,
  selectAppTutorial,
  selectAppLibraryYOffset
} from '../../store/app/selectors'
import { selectClipEnd, selectClipStart } from '../../store/clip/selectors'
import {
  selectLibrarySourceDirOfSources,
  selectLibrarySourceIncludeReplies,
  selectLibrarySourceIncludeRetweets,
  selectLibrarySourceIsEnabledClip,
  selectLibrarySourceSubtitleFile,
  selectLibrarySourceURL,
  selectLibrarySourceWeight,
  selectLibrarySourceRedditFunc,
  selectLibrarySourceRedditTime,
  selectLibrarySourceClips,
  selectLibrarySourceBlacklist
} from '../../store/librarySource/selectors'
import {
  setLibrarySourceDirOfSources,
  setLibrarySourceIncludeReplies,
  setLibrarySourceIncludeRetweets,
  setLibrarySourceToggleEnabledClip,
  setLibrarySourceWeight,
  setLibrarySourceSubtitleFile,
  setLibrarySourceRedditFunc,
  setLibrarySourceRedditTime
} from '../../store/librarySource/actions'
import {
  setSceneSourcesEditUrl,
  setLibraryEditUrl,
  editBlacklist
} from '../../store/librarySource/thunks'
import {
  setSceneSwapSources,
  setSceneSourcesRemoveOne
} from '../../store/scene/thunks'
import {
  setLibraryYOffset,
  setLibraryRemoveOne,
  setLibrarySelected,
  swapLibrary
} from '../../store/app/slice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import BaseTextField from '../common/text/BaseTextField'
import BaseSelect from '../common/BaseSelect'
import { RootState } from '../../store/store'
import FlipFlipService from '../../FlipFlipService'

const styles = (theme: Theme) =>
  createStyles({
    emptyMessage: {
      textAlign: 'center',
      marginTop: '25%'
    },
    emptyMessage2: {
      textAlign: 'center'
    },
    backdropTop: {
      zIndex: theme.zIndex.modal + 1
    },
    marginRight: {
      marginRight: theme.spacing(1)
    },
    blacklistInput: {
      minWidth: 550,
      minHeight: 300,
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      overflowY: 'auto !important' as any
    },
    fullWidth: {
      width: '100%'
    },
    wordWrap: {
      wordWrap: 'break-word'
    },
    arrow: {
      position: 'absolute',
      bottom: 20,
      right: 35,
      fontSize: 220,
      transform: 'rotateY(0deg) rotate(45deg)'
    },
    arrowMessage: {
      position: 'absolute',
      bottom: 260,
      right: 160
    },
    weightMenu: {
      width: theme.spacing(10)
    }
  })

interface BlacklistDialogProps extends WithStyles<typeof styles> {
  sourceID: number
  onClose: () => void
  onFinish: (url: string, blacklist: string) => void
}

function BlacklistDialog(props: BlacklistDialogProps) {
  const url = useAppSelector(selectLibrarySourceURL(props.sourceID))
  const blacklist = useAppSelector(selectLibrarySourceBlacklist(props.sourceID))

  const [blacklistToEdit, setBlacklistToEdit] = useState<string>()

  useEffect(() => {
    setBlacklistToEdit(blacklist.join('\n'))
  }, [blacklist])

  const onChangeBlacklist = (e: ChangeEvent<HTMLInputElement>) => {
    setBlacklistToEdit(e.currentTarget.value)
  }

  const onClose = () => {
    setBlacklistToEdit(undefined)
    props.onClose()
  }

  return (
    <Dialog
      open={true}
      onClose={() => {
        onClose()
      }}
      aria-describedby="edit-blacklist-description"
    >
      <DialogContent>
        <DialogContentText id="edit-blacklist-description">
          Blacklist ({url})
        </DialogContentText>
        <TextField
          variant="standard"
          fullWidth
          multiline
          helperText="One URL to blacklist per line"
          value={blacklistToEdit}
          margin="dense"
          inputProps={{ className: props.classes.blacklistInput }}
          onChange={onChangeBlacklist}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose()
          }}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            props.onFinish(url as string, blacklistToEdit as string)
          }}
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface DeleteDialogProps {
  sourceID: number
  onCloseDeleteDialog: () => void
  onFinishDelete: (sourceID: number, sourceURL: string) => void
}

function DeleteDialog(props: DeleteDialogProps) {
  const url = useAppSelector(selectLibrarySourceURL(props.sourceID))

  return (
    <Dialog
      open={true}
      onClose={() => {
        props.onCloseDeleteDialog()
      }}
      aria-describedby="delete-description"
    >
      <DialogContent>
        <DialogContentText id="delete-description">
          Are you sure you want to delete {url}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            props.onCloseDeleteDialog()
          }}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            props.onFinishDelete(props.sourceID, url as string)
          }}
          color="primary"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface ClipMenuProps extends WithStyles<typeof styles> {
  sourceID: number
}

function ClipMenu(props: ClipMenuProps) {
  const clips = useAppSelector(selectLibrarySourceClips(props.sourceID))

  return (
    <>
      {clips.map((c, index) => (
        <ClipMenuItem
          key={c}
          sourceID={props.sourceID}
          clipID={c}
          index={index}
          classes={props.classes}
        />
      ))}
    </>
  )
}

interface ClipMenuItemProps extends WithStyles<typeof styles> {
  sourceID: number
  clipID: number
  index: number
}

function ClipMenuItem(props: ClipMenuItemProps) {
  const start = useAppSelector(selectClipStart(props.clipID))
  const end = useAppSelector(selectClipEnd(props.clipID))

  return (
    <MenuItem>
      <ListItemText
        primary={
          '(' +
          (props.index + 1) +
          ') ' +
          getTimestamp(start as number) +
          ' - ' +
          getTimestamp(end as number)
        }
        className={props.classes.marginRight}
      />
      <ListItemSecondaryAction>
        <BaseSwitch
          size="small"
          selector={selectLibrarySourceIsEnabledClip(
            props.sourceID,
            props.clipID
          )}
          action={setLibrarySourceToggleEnabledClip(
            props.sourceID,
            props.clipID
          )}
        />
      </ListItemSecondaryAction>
    </MenuItem>
  )
}

interface SourceOptionsDialogProps extends WithStyles<typeof styles> {
  sourceID: number
  onClose: () => void
}

function SourceOptionsDialog(props: SourceOptionsDialogProps) {
  const flipflip = FlipFlipService.getInstance()
  const dispatch = useAppDispatch()
  const redditFunc = useAppSelector(
    selectLibrarySourceRedditFunc(props.sourceID)
  )
  const url = useAppSelector(selectLibrarySourceURL(props.sourceID))
  const type = url && getSourceType(url)

  const onOpenSubtitleFile = async () => {
    const subtitleFile = await flipflip.api.openSubtitleFile()
    if (!subtitleFile) return
    dispatch(setLibrarySourceSubtitleFile(props.sourceID)(subtitleFile))
  }

  return (
    <>
      {type === ST.local && (
        <Dialog
          open={type === ST.local}
          onClose={props.onClose}
          aria-describedby="local-options-description"
        >
          <DialogContent>
            <DialogContentText id="local-options-description">
              Directory Options ({url})
            </DialogContentText>
            <BaseSwitch
              label="Treat Inner Directories as Sources"
              tooltip="Enable this to treat directories directly inside this one as their own individual sources"
              selector={selectLibrarySourceDirOfSources(props.sourceID)}
              action={setLibrarySourceDirOfSources(props.sourceID)}
            />
          </DialogContent>
        </Dialog>
      )}
      {type === ST.video && (
        <Dialog
          open={type === ST.video}
          onClose={props.onClose}
          aria-describedby="video-options-description"
        >
          <DialogContent>
            <DialogContentText id="video-options-description">
              Video Options ({url})
            </DialogContentText>
            <BaseTextField
              variant="standard"
              label="Subtitle File"
              fullWidth
              placeholder="Paste URL Here"
              margin="dense"
              selector={selectLibrarySourceSubtitleFile(props.sourceID)}
              action={setLibrarySourceSubtitleFile(props.sourceID)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip disableInteractive title="Open File">
                      <IconButton onClick={onOpenSubtitleFile} size="large">
                        <FolderIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      {type === ST.reddit && (
        <Dialog
          open={type === ST.reddit}
          onClose={props.onClose}
          aria-describedby="reddit-options-description"
        >
          <DialogContent>
            <DialogContentText id="reddit-options-description">
              Reddit Options ({url})
            </DialogContentText>
            <BaseSelect
              label="Post Order"
              disabled={
                url !== undefined &&
                (url.includes('/user/') || url.includes('/u/'))
              }
              controlClassName={props.classes.fullWidth}
              selector={selectLibrarySourceRedditFunc(props.sourceID)}
              action={setLibrarySourceRedditFunc(props.sourceID)}
            >
              {Object.values(RF).map((rf) => (
                <MenuItem key={rf} value={rf}>
                  {en.get(rf)}
                </MenuItem>
              ))}
            </BaseSelect>
            {redditFunc === RF.top && (
              <BaseSelect
                label="Post Time"
                disabled={
                  url != undefined &&
                  (url.includes('/user/') || url.includes('/u/'))
                }
                controlClassName={props.classes.fullWidth}
                selector={selectLibrarySourceRedditTime(props.sourceID)}
                action={setLibrarySourceRedditTime(props.sourceID)}
              >
                {Object.values(RT).map((rt) => (
                  <MenuItem key={rt} value={rt}>
                    {en.get(rt)}
                  </MenuItem>
                ))}
              </BaseSelect>
            )}
            {url != undefined &&
              (url.includes('/user/') || url.includes('/u/')) && (
                <DialogContentText>
                  This only applies to subreddits, not user profiles
                </DialogContentText>
              )}
          </DialogContent>
        </Dialog>
      )}
      {type === ST.twitter && (
        <Dialog
          open={type === ST.twitter}
          onClose={props.onClose}
          aria-describedby="twitter-options-description"
        >
          <DialogContent>
            <DialogContentText id="twitter-options-description">
              Twitter Options ({url})
            </DialogContentText>
            <BaseSwitch
              label="Include Replies"
              size="small"
              selector={selectLibrarySourceIncludeReplies(props.sourceID)}
              action={setLibrarySourceIncludeReplies(props.sourceID)}
            />
            <BaseSwitch
              label="Include Retweets"
              size="small"
              selector={selectLibrarySourceIncludeRetweets(props.sourceID)}
              action={setLibrarySourceIncludeRetweets(props.sourceID)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export interface SourceListProps extends WithStyles<typeof styles> {
  isLibrary?: boolean
  showHelp: boolean
  sources: number[]
  isSelect?: boolean
  selected?: number[]
  useWeights?: boolean
}

function SourceList(props: SourceListProps) {
  const flipflip = FlipFlipService.getInstance()
  const dispatch = useAppDispatch()
  const { isWin32, pathSep } = useAppSelector(selectConstants())
  const cachingDirectory = useAppSelector(selectAppConfigCachingDirectory())
  const yOffsetSelector = props.isLibrary
    ? selectAppLibraryYOffset()
    : (state: RootState) => 0
  const yOffset = useAppSelector(yOffsetSelector)
  const firstSourceURL = useAppSelector(
    selectLibrarySourceURL(props.sources.length > 0 ? props.sources[0] : -1)
  )
  let tutorial = useAppSelector(selectAppTutorial())
  // TODO is this really needed?
  if (tutorial === SDGT.final) {
    tutorial = undefined
  }

  const [cachePath, setCachePath] = useState<string>()
  const [isEditing, setIsEditing] = useState(-1)
  const [mouseX, setMouseX] = useState<any>()
  const [mouseY, setMouseY] = useState<any>()
  const [clipMenu, setClipMenu] = useState<number>()
  const [weightMenu, setWeightMenu] = useState<number>()
  const [blacklistSource, setBlacklistSource] = useState<number>()
  const [sourceOptionsID, setSourceOptionsID] = useState<number>()
  const [deleteDialog, setDeleteDialog] = useState<number>()

  const _shiftDown = useRef(false)
  const _lastChecked = useRef<number>()

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('keyup', onKeyUp, false)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      savePosition()
    }
  }, [])

  useEffect(() => {
    if (firstSourceURL === '') {
      console.log('setIsEditing')
      setIsEditing(props.sources[0])
    }
  }, [props.sources])

  const onSortEnd = ({
    oldIndex,
    newIndex
  }: {
    oldIndex: number
    newIndex: number
  }) => {
    const oldSourceID = props.sources[oldIndex]
    const newSourceID = props.sources[newIndex]
    if (props.isLibrary) {
      dispatch(swapLibrary({ oldSourceID, newSourceID }))
    } else {
      dispatch(setSceneSwapSources(oldSourceID, newSourceID))
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Shift') _shiftDown.current = true
  }

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Shift') _shiftDown.current = false
  }

  const savePosition = () => {
    const sortableList = document.getElementById('sortable-list')
    if (sortableList) {
      const scrollElement = sortableList.firstElementChild
      const scrollTop = scrollElement ? scrollElement.scrollTop : 0
      dispatch(setLibraryYOffset(scrollTop))
    }
  }

  const onDelete = (sourceID: number) => {
    setDeleteDialog(sourceID)
  }
  const onCloseDeleteDialog = () => {
    setDeleteDialog(undefined)
  }

  const onFinishDelete = async (sourceID: number, sourceURL: string) => {
    const fileType = getSourceType(sourceURL)
    if (fileType === ST.local) {
      flipflip.api.rimrafSync(sourceURL)
    } else if (
      fileType === ST.video ||
      fileType === ST.playlist ||
      fileType === ST.list
    ) {
      await flipflip.api.unlink(sourceURL)
    }
    onRemove(sourceID)
    onCloseDeleteDialog()
  }

  const onRemove = (sourceID: number) => {
    if (props.isLibrary) {
      const selected = props.selected as number[]
      dispatch(setLibrarySelected(selected.filter((id) => id !== sourceID)))
      dispatch(setLibraryRemoveOne(sourceID))
    } else {
      dispatch(setSceneSourcesRemoveOne(sourceID))
    }
  }

  const onToggleSelect = (e: MouseEvent) => {
    const value = (e.currentTarget as HTMLInputElement).value
    const sourceID = Number(value)
    const newSelected = Array.from(props.selected || [])
    const index = newSelected.indexOf(sourceID)
    if (index !== -1) {
      newSelected.splice(index, 1)
    } else {
      if (
        _lastChecked.current &&
        props.sources.includes(_lastChecked.current) &&
        _shiftDown.current
      ) {
        let start = false
        for (const id of props.sources) {
          if (start && (id === sourceID || id === _lastChecked.current)) {
            break
          }
          if (start) {
            newSelected.push(id)
          }
          if (!start && (id === sourceID || id === _lastChecked.current)) {
            start = true
          }
        }
      }
      newSelected.push(sourceID)
    }
    _lastChecked.current = sourceID
    if (props.isLibrary) {
      dispatch(setLibrarySelected(newSelected))
    }
  }

  const onStartEdit = (sourceID: number) => {
    console.log('START EDIT: ' + sourceID)
    setIsEditing(sourceID)
  }

  const onEndEdit = (newURL: string) => {
    const action = props.isLibrary ? setLibraryEditUrl : setSceneSourcesEditUrl
    dispatch(action(isEditing, newURL))
    setIsEditing(-1)
  }

  const onClean = async (sourceURL: string) => {
    const fileType = getSourceType(sourceURL)
    if (fileType !== ST.local) {
      let cachePath = await getCachePath(cachingDirectory, sourceURL)
      if (fileType === ST.video || fileType === ST.playlist) {
        cachePath = getFileName(sourceURL, pathSep)
      }
      setCachePath(cachePath)
    }
  }

  const onFinishClean = () => {
    flipflip.api.rimrafSync(cachePath as string)
    onCloseClean()
  }

  const onCloseClean = () => {
    setCachePath(undefined)
  }

  const openDirectory = (cachePath: string) => {
    if (isWin32) {
      openExternalURL(cachePath)
    } else {
      openExternalURL(urlToPath(cachePath, isWin32))
    }
  }

  const openExternalURL = (url: string) => {
    window.open(url, '_blank')?.focus()
  }

  const onOpenClipMenu = (sourceID: number, e: MouseEvent) => {
    setMouseX(e.clientX)
    setMouseY(e.clientY)
    setClipMenu(sourceID)
  }

  const onOpenWeightMenu = (sourceID: number, e: MouseEvent) => {
    setMouseX(e.clientX)
    setMouseY(e.clientY)
    setWeightMenu(sourceID)
  }

  const onCloseDialog = () => {
    setClipMenu(undefined)
    setWeightMenu(undefined)
  }

  const onCloseBlacklist = () => {
    setBlacklistSource(undefined)
  }

  const onFinishBlacklist = (url: string, blacklist: string) => {
    dispatch(editBlacklist(url, blacklist))
    onCloseBlacklist()
  }

  const onEditBlacklist = (sourceID: number) => {
    setBlacklistSource(sourceID)
  }
  const onCloseSourceOptions = () => {
    setSourceOptionsID(undefined)
  }
  const onSourceOptions = (sourceID: number) => {
    setSourceOptionsID(sourceID)
  }

  const VirtualList = (props: any) => {
    const { tutorial, height, width, yOffset, sources } = props
    console.log('VIRTUAL LIST: ' + JSON.stringify(sources))
    return (
      <FixedSizeList
        height={tutorial ? 60 : height}
        width={width}
        initialScrollOffset={yOffset}
        itemSize={56}
        itemCount={tutorial ? 1 : sources.length}
        itemData={tutorial ? [sources[0]] : sources}
        itemKey={(index: number, data: any) => data[index].id}
        overscanCount={10}
      >
        {Row}
      </FixedSizeList>
    )
  }

  const SortableVirtualList = SortableContainer(VirtualList)

  const SortableItem = SortableElement(
    ({ value }: { value: { index: number; style: any; data: any[] } }) => {
      const index = value.index
      const sourceID: number = value.data[index]
      return (
        <SourceListItem
          key={sourceID}
          checked={
            props.isSelect &&
            props.selected &&
            props.selected.includes(sourceID)
          }
          index={index}
          isEditing={isEditing}
          isLibrary={props.isLibrary}
          isSelect={props.isSelect}
          source={sourceID}
          sources={props.sources}
          style={value.style}
          useWeights={props.useWeights}
          onClean={onClean}
          onDelete={onDelete}
          onEditBlacklist={onEditBlacklist}
          onEndEdit={onEndEdit}
          onOpenClipMenu={onOpenClipMenu}
          onOpenWeightMenu={onOpenWeightMenu}
          onRemove={onRemove}
          onSourceOptions={onSourceOptions}
          onStartEdit={onStartEdit}
          onToggleSelect={onToggleSelect}
          savePosition={savePosition}
        />
      )
    }
  )

  const Row = (props: any) => {
    const { index } = props
    return <SortableItem index={index} value={props} />
  }

  const classes = props.classes
  console.log('SOURCES UNDEFINED: ' + (props.sources === undefined))
  if (props.sources.length === 0) {
    return (
      <React.Fragment>
        <Typography
          component="h1"
          variant="h3"
          color="inherit"
          noWrap
          className={classes.emptyMessage}
        >
          乁( ◔ ౪◔)「
        </Typography>
        <Typography
          component="h1"
          variant="h4"
          color="inherit"
          noWrap
          className={classes.emptyMessage2}
        >
          Nothing here
        </Typography>
        {props.showHelp && (
          <React.Fragment>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.arrowMessage}
            >
              Add new sources
            </Typography>
            <div className={classes.arrow}>→</div>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List
            id="sortable-list"
            disablePadding
            className={clsx(
              (tutorial === SDT.source ||
                tutorial === SDT.sourceAvatar ||
                tutorial === SDT.sourceTitle ||
                tutorial === SDT.sourceTags ||
                tutorial === SDT.sourceCount ||
                tutorial === SDT.sourceButtons) &&
                classes.backdropTop
            )}
          >
            <SortableVirtualList
              helperContainer={() => document.getElementById('sortable-list')}
              distance={5}
              height={height - 1}
              width={width}
              onSortEnd={onSortEnd}
              tutorial={tutorial}
              yOffset={yOffset}
              sources={props.sources}
            />
          </List>
        )}
      </AutoSizer>
      <Menu
        id="clip-menu"
        elevation={1}
        anchorReference="anchorPosition"
        anchorPosition={
          mouseY != null && mouseX != null
            ? { top: mouseY, left: mouseX }
            : undefined
        }
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        keepMounted
        open={!!clipMenu}
        onClose={onCloseDialog}
      >
        {!!clipMenu && <ClipMenu sourceID={clipMenu} classes={classes} />}
      </Menu>
      {!!weightMenu && (
        <Menu
          id="weight-menu"
          classes={{ paper: classes.weightMenu }}
          elevation={1}
          anchorReference="anchorPosition"
          anchorPosition={
            mouseY != null && mouseX != null
              ? { top: mouseY, left: mouseX }
              : undefined
          }
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          keepMounted
          open={!!weightMenu}
          onClose={onCloseDialog}
        >
          <MenuItem>
            <BaseTextField
              variant="standard"
              margin="dense"
              selector={selectLibrarySourceWeight(weightMenu)}
              action={setLibrarySourceWeight(weightMenu)}
              inputProps={{
                min: 1,
                type: 'number'
              }}
            />
          </MenuItem>
        </Menu>
      )}
      {cachePath != null && (
        <Dialog
          open={true}
          onClose={onCloseClean}
          aria-describedby="clean-cache-description"
        >
          <DialogContent>
            <DialogContentText id="clean-cache-description">
              Are you SURE you want to delete{' '}
              <Link
                className={classes.wordWrap}
                href="#"
                onClick={() => openDirectory(cachePath)}
                underline="hover"
              >
                {cachePath}
              </Link>{' '}
              ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseClean} color="secondary">
              Cancel
            </Button>
            <Button onClick={onFinishClean} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {blacklistSource && (
        <BlacklistDialog
          sourceID={blacklistSource}
          onClose={onCloseBlacklist}
          onFinish={onFinishBlacklist}
          classes={classes}
        />
      )}
      {sourceOptionsID && (
        <SourceOptionsDialog
          sourceID={sourceOptionsID}
          onClose={onCloseSourceOptions}
          classes={classes}
        />
      )}
      {deleteDialog != null && (
        <DeleteDialog
          sourceID={deleteDialog}
          onCloseDeleteDialog={onCloseDeleteDialog}
          onFinishDelete={onFinishDelete}
        />
      )}
    </React.Fragment>
  )
}

;(SourceList as any).displayName = 'SourceList'
export default withStyles(styles)(SourceList as any)

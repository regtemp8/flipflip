import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

import {
  Badge,
  Checkbox,
  Chip,
  Fab,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  SvgIcon,
  TextField,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import BuildIcon from '@mui/icons-material/Build'
import DeleteIcon from '@mui/icons-material/Delete'
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt'

import { getCachePath, getTimestamp, urlToPath } from '../../data/utils'
import { getFileName, getSourceType } from '../player/Scrapers'
import { SDT, ST } from '../../data/const'
import SourceIcon from './SourceIcon'
import { grey } from '@mui/material/colors'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { systemMessage } from '../../../store/app/slice'
import { selectConstants } from '../../../store/constants/selectors'
import {
  selectAppConfigCachingDirectory,
  selectAppConfigCachingEnabled,
  selectAppTutorial
} from '../../../store/app/selectors'
import {
  blacklistFile,
  clipVideo,
  downloadSource,
  playSceneFromLibrary
} from '../../../store/app/thunks'
import TagChip from './TagChip'
import {
  selectLibrarySourceURL,
  selectLibrarySourceWeight,
  selectLibrarySourceClips,
  selectLibrarySourceOffline,
  selectLibrarySourceMarked,
  selectLibrarySourceDuration,
  selectLibrarySourceResolution,
  selectLibrarySourceCount,
  selectLibrarySourceCountComplete,
  selectLibrarySourceTags,
  selectLibrarySourceDisabledClips,
  selectLibrarySourceBlacklist
} from '../../../store/librarySource/selectors'

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    oddChild: {
      backgroundColor:
        theme.palette.mode === 'light'
          ? (theme.palette.primary as any)['100']
          : grey[900],
      '&:hover': {
        backgroundColor:
          theme.palette.mode === 'light'
            ? (theme.palette.primary as any)['200']
            : '#080808'
      }
    },
    evenChild: {
      backgroundColor:
        theme.palette.mode === 'light'
          ? (theme.palette.primary as any)['50']
          : theme.palette.background.default,
      '&:hover': {
        backgroundColor:
          theme.palette.mode === 'light'
            ? (theme.palette.primary as any)['200']
            : '#080808'
      }
    },
    avatar: {
      backgroundColor: theme.palette.primary.main,
      boxShadow: 'none'
    },
    markedSource: {
      backgroundColor: theme.palette.secondary.main
    },
    sourceIcon: {
      color: theme.palette.primary.contrastText
    },
    sourceMarkedIcon: {
      color: theme.palette.secondary.contrastText
    },
    deleteButton: {
      backgroundColor: theme.palette.error.main
    },
    deleteIcon: {
      color: theme.palette.error.contrastText
    },
    errorIcon: {
      color: theme.palette.error.main,
      backgroundColor: theme.palette.error.contrastText,
      borderRadius: '50%'
    },
    importBadge: {
      zIndex: theme.zIndex.fab + 1
    },
    actionButton: {
      marginLeft: theme.spacing(1)
    },
    countChip: {
      userSelect: 'none',
      marginRight: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        display: 'none'
      }
    },
    fullTag: {
      [theme.breakpoints.down('md')]: {
        display: 'none'
      }
    },
    simpleTag: {
      [theme.breakpoints.up('md')]: {
        display: 'none'
      },
      [theme.breakpoints.down('sm')]: {
        display: 'none'
      }
    },
    urlField: {
      width: '100%',
      margin: 0
    },
    highlight: {
      borderWidth: 2,
      borderColor: theme.palette.secondary.main,
      borderStyle: 'solid'
    },
    disable: {
      pointerEvents: 'none'
    },
    noUserSelect: {
      userSelect: 'none'
    }
  })

export interface SourceListItemProps extends WithStyles<typeof styles> {
  checked: boolean
  index: number
  isEditing: number
  isLibrary: boolean
  isSelect: boolean
  source: number
  sources: number[]
  style: any
  useWeights?: boolean
  onClean: (sourceURL: string) => void
  onDelete: (sourceID: number) => void
  onEditBlacklist: (sourceID: number) => void
  onEndEdit: (newURL: string) => void
  onOpenClipMenu: (sourceID: number) => void
  onOpenWeightMenu: (sourceID: number) => void
  onRemove: (sourceID: number) => void
  onSourceOptions: (sourceID: number) => void
  onStartEdit: (sourceID: number) => void
  onToggleSelect: () => void
  savePosition: () => void
}

function SourceListItem(props: SourceListItemProps) {
  const dispatch = useAppDispatch()
  const { isWin32, pathSep } = useAppSelector(selectConstants())
  const tutorial = useAppSelector(selectAppTutorial())
  const cachingEnabled = useAppSelector(selectAppConfigCachingEnabled())
  const cachingDirectory = useAppSelector(selectAppConfigCachingDirectory())
  const url = useAppSelector(selectLibrarySourceURL(props.source))
  const offline = useAppSelector(selectLibrarySourceOffline(props.source))
  const marked = useAppSelector(selectLibrarySourceMarked(props.source))
  const weight = useAppSelector(selectLibrarySourceWeight(props.source))
  const duration = useAppSelector(selectLibrarySourceDuration(props.source))
  const resolution = useAppSelector(selectLibrarySourceResolution(props.source))
  const count = useAppSelector(selectLibrarySourceCount(props.source))
  const countComplete = useAppSelector(
    selectLibrarySourceCountComplete(props.source)
  )
  const tags = useAppSelector(selectLibrarySourceTags(props.source))
  const clips = useAppSelector(selectLibrarySourceClips(props.source))
  const disabledClips = useAppSelector(
    selectLibrarySourceDisabledClips(props.source)
  )
  const blacklist = useAppSelector(selectLibrarySourceBlacklist(props.source))

  const [urlInput, setUrlInput] = useState<string>()

  useEffect(() => {
    setUrlInput(url)
  }, [props.source])

  const onSourceIconClick = async (e: MouseEvent) => {
    const sourceURL = url as string
    const sourceType = getSourceType(sourceURL)
    if (e.shiftKey && e.ctrlKey && e.altKey) {
      if (
        sourceType === ST.local ||
        sourceType === ST.video ||
        sourceType === ST.playlist ||
        sourceType === ST.list
      ) {
        const exists = await window.flipflip.api.pathExists(sourceURL)
        if (exists) {
          props.onDelete(props.source)
        }
      }
    } else if (e.shiftKey && !e.ctrlKey && !e.altKey) {
      openExternalURL(sourceURL)
    } else if (!e.shiftKey && !e.ctrlKey && e.altKey) {
      // If local source, still catch keypress, but don't do anything
      if (
        sourceType !== ST.local &&
        sourceType !== ST.video &&
        sourceType !== ST.piwigo &&
        sourceType !== ST.hydrus &&
        sourceType !== ST.nimja
      ) {
        dispatch(downloadSource(props.source))
      }
    } else if (!e.shiftKey && e.ctrlKey && !e.altKey) {
      const fileType = getSourceType(sourceURL)
      let cachePath = await getCachePath(cachingDirectory, sourceURL)
      if (fileType === ST.video || fileType === ST.playlist) {
        if (
          !(await window.flipflip.api.pathExists(
            cachePath + getFileName(sourceURL, pathSep)
          ))
        ) {
          cachePath = undefined
          window.flipflip.api.showItemInFolder(sourceURL)
        }
      }
      if (cachePath) {
        openDirectory(cachePath)
      }
    } else if (!e.shiftKey && !e.ctrlKey) {
      props.savePosition()
      try {
        dispatch(playSceneFromLibrary(props.source, props.sources))
      } catch (e) {
        dispatch(systemMessage('The source ' + url + " isn't in your Library"))
      }
    }
  }

  const onClip = () => {
    props.savePosition()
    dispatch(clipVideo(props.source, props.sources))
  }

  const onClickBlacklist = (e: MouseEvent) => {
    if (e.shiftKey) {
      clearBlacklist(url as string)
    } else {
      props.onEditBlacklist(props.source)
    }
  }

  const clearBlacklist = (sourceURL: string) => {
    dispatch(blacklistFile(sourceURL, undefined))
  }

  const onStartEdit = (sourceID: number) => {
    props.onStartEdit(sourceID)
  }

  const onEditSource = (e: MouseEvent) => {
    const input = e.target as HTMLInputElement
    setUrlInput(input.value)
  }

  const onEndEdit = () => {
    props.onEndEdit(urlInput as string)
  }

  const openDirectory = (cachePath: string) => {
    if (isWin32) {
      openExternalURL(cachePath)
    } else {
      openExternalURL(urlToPath(cachePath, isWin32))
    }
  }

  const openExternalURL = (url: string) => {
    window.flipflip.api.openExternal(url)
  }

  const classes = props.classes
  const sourceType = url && getSourceType(url)
  return (
    <div
      style={props.style}
      className={clsx(
        props.index % 2 === 0 ? classes.evenChild : classes.oddChild,
        tutorial === SDT.source && classes.highlight,
        tutorial && classes.disable
      )}
    >
      <ListItem>
        {props.isSelect && (
          <Checkbox
            value={props.source}
            onChange={props.onToggleSelect.bind(this)}
            checked={props.checked}
          />
        )}
        <ListItemAvatar>
          <Badge
            classes={{
              badge: classes.importBadge
            }}
            invisible={!offline}
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left'
            }}
            badgeContent={<OfflineBoltIcon className={classes.errorIcon} />}
          >
            <Tooltip
              disableInteractive
              title={
                <div>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click:
                  Library Tagging
                  <br />
                  Shift+Click: Open Source
                  <br />
                  &nbsp;&nbsp;Ctrl+Click:{' '}
                  {sourceType === ST.video ? 'Reveal File' : 'Open Cache'}
                  {sourceType !== ST.local &&
                    sourceType !== ST.video &&
                    sourceType !== ST.piwigo &&
                    sourceType !== ST.hydrus &&
                    sourceType !== ST.nimja && (
                      <React.Fragment>
                        <br />
                        &nbsp;&nbsp;&nbsp;Alt+Click: Download Source
                      </React.Fragment>
                    )}
                </div>
              }
            >
              <Fab
                size="small"
                onClick={onSourceIconClick.bind(this)}
                className={clsx(
                  classes.avatar,
                  marked && classes.markedSource,
                  tutorial === SDT.sourceAvatar && classes.highlight
                )}
              >
                <SourceIcon
                  url={url}
                  className={clsx(
                    classes.sourceIcon,
                    marked && classes.sourceMarkedIcon
                  )}
                />
              </Fab>
            </Tooltip>
          </Badge>
        </ListItemAvatar>

        <ListItemText classes={{ primary: classes.root }}>
          {props.isEditing === props.source && (
            <form onSubmit={onEndEdit.bind(this)} className={classes.urlField}>
              <TextField
                variant="standard"
                autoFocus
                fullWidth
                value={urlInput}
                margin="none"
                className={classes.urlField}
                onBlur={onEndEdit.bind(this)}
                onChange={onEditSource.bind(this)}
              />
            </form>
          )}
          {props.isEditing !== props.source && (
            <React.Fragment>
              <Typography
                noWrap
                className={clsx(
                  classes.noUserSelect,
                  tutorial === SDT.sourceTitle && classes.highlight
                )}
                onClick={onStartEdit.bind(this, props.source)}
              >
                {url}
              </Typography>
              {tags &&
                tags.map((tagID) => (
                  <React.Fragment key={tagID}>
                    <TagChip
                      tagID={tagID}
                      className={clsx(
                        classes.noUserSelect,
                        classes.actionButton,
                        classes.fullTag,
                        tutorial === SDT.sourceTags && classes.highlight
                      )}
                      outlined
                    />
                    <TagChip
                      tagID={tagID}
                      className={clsx(
                        classes.noUserSelect,
                        classes.actionButton,
                        classes.simpleTag,
                        tutorial === SDT.sourceTags && classes.highlight
                      )}
                      outlined
                      simpleTag
                    />
                  </React.Fragment>
                ))}
            </React.Fragment>
          )}
        </ListItemText>

        {props.isEditing !== props.source && (
          <ListItemSecondaryAction
            className={clsx(
              tutorial === SDT.sourceButtons && classes.highlight
            )}
          >
            {props.useWeights && (
              <React.Fragment>
                <Chip
                  className={classes.countChip}
                  clickable
                  label={weight || '1'}
                  color="default"
                  size="small"
                  onClick={props.onOpenWeightMenu.bind(this, props.source)}
                />
              </React.Fragment>
            )}
            {sourceType === ST.video && duration && (
              <Chip
                className={classes.countChip}
                label={getTimestamp(duration)}
                color="secondary"
                size="small"
              />
            )}
            {sourceType === ST.video && !!resolution && (
              <Chip
                className={classes.countChip}
                label={`${resolution}p`}
                color="secondary"
                size="small"
              />
            )}
            {count > 0 && sourceType !== ST.video && (
              <Chip
                className={clsx(
                  classes.countChip,
                  tutorial === SDT.sourceCount && classes.highlight
                )}
                label={`${count}${countComplete ? '' : '+'}`}
                color="primary"
                size="small"
              />
            )}
            {!props.isLibrary &&
              clips &&
              clips.length > 0 &&
              sourceType === ST.video && (
                <Chip
                  className={classes.countChip}
                  label={
                    (disabledClips
                      ? clips.filter(
                          (clipID) => !disabledClips.includes(clipID)
                        )
                      : clips
                    ).length +
                    '/' +
                    clips.length
                  }
                  onClick={props.onOpenClipMenu.bind(this, props.source)}
                  color="primary"
                  size="small"
                />
              )}
            {props.isLibrary &&
              clips &&
              clips.length > 0 &&
              sourceType === ST.video && (
                <Chip
                  className={classes.countChip}
                  label={clips.length}
                  color="primary"
                  size="small"
                />
              )}
            {(sourceType === ST.local ||
              sourceType === ST.video ||
              sourceType === ST.twitter ||
              sourceType === ST.reddit) && (
              <IconButton
                onClick={props.onSourceOptions.bind(this, props.source)}
                className={classes.actionButton}
                edge="end"
                size="small"
                aria-label="options"
              >
                <BuildIcon />
              </IconButton>
            )}
            {sourceType === ST.video && (
              <IconButton
                onClick={onClip.bind(this)}
                className={classes.actionButton}
                edge="end"
                size="small"
                aria-label="clip"
              >
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
              </IconButton>
            )}
            {blacklist && blacklist.length > 0 && (
              <IconButton
                onClick={onClickBlacklist.bind(this)}
                className={classes.actionButton}
                edge="end"
                size="small"
                aria-label="clear blacklist"
              >
                <SvgIcon>
                  <path
                    d="M2 6V8H14V6H2M2 10V12H11V10H2M14.17 10.76L12.76 12.17L15.59 15L12.76 17.83L14.17
                        19.24L17 16.41L19.83 19.24L21.24 17.83L18.41 15L21.24 12.17L19.83 10.76L17 13.59L14.17
                        10.76M2 14V16H11V14H2Z"
                  />
                </SvgIcon>
              </IconButton>
            )}
            {cachingEnabled &&
              sourceType !== ST.local &&
              ((sourceType !== ST.video && sourceType !== ST.playlist) ||
                /^https?:\/\//g.exec(url as string) != null) && (
                <React.Fragment>
                  <IconButton
                    onClick={props.onClean.bind(this, url)}
                    className={classes.actionButton}
                    edge="end"
                    size="small"
                    aria-label="clean cache"
                  >
                    <SvgIcon>
                      <path
                        d="M19.36 2.72L20.78 4.14L15.06 9.85C16.13 11.39 16.28 13.24 15.38 14.44L9.06
                          8.12C10.26 7.22 12.11 7.37 13.65 8.44L19.36 2.72M5.93 17.57C3.92 15.56 2.69 13.16 2.35
                          10.92L7.23 8.83L14.67 16.27L12.58 21.15C10.34 20.81 7.94 19.58 5.93 17.57Z"
                      />
                    </SvgIcon>
                  </IconButton>
                </React.Fragment>
              )}
            <IconButton
              onClick={props.onRemove.bind(this, props.source)}
              className={clsx(classes.deleteButton, classes.actionButton)}
              edge="end"
              size="small"
              aria-label="delete"
            >
              <DeleteIcon className={classes.deleteIcon} color="inherit" />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    </div>
  )
}

;(SourceListItem as any).displayName = 'SourceListItem'
export default withStyles(styles)(SourceListItem as any)

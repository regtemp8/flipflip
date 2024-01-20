import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import { cx } from '@emotion/css'

import {
  Checkbox,
  Fab,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Radio,
  TextField,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import BuildIcon from '@mui/icons-material/Build'
import DeleteIcon from '@mui/icons-material/Delete'

import SourceIcon from './SourceIcon'
import { grey } from '@mui/material/colors'
import { SP } from 'flipflip-common'
import EditIcon from '@mui/icons-material/Edit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectConstants } from '../../store/constants/selectors'
import { selectAppSpecialMode } from '../../store/app/selectors'
import { openScriptInScriptor } from '../../store/app/thunks'
import TagChip from './TagChip'
import {
  selectCaptionScriptUrl,
  selectCaptionScriptMarked,
  selectCaptionScriptTags
} from '../../store/captionScript/selectors'
import flipflip from '../../FlipFlipService'

const useStyles = makeStyles()((theme: Theme) => ({
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
  lastSelected: {
    backgroundColor:
      theme.palette.mode === 'light'
        ? (theme.palette.primary as any)['200']
        : '#0F0F0F'
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
  actionButton: {
    marginLeft: theme.spacing(1)
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
  noUserSelect: {
    userSelect: 'none'
  }
}))

export interface ScriptSourceListItemProps {
  checked: boolean
  index: number
  isEditing: number
  lastSelected: boolean
  scriptID: number
  style: any
  onDelete: (scriptID: number) => void
  onEndEdit: (newURL: string) => void
  onPlay: (scriptID: number) => void
  onRemove: (scriptID: number) => void
  onSourceOptions: (scriptID: number) => void
  onStartEdit: (scriptID: number) => void
  onToggleSelect: () => void
  savePosition: () => void
}

function ScriptSourceListItem(props: ScriptSourceListItemProps) {
  const dispatch = useAppDispatch()
  const specialMode = useAppSelector(selectAppSpecialMode())
  const url = useAppSelector(selectCaptionScriptUrl(props.scriptID))
  const marked = useAppSelector(selectCaptionScriptMarked(props.scriptID))
  const tags = useAppSelector(selectCaptionScriptTags(props.scriptID))

  const [urlInput, setUrlInput] = useState<string>()

  useEffect(() => {
    setUrlInput(url)
  }, [props.scriptID])

  const onSourceIconClick = (e: MouseEvent<HTMLButtonElement>) => {
    const sourceURL = url as string
    if (e.shiftKey && e.ctrlKey && e.altKey) {
      props.onDelete(props.scriptID)
    } else if (e.shiftKey && !e.ctrlKey) {
      openExternalURL(sourceURL)
    } else if (!e.shiftKey && e.ctrlKey) {
      flipflip().api.showItemInFolder(sourceURL)
    } else if (!e.shiftKey && !e.ctrlKey) {
      props.savePosition()
      props.onPlay(props.scriptID)
    }
  }

  const onEditSource = (e: ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value)
  }

  const onEndEdit = () => {
    props.onEndEdit(urlInput as string)
  }

  const openExternalURL = (url: string) => {
    window.open(url, '_blank')?.focus()
  }

  const { classes } = useStyles()
  return (
    <div
      style={props.style}
      className={cx(
        props.index % 2 === 0 ? classes.evenChild : classes.oddChild,
        props.lastSelected && classes.lastSelected
      )}
    >
      <ListItem>
        {(specialMode === SP.batchTag || specialMode === SP.select) && (
          <Checkbox
            value={props.scriptID}
            onChange={props.onToggleSelect}
            checked={props.checked}
          />
        )}
        {specialMode === SP.selectSingle && (
          <Radio
            value={props.scriptID}
            onChange={props.onToggleSelect}
            checked={props.checked}
          />
        )}
        <ListItemAvatar>
          <Tooltip
            disableInteractive
            title={
              <div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click:
                Library Tagging
                <br />
                Shift+Click: Open Source
                <br />
                &nbsp;&nbsp;Ctrl+Click: Reveal File
              </div>
            }
          >
            <Fab
              size="small"
              onClick={onSourceIconClick}
              className={cx(classes.avatar, marked && classes.markedSource)}
            >
              <SourceIcon
                url={url}
                className={cx(
                  classes.sourceIcon,
                  marked && classes.sourceMarkedIcon
                )}
              />
            </Fab>
          </Tooltip>
        </ListItemAvatar>

        <ListItemText classes={{ primary: classes.root }}>
          {props.isEditing === props.scriptID && (
            <form onSubmit={onEndEdit} className={classes.urlField}>
              <TextField
                variant="standard"
                autoFocus
                fullWidth
                value={urlInput}
                margin="none"
                className={classes.urlField}
                onBlur={onEndEdit}
                onChange={onEditSource}
              />
            </form>
          )}
          {props.isEditing !== props.scriptID && (
            <React.Fragment>
              <Typography
                noWrap
                className={classes.noUserSelect}
                onClick={() => props.onStartEdit(props.scriptID)}
              >
                {url}
              </Typography>
              {tags &&
                tags.map((tagID) => (
                  <React.Fragment key={tagID}>
                    <TagChip
                      tagID={tagID}
                      className={cx(
                        classes.noUserSelect,
                        classes.actionButton,
                        classes.fullTag
                      )}
                      outlined
                    />
                    <TagChip
                      tagID={tagID}
                      className={cx(
                        classes.noUserSelect,
                        classes.actionButton,
                        classes.simpleTag
                      )}
                      outlined
                      simpleTag
                    />
                  </React.Fragment>
                ))}
            </React.Fragment>
          )}
        </ListItemText>

        {props.isEditing !== props.scriptID && (
          <ListItemSecondaryAction>
            {!specialMode && (
              <IconButton
                onClick={() => {
                  dispatch(openScriptInScriptor(props.scriptID))
                }}
                className={classes.actionButton}
                edge="end"
                size="small"
                aria-label="edit"
              >
                <EditIcon />
              </IconButton>
            )}
            <IconButton
              onClick={() => props.onSourceOptions(props.scriptID)}
              className={classes.actionButton}
              edge="end"
              size="small"
              aria-label="options"
            >
              <BuildIcon />
            </IconButton>
            <IconButton
              onClick={() => props.onRemove(props.scriptID)}
              className={cx(classes.deleteButton, classes.actionButton)}
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

;(ScriptSourceListItem as any).displayName = 'ScriptSourceListItem'
export default ScriptSourceListItem

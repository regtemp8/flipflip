import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import { cx } from '@emotion/css'

import {
  Checkbox,
  Fab,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Radio,
  TextField,
  type Theme,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import BuildIcon from '@mui/icons-material/Build'
import DeleteIcon from '@mui/icons-material/Delete'

import SourceIcon from './SourceIcon'
import { grey } from '@mui/material/colors'
import { SP } from 'flipflip-common'
import EditIcon from '@mui/icons-material/Edit'
import TagChip from './TagChip'
import { useGetCaptionScriptQuery } from '../../store/api/slice'
import { useNavigate } from 'react-router-dom'
import { selectSpecialMode } from '../../store/app/selectors'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { saveScriptLibraryYOffset } from '../../store/scriptLibrary/thunks'

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
  urlField: {
    width: '100%',
    margin: 0
  },
  noUserSelect: {
    userSelect: 'none'
  },
  textRight: {
    textAlign: 'right'
  }
}))

interface ListItemTagChip {
  tagID: number
}

function ListItemTagChip(props: ListItemTagChip) {
  const { tagID } = props
  const theme = useTheme()
  const isFullTag = useMediaQuery(theme.breakpoints.up('md'))
  const isSimpleTag = useMediaQuery(theme.breakpoints.up('sm'))
  const { classes } = useStyles()

  if (isFullTag || isSimpleTag) {
    return (
      <TagChip
        tagID={tagID}
        className={cx(classes.noUserSelect, classes.actionButton)}
        outlined
        simpleTag={!isFullTag}
      />
    )
  } else {
    return null
  }
}

export interface ScriptSourceListItemProps {
  checked: boolean
  index: number
  isEditing: number
  lastSelected: boolean
  scriptID: number
  style: any
  onEndEdit: (newURL: string) => void
  onPlay: (scriptID: number) => void
  onRemove: (scriptID: number) => void
  onStartEdit: (scriptID: number) => void
  onToggleSelect: (e: ChangeEvent<HTMLInputElement>) => void
}

function ScriptSourceListItem(props: ScriptSourceListItemProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const specialMode = useAppSelector(selectSpecialMode())
  const { data: script } = useGetCaptionScriptQuery(props.scriptID)

  const [urlInput, setUrlInput] = useState<string>('')

  useEffect(() => {
    if (props.isEditing === props.scriptID) {
      setUrlInput(script?.url ?? '')
    }
  }, [props.isEditing, props.scriptID, script?.url])

  const onSourceIconClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (e.shiftKey && !e.ctrlKey) {
      const id = script?.id as number
      window.open(`http://localhost:5050/fs/open/caption-script/${id}`, '_blank')?.focus();
    } else if (!e.shiftKey && !e.ctrlKey) {
      props.onPlay(props.scriptID)
    }
  }

  const onEditSource = (e: ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value)
  }

  const onEndEdit = () => {
    props.onEndEdit(urlInput)
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
      <ListItem
        secondaryAction={
          props.isEditing !== props.scriptID && (
            <>
              {!specialMode && (
                <IconButton
                  onClick={() => {
                    dispatch(saveScriptLibraryYOffset())
                    navigate(`/scriptor/${props.scriptID}`)
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
                onClick={() => {
                  dispatch(saveScriptLibraryYOffset())
                  navigate(`/scripts/${props.scriptID}/options`)
                }}
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
            </>
          )
        }
      >
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
              <table>
                <tr>
                  <td className={classes.textRight}>Click:</td>
                  <td>Play Script</td>
                </tr>
                <tr>
                  <td className={classes.textRight}>Shift+Click:</td>
                  <td>Open Script</td>
                </tr>
              </table>
            }
          >
            <Fab
              size="small"
              onClick={onSourceIconClick}
              className={cx(
                classes.avatar,
                script?.marked && classes.markedSource
              )}
            >
              <SourceIcon
                type={script?.type ?? ''}
                className={cx(
                  classes.sourceIcon,
                  script?.marked && classes.sourceMarkedIcon
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
                {script?.url ?? ''}
              </Typography>
              {script?.tags?.map((tagID) => (
                <ListItemTagChip key={tagID} tagID={tagID} />
              ))}
            </React.Fragment>
          )}
        </ListItemText>
      </ListItem>
    </div>
  )
}

;(ScriptSourceListItem as any).displayName = 'ScriptSourceListItem'
export default ScriptSourceListItem

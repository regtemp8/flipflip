import { ChangeEvent, CSSProperties, FormEvent, MouseEvent } from 'react'
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
import { useNavigate } from 'react-router'
import { selectSpecialMode } from '../../store/app/selectors'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { saveScriptLibraryYOffset } from '../../store/scriptLibrary/thunks'
import {
  selectScriptLibraryEditing,
  selectScriptLibraryIsLastSelected
} from '../../store/scriptLibrary/selectors'
import {
  ScriptEdit,
  setScriptLibraryEditing,
  setScriptLibraryLastSelected
} from '../../store/scriptLibrary/slice'
import {
  deleteCaptionScript,
  updateCaptionScript
} from '../../store/api/thunks'
import { isPrimaryModifierKey } from '../../utils'

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
  scriptID: number
  style: CSSProperties
  onPlay: (scriptID: number) => void
  onRemove: (scriptID: number) => void
  onToggleSelect: (e: ChangeEvent<HTMLInputElement>) => void
}

function ScriptSourceListItem(props: ScriptSourceListItemProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const specialMode = useAppSelector(selectSpecialMode())
  const lastSelected = useAppSelector(
    selectScriptLibraryIsLastSelected(props.scriptID)
  )
  const { data: script } = useGetCaptionScriptQuery(props.scriptID)

  const editing = useAppSelector(selectScriptLibraryEditing())

  const beginEditingUrl = () => {
    if (script != null) {
      const { id, url } = script
      dispatch(setScriptLibraryEditing({ id, url }))
    }
  }

  const endEditingUrl = (e: FormEvent) => {
    e.preventDefault()
    const { id, url } = editing as ScriptEdit
    if (url === '') {
      dispatch(deleteCaptionScript(id))
    } else {
      dispatch(updateCaptionScript({ id, url }))
    }

    dispatch(setScriptLibraryEditing(undefined))
  }

  const onChangeUrl = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(
      setScriptLibraryEditing({
        id: editing?.id as number,
        url: e.currentTarget.value
      })
    )
  }

  const onSourceIconClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (e.shiftKey && !isPrimaryModifierKey(e)) {
      window.open(script?.fileUrl, '_blank')?.focus()
    } else if (!e.shiftKey && !isPrimaryModifierKey(e)) {
      props.onPlay(props.scriptID)
    }
  }

  const { classes } = useStyles()
  return (
    <div
      style={props.style}
      className={cx(
        props.index % 2 === 0 ? classes.evenChild : classes.oddChild,
        lastSelected && classes.lastSelected
      )}
    >
      <ListItem
        secondaryAction={
          editing?.id !== props.scriptID && (
            <>
              {!specialMode && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    dispatch(saveScriptLibraryYOffset())
                    dispatch(setScriptLibraryLastSelected(props.scriptID))
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
                onClick={(e) => {
                  e.stopPropagation()
                  dispatch(saveScriptLibraryYOffset())
                  dispatch(setScriptLibraryLastSelected(props.scriptID))
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
                onClick={(e) => {
                  e.stopPropagation()
                  props.onRemove(props.scriptID)
                }}
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
          {editing?.id === props.scriptID && (
            <form onSubmit={endEditingUrl} className={classes.urlField}>
              <TextField
                variant="standard"
                autoFocus
                fullWidth
                value={editing.url}
                margin="none"
                className={classes.urlField}
                onBlur={endEditingUrl}
                onChange={onChangeUrl}
              />
            </form>
          )}
          {editing?.id !== props.scriptID && (
            <>
              <Typography
                noWrap
                className={classes.noUserSelect}
                onClick={beginEditingUrl}
              >
                {script?.url ?? ''}
              </Typography>
              {script?.tags?.map((tagID) => (
                <ListItemTagChip key={tagID} tagID={tagID} />
              ))}
            </>
          )}
        </ListItemText>
      </ListItem>
    </div>
  )
}

;(ScriptSourceListItem as any).displayName = 'ScriptSourceListItem'
export default ScriptSourceListItem

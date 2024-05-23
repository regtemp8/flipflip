import React, { CSSProperties, ChangeEvent, useState } from 'react'
import {
  IconButton,
  ListItem,
  ListItemText,
  Typography,
  type Theme,
  TextField
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { makeStyles } from 'tss-react/mui'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectDisplayViewColor,
  selectDisplayViewName,
  selectDisplayViewVisible
} from '../../store/displayView/selectors'
import { setDisplayViewColor } from '../../store/displayView/actions'
import { setDisplayViewName } from '../../store/displayView/slice'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { setDisplayViewVisible } from '../../store/displayView/slice'
import ColorPickerMinimal from './ColorPickerMinimal'
import { setDisplaySelectedView } from '../../store/display/slice'
import { cx } from '@emotion/css'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex'
  },
  selected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  selectedText: {
    color: theme.palette.primary.contrastText
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
  },
  listItem: {
    gap: theme.spacing(1)
  }
}))

export interface DisplayViewListItemProps {
  index: number
  viewID: number
  displayID: number
  selected: boolean
  style: CSSProperties
  getScrollTop: () => number | undefined
}

function DisplayViewListItem(props: DisplayViewListItemProps) {
  const { index, viewID, displayID, selected } = props
  const dispatch = useAppDispatch()
  const name = useAppSelector(selectDisplayViewName(viewID))
  const visible = useAppSelector(selectDisplayViewVisible(viewID))

  const [editingName, setEditingName] = useState<string>()

  const onStartEdit = () => {
    setEditingName(name)
  }

  const onEndEdit = () => {
    const value = editingName as string
    if (value) {
      dispatch(setDisplayViewName({ id: viewID, value }))
    }
    setEditingName(undefined)
  }

  const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    setEditingName(event.currentTarget.value)
  }

  const toggleVisibility = () => {
    dispatch(setDisplayViewVisible({ id: viewID, value: !visible }))
  }

  const onItemClick = () => {
    const yOffset = props.getScrollTop()
    dispatch(
      setDisplaySelectedView({ id: displayID, value: { viewID, yOffset } })
    )
  }

  const { classes } = useStyles()
  return (
    <div
      style={props.style}
      className={
        selected
          ? classes.selected
          : index % 2 === 0
            ? classes.evenChild
            : classes.oddChild
      }
    >
      <ListItem className={classes.listItem}>
        <IconButton
          onClick={toggleVisibility}
          className={selected ? classes.selectedText : undefined}
        >
          {visible ? <Visibility /> : <VisibilityOff />}
        </IconButton>
        <ColorPickerMinimal
          selector={selectDisplayViewColor(viewID)}
          action={setDisplayViewColor(viewID)}
        />
        <ListItemText classes={{ primary: classes.root }} onClick={onItemClick}>
          {editingName != null ? (
            <form onSubmit={onEndEdit} className={classes.urlField}>
              <TextField
                variant="standard"
                autoFocus
                id="title"
                margin="none"
                value={editingName}
                onChange={onChangeName}
                onBlur={onEndEdit}
                inputProps={{
                  className: cx(
                    classes.urlField,
                    selected ? classes.selectedText : ''
                  )
                }}
              />
            </form>
          ) : (
            <Typography
              noWrap
              className={classes.noUserSelect}
              onClick={onStartEdit}
            >
              {name}
            </Typography>
          )}
        </ListItemText>
      </ListItem>
    </div>
  )
}

;(DisplayViewListItem as any).displayName = 'DisplayViewListItem'
export default DisplayViewListItem

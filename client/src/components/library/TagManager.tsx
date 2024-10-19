/// <reference path="../../react-sortablejs.d.ts" />
import React, { ChangeEvent, MouseEvent, useState } from 'react'
import { cx } from '@emotion/css'
import Sortable from 'react-sortablejs'

import {
  AppBar,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  IconButton,
  ListItemText,
  Menu,
  TextField,
  type Theme,
  Toolbar,
  Tooltip,
  Typography,
  ListItem
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import SortIcon from '@mui/icons-material/Sort'

import { en, MO, SF } from 'flipflip-common'
import Jiggle from '../animations/Jiggle'
import {
  useCreateTagMutation,
  useDeleteTagsMutation,
  useGetTagQuery,
  useGetTagsQuery
} from '../../store/api/slice'
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex'
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
    overflowY: 'auto'
  },
  tagList: {
    padding: theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap'
  },
  tag: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
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
  removeAllButton: {
    backgroundColor: theme.palette.error.main,
    margin: 0,
    top: 'auto',
    right: 130,
    bottom: 20,
    left: 'auto',
    position: 'fixed'
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
  phraseInput: {
    minWidth: 200,
    minHeight: 100
  }
}))

const ADD_TAG_ID = 0
interface TagEditDialogProps {
  tagID: number
  onClose: () => void
}

function TagEditDialog(props: TagEditDialogProps) {
  const [createTag] = useCreateTagMutation()
  const [tagName, setTagName] = useState('')
  const [tagPhrase, setTagPhrase] = useState('')

  const onChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setTagName(e.currentTarget.value)
  }

  const onChangePhrase = (e: ChangeEvent<HTMLInputElement>) => {
    setTagPhrase(e.currentTarget.value)
  }

  const onRemoveTag = () => {
    setTagName('')
    setTagPhrase('')
    props.onClose()
  }

  const onFinishEdit = async () => {
    await createTag({ id: props.tagID, name: tagName, phraseString: tagPhrase })
    setTagName('')
    setTagPhrase('')
    props.onClose()
  }

  const onCloseEditDialog = () => {
    props.onClose()
  }

  const { classes } = useStyles()
  return (
    <Dialog
      open={props.tagID !== -1}
      onClose={onCloseEditDialog}
      aria-labelledby="edit-title"
    >
      <DialogTitle id="edit-title">
        {props.tagID === ADD_TAG_ID ? 'Add' : 'Edit'} Tag
      </DialogTitle>
      <DialogContent>
        <TextField
          variant="standard"
          autoFocus
          fullWidth
          required
          label="Name"
          value={tagName}
          margin="dense"
          onChange={onChangeTitle}
        />
        <TextField
          variant="standard"
          fullWidth
          multiline
          label="Tag Phrases"
          helperText="These are used in place of $TAG_PHRASE for Caption scripts. One per line."
          id="phrase"
          value={tagPhrase}
          margin="dense"
          slotProps={{
            htmlInput: { className: classes.phraseInput }
          }}
          onChange={onChangePhrase}
        />
      </DialogContent>
      <DialogActions>
        {props.tagID > 0 && (
          <IconButton
            onClick={onRemoveTag}
            style={{ marginRight: 'auto' }}
            size="large"
          >
            <DeleteIcon color="error" />
          </IconButton>
        )}
        <Button onClick={onCloseEditDialog} color="secondary">
          Cancel
        </Button>
        <Button disabled={!tagName} onClick={onFinishEdit} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface TagCardProps {
  tagID: number
  onEdit: (id: number) => void
}

function TagCard(props: TagCardProps) {
  const { data: tag } = useGetTagQuery(props.tagID)

  const { classes } = useStyles()
  return (
    <Jiggle key={props.tagID} bounce>
      <Card className={classes.tag}>
        <CardActionArea onClick={() => props.onEdit(props.tagID)}>
          <CardContent>
            <Typography component="h2" variant="h6">
              {tag?.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Jiggle>
  )
}

function TagManager() {
  const navigate = useNavigate()
  const [deleteTags] = useDeleteTagsMutation()
  const { data: tags } = useGetTagsQuery()
  const [openMenu, setOpenMenu] = useState<string>()
  const [menuAnchorEl, setMenuAnchorEl] = useState<any>()
  const [isEditing, setIsEditing] = useState(-1)

  const goBack = () => {
    navigate(-1)
  }

  const onCloseDialog = () => {
    setMenuAnchorEl(null)
    setOpenMenu(undefined)
    setIsEditing(-1)
  }

  const onAddTag = () => {
    setIsEditing(ADD_TAG_ID)
  }

  const onEditTag = (tagID: number) => {
    setIsEditing(tagID)
  }

  const onRemoveAll = () => {
    setOpenMenu(MO.removeAllAlert)
  }

  const onOpenSortMenu = (e: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget)
    setOpenMenu(MO.sort)
  }

  const onFinishRemoveAll = async () => {
    await deleteTags()
    onCloseDialog()
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
            Tag Manager
          </Typography>

          <div className={classes.headerLeft} />
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />

        <div className={cx(classes.root, classes.fill)}>
          <Container maxWidth={false} className={classes.container}>
            <Sortable
              className={classes.tagList}
              options={{
                animation: 150,
                easing: 'cubic-bezier(1, 0, 0, 1)'
              }}
              onChange={(order: any, sortable: any, evt: any) => {
                // arrayMove(tags, evt.oldIndex, evt.newIndex)
              }}
            >
              {tags?.map((tagID) => (
                <TagCard tagID={tagID} onEdit={onEditTag} />
              ))}
            </Sortable>
          </Container>
        </div>
        <TagEditDialog tagID={isEditing} onClose={onCloseDialog} />
      </main>

      {(tags?.length ?? 0) > 0 && (
        <React.Fragment>
          <Tooltip disableInteractive title="Remove All Tags">
            <Fab
              className={classes.removeAllButton}
              onClick={onRemoveAll}
              size="small"
            >
              <DeleteSweepIcon className={classes.icon} />
            </Fab>
          </Tooltip>
          <Dialog
            open={openMenu === MO.removeAllAlert}
            onClose={onCloseDialog}
            aria-labelledby="remove-all-title"
            aria-describedby="remove-all-description"
          >
            <DialogTitle id="remove-all-title">Delete Tags</DialogTitle>
            <DialogContent>
              <DialogContentText id="remove-all-description">
                Are you sure you want to remove all Tags? This will untag all
                sources as well.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={onCloseDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={onFinishRemoveAll} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </React.Fragment>
      )}

      {(tags?.length ?? 0) >= 2 && (
        <React.Fragment>
          <Fab
            className={classes.sortMenuButton}
            aria-haspopup="true"
            aria-controls="sort-menu"
            aria-label="Sort Tags"
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
            {[SF.alpha, SF.date].map((sf) => (
              <ListItem
                key={sf}
                secondaryAction={
                  <>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        // dispatch(sortTags(sf, true))
                      }}
                      size="large"
                    >
                      <ArrowUpwardIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        // dispatch(sortTags(sf, false))
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
          </Menu>
        </React.Fragment>
      )}

      <Fab className={classes.addMenuButton} onClick={onAddTag} size="large">
        <AddIcon className={classes.icon} />
      </Fab>
    </div>
  )
}

;(TagManager as any).displayName = 'TagManager'
export default TagManager

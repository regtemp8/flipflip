/// <reference path="../../react-sortablejs.d.ts" />
import React, { MouseEvent, useState } from 'react'
import wretch from 'wretch'
import AbortAddon from 'wretch/addons/abort'
import FormUrlAddon from 'wretch/addons/formUrl'
import Sortable from 'react-sortablejs'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  type Theme,
  List,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Container,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Divider,
  Chip,
  ListItemButton,
  Rating,
  SelectChangeEvent
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

import { en, AF, PW, PWS } from 'flipflip-common'
import { arrayMove } from '../../data/utils'
import { useAppSelector } from '../../store/hooks'
import {
  selectAppConfigRemoteSettingsPiwigoHost,
  selectAppConfigRemoteSettingsPiwigoPassword,
  selectAppConfigRemoteSettingsPiwigoProtocol,
  selectAppConfigRemoteSettingsPiwigoUsername
} from '../../store/app/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
  list: {},
  subList: {
    paddingLeft: 10
  },
  rootInput: {
    marginLeft: theme.spacing(2),
    flexGrow: 1
  },
  sortListDisabled: {
    pointerEvents: 'none',
    opacity: 0.6
  },
  sortCol: {
    marginBottom: 5
  },
  sortColContent: {
    display: 'flex',
    padding: '5px !important'
  },
  sortColLabel: {
    lineHeight: 2,
    marginRight: 'auto'
  },
  sortColDir: {
    marginTop: 8
  },
  tagChip: {
    marginTop: 0,
    marginRight: 5,
    marginBottom: 5,
    marginLeft: 0
  },
  areaHeaderFirst: {
    marginTop: 0
  },
  areaHeader: {
    marginTop: 15
  },
  ratingArea: {
    display: 'flex'
  },
  typeSelect: {
    marginLeft: 10
  }
}))

interface Album {
  id: number
  tn_url: string
  name: string
  comment: string
  sub_categories: Album[]
}

interface Tag {
  id: number
  name: string
  counter: number
}

interface Column {
  label: string
  name: string
  direction: string
  enabled: boolean
}

export interface AlbumListItemProps {
  album: Album
  selectedAlbums: number[]
  onSelect: (albumID: number, selected: boolean) => void
}

function AlbumListItem(props: AlbumListItemProps) {
  const [foldersOpen, setFoldersOpen] = useState(false)

  const setOpen = (foldersOpen = false, e: MouseEvent) => {
    e.stopPropagation()
    setFoldersOpen(foldersOpen)
  }

  const { classes } = useStyles()
  const { album, selectedAlbums, onSelect } = props
  const isSelected = selectedAlbums.includes(album.id)

  return (
    <React.Fragment>
      <ListItemButton
        key={album.id}
        selected={isSelected}
        onClick={() => onSelect(album.id, !isSelected)}
      >
        <ListItemAvatar>
          <Avatar alt={album.name} src={album.tn_url} />
        </ListItemAvatar>
        <ListItemText primary={album.name} secondary={album.comment} />
        {album.sub_categories?.length && !foldersOpen && (
          <Tooltip disableInteractive title="Show Sub-Albums">
            <ExpandMoreIcon
              onClick={(e: MouseEvent<SVGSVGElement>) => setOpen(true, e)}
            />
          </Tooltip>
        )}
        {album.sub_categories?.length && foldersOpen && (
          <Tooltip disableInteractive title="Hide Sub-Albums">
            <ExpandLessIcon
              onClick={(e: MouseEvent<SVGSVGElement>) => setOpen(false, e)}
            />
          </Tooltip>
        )}
      </ListItemButton>
      {foldersOpen && (
        <List className={classes.subList}>
          {album.sub_categories.map((album: Album) => (
            <AlbumListItem
              key={album.id}
              album={album}
              selectedAlbums={selectedAlbums}
              onSelect={onSelect}
            />
          ))}
        </List>
      )}
    </React.Fragment>
  )
}

export interface PiwigoDialogProps {
  open: boolean
  onClose: () => void
  onImportURL: (type: string, e?: MouseEvent, ...args: any[]) => void
}

function PiwigoDialog(props: PiwigoDialogProps) {
  const piwigoPassword = useAppSelector(
    selectAppConfigRemoteSettingsPiwigoPassword()
  )
  const piwigoUsername = useAppSelector(
    selectAppConfigRemoteSettingsPiwigoUsername()
  )
  const piwigoHost = useAppSelector(selectAppConfigRemoteSettingsPiwigoHost())
  const piwigoProtocol = useAppSelector(
    selectAppConfigRemoteSettingsPiwigoProtocol()
  )

  const [listType, setListType] = useState(PW.apiTypeCategory)
  const [albums, setAlbums] = useState<Album[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loggedIn, setLoggedIn] = useState(false)
  const [selectedAlbums, setSelectedAlbums] = useState<number[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [tagModeAnd, setTagModeAnd] = useState(false)
  const [sortRandom, setSortRandom] = useState(false)
  const [recursiveMode, setRecursiveMode] = useState(false)
  const [sortOrder, setSortOrder] = useState(
    Object.values(PWS)
      .filter((pw) => pw !== PWS.sortOptionRandom)
      .map((pw) => {
        return {
          label: en.get(pw),
          name: pw,
          direction: 'DESC',
          enabled: false
        } as Column
      })
  )

  const onDialogEntered = () => {
    if (listType === PW.apiTypeCategory) {
      getAlbums()
    } else if (listType === PW.apiTypeTag) {
      getTags()
    }
  }

  const onListTypeChange = (e: SelectChangeEvent) => {
    const type = e.target.value
    setListType(type)
    if (type === PW.apiTypeCategory) {
      getAlbums()
    } else if (type === PW.apiTypeTag) {
      getTags()
    }
  }

  const login = async () => {
    await wretch(makeURL())
      .addon(AbortAddon())
      .addon(FormUrlAddon)
      .formUrl({
        method: 'pwg.session.login',
        username: piwigoUsername,
        password: piwigoPassword
      })
      .post()
      .setTimeout(5000)
      // .notFound((e) => pm({
      //   error: e.message,
      //   helpers: helpers,
      //   source: source,
      //   timeout: timeout,
      //   pathSep: pathSep
      // }))
      // .internalError((e) => pm({
      //   error: e.message,
      //   helpers: helpers,
      //   source: source,
      //   timeout: timeout,
      //   pathSep: pathSep
      // }))
      .json((json) => {
        if (json.stat === 'ok') {
          setLoggedIn(true)
        } else {
          //
        }
      })
      .catch((e) => {
        //
      })
  }

  const getAlbums = () => {
    const getAlbums = async () => {
      await wretch(makeURL())
        .addon(AbortAddon())
        .addon(FormUrlAddon)
        .formUrl({
          method: 'pwg.categories.getList',
          recursive: true,
          tree_output: true
        })
        .post()
        .setTimeout(5000)
        // .notFound((e) => pm({
        //   error: e.message,
        //   helpers: helpers,
        //   source: source,
        //   timeout: timeout,
        //   pathSep: pathSep
        // }))
        // .internalError((e) => pm({
        //   error: e.message,
        //   helpers: helpers,
        //   source: source,
        //   timeout: timeout,
        //   pathSep: pathSep
        // }))
        .json((json) => {
          if (json.stat === 'ok') {
            setAlbums(json.result.map((a: Album) => a))
          } else {
            //
          }
        })
        .catch((e) => {
          //
        })
    }

    if (!loggedIn && !!piwigoUsername) {
      login().then(getAlbums)
    } else {
      getAlbums()
    }
  }

  const getTags = () => {
    const getTags = async () => {
      await wretch(makeURL())
        .addon(AbortAddon())
        .addon(FormUrlAddon)
        .formUrl({ method: 'pwg.tags.getList' })
        .post()
        .setTimeout(5000)
        // .notFound((e) => pm({
        //   error: e.message,
        //   helpers: helpers,
        //   source: source,
        //   timeout: timeout,
        //   pathSep: pathSep
        // }))
        // .internalError((e) => pm({
        //   error: e.message,
        //   helpers: helpers,
        //   source: source,
        //   timeout: timeout,
        //   pathSep: pathSep
        // }))
        .json((json) => {
          if (json.stat === 'ok') {
            setTags(json.result.tags.map((t: Tag) => t))
          } else {
            //
          }
        })
        .catch((e) => {
          //
        })
    }

    if (!loggedIn && !!piwigoUsername) {
      login().then(getTags)
    } else {
      getTags()
    }
  }

  const createAPICall = (e: MouseEvent) => {
    let url = `${makeURL()}&method=${listType}`

    if (listType === PW.apiTypeCategory) {
      url += '&' + selectedAlbums.map((catID) => `cat_id[]=${catID}`).join('&')
      if (recursiveMode) {
        url += '&recursive=true'
      }
    } else if (listType === PW.apiTypeTag) {
      url += '&' + selectedTags.map((tagID) => `tag_id[]=${tagID}`).join('&')
      if (tagModeAnd) {
        url += '&tag_mode_and=true'
      }
    }

    if (sortRandom) {
      url += '&order=random'
    } else {
      const sortLines = sortOrder
        .filter((col) => col.enabled)
        .map((col) => `${col.name} ${col.direction}`)
        .join(',')
      if (sortLines) {
        url += `&order=${encodeURIComponent(sortLines)}`
      }
    }

    props.onImportURL(AF.url, undefined, [url])
  }

  const makeURL = () => {
    return piwigoProtocol + '://' + piwigoHost + '/ws.php?format=json'
  }

  const addSelectedAlbum = (albumID: number) => {
    setSelectedAlbums([...selectedAlbums, albumID])
  }

  const removeSelectedAlbum = (albumID: number) => {
    setSelectedAlbums(selectedAlbums.filter((t: number) => t !== albumID))
  }

  const addSelectedTag = (tagID: number) => {
    setSelectedTags([...selectedTags, tagID])
  }

  const removeSelectedTag = (tagID: number) => {
    setSelectedTags(selectedTags.filter((t: number) => t !== tagID))
  }

  const setRandomSortOrder = (sortRandom: boolean) => {
    setSortRandom(sortRandom)
  }

  const setRecursive = (recursiveMode: boolean) => {
    setRecursiveMode(recursiveMode)
  }

  const setTagMode = (tagModeAnd: boolean) => {
    setTagModeAnd(tagModeAnd)
  }

  const toggleSortColumn = (columnName: string, enabled: boolean) => {
    const newSortOrder = Array.from(sortOrder).map((col: Column) => {
      if (col.name === columnName) {
        return { ...col, enabled }
      }
      return col
    })
    setSortOrder(newSortOrder)
  }

  const setColumnDirection = (columnName: string, direction: string) => {
    const newSortOrder = Array.from(sortOrder).map((col: Column) => {
      if (col.name === columnName) {
        return { ...col, enabled: true, direction }
      }
      return col
    })
    setSortOrder(newSortOrder)
  }

  const { classes } = useStyles()

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      TransitionProps={{ onEntered: onDialogEntered }}
      fullWidth={true}
      aria-labelledby="url-import-title"
      aria-describedby="url-import-description"
    >
      <DialogTitle id="url-import-title">
        Create a New Piwigo Source
      </DialogTitle>
      <DialogContent>
        <FormControl variant="standard">
          <Typography
            component="h2"
            variant="h6"
            className={classes.areaHeaderFirst}
          >
            Piwigo Source Type
          </Typography>
          <DialogContentText>
            Select the type of image list to create
          </DialogContentText>
          <Select
            variant="standard"
            value={listType}
            className={classes.typeSelect}
            onChange={onListTypeChange}
          >
            <MenuItem value={PW.apiTypeCategory}>Album Media</MenuItem>
            <MenuItem value={PW.apiTypeTag}>Tagged Media</MenuItem>
            <MenuItem disabled={!piwigoUsername} value={PW.apiTypeFavorites}>
              Your Favorites
            </MenuItem>
          </Select>
        </FormControl>
        {listType === PW.apiTypeCategory && (
          <React.Fragment>
            <Typography
              component="h2"
              variant="h6"
              className={classes.areaHeader}
            >
              Select an Album
            </Typography>
            <DialogContentText>
              Select the album to load media from
            </DialogContentText>
            <List className={classes.list}>
              {albums.map((album: Album) => (
                <AlbumListItem
                  key={album.id}
                  album={album}
                  selectedAlbums={selectedAlbums}
                  onSelect={(albumID, isSelected) => {
                    const fn = isSelected
                      ? addSelectedAlbum
                      : removeSelectedAlbum

                    fn(albumID)
                  }}
                />
              ))}
            </List>
            <FormControlLabel
              control={
                <Checkbox
                  onChange={() => setRecursive(!recursiveMode)}
                  checked={recursiveMode}
                />
              }
              label="Recursive"
            />
          </React.Fragment>
        )}
        {listType === PW.apiTypeTag && (
          <React.Fragment>
            <Typography
              component="h2"
              variant="h6"
              className={classes.areaHeader}
            >
              Select Tags
            </Typography>
            <DialogContentText>
              Select the tags used to retrieve media with
            </DialogContentText>
            {tags.map((tag: Tag) => {
              const isSelected = selectedTags.includes(tag.id)
              return (
                <Chip
                  className={classes.tagChip}
                  key={tag.name}
                  color={isSelected ? 'secondary' : 'primary'}
                  onClick={
                    isSelected
                      ? () => removeSelectedTag(tag.id)
                      : () => addSelectedTag(tag.id)
                  }
                  label={tag.name}
                />
              )
            })}
            <Divider orientation="horizontal" flexItem />
            <FormControlLabel
              control={
                <Checkbox
                  onChange={() => setTagMode(!tagModeAnd)}
                  checked={tagModeAnd}
                />
              }
              label="Must Match All Tags"
            />
          </React.Fragment>
        )}
        <Divider orientation="horizontal" flexItem />
        <React.Fragment>
          <Typography
            component="h2"
            variant="h6"
            className={classes.areaHeader}
          >
            Sort Order
          </Typography>
          <DialogContentText>
            Indicate the media sort order (optional)
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox
                onChange={() => setRandomSortOrder(!sortRandom)}
                checked={sortRandom}
              />
            }
            label="Randomize"
          />
          <Sortable
            className={sortRandom ? classes.sortListDisabled : null}
            options={{
              animation: 150,
              easing: 'cubic-bezier(1, 0, 0, 1)'
            }}
            onChange={(order: any, sortable: any, evt: any) => {
              const newSortOrder = Array.from(sortOrder)
              arrayMove(newSortOrder, evt.oldIndex, evt.newIndex)
              setSortOrder(newSortOrder)
            }}
          >
            {sortOrder.map((column) => (
              <Card className={classes.sortCol} key={column.name}>
                <CardContent
                  className={classes.sortColContent}
                  onClick={() =>
                    setColumnDirection(
                      column.name,
                      column.direction === 'ASC' ? 'DESC' : 'ASC'
                    )
                  }
                >
                  <Checkbox
                    checked={column.enabled}
                    onChange={() =>
                      toggleSortColumn(column.name, !column.enabled)
                    }
                  />
                  <Typography
                    component="h3"
                    variant="h6"
                    className={classes.sortColLabel}
                  >
                    {column.label}
                  </Typography>
                  {column.direction === 'ASC' && (
                    <Tooltip disableInteractive title="Sort Ascending">
                      <ArrowUpwardIcon className={classes.sortColDir} />
                    </Tooltip>
                  )}
                  {column.direction === 'DESC' && (
                    <Tooltip disableInteractive title="Sort Descending">
                      <ArrowDownwardIcon className={classes.sortColDir} />
                    </Tooltip>
                  )}
                </CardContent>
              </Card>
            ))}
          </Sortable>
        </React.Fragment>
        {(listType === PW.apiTypeTag || listType === PW.apiTypeCategory) && (
          <React.Fragment>
            <Typography
              component="h2"
              variant="h6"
              className={classes.areaHeader}
            >
              Rating
            </Typography>
            <DialogContentText>
              Indicate the media sort order (optional)
            </DialogContentText>
            <Container className={classes.ratingArea}>
              <Container>
                <Typography component="legend">Minimum Rating</Typography>
                <Rating name="pwg-image-min" precision={0.5} />
              </Container>
              <Container>
                <Typography component="legend">Maximum Rating</Typography>
                <Rating name="pwg-image-max" precision={0.5} />
              </Container>
            </Container>
          </React.Fragment>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="secondary">
          Cancel
        </Button>
        <Button
          // disabled={!importURL.match("^https?://") || (importType === GT.local && rootDir.length === 0)}
          onClick={createAPICall}
          color="primary"
        >
          Create List
        </Button>
      </DialogActions>
    </Dialog>
  )
}

;(PiwigoDialog as any).displayName = 'PiwigoDialog'
export default PiwigoDialog

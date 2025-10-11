import { CSSProperties, MouseEvent, useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  Grid2,
  Card,
  Button,
  IconButton,
  InputBase,
  Breadcrumbs,
  Link,
  Typography,
  DialogActions,
  Divider,
  ListItemButton,
  Paper,
  Stack,
  Box,
  Popover,
  TextField,
  Theme
} from '@mui/material'
import CancelIcon from '@mui/icons-material/Cancel'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import FolderIcon from '@mui/icons-material/Folder'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import OtherHousesIcon from '@mui/icons-material/OtherHouses'
import { FixedSizeList } from 'react-window'
import {
  useCreateDirectoryMutation,
  useGetFilePickerDataQuery
} from '../../store/api/slice'
import { AF, BASE_DIR, FilePickerItem } from 'flipflip-common'
import { filesize } from 'filesize'
import { makeStyles } from 'tss-react/mui'
import { isPrimaryModifierKey } from '../../utils'

const useStyles = makeStyles()((theme: Theme) => ({
  itemSelected: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: `${theme.palette.primary.main} !important`,
      color: theme.palette.primary.contrastText
    }
  }
}))

interface FilePickerListItemProps {
  selected: boolean
  item: FilePickerItem
  onDoubleClick: (item: FilePickerItem) => void
  onSelect: (
    item: FilePickerItem,
    primaryModifierKey: boolean,
    shiftKey: boolean
  ) => void
  style?: CSSProperties
}

const FilePickerListItem = (props: FilePickerListItemProps) => {
  const { item, selected, style, onDoubleClick, onSelect } = props
  const { classes } = useStyles()
  return (
    <ListItemButton
      style={style}
      selected={selected}
      onDoubleClick={() => onDoubleClick(item)}
      onClick={(event) =>
        onSelect(item, isPrimaryModifierKey(event), event.shiftKey)
      }
      classes={{
        selected: classes.itemSelected
      }}
    >
      <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
        {item.directory ? <FolderIcon /> : <InsertDriveFileIcon />}
        <Typography sx={{ flex: 1 }}>{item.name}</Typography>
        <Typography sx={{ flex: 0.2, textAlign: 'right' }}>
          {filesize(item.size, { standard: 'jedec' })}
        </Typography>
        <Typography sx={{ flex: 0.2, textAlign: 'right' }}>
          {new Date(item.lastModified).toDateString()}
        </Typography>
      </Stack>
    </ListItemButton>
  )
}

const Row = (props: any) => {
  const { index, data, style } = props
  return (
    <FilePickerListItem
      key={index}
      selected={data[index].selected}
      item={data[index].item}
      onDoubleClick={data[index].onDoubleClick}
      onSelect={data[index].onSelect}
      style={style}
    />
  )
}

interface PathTextFieldProps {
  path: string
  onApply: (path: string) => void
}

const PathTextField = (props: PathTextFieldProps) => {
  const [value, setValue] = useState(props.path)
  return (
    <InputBase
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      inputRef={(ref) => ref?.focus()}
      sx={{ ml: 1, flex: 1 }}
      fullWidth
      aria-labelledby="edit-path-input"
      onBlur={() => props.onApply(value)}
      onKeyUp={(event) => {
        if (event.code === 'Enter') {
          props.onApply(value)
        }
      }}
    />
  )
}

interface CreateDirectoryPopoverProps {
  parentPath?: string
  sep?: string
  setSelected: (selected: string[]) => void
}

const CreateDirectoryPopover = (props: CreateDirectoryPopoverProps) => {
  const [createDirectory] = useCreateDirectoryMutation()
  const [folderName, setFolderName] = useState('')
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>()

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
    setFolderName('')
  }

  const onCreate = async () => {
    const { parentPath, sep } = props
    if (folderName) {
      await createDirectory({ path: `${parentPath}${sep}${folderName}` })
      props.setSelected([folderName])
      handleClose()
    }
  }

  return (
    <>
      <IconButton
        disabled={props.parentPath == null}
        onClick={handleClick}
        aria-describedby="create-directory-popover"
      >
        <CreateNewFolderIcon />
      </IconButton>
      <Popover
        id="create-directory-popover"
        open={anchorEl != null}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Grid2 container spacing={1} sx={{ p: 2, alignItems: 'center' }}>
          <Grid2 size={12}>
            <Typography>Folder Name</Typography>
          </Grid2>
          <Grid2 size={9}>
            <TextField
              size="small"
              fullWidth
              value={folderName}
              onChange={(event) => setFolderName(event.currentTarget.value)}
              onKeyUp={(event) => {
                if (event.code === 'Enter') {
                  onCreate()
                }
              }}
            />
          </Grid2>
          <Grid2 size={3}>
            <Button
              size="medium"
              variant="contained"
              fullWidth
              disabled={folderName === ''}
              onClick={onCreate}
            >
              Create
            </Button>
          </Grid2>
        </Grid2>
      </Popover>
    </>
  )
}

interface SortBy {
  column: string
  asc: boolean
}

interface SortButtonProps {
  column: string
  sort: SortBy
  justifyContent: string
  onSortClick: (column: string) => void
}

const SortButton = (props: SortButtonProps) => {
  const { column, sort, justifyContent, onSortClick } = props
  return (
    <Button
      variant="text"
      color="inherit"
      onClick={() => onSortClick(column)}
      fullWidth
      sx={{ justifyContent }}
    >
      {column}
      {sort.column === column && sort.asc && <ArrowDropUpIcon />}
      {sort.column === column && !sort.asc && <ArrowDropDownIcon />}
    </Button>
  )
}

const sortItems = (items: FilePickerItem[], sort: SortBy) => {
  if (sort.column === 'name') {
    if (sort.asc) {
      items.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      items.sort((a, b) => b.name.localeCompare(a.name))
    }
  } else if (sort.column === 'size') {
    if (sort.asc) {
      items.sort((a, b) => a.size - b.size)
    } else {
      items.sort((a, b) => b.size - a.size)
    }
  } else if (sort.column === 'modified') {
    if (sort.asc) {
      items.sort((a, b) => a.lastModified - b.lastModified)
    } else {
      items.sort((a, b) => b.lastModified - a.lastModified)
    }
  }
}

enum FilePickerMode {
  Search,
  PathInput,
  PathNavigation
}

export interface FilePickerProps {
  open: boolean
  multiple?: boolean
  type: string
  path?: string
  onClose: (chosenFiles?: string[]) => void
}

export default function FilePicker(props: FilePickerProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState<SortBy>({ column: 'name', asc: true })
  const [path, setPath] = useState(props.path ?? BASE_DIR)
  const [search, setSearch] = useState<string>()
  const [mode, setMode] = useState(FilePickerMode.PathNavigation)
  const { data } = useGetFilePickerDataQuery({ path, type: props.type })

  const _lastSelected = useRef<string>()

  useEffect(() => {
    setPath(props.path ?? BASE_DIR)
  }, [props.path])

  const renderFilePickerTopBar = () => {
    switch (mode) {
      case FilePickerMode.PathInput: {
        return (
          <PathTextField
            path={data?.path ?? ''}
            onApply={(path: string) => {
              setPath(path)
              setMode(FilePickerMode.PathNavigation)
              setSelected([])
            }}
          />
        )
      }
      case FilePickerMode.PathNavigation: {
        if (data == null) {
          return null
        }

        const path = data.path
        const crumbs = path.split(data.sep)
        const last = crumbs.pop()
        return (
          <Breadcrumbs
            maxItems={10}
            itemsBeforeCollapse={2}
            itemsAfterCollapse={5}
            separator={data.sep}
            sx={{ ml: 1, flex: 1 }}
          >
            <Link
              component="button"
              variant="body2"
              underline="hover"
              color="inherit"
              onClick={() => {
                setPath('')
                setSelected([])
              }}
            >
              {<OtherHousesIcon />}
            </Link>
            {crumbs.map(
              (crumb, index, array) =>
                (index !== 0 || crumb !== '') && (
                  <Link
                    component="button"
                    variant="body2"
                    underline="hover"
                    color="inherit"
                    onClick={() => {
                      setPath(array.slice(0, index + 1).join(data.sep))
                      setSelected([])
                    }}
                  >
                    {crumb}
                  </Link>
                )
            )}
            {last && (
              <Typography sx={{ color: 'text.primary' }}>{last}</Typography>
            )}
          </Breadcrumbs>
        )
      }
      case FilePickerMode.Search: {
        return (
          <InputBase
            inputRef={(ref) => ref?.focus()}
            sx={{ ml: 1, flex: 1 }}
            fullWidth
            placeholder="Search current directory"
            aria-labelledby="search-current-directory-input"
            onChange={(event) => setSearch(event.currentTarget.value)}
            value={search ?? ''}
          />
        )
      }
    }
  }

  const onEditClick = () => {
    setSearch(undefined)
    setMode((mode) =>
      mode === FilePickerMode.PathNavigation
        ? FilePickerMode.PathInput
        : FilePickerMode.PathNavigation
    )
  }

  const onDoubleClick = (item: FilePickerItem) => {
    if (data == null) {
      return
    }

    setSearch('')
    setMode(FilePickerMode.PathNavigation)
    const newPath = joinPath(data.path, item.name, data.sep)
    if (item.directory) {
      setPath(newPath)
      setSelected([])
      _lastSelected.current = undefined
    } else {
      onClose([newPath])
    }
  }

  const joinPath = (dir: string, file: string, sep: string) => {
    if (dir !== '' && dir !== sep) {
      dir += sep
    }

    return `${dir}${file}`
  }

  const onSelect = (
    item: FilePickerItem,
    primaryModifierKey: boolean,
    shiftKey: boolean
  ) => {
    if (props.multiple && primaryModifierKey) {
      _lastSelected.current = item.name
      setSelected((value) => {
        const oldLength = value.length
        value = value.filter((v) => v !== item.name)
        if (value.length === oldLength) {
          value.push(item.name)
        }

        return value
      })
    } else if (props.multiple && shiftKey && _lastSelected.current != null) {
      const lastSelectedIndex = items.findIndex(
        (i) => i.name === _lastSelected.current
      )
      const currentSelectedIndex = items.findIndex((i) => i.name === item.name)
      const start = Math.min(lastSelectedIndex, currentSelectedIndex)
      const end = Math.max(lastSelectedIndex, currentSelectedIndex) + 1
      setSelected(items.slice(start, end).map((i) => i.name))
    } else {
      _lastSelected.current = item.name
      setSelected([item.name])
    }
  }

  const onSortClick = (column: string) => {
    if (sort.column === column) {
      setSort({ column, asc: !sort.asc })
    } else {
      setSort({ column, asc: true })
    }
  }

  const onClose = (chosenFiles?: string[]) => {
    props.onClose(chosenFiles)
    setMode(FilePickerMode.PathNavigation)
    setSelected([])
    setSort({ column: 'name', asc: true })
    setSearch(undefined)
    setPath(props.path ?? BASE_DIR)
    _lastSelected.current = undefined
  }

  const isDir = () =>
    props.type === 'dir' ||
    props.type === AF.directory ||
    props.type === AF.videoDir

  const getChosenFiles = () => {
    const directory = isDir()
    const selectedItems = selected
      .map((name) => items.find((item) => item.name === name))
      .filter((item) => item?.directory === directory)
      .map((item) => item as FilePickerItem)

    return selectedItems.length === 0 && directory
      ? [data?.path as string]
      : selectedItems.map((item) => item.name)
  }

  const canChoose = () => {
    return getChosenFiles().length > 0
  }

  const onChoose = () => {
    if (data == null) {
      return
    }

    onClose(
      getChosenFiles().map((name) =>
        name !== data.path ? joinPath(data.path, name, data.sep) : name
      )
    )
  }

  let items: FilePickerItem[] = []
  if (data?.items != null) {
    items.push(...data.items)
  }
  if (search != null) {
    items = items.filter((item) => item.name.includes(search))
  }
  sortItems(items, sort)
  return (
    <Dialog open={props.open} fullWidth maxWidth="lg">
      <DialogContent sx={{ overflow: 'hidden' }}>
        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <Card sx={{ display: 'flex', alignItems: 'center' }}>
              {renderFilePickerTopBar()}
              <IconButton sx={{ p: '10px' }} onClick={onEditClick}>
                {mode === FilePickerMode.PathNavigation ? (
                  <EditIcon />
                ) : (
                  <CancelIcon />
                )}
              </IconButton>
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <IconButton
                sx={{ p: '10px' }}
                onClick={() => setMode(FilePickerMode.Search)}
              >
                <SearchIcon />
              </IconButton>
              {isDir() && (
                <>
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                  <CreateDirectoryPopover
                    parentPath={data?.path}
                    sep={data?.sep}
                    setSelected={setSelected}
                  />
                </>
              )}
            </Card>
          </Grid2>
          <Grid2 size={12}>
            <Paper>
              <Stack direction="row" spacing={1} sx={{ p: 2, pb: 1, flex: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <SortButton
                    column="name"
                    sort={sort}
                    justifyContent="left"
                    onSortClick={onSortClick}
                  />
                </Box>
                <Box sx={{ flex: 0.2 }}>
                  <SortButton
                    column="size"
                    sort={sort}
                    justifyContent="right"
                    onSortClick={onSortClick}
                  />
                </Box>
                <Box sx={{ flex: 0.2 }}>
                  <SortButton
                    column="modified"
                    sort={sort}
                    justifyContent="right"
                    onSortClick={onSortClick}
                  />
                </Box>
              </Stack>
              <FixedSizeList
                height={480}
                width="100%"
                itemSize={48}
                itemCount={items.length}
                itemData={items.map((item, index) => ({
                  index,
                  selected: selected.includes(item.name),
                  item,
                  onDoubleClick,
                  onSelect
                }))}
                itemKey={(index: number, data: FilePickerListItemProps[]) =>
                  data[index].item.name
                }
                overscanCount={5}
              >
                {Row}
              </FixedSizeList>
            </Paper>
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} color="secondary">
          Cancel
        </Button>
        <Button
          disabled={!canChoose()}
          onClick={() => onChoose()}
          color="primary"
          sx={{ mr: 2 }}
        >
          Choose
        </Button>
      </DialogActions>
    </Dialog>
  )
}

import { useEffect, useState, useRef, ChangeEvent } from 'react'
import {
  arrayMove,
  SortableContainer,
  SortableElement
} from 'react-sortable-hoc'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  List,
  type Theme,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AudioSourceListItem from './AudioSourceListItem'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setAudioLibraryLastSelected } from '../../store/audioLibrary/slice'
import { deleteAudio, moveAudio } from '../../store/api/thunks'
import { selectAudioLibraryYOffset } from '../../store/audioLibrary/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
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
  arrowWrapper: {
    position: 'absolute',
    overflow: 'hidden',
    bottom: 20,
    right: 35
  },
  arrow: {
    fontSize: 220,
    transform: 'rotateY(0deg) rotate(45deg)'
  },
  arrowMessage: {
    position: 'absolute',
    bottom: 260,
    right: 160
  }
}))

interface SortableVirtualListProps {
  width: number
  height: number
  audios: number[]
  yOffset: number
}

export interface AudioSourceListProps {
  cachePath: string
  isSelect: boolean
  selected: number[]
  showHelp: boolean
  audios: number[]
  filters: string[]
  sources: number[]
  playlist?: string
  onClickAlbum: (album: string) => void
  onClickArtist: (artist: string) => void
  onUpdateSelected: (selected: number[]) => void
}

function AudioSourceList(props: AudioSourceListProps) {
  const dispatch = useAppDispatch()
  const [deleteDialog, setDeleteDialog] = useState<number>()

  const _shiftDown = useRef<boolean>()
  const _lastChecked = useRef<number>()

  const yOffset = useAppSelector(selectAudioLibraryYOffset())
  const deleteDialogURL = ''

  const onSortEnd = ({
    oldIndex,
    newIndex
  }: {
    oldIndex: number
    newIndex: number
  }) => {
    const oldID = props.sources[oldIndex]
    const newID = props.sources[newIndex]
    const newSources = arrayMove(props.sources, oldIndex, newIndex)
    const newAudios = arrayMove(
      props.audios,
      props.audios.indexOf(oldID),
      props.audios.indexOf(newID)
    )
    dispatch(moveAudio(newAudios, props.filters, newSources))
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') _shiftDown.current = true
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') _shiftDown.current = false
    }

    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('keyup', onKeyUp, false)
    _shiftDown.current = false
    _lastChecked.current = undefined

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      _shiftDown.current = undefined
      _lastChecked.current = undefined
    }
  }, [])

  const onDelete = (audioID: number) => {
    setDeleteDialog(audioID)
  }

  const onCloseDeleteDialog = () => {
    setDeleteDialog(undefined)
  }

  const onFinishDelete = async () => {
    // await flipflip().api.unlink(deleteDialogURL as string)
    // onRemove(deleteDialog as number)
    // onCloseDeleteDialog()
  }

  const onRemove = (audioID: number) => {
    if (props.playlist) {
      return // TODO add playlist delete
    }

    props.onUpdateSelected(props.selected.filter((id) => id !== audioID))
    dispatch(deleteAudio(audioID))
  }

  const onToggleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    const audioID = Number(value)
    const index = props.selected.indexOf(audioID)
    const newSelected = Array.from(props.selected)
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
          if (start && (id === audioID || id === _lastChecked.current)) {
            break
          }
          if (start) {
            newSelected.push(id)
          }
          if (!start && (id === audioID || id === _lastChecked.current)) {
            start = true
          }
        }
      }
      newSelected.push(audioID)
    }
    _lastChecked.current = audioID
    props.onUpdateSelected(newSelected)
  }

  const clearLastSelected = () => {
    dispatch(setAudioLibraryLastSelected(undefined))
  }

  const SortableVirtualList =
    SortableContainer<SortableVirtualListProps>(VirtualList)

  function VirtualList(props: SortableVirtualListProps) {
    const { height, width, audios, yOffset } = props

    return (
      <FixedSizeList
        height={height}
        width={width}
        initialScrollOffset={yOffset}
        itemSize={56}
        itemCount={audios.length}
        itemData={audios}
        itemKey={(index: number) => index}
        overscanCount={10}
      >
        {Row}
      </FixedSizeList>
    )
  }

  const SortableItem = SortableElement<{ index: any; value: any }>(
    ({ value }: { value: { index: number; style: any; data: any[] } }) => {
      const index = value.index
      const audioID: number = value.data[index]
      return (
        <AudioSourceListItem
          key={index}
          checked={props.isSelect ? props.selected.includes(audioID) : false}
          index={index}
          isSelect={props.isSelect}
          audioID={audioID}
          audios={value.data}
          style={value.style}
          onClickAlbum={props.onClickAlbum}
          onClickArtist={props.onClickArtist}
          onDelete={onDelete}
          onRemove={onRemove}
          onToggleSelect={onToggleSelect}
        />
      )
    }
  )

  function Row(props: any) {
    const { index } = props
    return <SortableItem index={index} value={props} />
  }

  const { classes } = useStyles()
  if (props.sources.length === 0) {
    return (
      <>
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
          <>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.arrowMessage}
            >
              Add new tracks
            </Typography>
            <div className={classes.arrowWrapper}>
              <div className={classes.arrow}>→</div>
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List id="sortable-list" disablePadding onClick={clearLastSelected}>
            <SortableVirtualList
              helperContainer={() =>
                document.getElementById('sortable-list') as HTMLElement
              }
              distance={5}
              height={height}
              width={width}
              audios={props.sources}
              yOffset={yOffset}
              onSortEnd={onSortEnd}
            />
          </List>
        )}
      </AutoSizer>
      {deleteDialog != null && (
        <Dialog
          open={true}
          onClose={onCloseDeleteDialog}
          aria-describedby="delete-description"
        >
          <DialogContent>
            <DialogContentText id="delete-description">
              Are you sure you want to delete {deleteDialogURL}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseDeleteDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={onFinishDelete} color="primary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

;(AudioSourceList as any).displayName = 'AudioSourceList'
export default AudioSourceList

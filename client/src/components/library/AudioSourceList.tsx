import React, { useEffect, useState, useRef } from 'react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
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

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import type Audio from '../../store/audio/Audio'
import AudioSourceListItem from './AudioSourceListItem'
import AudioEdit from './AudioEdit'
import AudioOptions from './AudioOptions'
import { setAudioYOffset, removeAudios } from '../../store/app/slice'
import { selectUndefined } from '../../store/app/selectors'
import { updateAudio } from '../../store/audio/slice'
import { setPlaylistsSwapPlaylist, swapAudios } from '../../store/app/thunks'
import {
  setPlaylistRemoveAudio,
  setPlaylistsRemoveAudio
} from '../../store/playlist/thunks'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectAppAudioYOffset } from '../../store/app/selectors'
import { selectAudio, selectAudioUrl } from '../../store/audio/selectors'
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
    }
  })

export interface AudioSourceListProps extends WithStyles<typeof styles> {
  cachePath: string
  isSelect: boolean
  selected: number[]
  showHelp: boolean
  audios: number[]
  playlist?: string
  onClickAlbum: (album: string) => void
  onClickArtist: (artist: string) => void
  onUpdateSelected: (selected: number[]) => void
}

function AudioSourceList(props: AudioSourceListProps) {
  const flipflip = FlipFlipService.getInstance()
  const [sourceOptions, setSourceOptions] = useState<number>()
  const [deleteDialog, setDeleteDialog] = useState<number>()
  const [sourceEditID, setSourceEditID] = useState<number>()
  const [lastSelected, setLastSelected] = useState<number>()

  const dispatch = useAppDispatch()
  const yOffset = useAppSelector(selectAppAudioYOffset())
  const deleteDialogSelector =
    deleteDialog != null ? selectAudioUrl(deleteDialog) : selectUndefined
  const deleteDialogURL = useAppSelector(deleteDialogSelector)
  const sourceEditSelector =
    sourceEditID != null ? selectAudio(sourceEditID) : selectUndefined
  const sourceEdit = useAppSelector(sourceEditSelector)

  const _shiftDown = useRef<boolean>()
  const _lastChecked = useRef<number>()

  const onSortEnd = ({
    oldIndex,
    newIndex
  }: {
    oldIndex: number
    newIndex: number
  }) => {
    if (props.playlist) {
      const oldSourceId = props.audios[oldIndex]
      const newSourceId = props.audios[newIndex]
      dispatch(
        setPlaylistsSwapPlaylist(props.playlist, oldSourceId, newSourceId)
      )
    } else {
      const oldSourceURL = props.audios[oldIndex]
      const newSourceURL = props.audios[newIndex]
      dispatch(swapAudios(oldSourceURL, newSourceURL))
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('keyup', onKeyUp, false)
    _shiftDown.current = false
    _lastChecked.current = undefined

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      _shiftDown.current = undefined
      _lastChecked.current = undefined
      savePosition()
    }
  }, [])

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
      dispatch(setAudioYOffset(scrollTop))
    }
  }

  const onDelete = (audioID: number) => {
    setDeleteDialog(audioID)
  }

  const onCloseDeleteDialog = () => {
    setDeleteDialog(undefined)
  }

  const onFinishDelete = async () => {
    await flipflip.api.unlink(deleteDialogURL as string)
    onRemove(deleteDialog as number)
    onCloseDeleteDialog()
  }

  const onRemove = (audioID: number) => {
    if (props.playlist) {
      dispatch(setPlaylistRemoveAudio(props.playlist, audioID))
    } else {
      props.onUpdateSelected(props.selected.filter((id) => id !== audioID))
      dispatch(removeAudios([audioID]))
      dispatch(setPlaylistsRemoveAudio(audioID))
    }
  }

  const onToggleSelect = (e: MouseEvent) => {
    const value = (e.currentTarget as HTMLInputElement).value
    const audioID = Number(value)
    const index = props.selected.indexOf(audioID)
    const newSelected = Array.from(props.selected)
    if (index !== -1) {
      newSelected.splice(index, 1)
    } else {
      if (
        _lastChecked.current &&
        props.audios.includes(_lastChecked.current) &&
        _shiftDown.current
      ) {
        let start = false
        for (const id of props.audios) {
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
    if (!sourceEditID && !sourceOptions) {
      setLastSelected(undefined)
    }
  }

  const onEditSource = (audioID: number, e: MouseEvent) => {
    e.stopPropagation()
    setSourceEditID(audioID)
    setLastSelected(audioID)
  }

  const onCloseSourceEditDialog = () => {
    setSourceEditID(undefined)
  }

  const onSourceOptions = (audioID: number, e: MouseEvent) => {
    e.stopPropagation()
    setSourceOptions(audioID)
    setLastSelected(audioID)
  }

  const onSourceOptionsDone = () => {
    setSourceOptions(undefined)
  }

  const onFinishSourceEdit = (newAudio: Audio) => {
    dispatch(updateAudio(newAudio))
    onCloseSourceEditDialog()
  }

  const SortableVirtualList = SortableContainer(VirtualList)

  function VirtualList(props: any) {
    const { height, width } = props

    return (
      <FixedSizeList
        height={height}
        width={width}
        initialScrollOffset={yOffset}
        itemSize={56}
        itemCount={props.audios.length}
        itemData={props.audios}
        itemKey={(index: number, data: any) => index}
        overscanCount={10}
      >
        {Row}
      </FixedSizeList>
    )
  }

  const SortableItem = SortableElement(
    ({ value }: { value: { index: number; style: any; data: any[] } }) => {
      const index = value.index
      const audioID: number = value.data[index]
      return (
        <AudioSourceListItem
          key={index}
          checked={props.isSelect ? props.selected.includes(audioID) : false}
          index={index}
          isSelect={props.isSelect}
          lastSelected={audioID === lastSelected}
          audioID={audioID}
          audios={props.audios}
          style={value.style}
          onClickAlbum={props.onClickAlbum}
          onClickArtist={props.onClickArtist}
          onDelete={onDelete}
          onEditSource={onEditSource}
          onRemove={onRemove}
          onSourceOptions={onSourceOptions}
          onToggleSelect={onToggleSelect}
          savePosition={savePosition}
        />
      )
    }
  )

  function Row(props: any) {
    const { index } = props
    return <SortableItem index={index} value={props} />
  }

  const classes = props.classes
  if (props.audios.length === 0) {
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
              Add new tracks
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
          <List id="sortable-list" disablePadding onClick={clearLastSelected}>
            <SortableVirtualList
              helperContainer={() => document.getElementById('sortable-list')}
              distance={5}
              height={height - 1}
              width={width}
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
      {sourceOptions != null && (
        <AudioOptions audioID={sourceOptions} onDone={onSourceOptionsDone} />
      )}
      {sourceEdit != null && (
        <AudioEdit
          audio={sourceEdit}
          cachePath={props.cachePath}
          title={'Edit song info'}
          allowSuggestion
          onCancel={onCloseSourceEditDialog}
          onFinishEdit={onFinishSourceEdit}
        />
      )}
    </React.Fragment>
  )
}

;(AudioSourceList as any).displayName = 'AudioSourceList'
export default withStyles(styles)(AudioSourceList as any)

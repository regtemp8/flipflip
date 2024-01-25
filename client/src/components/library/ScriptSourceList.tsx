import React, {
  ChangeEvent,
  useEffect,
  useState,
  useRef,
  useCallback
} from 'react'
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

import { makeStyles } from 'tss-react/mui'

import ScriptSourceListItem from './ScriptSourceListItem'
import SceneSelect from '../configGroups/SceneSelect'
import ScriptOptions from './ScriptOptions'
import { SP } from 'flipflip-common'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  systemMessage,
  setScriptYOffset,
  setScriptsRemoveOne
} from '../../store/app/slice'
import { swapScripts, setScriptsEditUrl } from '../../store/app/thunks'
import { playScript } from '../../store/scene/thunks'
import {
  selectAppScriptYOffset,
  selectAppSpecialMode,
  selectUndefined
} from '../../store/app/selectors'
import { selectCaptionScriptUrl } from '../../store/captionScript/selectors'
import flipflip from '../../FlipFlipService'

const useStyles = makeStyles()((theme: Theme) => ({
  emptyMessage: {
    textAlign: 'center',
    marginTop: '25%'
  },
  emptyMessage2: {
    textAlign: 'center'
  },
  marginRight: {
    marginRight: theme.spacing(1)
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
  },
  scenePick: {
    height: 410
  }
}))

interface SortableVirtualListProps {
  height: number
  width: number
  yOffset: number
  sources: number[]
}

export interface ScriptSourceListProps {
  showHelp: boolean
  sources: number[]
  selected: number[]
  onUpdateSelected: (selected: number[]) => void
}

function ScriptSourceList(props: ScriptSourceListProps) {
  const dispatch = useAppDispatch()
  const [sourceOptions, setSourceOptions] = useState<number>()
  const [lastSelected, setLastSelected] = useState<number>()
  const [isEditing, setIsEditing] = useState(-1)
  const [deleteDialog, setDeleteDialog] = useState<number>()
  const [beginPlay, setBeginPlay] = useState<number>()
  const [playWithScene, setPlayWithScene] = useState<number>()

  const deleteDialogSelector =
    deleteDialog != null
      ? selectCaptionScriptUrl(deleteDialog)
      : selectUndefined
  const deleteDialogURL = useAppSelector(deleteDialogSelector)
  const beginPlaySelector =
    beginPlay != null ? selectCaptionScriptUrl(beginPlay) : selectUndefined
  const beginPlayURL = useAppSelector(beginPlaySelector)
  const firstSourceURL = useAppSelector(
    selectCaptionScriptUrl(props.sources.length > 0 ? props.sources[0] : -1)
  )
  const specialMode = useAppSelector(selectAppSpecialMode())
  const yOffset = useAppSelector(selectAppScriptYOffset())

  const _shiftDown = useRef<boolean>()
  const _lastChecked = useRef<number>()

  const savePosition = useCallback(() => {
    const sortableList = document.getElementById('sortable-list')
    if (sortableList) {
      const scrollElement = sortableList.firstElementChild
      const scrollTop = scrollElement ? scrollElement.scrollTop : 0
      dispatch(setScriptYOffset(scrollTop))
    }
  }, [dispatch])

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
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      _shiftDown.current = undefined
      _lastChecked.current = undefined
      savePosition()
    }
  }, [savePosition])

  useEffect(() => {
    if (firstSourceURL === '') {
      setIsEditing(props.sources[0])
    }
  }, [props.sources, firstSourceURL])

  const onSortEnd = ({
    oldIndex,
    newIndex
  }: {
    oldIndex: number
    newIndex: number
  }) => {
    const oldSourceID = props.sources[oldIndex]
    const newSourceID = props.sources[newIndex]
    dispatch(swapScripts(oldSourceID, newSourceID))
  }

  const clearLastSelected = () => {
    if (!sourceOptions) {
      setLastSelected(undefined)
    }
  }

  const onSourceOptions = (scriptID: number) => {
    setSourceOptions(scriptID)
    setLastSelected(scriptID)
  }

  const onCloseSourceOptions = () => {
    setSourceOptions(undefined)
  }

  const onDelete = (scriptID: number) => {
    setDeleteDialog(scriptID)
  }

  const onCloseDeleteDialog = () => {
    setDeleteDialog(undefined)
  }

  const onFinishDelete = async () => {
    await flipflip().api.unlink(deleteDialogURL as string)
    onRemove(deleteDialog as number)
    onCloseDeleteDialog()
  }

  const onRemove = (scriptID: number) => {
    props.onUpdateSelected(props.selected.filter((id) => id !== scriptID))
    dispatch(setScriptsRemoveOne(scriptID))
  }

  const onToggleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    const scriptID = Number(value)
    if (specialMode === SP.selectSingle) {
      props.onUpdateSelected([scriptID])
    } else {
      const newSelected = Array.from(props.selected)
      const index = newSelected.indexOf(scriptID)
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
            if (start && (id === scriptID || id === _lastChecked.current)) {
              break
            }
            if (start) {
              newSelected.push(id)
            }
            if (!start && (id === scriptID || id === _lastChecked.current)) {
              start = true
            }
          }
        }
        newSelected.push(scriptID)
      }
      _lastChecked.current = scriptID
      props.onUpdateSelected(newSelected)
    }
  }

  const onStartEdit = (id: number) => {
    setIsEditing(id)
  }

  const onEndEdit = (newURL: string) => {
    dispatch(setScriptsEditUrl(isEditing, newURL))
    setIsEditing(-1)
  }

  const onPlay = (scriptID: number) => {
    setBeginPlay(scriptID)
    setPlayWithScene(0)
  }

  const onClosePlayDialog = () => {
    setBeginPlay(undefined)
    setPlayWithScene(undefined)
  }

  const onFinishPlay = () => {
    savePosition()
    try {
      const scriptID = beginPlay as number
      const sceneID = playWithScene as number
      dispatch(playScript(scriptID, sceneID, props.sources))
    } catch (e) {
      dispatch(
        systemMessage('The source ' + beginPlayURL + " isn't in your Library")
      )
    }
  }

  const onChangeScene = (sceneID: number) => {
    setPlayWithScene(sceneID)
  }

  function VirtualList(props: {
    height: number
    width: number
    yOffset: number
    sources: any[]
  }) {
    const { height, width, yOffset, sources } = props

    return (
      <FixedSizeList
        height={height}
        width={width}
        initialScrollOffset={yOffset}
        itemSize={56}
        itemCount={sources.length}
        itemData={sources}
        itemKey={(index: number, data: any) => data[index].id}
        overscanCount={10}
      >
        {Row}
      </FixedSizeList>
    )
  }

  function Row(props: any) {
    const { index } = props
    const SortableItem = SortableElement<{ index: any; value: any }>(
      ({ value }: { value: { index: number; style: any; data: any[] } }) => {
        const index = value.index
        const scriptID: number = value.data[index]
        return (
          <ScriptSourceListItem
            key={index}
            checked={specialMode ? props.selected.includes(scriptID) : false}
            index={index}
            isEditing={isEditing}
            lastSelected={scriptID === lastSelected}
            scriptID={scriptID}
            style={value.style}
            onDelete={onDelete}
            onEndEdit={onEndEdit}
            onPlay={onPlay}
            onRemove={onRemove}
            onSourceOptions={onSourceOptions}
            onStartEdit={onStartEdit}
            onToggleSelect={onToggleSelect}
            savePosition={savePosition}
          />
        )
      }
    )

    return <SortableItem index={index} value={props} />
  }

  const { classes } = useStyles()
  if (props.sources.length === 0) {
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
              Add new scripts
            </Typography>
            <div className={classes.arrow}>→</div>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }

  const SortableVirtualList =
    SortableContainer<SortableVirtualListProps>(VirtualList)
  return (
    <React.Fragment>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List id="sortable-list" disablePadding onClick={clearLastSelected}>
            <SortableVirtualList
              helperContainer={() =>
                document.getElementById('sortable-list') as HTMLElement
              }
              distance={5}
              height={height - 1}
              width={width}
              yOffset={yOffset}
              sources={props.sources}
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
        <ScriptOptions scriptID={sourceOptions} onDone={onCloseSourceOptions} />
      )}
      {beginPlay != null && (
        <Dialog
          open={true}
          onClose={onClosePlayDialog}
          aria-describedby="play-description"
        >
          <DialogContent className={classes.scenePick}>
            <DialogContentText id="play-description">
              Choose a scene to test with:
            </DialogContentText>
            <SceneSelect
              autoFocus
              menuIsOpen
              value={playWithScene ?? 0}
              onChange={onChangeScene}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClosePlayDialog} color="secondary">
              Cancel
            </Button>
            <Button
              disabled={playWithScene == null || playWithScene === 0}
              onClick={onFinishPlay}
              color="primary"
            >
              Play
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </React.Fragment>
  )
}

;(ScriptSourceList as any).displayName = 'ScriptSourceList'
export default ScriptSourceList

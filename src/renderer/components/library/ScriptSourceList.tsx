import React, { useEffect, useState, useRef } from 'react'
import { sortableContainer, sortableElement } from 'react-sortable-hoc'
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

import ScriptSourceListItem from './ScriptSourceListItem'
import SceneSelect from '../configGroups/SceneSelect'
import ScriptOptions from './ScriptOptions'
import { SP } from '../../data/const'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  systemMessage,
  setScriptYOffset,
  setScriptsRemoveOne
} from '../../../store/app/slice'
import { swapScripts, setScriptsEditUrl } from '../../../store/app/thunks'
import { playScript } from '../../../store/scene/thunks'
import {
  selectAppScriptYOffset,
  selectAppSpecialMode
} from '../../../store/app/selectors'
import { selectCaptionScriptUrl } from '../../../store/captionScript/selectors'

const styles = (theme: Theme) =>
  createStyles({
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
  })

export interface ScriptSourceListProps extends WithStyles<typeof styles> {
  showHelp: boolean
  sources: number[]
  tutorial: string
  selected: number[]
  onUpdateSelected: (selected: number[]) => void
}

function ScriptSourceList (props: ScriptSourceListProps) {
  const dispatch = useAppDispatch()
  const [sourceOptions, setSourceOptions] = useState<number>()
  const [lastSelected, setLastSelected] = useState<number>()
  const [isEditing, setIsEditing] = useState(-1)
  const [deleteDialog, setDeleteDialog] = useState<number>()
  const [beginPlay, setBeginPlay] = useState<number>()
  const [playWithScene, setPlayWithScene] = useState<number>()

  const deleteDialogURL = useAppSelector(selectCaptionScriptUrl(deleteDialog ?? -1))
  const beginPlayURL = useAppSelector(selectCaptionScriptUrl(beginPlay ?? -1))
  const firstSourceURL = useAppSelector(selectCaptionScriptUrl(props.sources.length > 0 ? props.sources[0] : -1))
  const specialMode = useAppSelector(selectAppSpecialMode())
  const yOffset = useAppSelector(selectAppScriptYOffset())

  const _shiftDown = useRef<boolean>()
  const _lastChecked = useRef<number>()

  useEffect(() => {
    addEventListener('keydown', onKeyDown, false)
    addEventListener('keyup', onKeyUp, false)
    _shiftDown.current = false

    return () => {
      removeEventListener('keydown', onKeyDown)
      addEventListener('keyup', onKeyUp)
      _shiftDown.current = undefined
      _lastChecked.current = undefined
      savePosition()
    }
  }, [])

  useEffect(() => {
    if (firstSourceURL === '') {
      setIsEditing(props.sources[0])
    }
  }, [props.sources])

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
      dispatch(setScriptYOffset(scrollTop))
    }
  }

  const clearLastSelected = () => {
    if (!sourceOptions) {
      setLastSelected(undefined)
    }
  }

  const onSourceOptions = (scriptID: number, e: MouseEvent) => {
    e.stopPropagation()
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
    await window.flipflip.api.unlink(deleteDialogURL as string)
    onRemove(deleteDialog as number)
    onCloseDeleteDialog()
  }

  const onRemove = (scriptID: number) => {
    props.onUpdateSelected(props.selected.filter((id) => id !== scriptID))
    dispatch(setScriptsRemoveOne(scriptID))
  }

  const onToggleSelect = (e: MouseEvent) => {
    const value = (e.currentTarget as HTMLInputElement).value
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

  const onChangeScene = (sceneID: string) => {
    setPlayWithScene(Number(sceneID))
  }

  function VirtualList (props: {
    height: number
    width: number
    yOffset: number
    sources: any[]
  }) {
    const { height, width } = props

    return (
      <FixedSizeList
        height={height}
        width={width}
        initialScrollOffset={yOffset}
        itemSize={56}
        itemCount={props.sources.length}
        itemData={props.sources}
        itemKey={(index: number, data: any) => data[index].id}
        overscanCount={10}
      >
        <Row />
      </FixedSizeList>
    )
  }

  function Row (props: any) {
    const { index } = props
    const SortableItem = sortableElement(
      ({ value }: { value: { index: number, style: any, data: any[] } }) => {
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
            onDelete={onDelete.bind(this)}
            onEndEdit={onEndEdit.bind(this)}
            onPlay={onPlay.bind(this)}
            onRemove={onRemove.bind(this)}
            onSourceOptions={onSourceOptions.bind(this)}
            onStartEdit={onStartEdit.bind(this)}
            onToggleSelect={onToggleSelect.bind(this)}
            savePosition={savePosition.bind(this)}
          />
        )
      }
    )

    return <SortableItem index={index} value={props} />
  }

  const classes = props.classes
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

  const SortableVirtualList = sortableContainer(VirtualList.bind(this))
  return (
    <React.Fragment>
      <AutoSizer>
        {({ height, width }: { height: number, width: number }) => (
          <List
            id="sortable-list"
            disablePadding
            onClick={clearLastSelected.bind(this)}
          >
            <SortableVirtualList
              helperContainer={() => document.getElementById('sortable-list')}
              distance={5}
              height={height - 1}
              width={width}
              onSortEnd={onSortEnd.bind(this)}
            />
          </List>
        )}
      </AutoSizer>
      {deleteDialog != null && (
        <Dialog
          open={true}
          onClose={onCloseDeleteDialog.bind(this)}
          aria-describedby="delete-description"
        >
          <DialogContent>
            <DialogContentText id="delete-description">
              Are you sure you want to delete {deleteDialogURL}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseDeleteDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={onFinishDelete.bind(this)} color="primary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {sourceOptions != null && (
        <ScriptOptions
          scriptID={sourceOptions}
          onDone={onCloseSourceOptions.bind(this)}
        />
      )}
      {beginPlay != null && (
        <Dialog
          open={true}
          onClose={onClosePlayDialog.bind(this)}
          aria-describedby="play-description"
        >
          <DialogContent className={classes.scenePick}>
            <DialogContentText id="play-description">
              Choose a scene to test with:
            </DialogContentText>
            <SceneSelect
              autoFocus
              menuIsOpen
              value={playWithScene}
              onChange={onChangeScene.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClosePlayDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button
              disabled={playWithScene == null || playWithScene === 0}
              onClick={onFinishPlay.bind(this)}
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
export default withStyles(styles)(ScriptSourceList as any)

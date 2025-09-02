import { ChangeEvent, useEffect, useState, useRef, useCallback } from 'react'
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
import { SCENE_NONE, SP } from 'flipflip-common'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectSpecialMode } from '../../store/app/selectors'
import { deleteCaptionScript, moveCaptionScript } from '../../store/api/thunks'
import { arrayMove } from 'react-sortable-hoc'
import { saveScriptLibraryYOffset } from '../../store/scriptLibrary/thunks'
import { selectScriptLibraryYOffset } from '../../store/scriptLibrary/selectors'
import { setScriptLibraryLastSelected } from '../../store/scriptLibrary/slice'
import snackbar from '../../data/Snackbar'

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
  scripts: number[]
  filters: string[]
  sources: number[]
  selected: number[]
  onUpdateSelected: (selected: number[]) => void
}

function ScriptSourceList(props: ScriptSourceListProps) {
  const dispatch = useAppDispatch()

  const [beginPlay, setBeginPlay] = useState<number>()
  const [playWithScene, setPlayWithScene] = useState<number>()

  const beginPlayURL = '' //useAppSelector(beginPlaySelector)
  const specialMode = useAppSelector(selectSpecialMode())
  const yOffset = useAppSelector(selectScriptLibraryYOffset())

  const _shiftDown = useRef<boolean>()
  const _lastChecked = useRef<number>()

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
    }
  }, [])

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
    const newScripts = arrayMove(
      props.scripts,
      props.scripts.indexOf(oldID),
      props.scripts.indexOf(newID)
    )
    dispatch(moveCaptionScript(newScripts, props.filters, newSources))
  }

  const clearLastSelected = () => {
    dispatch(setScriptLibraryLastSelected(undefined))
  }

  const onRemove = (scriptID: number) => {
    props.onUpdateSelected(props.selected.filter((id) => id !== scriptID))
    dispatch(deleteCaptionScript(scriptID))
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

  const onPlay = (scriptID: number) => {
    setBeginPlay(scriptID)
    setPlayWithScene(SCENE_NONE)
  }

  const onClosePlayDialog = () => {
    setBeginPlay(undefined)
    setPlayWithScene(undefined)
  }

  const onFinishPlay = () => {
    dispatch(saveScriptLibraryYOffset())
    try {
      // const scriptID = beginPlay as number
      // const sceneID = playWithScene as number
      // dispatch(playScript(scriptID, sceneID, sources))
    } catch {
      snackbar().showMessage({
        error: 'The source ' + beginPlayURL + " isn't in your Library"
      })
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

  const isChecked = useCallback(
    (id: number) => {
      return specialMode != null && props.selected.includes(id)
    },
    [specialMode, props.selected]
  )

  function Row(props: any) {
    const { index } = props
    const SortableItem = SortableElement<{ index: any; value: any }>(
      ({ value }: { value: { index: number; style: any; data: any[] } }) => {
        const index = value.index
        const scriptID: number = value.data[index]
        return (
          <ScriptSourceListItem
            key={index}
            checked={isChecked(scriptID)}
            index={index}
            scriptID={scriptID}
            style={value.style}
            onPlay={onPlay}
            onRemove={onRemove}
            onToggleSelect={onToggleSelect}
          />
        )
      }
    )

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
              Add new scripts
            </Typography>
            <div className={classes.arrowWrapper}>
              <div className={classes.arrow}>→</div>
            </div>
          </>
        )}
      </>
    )
  }

  const SortableVirtualList =
    SortableContainer<SortableVirtualListProps>(VirtualList)
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
              height={height - 1}
              width={width}
              yOffset={yOffset}
              sources={props.sources}
              onSortEnd={onSortEnd}
            />
          </List>
        )}
      </AutoSizer>
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
              value={playWithScene ?? SCENE_NONE}
              onChange={onChangeScene}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClosePlayDialog} color="secondary">
              Cancel
            </Button>
            <Button
              disabled={playWithScene == null || playWithScene === SCENE_NONE}
              onClick={onFinishPlay}
              color="primary"
            >
              Play
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

;(ScriptSourceList as any).displayName = 'ScriptSourceList'
export default ScriptSourceList

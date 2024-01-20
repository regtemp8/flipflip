import React, { useState, useRef } from 'react'
import Draggable, { DraggableEvent, type DraggableData } from 'react-draggable'
import { Button, Menu, type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import BaseSwitch from '../common/BaseSwitch'
import SceneSelect from '../configGroups/SceneSelect'
import {
  selectSceneGridCellColor,
  selectSceneGridCellMirror,
  selectSceneGridCellSceneName,
  selectSceneGridCellSceneID,
  selectSceneGridCellIsSceneCopy
} from '../../store/sceneGrid/selectors'
import {
  setSceneGridCellToggleMirror,
  setSceneGridCellSceneID,
  setSceneGridCellSceneCopy
} from '../../store/sceneGrid/slice'
import { setSceneGridCellMirror } from '../../store/sceneGrid/actions'

const useStyles = makeStyles()((theme: Theme) => ({
    gridCell: {
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    },
    sceneMenu: {
      minHeight: 365,
      minWidth: 250
    }
  }))

export interface GridCellSetupProps {
  id: number
  row: number
  col: number
  isEditing: boolean
  onStartEditing: (row: number, col: number) => void
  onEndEditing: (row: number, col: number) => void
}

function GridCellSetup(props: GridCellSetupProps) {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const color = useAppSelector(
    selectSceneGridCellColor(props.id, props.row, props.col)
  )
  const name = useAppSelector(
    selectSceneGridCellSceneName(props.id, props.row, props.col)
  )
  const sceneID = useAppSelector(
    selectSceneGridCellSceneID(props.id, props.row, props.col)
  )
  const isSceneCopy = useAppSelector(
    selectSceneGridCellIsSceneCopy(props.id, props.row, props.col)
  )

  const [dragging, setDragging] = useState(false)
  const menuAnchorEl = useRef<any>()

  const onDrag = () => {
    if (!dragging) {
      setDragging(true)
    }
  }

  const onDragStop = (e: DraggableEvent, position: DraggableData) => {
    if (dragging) {
      onDragDrop(e, position)
    } else {
      onClickCell(e)
    }
    setDragging(false)
  }

  const onClickCell = (e: DraggableEvent) => {
    if ((e.target as Element).className?.includes('MuiSwitch-input')) {
      onToggleMirror()
    } else {
      menuAnchorEl.current = e.target
      props.onStartEditing(props.row, props.col)
    }
  }

  const onDragDrop = (e: any, position: DraggableData) => {
    if (!e.path || e.path.length === 0) return

    const { id, row, col } = props
    const newRowIndex = e.path[0].id.split('-')[0]
    const newColIndex = e.path[0].id.split('-')[1]
    if (row === newRowIndex && col === newColIndex) return

    dispatch(
      setSceneGridCellSceneCopy({
        id,
        row: newRowIndex,
        col: newColIndex,
        value: [row, col]
      })
    )
  }

  const onToggleMirror = () => {
    const { id, row, col } = props
    dispatch(setSceneGridCellToggleMirror({ id, row, col }))
  }

  const onChooseScene = (sceneID: number) => {
    const { id, row, col } = props
    dispatch(setSceneGridCellSceneID({ id, row, col, value: sceneID }))
    onCloseMenu()
  }

  const onCloseMenu = () => {
    props.onEndEditing(props.row, props.col)
  }

  const renderDraggableCell = () => {
    return (
      <Draggable
        bounds="#app"
        position={{ x: 0, y: 0 }}
        onStop={onDragStop}
        onDrag={onDrag}
      >
        {renderCell()}
      </Draggable>
    )
  }

  const renderCell = () => {
    return (
      <Button
        id={props.row + '-' + props.col}
        className={classes.gridCell}
        style={
          color == null
            ? {}
            : {
                borderStyle: 'solid',
                borderWidth: 10,
                borderColor: color
              }
        }
        variant="outlined"
      >
        {name}
        {isSceneCopy && (
          <BaseSwitch
            label="Mirror"
            size="small"
            selector={selectSceneGridCellMirror(props.id, props.row, props.col)}
            action={setSceneGridCellMirror(props.id, props.row, props.col)}
          />
        )}
      </Button>
    )
  }

  return (
    <React.Fragment>
      {isSceneCopy ? renderCell() : renderDraggableCell()}
      <Menu
        id="scene-menu"
        elevation={1}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        anchorEl={menuAnchorEl.current}
        keepMounted
        classes={{ paper: classes.sceneMenu }}
        open={props.isEditing}
        onClose={onCloseMenu}
      >
        {props.isEditing && (
          <SceneSelect
            value={sceneID}
            menuIsOpen
            autoFocus
            onlyExtra
            onChange={onChooseScene}
          />
        )}
      </Menu>
    </React.Fragment>
  )
}

;(GridCellSetup as any).displayName = 'GridCellSetup'
export default GridCellSetup

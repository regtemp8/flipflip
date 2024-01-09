import React, { type ChangeEvent, useEffect, useState } from 'react'
import clsx from 'clsx'

import {
  AppBar,
  Container,
  Fab,
  IconButton,
  TextField,
  type Theme,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'

import BaseTextField from '../common/text/BaseTextField'
import { SGT, SP } from 'flipflip-common'
import {
  selectAppTutorial,
  selectAppSpecialMode
} from '../../store/app/selectors'
import {
  selectSceneGridName,
  selectSceneGridHeight,
  selectSceneGridWidth
} from '../../store/sceneGrid/selectors'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSceneGridName } from '../../store/sceneGrid/actions'
import { setSceneGridCells } from '../../store/sceneGrid/slice'
import { removeSceneGrid } from '../../store/sceneGrid/thunks'
import { doneDimensionsTutorial, setRouteGoBack } from '../../store/app/thunks'
import { generateScenes } from '../../store/scene/thunks'
import { playGrid } from '../../store/player/thunks'
import GridCellSetup from './GridCellSetup'
import { convertGridIDToSceneID } from '../../data/utils'

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      height: '100vh'
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1
    },
    appBarSpacer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      minHeight: 64
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
      flexBasis: '13%'
    },
    headerRight: {
      flexBasis: '13%',
      justifyContent: 'flex-end',
      display: 'flex'
    },
    titleField: {
      margin: 0,
      textAlign: 'center',
      flexGrow: 1
    },
    titleInput: {
      color: theme.palette.primary.contrastText,
      textAlign: 'center',
      fontSize: theme.typography.h4.fontSize
    },
    noTitle: {
      width: '33%',
      height: theme.spacing(7)
    },
    content: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default
    },
    container: {
      height: '100%',
      padding: theme.spacing(0)
    },
    dimensionInput: {
      color: `${theme.palette.primary.contrastText} !important`,
      minWidth: theme.spacing(6)
    },
    grid: {
      flexGrow: 1,
      display: 'grid',
      height: '100%'
    },
    deleteButton: {
      backgroundColor: theme.palette.error.dark,
      margin: 0,
      top: 'auto',
      right: 20,
      bottom: 20,
      left: 'auto',
      position: 'fixed',
      zIndex: 3
    },
    deleteIcon: {
      color: theme.palette.error.contrastText
    },
    fill: {
      flexGrow: 1
    },
    backdropTop: {
      zIndex: theme.zIndex.modal + 1
    },
    highlight: {
      borderWidth: 2,
      borderColor: theme.palette.secondary.main,
      borderStyle: 'solid'
    },
    disable: {
      pointerEvents: 'none'
    }
  })

export interface GridSetupProps extends WithStyles<typeof styles> {
  gridID: number
}

function GridSetup(props: GridSetupProps) {
  const dispatch = useAppDispatch()
  const tutorial = useAppSelector(selectAppTutorial())
  const specialMode = useAppSelector(selectAppSpecialMode())
  const name = useAppSelector(selectSceneGridName(props.gridID))
  const height = useAppSelector(selectSceneGridHeight(props.gridID))
  const width = useAppSelector(selectSceneGridWidth(props.gridID))

  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditing, setIsEditing] = useState([-1, -1])

  if (tutorial === SGT.dimensions && width === 2 && height === 2) {
    dispatch(doneDimensionsTutorial(props.gridID))
  }

  useEffect(() => {
    setIsEditingName(specialMode === SP.autoEdit)
  }, [specialMode])

  const onUpdateSceneGridCells = (height: number, width: number) => {
    dispatch(setSceneGridCells({ id: props.gridID, row: height, col: width }))
    if (tutorial === SGT.cells && width === 2 && height === 2) {
      dispatch(doneDimensionsTutorial(props.gridID))
    }
  }

  const onUpdateHeight = (height: number) => {
    onUpdateSceneGridCells(height, width)
  }

  const onUpdateWidth = (width: number) => {
    onUpdateSceneGridCells(height, width)
  }

  const onChangeNumber =
    (min: number, max: number, action: (value: number) => void) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let value = event.target.value !== '' ? Number(event.target.value) : min
      value = Math.max(value, min)
      value = Math.min(value, max)
      action(value)
    }

  const onChangeHeight = onChangeNumber(1, 5, onUpdateHeight)
  const onChangeWidth = onChangeNumber(1, 5, onUpdateWidth)

  const startEditingGridCell = (row: number, col: number) => {
    console.log(`EDIT ${row}, ${col}`)
    setIsEditing([row, col])
  }

  const endEditingGridCell = (row: number, col: number) => {
    if (isEditing[0] === row && isEditing[1] === col) {
      setIsEditing([-1, -1])
    }
  }

  const beginEditingName = () => {
    setIsEditingName(true)
  }

  const endEditingName = () => {
    setIsEditingName(false)
  }

  const goBack = () => {
    dispatch(setRouteGoBack())
  }

  const onPlayGrid = () => {
    // Regenerate scene(s) before playback
    dispatch(generateScenes(convertGridIDToSceneID(props.gridID)))
    dispatch(playGrid(props.gridID))
  }

  const classes = props.classes
  const colSize = 100 / width
  const rowSize = 100 / height
  let gridTemplateColumns = ''
  let gridTemplateRows = ''
  for (let w = 0; w < width; w++) {
    gridTemplateColumns += colSize.toString() + '% '
  }
  for (let h = 0; h < height; h++) {
    gridTemplateRows += rowSize.toString() + '% '
  }

  return (
    <div className={classes.root}>
      <AppBar
        enableColorOnDark
        position="absolute"
        className={clsx(
          classes.appBar,
          tutorial === SGT.dimensions && classes.backdropTop
        )}
      >
        <Toolbar className={classes.headerBar}>
          <div className={classes.headerLeft}>
            <Tooltip disableInteractive title="Back" placement="right-end">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Back"
                className={clsx(tutorial === SGT.dimensions && classes.disable)}
                onClick={goBack}
                size="large"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </div>

          {isEditingName && (
            <form onSubmit={endEditingName} className={classes.titleField}>
              <BaseTextField
                variant="standard"
                autoFocus
                fullWidth
                id="title"
                margin="none"
                inputProps={{ className: classes.titleInput }}
                selector={selectSceneGridName(props.gridID)}
                action={setSceneGridName(props.gridID)}
                onBlur={endEditingName}
              />
            </form>
          )}
          {!isEditingName && (
            <Typography
              component="h1"
              variant="h4"
              noWrap
              className={clsx(
                classes.title,
                name.length === 0 && classes.noTitle,
                tutorial === SGT.dimensions && classes.disable
              )}
              onClick={beginEditingName}
            >
              {name}
            </Typography>
          )}

          <div className={classes.headerRight}>
            <TextField
              label="Height"
              margin="dense"
              value={height}
              onChange={onChangeHeight}
              variant="filled"
              className={clsx(tutorial === SGT.dimensions && classes.highlight)}
              InputLabelProps={{ className: classes.dimensionInput }}
              inputProps={{
                className: classes.dimensionInput,
                min: 1,
                max: 5,
                type: 'number'
              }}
            />
            <TextField
              label="Width"
              margin="dense"
              value={width}
              onChange={onChangeWidth}
              variant="filled"
              className={clsx(tutorial === SGT.dimensions && classes.highlight)}
              InputLabelProps={{ className: classes.dimensionInput }}
              inputProps={{
                className: classes.dimensionInput,
                min: 1,
                max: 5,
                type: 'number'
              }}
            />
            <IconButton
              edge="end"
              color="inherit"
              aria-label="Play"
              className={clsx(tutorial === SGT.dimensions && classes.disable)}
              onClick={onPlayGrid}
              size="large"
            >
              <PlayCircleOutlineIcon fontSize="large" />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth={false} className={classes.container}>
          <div
            className={classes.grid}
            style={{
              gridTemplateColumns,
              gridTemplateRows
            }}
          >
            {[...Array(height).keys()].map((row) => (
              <React.Fragment key={row}>
                {[...Array(width).keys()].map((col) => (
                  <GridCellSetup
                    key={row + '-' + col}
                    id={props.gridID}
                    row={row}
                    col={col}
                    isEditing={isEditing[0] === row && isEditing[1] === col}
                    onStartEditing={startEditingGridCell}
                    onEndEditing={endEditingGridCell}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
          <Fab
            className={classes.deleteButton}
            onClick={() => {
              dispatch(removeSceneGrid(props.gridID))
            }}
            size="small"
          >
            <DeleteIcon className={classes.deleteIcon} />
          </Fab>
        </Container>
      </main>
    </div>
  )
}

;(GridSetup as any).displayName = 'GridSetup'
export default withStyles(styles)(GridSetup as any)
